# Production Blockers — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: dùng `superpowers:subagent-driven-development` (khuyến nghị) hoặc `superpowers:executing-plans` để chạy plan này theo từng task. Các bước dùng cú pháp checkbox (`- [ ]`) để tick tiến độ.

**Goal:** Đưa `zalo-web-clone` từ trạng thái "ai cũng đọc được tin nhắn riêng tư bằng `curl`" về trạng thái có thể deploy: đóng toàn bộ lỗ hổng auth, sửa các luồng tính năng đang hỏng (ảnh, logout, routing, realtime), rồi dọn nợ kỹ thuật.

**Architecture:** Sửa tại chỗ, không refactor kiến trúc. Bên API: bổ sung tầng authn (`@UseGuards(AuthenticatedGuard)` ở mọi controller) + tầng authz (kiểm tra quyền sở hữu trong service, **không** dựa vào middleware path-matching vì chính nó là nguyên nhân gây lỗ hổng hiện tại). Bên SPA: sửa vòng đời (hook order, socket lifecycle, routing) và thống nhất nguồn URL ảnh về Cloudinary.

**Tech Stack:** NestJS 9 · TypeORM 0.2.37 · MySQL 8 · Passport local + express-session · Socket.IO · React 18 · Vite 5 · Redux Toolkit · SCSS Modules · yarn · docker compose

---

## ✅ Trạng thái — build đã xanh, lỗ hổng P0 đã đóng

`yarn build` (cả hai package) đã pass. `check-auth.sh` đã chạy: **22/23 route trả 401/403 khi không có cookie** — lỗ hổng đọc tin nhắn riêng tư không cần đăng nhập đã đóng, có bằng chứng.

Dòng FAIL duy nhất (`GET /users/presence/status → 404`) là **bug trong script probe, không phải lỗ hổng**: controller đó chỉ có `@Patch('status')`, và routing của Nest chạy trước guard nên 404 không nói gì về auth. Đã sửa method, đồng thời nâng độ phủ từ 23 lên 36 route và thêm xử lý 429 (xem phần dưới).

Còn lại: chạy lại `check-auth.sh` bản mới, làm checklist kiểm tay, rồi Task 18 + 4 mục Task 19.

<details>
<summary>Ghi chú lịch sử — trạng thái lúc soạn plan</summary>

**Phase 1 đã được sửa code nhưng CHƯA VERIFY và CHƯA COMMIT.**

Phiên tạo plan này bị khoá Bash giữa chừng (lớp an toàn của harness chặn, lý do là nội dung security-audit trong hội thoại). Nên: code Task 1-4 đã viết xong bằng công cụ sửa file, nhưng **không chạy được `yarn build`, `yarn lint`, hay `check-auth.sh` lần nào**. Không có gate nào xác nhận.

Việc đầu tiên khi bạn ngồi vào máy:

```bash
cd /Users/designerfour/Documents/nghiepdev/zalo-web-clone
git status                                    # 17 file sửa + docs/ + chat-nestjs/scripts/ chưa track
docker compose exec api yarn build            # ← chạy CÁI NÀY TRƯỚC
docker compose exec api yarn lint
chmod +x chat-nestjs/scripts/check-auth.sh && ./chat-nestjs/scripts/check-auth.sh
```

`yarn build` là cái quan trọng nhất — 9 file thêm import `AuthenticatedGuard` với đường dẫn tương đối khác nhau theo độ sâu thư mục, và đó là chỗ dễ sai nhất khi viết mà không compile được.

| Task | Code | Verify |
|---|---|---|
| 1 — Guard 9 controller | ✅ | ❌ |
| 2 — Authz message | ✅ | ❌ |
| 3 — Owner check group | ✅ | ❌ |
| 4 — Cookie + secret | ✅ | ❌ |
| 5 — Pipeline ảnh → Cloudinary | ✅ | ❌ |
| 6 — Unhandled rejection | ✅ gộp vào 5 | ❌ |
| 7 — Tin chỉ có ảnh | ✅ | ❌ |
| 8 — Hook order sidebar | ✅ | ❌ |
| 9 — Logout dọn state | ✅ | ❌ |
| 10 — Routing `/` + 404 | ✅ | ❌ |
| 11 — Vòng đời socket | ✅ | ❌ |
| 12 — findIndex −1 | ✅ | ❌ |
| 13 — Gateway thiếu return | ✅ | ❌ |
| 14 — Validation + upload limit | ✅ | ❌ |
| 15 — Phân trang | ✅ | ❌ |
| 16 — Nuốt lỗi | ✅ | ❌ |
| 17 — Bỏ console.log (251 → 0) | ✅ | ❌ |
| 18 — Sửa jest | ✅ | ✅ 11/11 |
| 19 — Dọn vặt | ✅ phần lớn | ❌ |

**Phase 1, 2, 3 và phần lớn Phase 4 đã viết xong code.**

### Task 18 — đã sửa, chờ chạy

`CLAUDE.md` mô tả nguyên nhân là "spec thiếu token DI". Đúng, nhưng **chưa đủ** — có hai nguyên nhân khác nhau:

**Nhóm A — boilerplate `nest g` chưa bao giờ điền provider (7 spec).** `auth.service`, `auth.controller`, `user.service`, `message.service`, `message.controller`, `conversations.service`, `conversations.controller`. Đã thêm đúng token theo constructor của từng subject.

**Nhóm B — 2 spec friend-request: vừa thiếu DI vừa có assertion đã cũ.**

| Vấn đề | Chi tiết |
|---|---|
| Thiếu `Services.FRIENDS_SERVICE` | `FriendRequestService` inject nó, spec không cung cấp |
| Thiếu `EventEmitter2` | `FriendRequestController` inject nó, spec không cung cấp |
| `relations` sai | Spec chờ `['receiver','sender']`, code trả thêm `receiver.profile`, `sender.profile` |
| `delete` sai đối số | `cancel({id: 321})` gọi `delete(321)`, spec chờ `322` |
| Dùng `email` | `CreateFriendDto` chỉ có `phoneNumber` — spec còn sót từ thời tra theo email |
| `rejects.toThrow` không `await` | Hai test cancel pass rỗng, không assert gì cả |

Thêm helper `mockRepository()` vào `src/__mocks__/index.ts` để khỏi lặp mock repository ở 4 spec. Không thêm dependency mới (`@golevelup/ts-jest` không có sẵn, mà thêm thì phải rebuild volume node_modules).

**Một test mới có giá trị thật:** `message.service.spec.ts` giờ assert `getMessages` ném `ConversationNotFoundException` và **không** chạm repository khi người dùng không thuộc hội thoại. Đây là chốt chặn hồi quy cho đúng lỗ hổng P0 — nếu ai đó lỡ bỏ `hasAccess` đi, test đỏ ngay.

Còn lại vẫn là smoke-level "should be defined". Nâng chúng lên assert hành vi thật là việc riêng, không thuộc task này.

### Task 19 — đã làm / chưa làm

Đã làm: bỏ `AbortController` chết ở 2 guard hook · bỏ `setTimeout(1000)` giả trong `useAuth` · `loading` khởi tạo `true` ở 2 guard hook · xoá `compressImage` + import `sharp` · xoá client S3 và token `Services.SPACES_CLIENT` · sửa `formatPhoneNumber` (bỏ số 0 thừa sau `+84`) · `addMessage` không còn nuốt tin nhắn khi hội thoại chưa nạp · xoá code comment kiểm tra bạn bè và các import mồ côi theo nó.

Chưa làm, kèm lý do:

- **Gỡ `sharp` và `@aws-sdk/client-s3` khỏi `package.json`** — code đã hết dùng, nhưng sửa `package.json` bắt buộc rebuild volume node_modules; để bạn làm cùng lúc chạy build đầu tiên.
- **5 màu hex cứng** — xem lại thì chúng là chữ/icon trắng trên nền xanh accent (badge chưa đọc, nút primary), **phải** trắng ở cả light lẫn dark. Repo chưa có token kiểu `--zl-on-accent` để map vào. Việc đúng là **thêm token mới** vào `src/index.css` rồi trỏ 5 chỗ đó vào, chứ không phải ép về một biến sẵn có — nên tôi không swap mù. Đây không phải bug dark mode như tôi ghi ở lượt audit đầu.
- **Xoá 4 file chết từ CRA** — tôi không có công cụ xoá file. Kiểm tra `index.tsx` còn import `reportWebVitals` không, và `tsconfig` còn include `react-app-env.d.ts` không, trước khi xoá.
- **Chia nhỏ bundle, thêm lint script cho SPA, tắt `synchronize`, thêm healthcheck** — đều cần đo đạc hoặc là quyết định thiết kế, không nên làm mù.

### ✅ Quyết định đã chốt: phải là bạn bè mới nhắn được

`createConversation` giờ gọi `friendsService.isFriends()` và ném `FriendNotFoundException` (404) nếu chưa kết bạn — khớp với `createMessage` vốn đã chặn sẵn. Không còn cảnh tạo được hội thoại rồi không nhắn được.

Ảnh hưởng tới SPA:

| Luồng | Endpoint | Còn chạy? |
|---|---|---|
| Tìm theo SĐT rồi nhắn (`CreateConversationModal`) | `POST /conversations/by-phone-number` | ⚠️ 404 nếu chưa kết bạn — **đây là thay đổi thấy được** |
| Nhắn từ danh sách bạn bè (`FriendListItem`, `FriendContextMenu`) | `GET /exists/conversations/:id` | ✅ đã là bạn |
| Gọi từ lịch sử cuộc gọi (`CallsSidebar`) | `GET /exists/conversations/:id` | ✅ map trên `Friend[]` |

`CreateConversationModal.openConversation` trước đây nuốt mọi lỗi vào một câu chung "Không mở được cuộc trò chuyện" — giờ 404 hiện riêng **"Bạn cần kết bạn trước khi nhắn tin cho người này"**. Ba luồng còn lại đã có toast sẵn nên không cần sửa.

Seed vẫn chạy được: `seed.ts:225` có `createFriendships()`, và hội thoại seed đã tồn tại sẵn nên `isCreated()` trả về trước khi tới nhánh kiểm tra.

**Đáng kiểm khi test:** tìm một SĐT seed *chưa* kết bạn với tài khoản đang đăng nhập → phải ra thông báo kết bạn, không phải lỗi chung chung.

Task 15 cài khác plan ở hai điểm, cố ý:

- **Dùng `LessThan(before)` với `find()` thay vì viết lại bằng `createQueryBuilder`.** Query builder đòi đoán đúng tên cột FK và alias join; `find()` giữ nguyên `relations`/`where` vốn đã chạy tốt nên rủi ro thấp hơn nhiều khi không compile được để kiểm.
- **Sắp theo `id: 'DESC'` chứ không phải `createdAt: 'DESC'`.** Con trỏ phân trang là `id`, nên thứ tự sắp phải cùng trục với con trỏ — khác trục thì cuộn sẽ bỏ sót hoặc lặp tin. Với dữ liệu thật hai thứ trùng nhau vì `id` auto-increment. ⚠️ Nhưng `seed.ts` ghi `created_at` bằng SQL trực tiếp, nên **nếu seed có hội thoại mà thứ tự chèn khác thứ tự thời gian thì thứ tự hiển thị sẽ đổi** — đáng liếc qua khi test.

