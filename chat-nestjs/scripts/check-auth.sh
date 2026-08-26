#!/usr/bin/env bash
#
# Mọi route dưới đây phải từ chối request không có session cookie.
# Chạy khi API đang lên: ./chat-nestjs/scripts/check-auth.sh
#
# 403 = AuthenticatedGuard (req.isAuthenticated() false -> ForbiddenException).
# 401 = middleware isAuthorized, chạy trước guard trên các route có :id.
# Cả hai đều là chặn đúng.
#
# 404 tính là FAIL: routing của Nest chạy TRƯỚC guard, nên 404 chỉ có nghĩa là
# dòng probe sai method/đường dẫn — nó không nói gì về việc route có được bảo
# vệ hay không. Sửa dòng probe, đừng nới điều kiện.
#
# /auth/register, /auth/login, /auth/captcha cố ý công khai nên không có ở đây.

set -uo pipefail

BASE="${API_BASE:-http://localhost:8001/api}"
failed=0
throttled=0

check() {
  local method="$1" path="$2"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' -X "$method" "$BASE$path")
  case "$code" in
    401|403)
      printf '  ok   %-6s %-45s %s\n' "$method" "$path" "$code"
      ;;
    429)
      # ThrottlerGuard là APP_GUARD nên chạy TRƯỚC AuthenticatedGuard: request
      # bị chặn thật, nhưng không chứng minh được tầng auth có hoạt động không.
      printf '  ??   %-6s %-45s 429 rate limit — chưa kết luận\n' "$method" "$path"
      throttled=1
      ;;
    *)
      printf '  FAIL %-6s %-45s %s (mong đợi 401/403)\n' "$method" "$path" "$code"
      failed=1
      ;;
  esac
}

echo "Kiểm tra route không cần đăng nhập vẫn bị chặn — $BASE"

check GET    "/auth/status"
check POST   "/auth/logout"

check GET    "/users/search?query=0900000001"
check GET    "/users/check?phoneNumber=0900000001"
check PATCH  "/users/profiles"
check PATCH  "/users/presence/status"

check GET    "/conversations"
check POST   "/conversations"
check POST   "/conversations/by-phone-number"
check GET    "/conversations/1"
check POST   "/conversations/1/read"
check PATCH  "/conversations/1/state"
check GET    "/conversations/1/messages"
check POST   "/conversations/1/messages"
check DELETE "/conversations/1/messages/1"
check PATCH  "/conversations/1/messages/1"

check GET    "/groups"
check POST   "/groups"
check GET    "/groups/1"
check PATCH  "/groups/1/owner"
check PATCH  "/groups/1/details"
check GET    "/groups/1/messages"
check POST   "/groups/1/messages"
check DELETE "/groups/1/messages/1"
check PATCH  "/groups/1/messages/1"
check POST   "/groups/1/recipients"
check DELETE "/groups/1/recipients/leave"
check DELETE "/groups/1/recipients/2"

check GET    "/friends"
check DELETE "/friends/1/delete"
check GET    "/friends/requests"
check POST   "/friends/requests"
check PATCH  "/friends/requests/1/accept"
check PATCH  "/friends/requests/1/reject"
check DELETE "/friends/requests/1/cancel"

check GET    "/exists/conversations/1"

if [[ "$failed" -ne 0 ]]; then
  echo "FAIL — còn route trả dữ liệu khi chưa đăng nhập."
  exit 1
fi

if [[ "$throttled" -ne 0 ]]; then
  echo "CHƯA KẾT LUẬN — có route dính rate limit (10 req/10s trong app.module.ts)."
  echo "Đợi ~15 giây rồi chạy lại. Không nới điều kiện để nuốt 429."
  exit 2
fi

echo "PASS — không route nào rò rỉ."