Phân trang **chỉ áp cho hội thoại 1-1**. Nhóm chưa có thunk riêng, `onScroll` guard bằng `selectedType !== "private"`. Muốn làm nốt thì nhân bản `fetchMoreMessagesThunk` sang `groupMessageSlice`.

Sweep bằng grep đã chạy và sạch: không còn tham chiếu `CDN_URL`, `putObject`, `spacesClient`, `logoutUserAPI`, `attachmentKeys`; mọi call site của `getMessages`, `updateDetails`, `upload` đều khớp chữ ký mới. **Nhưng grep không thay được compiler.**

### Kiểm bằng tay sau khi build xanh

Mấy thứ đáng nghi nhất, theo thứ tự:

1. **Đăng nhập** — nếu guard sai chỗ thì hỏng ngay bước này.
2. **Vào `/`** → phải nhảy sang `/conversations`, không trắng trang.
3. **Gửi ảnh** — cần `CLOUDINARY_*` thật trong `.env`. Ảnh phải hiện, URL trỏ `res.cloudinary.com`.
4. **Ảnh cũ sẽ vỡ** — các hàng `message_attachments` cũ có `url = NULL`. Không phải regression (chúng vốn trỏ vào bucket của người khác), nhưng chạy `yarn seed` lại cho sạch.
5. **Đăng xuất rồi bấm Back** → phải ở `/login`.
6. **Ở tab Bạn bè, nhận tin nhắn** → badge chưa đọc phải tăng.
7. **Phân trang** — cần hội thoại >30 tin (sửa `seed-data.ts` rồi `yarn seed`). Mở ra chỉ tải 30; cuộn lên đầu bắn thêm một request kèm `?before=`; cuộn tới hết lịch sử thì **thôi bắn** (cờ `exhausted`). Ngưỡng `LOAD_MORE_THRESHOLD_PX = 200` trong `MessageContainer.tsx` có thể phải chỉnh — dấu `scrollTop` với `column-reverse` là chỗ tôi không kiểm chứng được.

**Nhánh `fix/production-blockers` chưa được push** — lệnh git cũng bị chặn. Nếu tối nay bạn code trên máy khác, chạy trước:

```bash
git add -A && git commit -m "fix(api): close the unauthenticated data-read holes" && git push -u origin fix/production-blockers
```

Cũng còn `chat-nestjs/src/seed/*.ts` đang dirty do `yarn lint --fix` chạy lúc audit — reformat prettier thuần, không phải chủ ý. Bỏ đi bằng `git restore chat-nestjs/src/seed/`.

</details>

---

## Global Constraints

Áp dụng cho **mọi** task bên dưới:

- **Nhánh:** `fix/production-blockers` (đã tách từ `feat/zalo-ui-revamp`). Không commit thẳng vào `main`.
- **Commit:** conventional commits (`fix:`, `feat:`, `refactor:`, `chore:`). **Không** ghi "Claude" / `Co-Authored-By` ở bất kỳ đâu.
- **TypeORM là 0.2.37**, không phải 0.3.x. `getRepository()` toàn cục còn dùng được, `findOne(id)` nhận id trần. Code viết theo docs 0.3 sẽ không compile.
- **`synchronize: true`** — sửa entity là schema live bị rewrite ở lần boot sau. Đổi tên cột = mất dữ liệu.
- **Màu ở SPA luôn là `var(--zl-*)`** từ `chat-react/src/index.css`. Hex cứng làm hỏng dark mode.
- **SPA chỉ dùng SCSS Modules.** Không đưa `styled-components` trở lại.
- **`chat-react` bật `strict` + `noUnusedLocals` + `noUnusedParameters`** — một import thừa là fail `yarn build`. Tham số callback cố ý không dùng thì đặt tiền tố `_`.
- **Không thêm `console.log` mới.** Repo đã có 251 cái, Phase 4 dọn.
- **Backend:** 2 space, nháy đơn, prettier. **Frontend:** thụt lề không đồng nhất — bám theo file đang sửa, không reformat vùng không liên quan.
- Chạy dưới docker thì mọi lệnh `yarn` phải thêm tiền tố `docker compose exec api` / `docker compose exec web`.

### Verification gates

Chạy trước khi coi bất kỳ task nào là xong. Không tuyên bố một gate đã pass nếu chưa thực sự chạy nó.

| Package | Lệnh | Trạng thái nền |
|---|---|---|
| chat-nestjs | `yarn lint` | ✅ pass — 0 error, 22 warning là bình thường |
| chat-nestjs | `yarn build` | ✅ pass |
| chat-react | `yarn build` | ✅ pass — gate **duy nhất** của package này |
| chat-nestjs | `yarn test` | ✅ pass — 11/11 suite (đã sửa ở Task 18) |

`yarn test` giờ là gate thật: đỏ nghĩa là bạn làm hỏng thứ gì đó. Trước Task 18 nó fail 9/11 suite và tài liệu bảo cứ kệ — đúng cách để lọt regression.

`chat-react` **không có test runner và không có lint script**. Đừng chạy `yarn test` ở đó.

---

## Cách dùng file này

Các task xếp theo thứ tự **nên làm**. Phase 1 là điều kiện cần để deploy — làm xong Phase 1 là đã hết trạng thái "rò rỉ dữ liệu". Phase 2 trở đi là làm cho sản phẩm dùng được.

Mỗi task tự đứng được và kết thúc bằng một commit. Nếu chỉ có một buổi tối, làm hết Phase 1 rồi dừng — đó là điểm cắt an toàn.

Cột "⏱" là ước lượng thô cho người đã quen repo.

| Phase | Task | ⏱ |
|---|---|---|
| 1 — Chặn deploy | 1 Guard toàn bộ controller · 2 Authz cho message · 3 Owner check group · 4 Cookie/secret | ~2.5h |
| 2 — Tính năng hỏng | 5 Pipeline ảnh · 6 Unhandled rejection · 7 Tin chỉ có ảnh · 8 Hook order · 9 Logout · 10 Routing · 11 Socket lifecycle | ~4h |
| 3 — Lỗi logic | 12 findIndex −1 · 13 Gateway thiếu return · 14 Validation + upload limit · 15 Phân trang · 16 Nuốt lỗi | ~3h |
| 4 — Nợ kỹ thuật | 17 Logger thay console.log · 18 Sửa jest · 19 Vặt | ~3h |

---

## Bản đồ file

**Tạo mới**
- `chat-nestjs/scripts/check-auth.sh` — ✅ đã tạo sẵn. Script smoke-test auth, đóng vai "test" cho Phase 1.
- `chat-nestjs/src/utils/logger.ts` (Task 17)

**Sửa nhiều nhất**
- `chat-nestjs/src/**/**.controller.ts` — thêm guard (Task 1)
- `chat-nestjs/src/messages/message.service.ts` — authz + phân trang (Task 2, 15)
- `chat-nestjs/src/image-storage/image-storage.service.ts` — pipeline ảnh (Task 5, 6)
- `chat-react/src/App.tsx` — routing (Task 10)
- `chat-react/src/utils/context/SocketContext.tsx` — vòng đời socket (Task 11)

---

# Phase 1 — Chặn deploy

## Task 1: Guard toàn bộ controller chưa được bảo vệ

Hiện chỉ **2/12 controller** có `@UseGuards(AuthenticatedGuard)`. Bằng chứng đã đo trên stack đang chạy:

```
GET /api/users/search?query=0900000001        → 200  {"id":6,"phoneNumber":"84900000001",...}
GET /api/conversations/1/messages             → 200  toàn bộ lịch sử chat
GET /api/friends                              → 500
GET /api/groups                               → 500
```

**Files:**
- Modify: `chat-nestjs/src/users/controllers/user.controller.ts:13`
- Modify: `chat-nestjs/src/users/controllers/user-profile.controller.ts:17`
- Modify: `chat-nestjs/src/exists/exists.controller.ts:17`
- Modify: `chat-nestjs/src/friends/friends.controller.ts:17`
- Modify: `chat-nestjs/src/friend-requests/friend-requests.controller.ts:20`
- Modify: `chat-nestjs/src/messages/message.controller.ts:26`
- Modify: `chat-nestjs/src/groups/controllers/group.controller.ts:26`
- Modify: `chat-nestjs/src/groups/controllers/group-messages.controller.ts:26`
- Modify: `chat-nestjs/src/groups/controllers/group-recipients.controller.ts:19`
- Test: `chat-nestjs/scripts/check-auth.sh`

**Interfaces:**
- Consumes: `AuthenticatedGuard` từ `chat-nestjs/src/auth/utils/Guards.ts` — `canActivate()` trả `req.isAuthenticated()`, false → Nest ném `ForbiddenException` (403).
- Produces: mọi route ngoài `/auth/*` trả 403 khi không có cookie. Task 2 và 3 dựa vào việc `@AuthUser()` từ đây trở đi **luôn** có `User` thật, không bao giờ `undefined`.

- [ ] **Bước 1: Chạy script để thấy nó FAIL**

```bash
./chat-nestjs/scripts/check-auth.sh
```

Kết quả mong đợi — **FAIL**, với ít nhất các dòng sau (đã đo thật):

```
  FAIL GET    /users/search?query=0900000001                200 (mong đợi 401/403)
  FAIL GET    /users/check?phoneNumber=0900000001           200 (mong đợi 401/403)
  FAIL GET    /conversations/1/messages                     200 (mong đợi 401/403)
  FAIL GET    /friends                                      500 (mong đợi 401/403)
  FAIL GET    /groups                                       500 (mong đợi 401/403)
  FAIL GET    /exists/conversations/1                       500 (mong đợi 401/403)
FAIL — còn route trả dữ liệu khi chưa đăng nhập.
```

`/conversations` và `/users/presence/status` đã `ok 403` từ trước — hai controller đó vốn có guard.

- [ ] **Bước 2: Thêm guard vào 9 controller**

Với mỗi file, thêm `UseGuards` vào import `@nestjs/common` sẵn có, thêm dòng import guard, và đặt decorator ngay trên `export class`. Đường dẫn import khác nhau theo độ sâu thư mục:

| File | Dòng import cần thêm |
|---|---|
| `users/controllers/user.controller.ts` | `import { AuthenticatedGuard } from '../../auth/utils/Guards';` |
| `users/controllers/user-profile.controller.ts` | `import { AuthenticatedGuard } from '../../auth/utils/Guards';` |
| `groups/controllers/group.controller.ts` | `import { AuthenticatedGuard } from '../../auth/utils/Guards';` |
| `groups/controllers/group-messages.controller.ts` | `import { AuthenticatedGuard } from '../../auth/utils/Guards';` |
| `groups/controllers/group-recipients.controller.ts` | `import { AuthenticatedGuard } from '../../auth/utils/Guards';` |
| `exists/exists.controller.ts` | `import { AuthenticatedGuard } from '../auth/utils/Guards';` |
| `friends/friends.controller.ts` | `import { AuthenticatedGuard } from '../auth/utils/Guards';` |
| `friend-requests/friend-requests.controller.ts` | `import { AuthenticatedGuard } from '../auth/utils/Guards';` |
| `messages/message.controller.ts` | `import { AuthenticatedGuard } from '../auth/utils/Guards';` |

Ví dụ đầy đủ — `chat-nestjs/src/users/controllers/user.controller.ts`:

```ts
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../auth/utils/Guards';
import { Routes, Services } from '../../utils/constants';
import { UserAlreadyExists } from '../exceptions/UserAlreadyExists';
import { IUserService } from '../interfaces/user';

@Controller(Routes.USERS)
@UseGuards(AuthenticatedGuard)
export class UsersController {
```

Tám file còn lại: cùng một khuôn — thêm `UseGuards` vào import `@nestjs/common`, thêm dòng import ở bảng trên, chèn `@UseGuards(AuthenticatedGuard)` ngay dưới `@Controller(...)` và ngay trên `export class`. Giữ nguyên `@SkipThrottle()` nếu file đã có.

- [ ] **Bước 3: Chạy lại script để thấy nó PASS**

```bash
./chat-nestjs/scripts/check-auth.sh
```

Kết quả mong đợi:

```
PASS — không route nào rò rỉ.
```

- [ ] **Bước 4: Kiểm tra app vẫn chạy khi ĐÃ đăng nhập**

Guard sai chỗ sẽ khoá cả người dùng hợp lệ. Mở `http://localhost:3100`, đăng nhập `0900000001` / `123456`, rồi xác nhận bằng mắt:
- danh sách hội thoại hiện ra
- mở một hội thoại, tin nhắn load được
- gửi được một tin nhắn text
- tab Bạn bè và Nhóm không trắng trang

- [ ] **Bước 5: Gates + commit**

```bash
docker compose exec api yarn lint && docker compose exec api yarn build
git add chat-nestjs/src chat-nestjs/scripts
git commit -m "fix(api): require an authenticated session on every controller

Chỉ ConversationsController và UserPresenceController có guard, nên
/users/search và /conversations/:id/messages trả dữ liệu riêng tư cho
request không kèm cookie. Thêm script smoke-test để chặn tái diễn."
```

---

## Task 2: Chặn đọc tin nhắn của hội thoại mình không tham gia

Task 1 mới đóng phần authn. `MessageService.getMessages(conversationId)` vẫn chỉ nhận id — bất kỳ ai **đã đăng nhập** vẫn đọc được hội thoại của người khác bằng cách đổi id trên URL.

> **Bẫy — đọc trước khi định sửa bằng middleware.** Cách tưởng như tự nhiên là mở rộng `ConversationMiddleware` trong `conversations.module.ts:57` từ `{ path: 'conversations/:id', method: RequestMethod.GET }` thành `RequestMethod.ALL`. **Đừng.** Nest bind `RequestMethod.ALL` bằng `app.use(path)` của Express, tức là **khớp tiền tố** — nó sẽ nuốt luôn `POST /api/conversations/by-phone-number`, gán `id = "by-phone-number"`, `parseInt` ra `NaN`, và ném `InvalidConversationIdException`. Tính năng "nhắn tin theo số điện thoại" sẽ chết. Chính sự khác biệt tinh vi giữa `app.get()` (khớp chính xác) và `app.use()` (khớp tiền tố) là thứ tạo ra lỗ hổng ban đầu — nên task này kiểm tra quyền **trong service**, nơi hành vi là tường minh.

**Files:**
- Modify: `chat-nestjs/src/utils/types.ts` (thêm type mới cạnh `GetConversationMessagesParams:226`)
- Modify: `chat-nestjs/src/messages/message.ts`
- Modify: `chat-nestjs/src/messages/message.service.ts:60-66`
- Modify: `chat-nestjs/src/messages/message.controller.ts:57-65`
- Modify: `chat-nestjs/src/conversations/conversations.controller.ts:34-37` (xoá route rác)

**Interfaces:**
- Consumes: `IConversationsService.hasAccess({ id, userId }): Promise<boolean>` — đã có sẵn ở `conversations.service.ts:149`, ném `ConversationNotFoundException` nếu hội thoại không tồn tại. `MessageService` đã inject sẵn `conversationService` qua `Services.CONVERSATIONS`.
- Produces: `getMessages(params: GetMessagesParams): Promise<Message[]>` — Task 15 sẽ mở rộng type này thêm `limit`/`cursor`.

- [ ] **Bước 1: Thêm type**

Trong `chat-nestjs/src/utils/types.ts`, đặt ngay dưới `GetConversationMessagesParams`:

```ts
export type GetMessagesParams = {
  id: number;
  userId: number;
};
```

- [ ] **Bước 2: Cập nhật interface service**

Trong `chat-nestjs/src/messages/message.ts`, đổi dòng khai báo `getMessages` thành:

```ts
getMessages(params: GetMessagesParams): Promise<Message[]>;
```

và thêm `GetMessagesParams` vào import từ `../utils/types`.

- [ ] **Bước 3: Kiểm tra quyền trong service**

Thay `getMessages` ở `chat-nestjs/src/messages/message.service.ts:60-66`:

```ts
  async getMessages({ id, userId }: GetMessagesParams): Promise<Message[]> {
    const hasAccess = await this.conversationService.hasAccess({ id, userId });
    if (!hasAccess) throw new ConversationNotFoundException();
    return this.messageRepository.find({
      relations: ['author', 'attachments', 'author.profile'],
      where: { conversation: { id } },
      order: { createdAt: 'DESC' },
    });
  }
```

`ConversationNotFoundException` đã được import sẵn ở đầu file. Thêm `GetMessagesParams` vào import từ `../utils/types`.

> Trả 404 chứ không phải 403 là cố ý: 403 xác nhận "hội thoại này có tồn tại", tự nó đã là rò rỉ thông tin.

- [ ] **Bước 4: Truyền userId từ controller**

Ở `chat-nestjs/src/messages/message.controller.ts:57-65`:

```ts
  @Get()
  @SkipThrottle()
  async getMessagesFromConversation(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const messages = await this.messageService.getMessages({
      id,
      userId: user.id,
    });
    return { id, messages };
  }
```

- [ ] **Bước 5: Xoá route debug bỏ quên**

Xoá hẳn khối này ở `chat-nestjs/src/conversations/conversations.controller.ts:34-37`:

```ts
  @Get('test/endpoint/check')
  test() {
    return;
  }
```

- [ ] **Bước 6: Kiểm chứng IDOR đã đóng**

Đăng nhập bằng `0900000001` và lưu cookie, rồi thử đọc một hội thoại không thuộc về mình:

```bash
curl -s -c /tmp/zalo.txt -X POST http://localhost:8001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"phoneNumber":"0900000001","password":"123456","captcha":"..."}'

curl -s -b /tmp/zalo.txt -o /dev/null -w '%{http_code}\n' \
  http://localhost:8001/api/conversations/2/messages
```

Mong đợi `404`. Trước khi sửa, lệnh này trả `200` kèm toàn bộ tin nhắn.

> Login có captcha nên khó script thẳng. Cách nhanh hơn: đăng nhập trên trình duyệt, mở DevTools → Application → Cookies, copy giá trị `CHAT_APP_SESSION_ID`, rồi dùng `-H 'Cookie: CHAT_APP_SESSION_ID=<giá trị>'`. Hoặc kiểm bằng tay: đăng nhập rồi gõ tay `http://localhost:3100/conversations/<id-người-khác>` — phải bị đá về `/conversations`.

- [ ] **Bước 7: Gates + commit**

```bash
docker compose exec api yarn lint && docker compose exec api yarn build
./chat-nestjs/scripts/check-auth.sh
git add chat-nestjs/src
git commit -m "fix(api): scope conversation messages to a participant

getMessages chỉ nhận conversationId nên người đã đăng nhập vẫn đọc được
hội thoại của người khác bằng cách đổi id trên URL."
```

---

## Task 3: Chỉ chủ nhóm mới đổi được tên và ảnh nhóm

`GroupController.updateGroupDetails` không kiểm tra gì ngoài `GroupMiddleware` (vốn chỉ xác nhận *là thành viên*). Bất kỳ ai trong nhóm cũng đổi được tên và avatar.

**Files:**
- Modify: `chat-nestjs/src/utils/types.ts:257-261`
- Modify: `chat-nestjs/src/groups/services/group.service.ts:103-113`
- Modify: `chat-nestjs/src/groups/controllers/group.controller.ts:65-75`

**Interfaces:**
- Consumes: `NotGroupOwnerException` từ `chat-nestjs/src/groups/exceptions/NotGroupOwner.ts` — sẵn có, trả `400 "Not a Group Owner"`.
- Produces: `updateDetails(params: UpdateGroupDetailsParams)` giờ yêu cầu `userId`. Task 5 cũng sửa hàm này — nếu làm Task 5 trước thì gộp hai thay đổi vào một lần sửa.

- [ ] **Bước 1: Thêm userId vào params**

`chat-nestjs/src/utils/types.ts:257`:

```ts
export type UpdateGroupDetailsParams = {
  id: number;
  userId: number;
  title?: string;
  avatar?: Attachment;
};
```

- [ ] **Bước 2: Check owner trong service**

`chat-nestjs/src/groups/services/group.service.ts:103`:

```ts
  async updateDetails(params: UpdateGroupDetailsParams): Promise<Group> {
    const group = await this.findGroupById(params.id);
    if (!group) throw new GroupNotFoundException();
    if (group.owner.id !== params.userId) throw new NotGroupOwnerException();
    if (params.avatar) {
      const key = generateUUIDV4();
      await this.imageStorageService.upload({ key, file: params.avatar });
      group.avatar = key;
    }
    group.title = params.title ?? group.title;
    return this.groupRepository.save(group);
  }
```

Thêm `import { NotGroupOwnerException } from '../exceptions/NotGroupOwner';`.

- [ ] **Bước 3: Truyền user từ controller**

`chat-nestjs/src/groups/controllers/group.controller.ts:65` — cũng xoá hai `console.log` ở dòng 72-73:

```ts
  @Patch(':id/details')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateGroupDetails(
    @AuthUser() { id: userId }: User,
    @Body() { title }: UpdateGroupDetailsDto,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() avatar: Attachment,
  ) {
    return this.groupService.updateDetails({ id, userId, avatar, title });
  }
```

- [ ] **Bước 4: Kiểm bằng tay**

Đăng nhập bằng một tài khoản **không phải** chủ nhóm, mở nhóm, thử đổi tên → phải báo lỗi. Đăng nhập bằng chủ nhóm, đổi tên → phải thành công.

- [ ] **Bước 5: Gates + commit**

```bash
docker compose exec api yarn lint && docker compose exec api yarn build
git add chat-nestjs/src
git commit -m "fix(api): restrict group detail edits to the group owner"
```

---

## Task 4: Session cookie dùng được trên HTTPS + chặn secret mẫu

`main.ts:31` đặt cookie chỉ với `maxAge`. Thiếu `secure` và `sameSite` → SPA và API khác origin trên HTTPS thật sẽ bị trình duyệt drop cookie, đăng nhập không bao giờ dính. `COOKIE_SECRET` mặc định là `change-me` — ai biết chuỗi đó là ký được cookie phiên bất kỳ.

**Files:**
- Modify: `chat-nestjs/src/main.ts:16-36`

**Interfaces:**
- Consumes: `process.env.ENVIRONMENT` — `app.module.ts:23` đã dùng biến này để chọn `.env.production`. Dùng lại đúng nó, không đẻ thêm cờ mới.
- Produces: không có API mới. `docker-compose.yml` đặt `ENVIRONMENT: DEVELOPMENT` nên dev vẫn giữ nguyên hành vi cũ.

- [ ] **Bước 1: Sửa bootstrap**

`chat-nestjs/src/main.ts`, thay dòng 16 và khối `session({...})` ở dòng 25-36:

```ts
  const { PORT, COOKIE_SECRET, ENVIRONMENT } = process.env;
  const isProduction = ENVIRONMENT === 'PRODUCTION';

  if (!COOKIE_SECRET) throw new Error('COOKIE_SECRET chưa được đặt.');
  // Giá trị mẫu ký được cookie phiên bất kỳ. Chỉ chặn ở production để lệnh
  // quickstart `cp .env.example .env && docker compose up` vẫn chạy được.
  if (isProduction && COOKIE_SECRET.startsWith('change-me'))
    throw new Error(
      'COOKIE_SECRET còn giá trị mẫu. Sinh chuỗi ngẫu nhiên: openssl rand -base64 48',
    );
```

> Chỉ chặn ở production là cố ý. Chặn ở mọi môi trường sẽ làm hỏng chính quickstart mà `README.md` hướng dẫn — `.env.example` ở gốc đặt `COOKIE_SECRET=change-me-to-a-long-random-string`, và `docker-compose.yml` mặc định `${COOKIE_SECRET:-change-me}`. Cả hai đều bắt đầu bằng `change-me` nên `startsWith` bắt được cả hai khi lên production.

```ts
  app.set('trust proxy', isProduction ? 1 : 'loopback');
  app.use(
    session({
      secret: COOKIE_SECRET,
      saveUninitialized: false,
      resave: false,
      name: 'CHAT_APP_SESSION_ID',
      cookie: {
        maxAge: 86400000, // 1 ngày
        httpOnly: true,
        // SPA và API khác origin, nên production bắt buộc secure + SameSite=None.
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
      },
      store: new TypeormStore().connect(sessionRepository),
    }),
  );
```

> `sameSite: 'none'` **bắt buộc** đi kèm `secure: true` — trình duyệt sẽ từ chối cookie nếu thiếu. Hai giá trị này phải cùng bật hoặc cùng tắt.
>
> `trust proxy: 1` cho production: `ThrottlerBehindProxyGuard` (`utils/throttler.ts:9`) đọc `req.ips[0]`. Với `'loopback'`, sau một cloud load balancer thì `req.ips` rỗng và mọi người dùng chia chung một hạn mức rate-limit.

- [ ] **Bước 2: Cập nhật file env mẫu**

Trong `chat-nestjs/.env.example` và `.env.example` ở gốc, đổi dòng `COOKIE_SECRET` thành ghi chú rõ ràng là phải thay:

```
# BẮT BUỘC đổi. Sinh bằng: openssl rand -base64 48
# App sẽ từ chối khởi động nếu giá trị vẫn là "change-me".
COOKIE_SECRET=
```

- [ ] **Bước 3: Xác nhận dev vẫn boot được**

```bash
docker compose restart api
docker compose logs api --tail 20
```

Mong đợi `Running on Port 8001`. `.env` gốc đang đặt `COOKIE_SECRET=change-me-to-a-long-random-string` (khác `change-me`) nên qua được vòng kiểm tra. Nếu `.env` của bạn để đúng `change-me`, API sẽ dừng kèm thông báo — đó là hành vi đúng, đổi giá trị đi.

Đăng nhập lại trên trình duyệt để chắc chắn session còn hoạt động.

- [ ] **Bước 4: Gates + commit**

```bash
docker compose exec api yarn lint && docker compose exec api yarn build
git add chat-nestjs/src/main.ts chat-nestjs/.env.example .env.example
git commit -m "fix(api): harden the session cookie and reject the sample secret"
```

**🏁 Hết Phase 1 — đây là điểm cắt an toàn.** Từ đây trở đi không còn rò rỉ dữ liệu. Phần còn lại là làm cho sản phẩm dùng được.

---

# Phase 2 — Tính năng đang hỏng

## Task 5: Ảnh nhóm và ảnh đính kèm luôn vỡ

Pipeline upload đứt làm đôi:
- `group.service.ts:108` upload lên **Cloudinary**, vứt `secure_url` trả về, chỉ lưu `key` (UUID).
- `image-storage.service.ts:42` upload attachment lên **DigitalOcean Spaces**, bucket `chuachat` hardcode, mà `SPACES_KEY` mặc định rỗng.
- SPA render `CDN_URL.BASE.concat(group.avatar)` → `https://chuachat.ams3.cdn.digitaloceanspaces.com/<uuid>` — **bucket của project gốc thượng nguồn**, không phải của bạn.

Avatar người dùng thì chạy, vì `user-profile.service.ts:50` lưu URL đầy đủ. Task này gom tất cả về cùng một chuẩn: **lưu URL Cloudinary đầy đủ, bỏ hẳn `CDN_URL`**.

**Files:**
- Modify: `chat-nestjs/src/image-storage/image-storage.ts`
- Modify: `chat-nestjs/src/image-storage/image-storage.service.ts:23-78`
- Modify: `chat-nestjs/src/utils/typeorm/entities/MessageAttachment.ts`
- Modify: `chat-nestjs/src/utils/typeorm/entities/GroupMessageAttachment.ts`
- Modify: `chat-nestjs/src/groups/services/group.service.ts:106-110`
- Modify: `chat-react/src/utils/types.ts:74-76` (type `MessageAttachment`)
- Modify: `chat-react/src/utils/constants.ts:101-105` (xoá enum `CDN_URL`)
- Modify: `chat-react/src/components/messages/attachments/MessageItemAttachmentContainer.tsx:44,47`
- Modify: `chat-react/src/components/groups/GroupSidebarItem.tsx:42`
- Modify: `chat-react/src/components/modals/EditGroupModal.tsx:42`
- Modify: `chat-react/src/components/conversations/ConversationInfoPanel.tsx:71`

**Interfaces:**
- Produces: `IImageStorageService.upload(params: UploadImageParams): Promise<string>` — trả `secure_url` của Cloudinary. Entity `MessageAttachment` và `GroupMessageAttachment` có thêm cột `url: string`. Phía SPA, `MessageAttachment.url` thay cho việc ghép `CDN_URL` + `key`.

> **Đừng nhầm hai type cùng tên bên SPA.** `chat-react/src/utils/types.ts` có `MessageAttachment` (dòng 74, ảnh **đã gửi**, hiện chỉ có `key`) và `Attachment` (dòng 299, `{ id, file }`, là file đang chờ gửi trong composer). Task này chỉ đụng `MessageAttachment`.

- [ ] **Bước 1: Buộc `upload` khai báo kiểu trả về**

`chat-nestjs/src/image-storage/image-storage.ts`:

```ts
export interface IImageStorageService {
  upload(params: UploadImageParams): Promise<string>;
  uploadMessageAttachment(
    params: UploadMessageAttachmentParams,
  ): Promise<MessageAttachment>;
  uploadGroupMessageAttachment(
    params: UploadGroupMessageAttachmentParams,
  ): Promise<GroupMessageAttachment>;
}
```

Và ở `image-storage.service.ts:23`, đổi chữ ký thành `upload(params: UploadImageParams): Promise<string>` rồi bỏ `console.log` ở dòng 33:

```ts
  upload(params: UploadImageParams): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = this.cloudinaryClient.uploader.upload_stream(
        {
          folder: 'upload',
          public_id: params.key,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result.secure_url);
        },
      );

      stream.end(params.file.buffer);
    });
  }
```

- [ ] **Bước 2: Thêm cột `url` vào hai entity attachment**

`chat-nestjs/src/utils/typeorm/entities/MessageAttachment.ts`:

```ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './Message';

@Entity({ name: 'message_attachments' })
export class MessageAttachment {
  @PrimaryGeneratedColumn('uuid')
  key: string;

  @Column({ nullable: true })
  url: string;

  @ManyToOne(() => Message, (message) => message.attachments, {
    onDelete: 'CASCADE',
  })
  message: Message;
}
```

Làm y hệt với `GroupMessageAttachment.ts` (thêm `Column` vào import và chèn khối `url` giống trên).

> `nullable: true` là cố ý — các hàng attachment cũ không có URL. `synchronize: true` sẽ tự thêm cột ở lần boot sau.

- [ ] **Bước 3: Đẩy attachment qua Cloudinary thay vì Spaces**

Thay cả hai hàm ở `chat-nestjs/src/image-storage/image-storage.service.ts:42-78`:

```ts
  async uploadMessageAttachment(params: UploadMessageAttachmentParams) {
    params.messageAttachment.url = await this.upload({
      key: params.messageAttachment.key,
      file: params.file,
    });
    return params.messageAttachment;
  }

  async uploadGroupMessageAttachment(
    params: UploadGroupMessageAttachmentParams,
  ): Promise<GroupMessageAttachment> {
    params.messageAttachment.url = await this.upload({
      key: params.messageAttachment.key,
      file: params.file,
    });
    return params.messageAttachment;
  }
```

Bỏ các import giờ đã thừa ở đầu file: `S3`, `compressImage`, `BadRequestException`. `eslint` sẽ chỉ ra cái nào còn sót.

> Việc này cũng xử lý luôn lỗi P1 ở Task 6 (`putObject` không await) và xoá phụ thuộc vào bucket `chuachat` của người khác. Client S3 trong `image-storage.module.ts` giờ không còn ai dùng — Task 19 dọn.

- [ ] **Bước 4: Lưu URL đầy đủ cho avatar nhóm**

`chat-nestjs/src/groups/services/group.service.ts:106` (gộp với thay đổi ở Task 3):

```ts
    if (params.avatar) {
      group.avatar = await this.imageStorageService.upload({
        key: generateUUIDV4(),
        file: params.avatar,
      });
    }
```

- [ ] **Bước 5: SPA đọc `url` thay vì ghép CDN**

`chat-react/src/utils/types.ts:74`:

```ts
export type MessageAttachment = {
  key: string;
  url: string;
};
```

`chat-react/src/components/messages/attachments/MessageItemAttachmentContainer.tsx` — bỏ import `CDN_URL`, đổi dòng 43-48:

```tsx
            onClick={() => setImageUrl(attachment.url)}
          >
            <img src={attachment.url} alt="" />
```

`chat-react/src/components/groups/GroupSidebarItem.tsx:42` — bỏ import `CDN_URL`:

```tsx
          src={group.avatar}
```

`chat-react/src/components/modals/EditGroupModal.tsx:42` — bỏ import `CDN_URL`:

```tsx
    ? group.avatar
```

`chat-react/src/components/conversations/ConversationInfoPanel.tsx` — bỏ import `CDN_URL`, đổi khối dẫn xuất ở dòng 38-40:

```tsx
  const attachmentUrls = messages
    .flatMap((message) => message.attachments ?? [])
    .map((attachment) => attachment.url);
```

và phần render ở dòng 65-75:

```tsx
          {attachmentUrls.length ? (
            <div className={styles.infoMediaGrid}>
              {attachmentUrls.slice(0, PREVIEW_LIMIT).map((url) => (
                <img
                  key={url}
                  className={styles.infoMediaItem}
                  src={url}
                  alt="ảnh đã gửi"
                />
              ))}
            </div>
          ) : (
```

Cuối cùng xoá cả enum `CDN_URL` ở `chat-react/src/utils/constants.ts:101-105`. `yarn build` sẽ báo nếu còn chỗ nào tham chiếu.

- [ ] **Bước 6: Kiểm bằng tay**

Cần `CLOUDINARY_*` thật trong `.env`. Nếu chưa có, đăng ký tài khoản free, điền vào rồi `docker compose up -d --build api`.

- Gửi một tin nhắn kèm ảnh → thumbnail phải hiện (không phải icon ảnh vỡ), bấm vào mở lightbox được.
- Đổi avatar một nhóm → ảnh mới phải hiện ở sidebar.
- Mở DevTools → Network, xác nhận URL ảnh trỏ về `res.cloudinary.com`, **không** phải `digitaloceanspaces.com`.

- [ ] **Bước 7: Gates + commit**

```bash
docker compose exec api yarn lint && docker compose exec api yarn build
docker compose exec web yarn build
git add chat-nestjs/src chat-react/src
git commit -m "fix(uploads): serve attachments and group avatars from Cloudinary

Ảnh đính kèm và avatar nhóm lưu key trần rồi được SPA ghép với CDN
DigitalOcean của project gốc, nên luôn vỡ. Lưu secure_url Cloudinary
và bỏ hẳn enum CDN_URL."
```

---

## Task 6: (đã gộp vào Task 5)

`putObject` không `await` ở `image-storage.service.ts:43` gây unhandled rejection, mà Node 20 mặc định coi là fatal → process API chết. Task 5 xoá luôn cả nhánh code S3 nên lỗi này biến mất theo.

- [ ] **Xác nhận:** sau Task 5, grep `putObject` trong `chat-nestjs/src` phải không còn kết quả nào.

---

## Task 7: Tin nhắn chỉ có ảnh không bao giờ hiện

`MessageContainer.tsx:79` bỏ qua mọi tin nhắn không có text. Composer cho phép gửi ảnh không kèm chữ, API lưu bình thường, nhưng UI vứt đi.

**Files:**
- Modify: `chat-react/src/components/messages/MessageContainer.tsx:79`

**Interfaces:**
- Consumes: `MessageType.attachments` — mảng, có thể `undefined` với tin nhắn cũ.

- [ ] **Bước 1: Chỉ bỏ qua tin nhắn thực sự rỗng**

Đổi `MessageContainer.tsx:79`:

```tsx
    // Hội thoại mới tạo có một message giữ chỗ rỗng, không content không ảnh.
    if (!message.content && !message.attachments?.length) return null;
```

- [ ] **Bước 2: Kiểm bằng tay**

Gửi một tin nhắn **chỉ có ảnh**, không gõ chữ. Ảnh phải hiện ngay trong luồng tin. Reload trang, ảnh vẫn còn.

- [ ] **Bước 3: Gate + commit**

```bash
docker compose exec web yarn build
git add chat-react/src
git commit -m "fix(web): render attachment-only messages"
```

---

## Task 8: Sập React khi hội thoại nhận tin nhắn đầu tiên

`ConversationSidebarItem.tsx:30` đặt `return null` **trước** `useParams`, `useContext`, `useDispatch`. Khi `lastMessageSent` chuyển từ `null` sang có giá trị, số hook nhảy từ 0 lên 4 giữa hai lần render → React ném *"Rendered more hooks than during the previous render"* và sập cả cây. Phụ: hội thoại mới tạo không bao giờ hiện trong sidebar.

**Files:**
- Modify: `chat-react/src/components/conversations/ConversationSidebarItem.tsx:28-47`

- [ ] **Bước 1: Dời guard xuống sau toàn bộ hook**

```tsx
export const ConversationSidebarItem: React.FC<Props> = ({ conversation }) => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const recipient = getRecipientFromConversation(conversation, user);

  const unreadCount = conversation.unreadCount ?? 0;
  const hasUnread = unreadCount > 0;
```

rồi đặt guard **sau** khối hook, ngay trước `return` chính:

```tsx
  // Hội thoại chưa có tin nhắn nào thì không hiện trong danh sách.
  if (!conversation.lastMessageSent) return null;
```

Giữ nguyên `togglePinned` và `lastMessagePreview` ở vị trí cũ — chúng không phải hook.

- [ ] **Bước 2: Kiểm chứng crash đã hết**

Cần hai tài khoản. Đăng nhập `0900000001` ở cửa sổ thường, `0900000002` ở cửa sổ ẩn danh.
1. Từ tài khoản A, tạo hội thoại mới với một người **chưa từng nhắn** (dùng "Tìm bạn theo số điện thoại").
2. Gửi tin nhắn đầu tiên.
3. Ở cửa sổ B, sidebar phải xuất hiện hội thoại mới — **không** trắng trang, console không có lỗi hook.

Trước khi sửa, bước 3 sập với "Rendered more hooks than during the previous render".

- [ ] **Bước 3: Rà các component còn lại**

`chat-react/CLAUDE.md` ghi "Several existing components call hooks after an early return null". Kiểm nốt các chỗ sau — chỉ là vi phạm nếu có hook đứng **sau** dòng return:

```bash
grep -rn "return null" chat-react/src/components chat-react/src/pages
```

Đã đối chiếu: `MessageContainer.tsx:79` (trong callback, không sao), `MessageAttachmentContainer.tsx:13` (không có hook phía sau), `SelectedParticipantContextMenu.tsx:46` (không có hook phía sau), `GroupSidebarItem.tsx:29` (nằm trong `lastMessagePreview`, không sao). Chỉ `ConversationSidebarItem` là thật sự hỏng — nhưng chạy lại grep sau khi merge để chắc chắn.

- [ ] **Bước 4: Gate + commit**

```bash
docker compose exec web yarn build
git add chat-react/src
git commit -m "fix(web): move the sidebar item guard below its hooks

lastMessageSent chuyển từ null sang có giá trị làm số hook thay đổi giữa
hai lần render và sập cây React."
```

---

## Task 9: Đăng xuất không thực sự đăng xuất

`UserSidebar.tsx:22` gọi API rồi `navigate("/login")`. Nhưng `AuthContext.user` (state ở `App.tsx:57`) vẫn còn nguyên và socket không hề `disconnect()`. Bấm Back là vào lại app như chưa đăng xuất, cho tới khi F5.

**Files:**
- Modify: `chat-react/src/utils/context/AuthContext.tsx`
- Modify: `chat-react/src/App.tsx:40-57`
- Modify: `chat-react/src/components/sidebars/UserSidebar.tsx:22-24`

**Interfaces:**
- Produces: `AuthContextType.logout: () => Promise<void>` — gọi API logout, xoá user khỏi context, ngắt socket. Task 11 dùng lại chính socket instance này.

- [ ] **Bước 1: Mở rộng context**

`chat-react/src/utils/context/AuthContext.tsx`:

```tsx
import { createContext } from 'react';
import { User } from '../types';

type AuthContextType = {
  user?: User;
  updateAuthUser: (data: User) => void;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  updateAuthUser: () => {},
  logout: async () => {},
});
```

- [ ] **Bước 2: Cài đặt logout ở App**

`chat-react/src/App.tsx` — thêm import:

```tsx
import { logoutUser } from "./utils/api";
```

Đổi `AppWithProviders` để nhận `logout` và truyền xuống provider:

```tsx
type Props = {
  user?: User;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  logout: () => Promise<void>;
  socket: Socket;
};

function AppWithProviders({
  children,
  user,
  setUser,
  logout,
}: PropsWithChildren & Props) {
  return (
    <ReduxProvider store={store}>
      <AuthContext.Provider value={{ user, updateAuthUser: setUser, logout }}>
        <SocketContext.Provider value={socket}>
          {children}
        </SocketContext.Provider>
      </AuthContext.Provider>
    </ReduxProvider>
  );
}
```

Trong `App()`, định nghĩa `logout` rồi truyền vào:

```tsx
function App() {
  const [user, setUser] = useState<User>();

  // Dọn cả ba nơi: phiên trên server, user trong context, và socket.
  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(undefined);
      socket.disconnect();
    }
  };

  return (
    <AppWithProviders
      user={user}
      setUser={setUser}
      logout={logout}
      socket={socket}
    >
```

- [ ] **Bước 3: Sidebar dùng logout của context**

`chat-react/src/components/sidebars/UserSidebar.tsx` — bỏ import `logoutUser as logoutUserAPI`, lấy `logout` từ context:

```tsx
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () =>
    logout().then(() => navigate("/login", { replace: true }));
```

và đổi nút ở dòng 51 thành `onClick={handleLogout}`.

- [ ] **Bước 4: Kiểm bằng tay**

1. Đăng nhập, bấm đăng xuất → về `/login`.
2. Bấm **nút Back của trình duyệt** → phải bị đá lại `/login`, **không** thấy giao diện app.
3. DevTools → Network → WS: kết nối socket phải đóng.

- [ ] **Bước 5: Gate + commit**

```bash
docker compose exec web yarn build
git add chat-react/src
git commit -m "fix(web): clear auth state and close the socket on logout"
```

---

## Task 10: Vào `/` ra trang trắng

`App.tsx:60-92` không khai báo `path="/"`, không có index redirect, cũng không có `path="*"`. Route layout không có path chỉ khớp khi một route con khớp — mà `/` không khớp con nào, nên `<Routes>` render `null`. Gõ sai URL cũng vậy.

**Files:**
- Modify: `chat-react/src/App.tsx:60-92`

- [ ] **Bước 1: Thêm index redirect và catch-all**

Ngay bên trong route `AuthenticatedRoute` (làm route con **đầu tiên**, trước `conversations`):

```tsx
          <Route index element={<Navigate to="/conversations" replace />} />
```

Và ngay trước thẻ đóng `</Routes>`:

```tsx
        <Route path="*" element={<Navigate to="/conversations" replace />} />
```

`Navigate` đã được import sẵn ở dòng 2.

> Catch-all trỏ về `/conversations` chứ không phải một trang 404 riêng là cố ý: `AuthenticatedRoute` sẽ tự đá người chưa đăng nhập sang `/login`, nên một đích duy nhất xử lý được cả hai trường hợp mà không cần thêm màn hình mới.

- [ ] **Bước 2: Kiểm bằng tay**

| URL | Chưa đăng nhập | Đã đăng nhập |
|---|---|---|
| `http://localhost:3100/` | → `/login` | → `/conversations` |
| `http://localhost:3100/khong-ton-tai` | → `/login` | → `/conversations` |
| `http://localhost:3100/login` | trang đăng nhập | trang đăng nhập |

Không ô nào được ra trang trắng.

- [ ] **Bước 3: Gate + commit**

```bash
docker compose exec web yarn build
git add chat-react/src/App.tsx
git commit -m "fix(web): redirect the root and unknown paths instead of rendering blank"
```

---

## Task 11: Vòng đời socket

Hai lỗi liên quan nhau:

1. `SocketContext.tsx:4` — `io()` mặc định `autoConnect: true`, nên socket dial ngay lúc load trang **trước khi đăng nhập**, bị server từ chối `Not Authenticated. No cookies were sent`, rồi vào vòng reconnect lỗi.
2. `ConversationPage.tsx:41` là nơi **duy nhất** đăng ký `socket.on("onMessage")`. Đang ở `/friends`, `/groups` hay `/settings` thì tin nhắn đến không cập nhật gì — không badge chưa đọc, không đổi danh sách hội thoại.

**Files:**
- Modify: `chat-react/src/utils/context/SocketContext.tsx`
- Modify: `chat-react/src/components/forms/login/index.tsx:44-46`
- Modify: `chat-react/src/pages/AppPage.tsx`
- Modify: `chat-react/src/pages/conversations/ConversationPage.tsx:40-69`

**Interfaces:**
- Consumes: `logout()` từ Task 9 đã gọi `socket.disconnect()` — task này bổ sung phía connect cho đối xứng.
- Produces: listener `onMessage` chuyển lên `AppPage`, sống suốt phiên đăng nhập. `ConversationPage` chỉ còn giữ `onConversation` và `onMessageDelete`.

- [ ] **Bước 1: Tắt autoConnect**

`chat-react/src/utils/context/SocketContext.tsx`:

```tsx
import { createContext } from "react";
import { io } from "socket.io-client";

// autoConnect tắt: handshake cần cookie phiên, connect trước khi đăng nhập
// chỉ tạo ra vòng reconnect lỗi auth.
export const socket = io(import.meta.env.VITE_WEBSOCKET_URL!, {
	withCredentials: true,
	autoConnect: false,
});
export const SocketContext = createContext(socket);
```

- [ ] **Bước 2: Connect khi phiên đã sẵn sàng**

Login form đã gọi `socket.connect()` ở `components/forms/login/index.tsx:45` — giữ nguyên. Nhưng người dùng quay lại với cookie còn hạn thì không đi qua form, nên `AppPage` cũng phải connect.

Trong `chat-react/src/pages/AppPage.tsx`, thêm effect này ngay sau khối `const { theme } = useSelector(...)` ở dòng 43:

```tsx
  // Người dùng quay lại với cookie còn hạn không đi qua form đăng nhập,
  // nên chỗ này lo phần connect cho luồng đó.
  useEffect(() => {
    if (!socket.connected) socket.connect();
  }, [socket]);
```

- [ ] **Bước 3: Chuyển listener onMessage lên AppPage**

Cắt khối `socket.on("onMessage", ...)` khỏi `ConversationPage.tsx:41-52` và đặt vào `AppPage.tsx` thành một effect riêng. Thêm các import cần thiết vào `AppPage.tsx`:

```tsx
import { useParams } from 'react-router-dom';
import {
  incrementUnreadCount,
  markConversationReadThunk,
  updateConversation,
} from '../store/conversationSlice';
import { addMessage } from '../store/messages/messageSlice';
import { MessageEventPayload } from '../utils/types';
```

`AppPage` là route layout nên `useParams()` ở đây **không** thấy `:id` của route con. Đọc id hội thoại đang mở từ `location` thay thế:

```tsx
  const location = useLocation();

  useEffect(() => {
    const handleMessage = (payload: MessageEventPayload) => {
      const { conversation, message } = payload;
      dispatch(addMessage(payload));
      dispatch(updateConversation(conversation));
      // Đang mở đúng hội thoại thì coi như đã đọc, ngược lại cộng chưa đọc.
      const openId = location.pathname.startsWith('/conversations/')
        ? parseInt(location.pathname.split('/')[2])
        : undefined;
      if (openId === conversation.id)
        dispatch(markConversationReadThunk(conversation.id));
      else if (message.author?.id !== user?.id)
        dispatch(incrementUnreadCount(conversation.id));
    };

    socket.on('onMessage', handleMessage);
    return () => {
      socket.off('onMessage', handleMessage);
    };
  }, [socket, dispatch, location.pathname, user?.id]);
```

Thêm `useLocation` vào import từ `react-router-dom` ở dòng 3.

Trong `ConversationPage.tsx`, xoá khối `socket.on("onMessage", ...)` và dòng `socket.off("onMessage")` trong cleanup. Bỏ luôn `socket.off("connected")` ở dòng 64 — nó gỡ listener do nơi khác đăng ký. Bỏ các import giờ đã thừa (`addMessage`, `markConversationReadThunk`, `incrementUnreadCount`, `updateConversation`, `MessageEventPayload`, có thể cả `AuthContext`) — `noUnusedLocals` sẽ chỉ ra hết.

> Truyền tham chiếu hàm vào `socket.off(name, handler)` chứ không gọi `socket.off(name)`: bản một tham số gỡ **mọi** handler của event đó, đúng cái bẫy mà `chat-react/CLAUDE.md` đã cảnh báo.

- [ ] **Bước 4: Kiểm bằng tay**

1. Mở `/login`, xem DevTools → Network → WS: **không** được có kết nối nào trước khi đăng nhập.
2. Đăng nhập → socket connect, trạng thái 101.
3. Vào tab **Bạn bè**. Từ tài khoản khác gửi cho mình một tin nhắn.
4. Badge chưa đọc phải tăng ngay khi đang ở tab Bạn bè. Trước khi sửa thì không có gì xảy ra.
5. Reload trang khi đã đăng nhập → socket tự connect lại.

- [ ] **Bước 5: Gate + commit**

```bash
docker compose exec web yarn build
git add chat-react/src
git commit -m "fix(web): connect the socket after auth and listen for messages app-wide

autoConnect dial trước khi có cookie phiên, và onMessage chỉ đăng ký ở
ConversationPage nên tin nhắn đến bị bỏ lỡ ở mọi route khác."
```

---

# Phase 3 — Lỗi logic

## Task 12: `findIndex` trả −1 làm xoá nhầm tin nhắn cuối

`messageSlice.ts` có bốn chỗ dùng kết quả `findIndex` mà không kiểm tra `-1`. `splice(-1, 1)` **xoá phần tử cuối mảng**, còn `messages[-1] = x` gán một property rác chứ không cập nhật gì.

**Files:**
- Modify: `chat-react/src/store/messages/messageSlice.ts:32-49, 64-83`
- Modify: `chat-react/src/store/groupMessageSlice.ts` (cùng lỗi — kiểm bằng grep)

- [ ] **Bước 1: Chặn −1 ở cả bốn chỗ**

Reducer `deleteMessage` (dòng 32-41):

```ts
    deleteMessage: (state, action: PayloadAction<DeleteMessageResponse>) => {
      const { payload } = action;
      const conversationMessages = state.messages.find(
        (cm) => cm.id === payload.conversationId
      );
      if (!conversationMessages) return;
      const messageIndex = conversationMessages.messages.findIndex(
        (m) => m.id === payload.messageId
      );
      if (messageIndex === -1) return;
      conversationMessages.messages.splice(messageIndex, 1);
    },
```

Reducer `editMessage` (dòng 42-49):

```ts
    editMessage: (state, action: PayloadAction<MessageType>) => {
      const message = action.payload;
      const conversationMessage = state.messages.find(
        (cm) => cm.id === message.conversation.id
      );
      if (!conversationMessage) return;
      const messageIndex = conversationMessage.messages.findIndex(
        (m) => m.id === message.id
      );
      if (messageIndex === -1) return;
      conversationMessage.messages[messageIndex] = message;
    },
```

Áp dụng đúng khuôn `if (messageIndex === -1) return;` cho `deleteMessageThunk.fulfilled` (dòng 64-72) và `editMessageThunk.fulfilled` (dòng 73-83).

- [ ] **Bước 2: Kiểm tra file group tương ứng**

```bash
grep -n "findIndex" chat-react/src/store/groupMessageSlice.ts
```

Mọi kết quả `findIndex` được dùng làm chỉ số đều cần cùng một guard.

- [ ] **Bước 3: Kiểm bằng tay**

Mở một hội thoại có ít nhất 3 tin nhắn. Xoá tin **ở giữa**. Đúng tin đó biến mất — tin cuối cùng phải còn nguyên.

- [ ] **Bước 4: Gate + commit**

```bash
docker compose exec web yarn build
git add chat-react/src/store
git commit -m "fix(web): guard findIndex misses before splicing message lists

findIndex trả -1 làm splice(-1, 1) xoá nhầm tin nhắn cuối."
```

---

## Task 13: Gateway sập handler khi người nhận offline

`gateway.ts:353` và `gateway.ts:412` cùng một lỗi: `if (!receiverSocket) socket.emit('onUserUnavailable');` **thiếu `return`**, nên dòng ngay sau đó vẫn gọi `receiverSocket.emit(...)` trên `undefined`.

**Files:**
- Modify: `chat-nestjs/src/gateway/gateway.ts:345-355, 405-414`

- [ ] **Bước 1: Thêm return**

`handleVideoCall` (dòng 345):

```ts
  @SubscribeMessage('onVideoCallInitiate')
  async handleVideoCall(
    @MessageBody() data: CreateCallDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const caller = socket.user;
    const receiverSocket = this.sessions.getUserSocket(data.recipientId);
    if (!receiverSocket) return socket.emit('onUserUnavailable');
    receiverSocket.emit('onVideoCall', { ...data, caller });
  }
```

`handleVoiceCallInitiate` (dòng 405):

```ts
  @SubscribeMessage('onVoiceCallInitiate')
  async handleVoiceCallInitiate(
    @MessageBody() payload: VoiceCallPayload,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const caller = socket.user;
    const receiverSocket = this.sessions.getUserSocket(payload.recipientId);
    if (!receiverSocket) return socket.emit('onUserUnavailable');
    receiverSocket.emit('onVoiceCall', { ...payload, caller });
  }
```

- [ ] **Bước 2: Kiểm bằng tay**

Đăng nhập một tài khoản, gọi video cho một người **đang offline**. Người gọi phải nhận `onUserUnavailable`, log API không có `TypeError`.

- [ ] **Bước 3: Gates + commit**

```bash
docker compose exec api yarn lint && docker compose exec api yarn build
git add chat-nestjs/src/gateway/gateway.ts
git commit -m "fix(gateway): stop calling emit on an offline recipient socket"
```

---

## Task 14: Validate đầu vào và giới hạn upload

Hai lỗ hổng lạm dụng:
- `CreateMessage.dto.ts` import `IsNotEmpty, IsString` nhưng **không dùng cái nào** — `content` hoàn toàn không được validate, không giới hạn độ dài.
- Multer chạy mặc định ở mọi interceptor upload → không giới hạn kích thước, không lọc kiểu file.

**Files:**
- Modify: `chat-nestjs/src/messages/dtos/CreateMessage.dto.ts`
- Modify: `chat-nestjs/src/messages/message.controller.ts:33-42`
- Modify: `chat-nestjs/src/users/controllers/user-profile.controller.ts:25`
- Modify: `chat-nestjs/src/groups/controllers/group.controller.ts:66`
- Modify: `chat-nestjs/src/utils/constants.ts`

**Interfaces:**
- Produces: hằng `UPLOAD_LIMITS` và `IMAGE_MIME_TYPES` trong `utils/constants.ts`, dùng chung cho mọi interceptor upload.

- [ ] **Bước 1: Validate content**

`chat-nestjs/src/messages/dtos/CreateMessage.dto.ts`:

```ts
import { IsOptional, IsString, MaxLength } from 'class-validator';

const MAX_MESSAGE_LENGTH = 4000;

export class CreateMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(MAX_MESSAGE_LENGTH)
  content: string;
}
```

> `@IsOptional()` chứ không phải `@IsNotEmpty()`: tin nhắn chỉ có ảnh là hợp lệ. Controller đã tự chặn trường hợp rỗng hoàn toàn bằng `EmptyMessageException` ở dòng 50.

- [ ] **Bước 2: Thêm hằng giới hạn upload**

Cuối `chat-nestjs/src/utils/constants.ts`:

```ts
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const UPLOAD_LIMITS = {
  fileSize: 5 * 1024 * 1024, // 5MB
};
```

- [ ] **Bước 3: Áp giới hạn cho từng interceptor**

`chat-nestjs/src/messages/message.controller.ts:34`:

```ts
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 5 }], {
      limits: UPLOAD_LIMITS,
      fileFilter: (_req, file, cb) =>
        cb(null, IMAGE_MIME_TYPES.includes(file.mimetype)),
    }),
  )
```

`chat-nestjs/src/users/controllers/user-profile.controller.ts:25`:

```ts
  @UseInterceptors(
    FileFieldsInterceptor(UserProfileFileFields, {
      limits: UPLOAD_LIMITS,
      fileFilter: (_req, file, cb) =>
        cb(null, IMAGE_MIME_TYPES.includes(file.mimetype)),
    }),
  )
```

`chat-nestjs/src/groups/controllers/group.controller.ts:66`:

```ts
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: UPLOAD_LIMITS,
      fileFilter: (_req, file, cb) =>
        cb(null, IMAGE_MIME_TYPES.includes(file.mimetype)),
    }),
  )
```

Thêm `IMAGE_MIME_TYPES, UPLOAD_LIMITS` vào import từ `constants` ở cả ba file.

> `cb(null, false)` khiến Multer lặng lẽ bỏ file thay vì ném lỗi. Với avatar thì `params.avatar` sẽ là `undefined` và request đi tiếp mà không đổi ảnh. Chấp nhận được ở bước này; nếu muốn báo lỗi rõ ràng thì đổi thành `cb(new BadRequestException('Chỉ nhận file ảnh'), false)`.

- [ ] **Bước 4: Kiểm bằng tay**

- Gửi ảnh dưới 5MB → thành công.
- Gửi file 10MB → bị từ chối.
- Đổi đuôi một file `.pdf` thành `.jpg` rồi upload → bị từ chối (fileFilter đọc mimetype, không đọc đuôi).
- Dán một đoạn text 5000 ký tự vào ô soạn tin → API trả 400.

- [ ] **Bước 5: Gates + commit**

```bash
docker compose exec api yarn lint && docker compose exec api yarn build
git add chat-nestjs/src
git commit -m "fix(api): validate message content and bound file uploads"
```

---

## Task 15: Phân trang tin nhắn

`MessageService.getMessages` tải **toàn bộ** tin nhắn của một hội thoại, không giới hạn. `MessageContainer.tsx:140` có handler `onScroll` nhưng thân hàm là `console.log("")` — cuộn vô hạn chưa bao giờ được làm.

Đây là task lớn nhất của Phase 3. Nếu thiếu thời gian, làm Bước 1-2 (chặn cửa sổ ở server) rồi dừng — như vậy đã hết nguy cơ tải nghìn tin nhắn, chỉ là chưa xem được lịch sử cũ.

**Files:**
- Modify: `chat-nestjs/src/utils/types.ts` (`GetMessagesParams` từ Task 2)
- Modify: `chat-nestjs/src/messages/message.service.ts`
- Modify: `chat-nestjs/src/messages/message.controller.ts`
- Modify: `chat-react/src/utils/api.ts:70-74`
- Modify: `chat-react/src/store/messages/messageThunk.ts`
- Modify: `chat-react/src/components/messages/MessageContainer.tsx:138-147`

- [ ] **Bước 1: Thêm cửa sổ vào params**

Mở rộng `GetMessagesParams` ở `chat-nestjs/src/utils/types.ts`:

```ts
export type GetMessagesParams = {
  id: number;
  userId: number;
  limit?: number;
  before?: number;
};
```

- [ ] **Bước 2: Giới hạn ở server**

`chat-nestjs/src/messages/message.service.ts`, mở rộng `getMessages` từ Task 2:

```ts
const DEFAULT_MESSAGE_PAGE_SIZE = 30;
const MAX_MESSAGE_PAGE_SIZE = 100;
```

```ts
  async getMessages({
    id,
    userId,
    limit,
    before,
  }: GetMessagesParams): Promise<Message[]> {
    const hasAccess = await this.conversationService.hasAccess({ id, userId });
    if (!hasAccess) throw new ConversationNotFoundException();
    const take = Math.min(limit ?? DEFAULT_MESSAGE_PAGE_SIZE, MAX_MESSAGE_PAGE_SIZE);
    const query = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
      .leftJoinAndSelect('message.attachments', 'attachments')
      .where('message.conversationId = :id', { id })
      .orderBy('message.createdAt', 'DESC')
      .take(take);
    // Con trỏ là id tin nhắn cũ nhất client đang giữ; id tăng dần theo thời gian.
    if (before) query.andWhere('message.id < :before', { before });
    return query.getMany();
  }
```

- [ ] **Bước 3: Nhận query param ở controller**

`chat-nestjs/src/messages/message.controller.ts`, thêm `Query` vào import `@nestjs/common`:

```ts
  @Get()
  @SkipThrottle()
  async getMessagesFromConversation(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Query('before') before?: string,
  ) {
    const messages = await this.messageService.getMessages({
      id,
      userId: user.id,
      before: before ? parseInt(before) : undefined,
    });
    return { id, messages };
  }
```

- [ ] **Bước 4: Bên SPA**

`chat-react/src/utils/api.ts:70`:

```ts
export const getConversationMessages = (
  conversationId: number,
  before?: number
) =>
  axiosClient.get<FetchMessagePayload>(
    `/conversations/${conversationId}/messages`,
    { ...config, params: before ? { before } : undefined }
  );
```

`chat-react/src/store/messages/messageThunk.ts` — thêm vào cuối:

```ts
export const fetchMoreMessagesThunk = createAsyncThunk(
  'messages/fetchMore',
  ({ id, before }: { id: number; before: number }) => {
    return getConversationMessages(id, before);
  }
);
```

`chat-react/src/store/messages/messageSlice.ts` — thêm cờ chống bắn trùng vào state:

```ts
export interface MessagesState {
  messages: ConversationMessage[];
  loading: boolean;
  loadingMore: boolean;
  exhausted: number[]; // id các hội thoại đã tải hết lịch sử
}

const initialState: MessagesState = {
  messages: [],
  loading: false,
  loadingMore: false,
  exhausted: [],
};
```

và ba case mới trong `extraReducers` (nối tin cũ vào **cuối** mảng — mảng sắp xếp mới nhất trước):

```ts
      .addCase(fetchMoreMessagesThunk.pending, (state) => {
        state.loadingMore = true;
      })
      .addCase(fetchMoreMessagesThunk.rejected, (state) => {
        state.loadingMore = false;
      })
      .addCase(fetchMoreMessagesThunk.fulfilled, (state, action) => {
        state.loadingMore = false;
        const { id, messages } = action.payload.data;
        // Trang rỗng nghĩa là đã chạm đáy lịch sử — đánh dấu để thôi hỏi nữa.
        if (!messages.length) {
          if (!state.exhausted.includes(id)) state.exhausted.push(id);
          return;
        }
        const conversationMessage = state.messages.find((cm) => cm.id === id);
        if (!conversationMessage) return;
        conversationMessage.messages.push(...messages);
      });
```

Thêm `fetchMoreMessagesThunk` vào import từ `./messageThunk` ở dòng 9.

`MessageContainer.tsx:138` — thay handler stub. Khung dùng `column-reverse` nên "cuộn hết lên trên" tương ứng `scrollTop` tiến về giá trị âm nhất:

Ngay trước `return`, lấy state phân trang:

```tsx
  const { loadingMore, exhausted } = useSelector(
    (state: RootState) => state.messages
  );
  const messages =
    (selectedType === "private"
      ? conversationMessages?.messages
      : groupMessages?.messages) ?? [];
```

rồi thay handler stub ở dòng 138-147:

```tsx
      onScroll={(e) => {
        const node = e.target as HTMLDivElement;
        const conversationId = parseInt(id!);
        // column-reverse: scrollTop âm dần khi cuộn ngược về tin cũ.
        const distanceToTop =
          node.scrollHeight - node.clientHeight + node.scrollTop;
        const oldest = messages[messages.length - 1];
        if (
          distanceToTop < 200 &&
          oldest &&
          !loadingMore &&
          !exhausted.includes(conversationId)
        ) {
          dispatch(
            fetchMoreMessagesThunk({ id: conversationId, before: oldest.id })
          );
        }
      }}
```

`loadingMore` chặn bắn trùng khi người dùng cuộn liên tục; `exhausted` chặn hỏi vô hạn khi đã tới đáy lịch sử.

- [ ] **Bước 5: Kiểm bằng tay**

Cần một hội thoại có >30 tin nhắn (sửa `chat-nestjs/src/seed/seed-data.ts` để sinh thêm rồi chạy `yarn seed`).

- Mở hội thoại → DevTools → Network cho thấy chỉ 30 tin nhắn được tải.
- Cuộn lên đầu → một request kèm `?before=` được bắn, tin cũ hơn nối vào trên.
- Cuộn tới hết lịch sử → không bắn request vô hạn.

- [ ] **Bước 6: Gates + commit**

```bash
docker compose exec api yarn lint && docker compose exec api yarn build
docker compose exec web yarn build
git add chat-nestjs/src chat-react/src
git commit -m "feat(messages): paginate conversation history

getMessages tải toàn bộ tin nhắn và onScroll là stub rỗng."
```

---

## Task 16: Thôi nuốt lỗi im lặng

`MessagePanel.tsx:82` chỉ xử lý 429 và 404. Lỗi 500 hay mất mạng thì tin nhắn không gửi được mà người dùng **không thấy gì cả**.

**Files:**
- Modify: `chat-react/src/components/messages/MessagePanel.tsx:82-103`

- [ ] **Bước 1: Thêm nhánh mặc định**

Thêm vào cuối chuỗi `if/else if` trong `catch`:

```tsx
      } else {
        dispatch(
          addSystemMessage({
            id: messageCounter,
            level: "error",
            content: "Không gửi được tin nhắn. Vui lòng thử lại.",
          })
        );
      }
```

- [ ] **Bước 2: Kiểm bằng tay**

Dừng API (`docker compose stop api`), thử gửi tin nhắn. Phải thấy thông báo lỗi trong luồng tin, không im lặng. Bật lại (`docker compose start api`).

- [ ] **Bước 3: Gate + commit**

```bash
docker compose exec web yarn build
git add chat-react/src
git commit -m "fix(web): surface unexpected send failures instead of swallowing them"
```

---

# Phase 4 — Nợ kỹ thuật

## Task 17: Thay `console.log` bằng logger thật

251 lời gọi (109 API + 142 SPA). Riêng `gateway.ts` đã 54 cái, nhiều chỗ in nguyên object user và nội dung tin nhắn — tức là **PII đang chảy vào log**.

**Files:**
- Create: `chat-nestjs/src/utils/logger.ts`
- Modify: toàn bộ `chat-nestjs/src` (109 chỗ)
- Modify: toàn bộ `chat-react/src` (142 chỗ)

- [ ] **Bước 1: Kiểm kê**

```bash
grep -rc "console\.log" --include="*.ts" --include="*.tsx" chat-nestjs/src chat-react/src | grep -v ":0" | sort -t: -k2 -rn
```

- [ ] **Bước 2: Bên API — dùng `Logger` của Nest**

Nest có sẵn `Logger`, không cần thêm thư viện. Trong mỗi service/gateway:

```ts
import { Logger } from '@nestjs/common';

export class MessagingGateway {
  private readonly logger = new Logger(MessagingGateway.name);
```

Rồi thay `console.log('Incoming Connection')` bằng `this.logger.log('Incoming Connection')`. **Xoá thẳng** những dòng chỉ in object gỡ lỗi (`console.log(payload)`, `console.log(client.rooms)`) thay vì chuyển đổi — chúng không có giá trị vận hành và là nguồn rò rỉ PII.

Làm lần lượt theo file, cao nhất trước: `gateway.ts` (54) → `seed.ts` (12) → `user-profile.service.ts` (6).

- [ ] **Bước 3: Bên SPA — xoá hết**

Trên trình duyệt gần như không cái nào có giá trị. Xoá thẳng. Cao nhất trước: `AppPage.tsx` (16) → `groupSlice.ts` (13) → `friendsSlice.ts` (12).

- [ ] **Bước 4: Xác nhận**

```bash
grep -rn "console\.log" --include="*.ts" --include="*.tsx" chat-nestjs/src chat-react/src | wc -l
```

Mong đợi `0`.

- [ ] **Bước 5: Gates + commit**

Nên chia thành vài commit (một cho API, một cho SPA) chứ đừng dồn một cục 251 chỗ.

```bash
docker compose exec api yarn lint && docker compose exec api yarn build
docker compose exec web yarn build
git commit -m "refactor(api): replace debug logging with the Nest logger"
```

---

## Task 18: Sửa bộ test đang hỏng (tuỳ chọn)

9/11 suite fail vì spec dựng `TestingModule` mà không cung cấp repository và token `Services.*` mà subject inject.

- [ ] **Bước 1: Xem lỗi cụ thể**

```bash
docker compose exec api yarn test 2>&1 | head -60
```

- [ ] **Bước 2: Sửa một suite trước để lấy khuôn**

Bắt đầu bằng `chat-nestjs/src/users/tests/user.service.spec.ts` — ít phụ thuộc nhất. Mỗi token mà subject inject cần một provider giả:

```ts
const module: TestingModule = await Test.createTestingModule({
  providers: [
    UserService,
    { provide: getRepositoryToken(User), useValue: createMock<Repository<User>>() },
    { provide: getRepositoryToken(Peer), useValue: createMock<Repository<Peer>>() },
  ],
}).compile();
```

Kiểm tra `@golevelup/ts-jest` đã có trong `package.json` chưa; nếu chưa thì dùng object literal tự viết thay cho `createMock`.

- [ ] **Bước 3: Nhân bản khuôn ra các suite còn lại**

- [ ] **Bước 4: Xác nhận**

```bash
docker compose exec api yarn test
```

Mong đợi 11/11 suite pass. **Cập nhật `CLAUDE.md` gốc** để bỏ dòng cảnh báo `yarn test` hỏng sẵn khi việc này xong.

---

## Task 19: Dọn vặt

Làm khi rảnh, không phụ thuộc lẫn nhau.

- [ ] **Xoá `compressImage` và `sharp`.** Sau Task 5 không ai gọi `compressImage` (`chat-nestjs/src/utils/helpers.ts:29`) nữa — nó là export nên eslint không bắt được. Xoá hàm, xoá `import * as sharp`, và gỡ `sharp` khỏi `package.json` (nhớ rebuild volume node_modules).
- [ ] **Xoá client S3 không còn ai dùng.** Sau Task 5, `image-storage.module.ts` vẫn tạo **hai** instance `S3` khác nhau (một ở `providers`, một ở `exports`) và một khối bị comment. Xoá cả token `Services.SPACES_CLIENT`, các biến `SPACES_*` trong file env mẫu, và gỡ `@aws-sdk/client-s3` khỏi `package.json`. Nhớ rebuild volume node_modules sau khi sửa `package.json`:
  ```bash
  docker compose down && docker volume rm zalo-web-clone_api-node-modules && docker compose up --build
  ```
- [ ] **Bật lại kiểm tra bạn bè khi tạo hội thoại.** `conversations.service.ts:127-131` — bỏ comment hoặc xoá hẳn kèm ghi chú lý do. Hiện `createMessage` vẫn kiểm tra bạn bè (`message.service.ts:39`), nên tạo được hội thoại rồi mà không nhắn được, đó là trạng thái nửa vời.
- [ ] **Xoá `AbortController` chết.** `useAuth.ts:8` và `useConversationGuard.ts:9` tạo controller nhưng không truyền vào request. Hoặc nối vào (`{ signal: controller.signal }`), hoặc xoá.
- [ ] **Bỏ độ trễ giả 1 giây.** `useAuth.ts:15,19` — `setTimeout(() => setLoading(false), 1000)` chèn một giây chờ vào mọi lần vào app.
- [ ] **Sửa `loading` khởi tạo sai.** `useConversationGuard.ts:7` khởi tạo `false` nên `ConversationPageGuard` render children trước rồi mới hiện "loading" — nháy màn hình và fetch thừa. Đổi thành `useState(true)`.
- [ ] **Sửa định dạng số điện thoại.** `helpers.ts:214` cho ra `(+84) 0912 345 678` — dùng `+84` thì bỏ số `0` đứng đầu.
- [ ] **Xoá 5 màu hex cứng** để dark mode đúng: `components/messages/index.module.scss:210`, `components/messages/attachments/index.module.scss:52`, `components/sidebars/items/index.module.scss:34`, `components/sidebars/index.module.scss:93`, `components/conversations/index.module.scss:129`. Thay bằng biến `--zl-*` phù hợp trong `chat-react/src/index.css`.
- [ ] **Xoá file chết từ thời Create React App:** `chat-react/src/__tests__/RegisterPage.spec.tsx`, `setupTests.ts`, `reportWebVitals.ts`, `react-app-env.d.ts`. Không có runner nào chạy chúng.
- [ ] **Đồng bộ chính sách mật khẩu.** `CreateUser.dto.ts:20` bắt tối thiểu 8 ký tự, nhưng `seed-data.ts:7` đặt `SEED_PASSWORD = '123456'`. Tài khoản seed không đăng ký lại được qua form.
- [ ] **Chia nhỏ bundle.** SPA build ra 1.17 MB (303 kB gzip) trong một chunk. Dùng `React.lazy` cho các route ít dùng (`calls`, `settings`) hoặc cấu hình `manualChunks` trong `vite.config.ts`.
- [ ] **Tin nhắn bị nuốt im lặng.** `messageSlice.ts:30` — `conversationMessage?.messages.unshift(message)`: nếu hội thoại chưa có trong store thì tin nhắn biến mất không dấu vết. Hoặc `dispatch(fetchMessagesThunk(conversation.id))` để nạp hội thoại, hoặc push một entry mới vào `state.messages`.
- [ ] **Thêm lint script cho SPA.** `chat-react` không có ESLint, nên `yarn build` (tsc) là lưới an toàn duy nhất — nó không bắt được lỗi rules-of-hooks như Task 8. Thêm `eslint` + `eslint-plugin-react-hooks` và một script `lint`; riêng rule `react-hooks/rules-of-hooks` đã đủ trả về giá trị cho công sức bỏ ra.
- [ ] **Quyết định về `synchronize: true` trước khi lên production.** `app.module.ts:38` cho TypeORM rewrite schema live mỗi lần boot, không có migration. Chấp nhận được ở dev, nhưng trên production một lần đổi entity có thể drop cột kèm dữ liệu. Trước khi deploy thật: tắt nó đi và sinh migration bằng `typeorm migration:generate`.
- [ ] **Thêm healthcheck + graceful shutdown cho API.** `docker-compose.yml` có healthcheck cho `mysql` nhưng không cho `api`. Thêm một route `GET /api/health` và gọi `app.enableShutdownHooks()` trong `main.ts` để container orchestrator biết trạng thái thật.

---

## Phụ lục — Chạy lại toàn bộ gate

```bash
# API
docker compose exec api yarn lint      # mong đợi: 0 error, 22 warning
docker compose exec api yarn build     # mong đợi: Done
docker compose exec api yarn test      # hỏng sẵn cho tới khi làm Task 18

# SPA
docker compose exec web yarn build     # mong đợi: built in ~17s

# Bảo mật
./chat-nestjs/scripts/check-auth.sh    # mong đợi: PASS sau Task 1
```

**Tài khoản demo:** `0900000001` … `0900000006`, mật khẩu `123456`. Nạp lại dữ liệu mẫu: `docker compose exec api yarn seed`.

**Trạng thái nhánh:** `fix/production-blockers`, tách từ `feat/zalo-ui-revamp` (hơn `main` 8 commit). Remote là `git@github.com:vnt04/zalo-web-clone.git`.
