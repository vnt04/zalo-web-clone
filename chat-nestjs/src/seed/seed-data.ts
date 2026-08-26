/**
 * Nội dung mẫu cho lệnh `yarn seed`. Tách khỏi seed.ts để file chạy chỉ lo phần
 * ghi dữ liệu, còn chỗ này là thứ bạn sửa khi muốn thêm người / thêm hội thoại.
 */

// Mọi tài khoản seed dùng chung mật khẩu này.
export const SEED_PASSWORD = '123456';

// Số điện thoại ghi ở dạng người dùng gõ khi đăng nhập. Lúc lưu, seed.ts đẩy
// qua normalizePhone() để ra dạng 84xxxxxxxxx giống hệt luồng đăng ký thật —
// đăng nhập tra theo số đã chuẩn hoá nên lưu sai dạng là không vào được.

export type SeedPerson = {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  avatar: string;
  about: string;
};

// people[0] là tài khoản chính để bạn đăng nhập và nhìn giao diện.
export const people: SeedPerson[] = [
  {
    phoneNumber: '0900000001',
    lastName: 'Nguyễn Văn',
    firstName: 'Nghiệp',
    avatar: 'https://i.pravatar.cc/150?img=13',
    about: 'Tài khoản demo chính',
  },
  {
    phoneNumber: '0900000002',
    lastName: 'Lê Quang',
    firstName: 'Đức',
    avatar: 'https://i.pravatar.cc/150?img=12',
    about: 'Học, học nữa, học mãi',
  },
  {
    phoneNumber: '0900000003',
    lastName: 'Trần Minh',
    firstName: 'Thư',
    avatar: 'https://i.pravatar.cc/150?img=45',
    about: 'Cà phê và deadline',
  },
  {
    phoneNumber: '0900000004',
    lastName: 'Phạm Hoàng',
    firstName: 'Long',
    avatar: 'https://i.pravatar.cc/150?img=15',
    about: '',
  },
  {
    phoneNumber: '0900000005',
    lastName: 'Đỗ Thuỳ',
    firstName: 'Linh',
    avatar: 'https://i.pravatar.cc/150?img=32',
    about: 'Sống chậm lại',
  },
  {
    phoneNumber: '0900000006',
    lastName: 'Vũ Đình',
    firstName: 'Khoa',
    avatar: 'https://i.pravatar.cc/150?img=51',
    about: 'Dev quèn',
  },
  {
    phoneNumber: '0900000007',
    lastName: 'Bùi Ngọc',
    firstName: 'Mai',
    avatar: 'https://i.pravatar.cc/150?img=47',
    about: '',
  },
  {
    phoneNumber: '0900000008',
    lastName: 'Hoàng Anh',
    firstName: 'Tuấn',
    avatar: 'https://i.pravatar.cc/150?img=68',
    about: 'Chạy bộ mỗi sáng',
  },
  {
    phoneNumber: '0900000009',
    lastName: 'Ngô Thanh',
    firstName: 'Hà',
    avatar: 'https://i.pravatar.cc/150?img=26',
    about: '',
  },
  {
    phoneNumber: '0900000010',
    lastName: 'Đặng Quốc',
    firstName: 'Bảo',
    avatar: 'https://i.pravatar.cc/150?img=59',
    about: 'Nhận sửa laptop',
  },
  {
    phoneNumber: '0900000011',
    lastName: 'Lý Kim',
    firstName: 'Chi',
    avatar: 'https://i.pravatar.cc/150?img=44',
    about: '',
  },
  {
    phoneNumber: '0900000012',
    lastName: 'Trịnh Gia',
    firstName: 'Huy',
    avatar: 'https://i.pravatar.cc/150?img=60',
    about: 'Ít nói',
  },
];

export type SeedLine = {
  // 'me' là people[0], 'them' là người còn lại của hội thoại.
  from: 'me' | 'them';
  content: string;
};

export type SeedConversation = {
  phoneNumber: string;
  // Tin cuối cách hiện tại bao nhiêu phút — quyết định thứ tự danh sách.
  lastActivityMinutesAgo: number;
  // Khoảng cách giữa hai tin liên tiếp, tính ngược từ tin cuối.
  gapMinutes: number;
  read?: boolean;
  pinned?: boolean;
  muted?: boolean;
  lines: SeedLine[];
};

export const conversations: SeedConversation[] = [
  {
    phoneNumber: '0900000002',
    lastActivityMinutesAgo: 12,
    gapMinutes: 3,
    pinned: true,
    lines: [
      { from: 'them', content: 'Alo ông ơi' },
      { from: 'me', content: 'Gì đó' },
      { from: 'them', content: 'Cái task socket ông làm xong chưa' },
      { from: 'me', content: 'Xong phần gateway rồi, còn phần client' },
      { from: 'them', content: 'Ok để tui review giúp cho' },
      { from: 'me', content: 'Chiều nay tui push lên nhánh feat/socket nha' },
      { from: 'them', content: 'Ừ push xong nhắn tui' },
      { from: 'me', content: 'Ok' },
      { from: 'them', content: 'Mà nhớ viết test giúp cái' },
      { from: 'me', content: 'Biết rồi khổ lắm nói mãi' },
      { from: 'them', content: 'Hehe' },
      { from: 'them', content: 'Tối nay ăn gì chưa' },
      { from: 'me', content: 'Chưa, đang định đi kiếm cái gì đó' },
      { from: 'them', content: 'Qua quán cũ đi, tui bao' },
    ],
  },
  {
    phoneNumber: '0900000003',
    lastActivityMinutesAgo: 40,
    gapMinutes: 6,
    pinned: true,
    read: true,
    lines: [
      { from: 'me', content: 'Chị ơi cái báo cáo tuần em gửi rồi nha' },
      { from: 'them', content: 'Chị nhận được rồi em' },
      { from: 'them', content: 'Phần số liệu tháng 7 em lấy từ đâu vậy' },
      { from: 'me', content: 'Em lấy từ dashboard bên marketing chị ạ' },
      { from: 'them', content: 'Ok vậy chuẩn rồi' },
      { from: 'them', content: 'Mai họp 9h nhé em, nhớ chuẩn bị slide' },
      { from: 'me', content: 'Dạ em nhớ rồi' },
      { from: 'me', content: 'Em gửi slide trước cho chị xem qua nha' },
      { from: 'them', content: 'Ừ gửi sớm giúp chị' },
    ],
  },
  {
    phoneNumber: '0900000004',
    lastActivityMinutesAgo: 95,
    gapMinutes: 4,
    lines: [
      { from: 'them', content: 'Ê' },
      { from: 'them', content: 'Cuối tuần này đi đá banh không' },
      { from: 'me', content: 'Mấy giờ' },
      { from: 'them', content: '5h chiều chủ nhật, sân cũ' },
      { from: 'me', content: 'Ok đi' },
      { from: 'them', content: 'Nhớ mang giày nha, lần trước mượn hoài' },
      { from: 'me', content: 'Nhớ rồi' },
      { from: 'them', content: 'Thiếu 2 người nữa, ông rủ ai đi' },
      { from: 'them', content: 'Rủ thằng Khoa với thằng Tuấn đi' },
    ],
  },
  {
    phoneNumber: '0900000005',
    lastActivityMinutesAgo: 180,
    gapMinutes: 8,
    read: true,
    lines: [
      { from: 'them', content: 'Anh ơi cho em hỏi cái đơn hàng hôm qua' },
      { from: 'me', content: 'Em nói đi' },
      { from: 'them', content: 'Bên em đặt 3 cái nhưng nhận có 2' },
      { from: 'me', content: 'Để anh kiểm tra lại đơn' },
      { from: 'me', content: 'Đúng rồi em, kho gửi thiếu 1 cái' },
      { from: 'me', content: 'Anh cho gửi bù trong hôm nay nha' },
      { from: 'them', content: 'Dạ em cảm ơn anh' },
      { from: 'them', content: 'Anh gửi giúp em cái hoá đơn luôn nha' },
      { from: 'me', content: 'Ok em' },
    ],
  },
  {
    phoneNumber: '0900000006',
    lastActivityMinutesAgo: 400,
    gapMinutes: 5,
    lines: [
      { from: 'me', content: 'Ông ơi cái bug hôm qua fix sao rồi' },
      { from: 'them', content: 'Fix rồi, do query thiếu index' },
      { from: 'me', content: 'Thảo nào chạy chậm dữ' },
      { from: 'them', content: 'Ừ thêm index xong còn 40ms' },
      { from: 'me', content: 'Ngon' },
      { from: 'them', content: 'Mà ông nhớ chạy migration trước khi deploy' },
      { from: 'me', content: 'Ok để tui note lại' },
      { from: 'them', content: 'Deploy xong nhắn tui, tui theo dõi log' },
      { from: 'them', content: 'Đừng deploy giờ cao điểm nha' },
      { from: 'them', content: 'Alo?' },
    ],
  },
  {
    phoneNumber: '0900000007',
    lastActivityMinutesAgo: 1500,
    gapMinutes: 10,
    read: true,
    muted: true,
    lines: [
      { from: 'them', content: 'Chào bạn, mình là Mai bên tuyển dụng' },
      {
        from: 'them',
        content: 'Bên mình đang tìm dev React, bạn quan tâm không',
      },
      { from: 'me', content: 'Chào bạn, cho mình xin JD với' },
      { from: 'them', content: 'Mình gửi qua mail nha, bạn cho mình xin mail' },
      { from: 'me', content: 'Bạn gửi qua đây cũng được' },
      { from: 'them', content: 'Ok để mình gửi' },
    ],
  },
  {
    phoneNumber: '0900000008',
    lastActivityMinutesAgo: 2600,
    gapMinutes: 7,
    lines: [
      { from: 'me', content: 'Sáng nay chạy được mấy km' },
      { from: 'them', content: '7km, chậm hơn hôm qua' },
      { from: 'me', content: 'Vậy là ngon rồi' },
      { from: 'them', content: 'Mai đi chung không' },
      { from: 'me', content: 'Mấy giờ' },
      { from: 'them', content: '5h30 sáng' },
      { from: 'me', content: 'Sớm quá' },
      { from: 'them', content: 'Dậy sớm quen là được' },
    ],
  },
  {
    phoneNumber: '0900000009',
    lastActivityMinutesAgo: 4300,
    gapMinutes: 12,
    read: true,
    lines: [
      { from: 'them', content: 'Anh ơi tài liệu em để trong drive rồi nha' },
      { from: 'me', content: 'Anh thấy rồi' },
      { from: 'them', content: 'Anh xem giúp em phần cuối với' },
      {
        from: 'me',
        content: 'Phần đó em viết ổn rồi, chỉ cần sửa lại tiêu đề',
      },
      { from: 'them', content: 'Dạ em sửa liền' },
      { from: 'them', content: 'Em sửa xong rồi nha anh' },
    ],
  },
  {
    phoneNumber: '0900000010',
    lastActivityMinutesAgo: 7200,
    gapMinutes: 9,
    lines: [
      { from: 'me', content: 'Anh ơi laptop em bật không lên' },
      { from: 'them', content: 'Có đèn nguồn không em' },
      { from: 'me', content: 'Có đèn mà màn hình đen' },
      {
        from: 'them',
        content: 'Chắc hỏng màn hoặc lỏng cáp, em mang qua anh xem',
      },
      { from: 'me', content: 'Chiều nay em qua được không anh' },
      { from: 'them', content: 'Được, anh ở tiệm tới 6h' },
      { from: 'them', content: 'Nhớ mang cả sạc nha em' },
    ],
  },
  {
    phoneNumber: '0900000011',
    lastActivityMinutesAgo: 11000,
    gapMinutes: 15,
    read: true,
    lines: [
      { from: 'them', content: 'Sinh nhật bé nhà mình cuối tuần này nè' },
      { from: 'me', content: 'Chúc mừng nha' },
      { from: 'them', content: 'Rảnh qua chơi nha, 5h chiều thứ 7' },
      { from: 'me', content: 'Ok mình sắp xếp' },
      { from: 'them', content: 'Nhớ qua nha, lâu rồi không gặp' },
    ],
  },
];

export type SeedGroup = {
  title: string;
  memberPhones: string[];
  lastActivityMinutesAgo: number;
  gapMinutes: number;
  lines: { fromPhone: string; content: string }[];
};

export const groups: SeedGroup[] = [
  {
    title: 'Dev Community - Coding',
    memberPhones: [
      '0900000001',
      '0900000002',
      '0900000006',
      '0900000004',
      '0900000012',
    ],
    lastActivityMinutesAgo: 55,
    gapMinutes: 4,
    lines: [
      {
        fromPhone: '0900000006',
        content: 'Team ơi hôm nay deploy lúc mấy giờ',
      },
      { fromPhone: '0900000002', content: '8h tối nha, sau giờ cao điểm' },
      { fromPhone: '0900000001', content: 'Ok tôi chuẩn bị sẵn script' },
      { fromPhone: '0900000004', content: 'Nhớ backup DB trước' },
      {
        fromPhone: '0900000006',
        content: 'Backup rồi, để trong thư mục hôm nay',
      },
      { fromPhone: '0900000012', content: 'Ok' },
      { fromPhone: '0900000002', content: 'Ai trực log tối nay' },
      { fromPhone: '0900000001', content: 'Để tôi trực cho' },
      { fromPhone: '0900000004', content: 'Có gì hú anh em nha' },
      { fromPhone: '0900000006', content: 'Ok chốt vậy đi' },
    ],
  },
  {
    title: 'Anh em cùng phòng',
    memberPhones: ['0900000001', '0900000004', '0900000008', '0900000010'],
    lastActivityMinutesAgo: 320,
    gapMinutes: 6,
    lines: [
      { fromPhone: '0900000004', content: 'Tối nay ăn gì' },
      { fromPhone: '0900000008', content: 'Lẩu đi' },
      { fromPhone: '0900000010', content: 'Lẩu hoài, đổi món đi' },
      { fromPhone: '0900000001', content: 'Nướng?' },
      { fromPhone: '0900000004', content: 'Chốt nướng' },
      { fromPhone: '0900000008', content: '7h nha' },
      { fromPhone: '0900000010', content: 'Ai đi mua đồ' },
      { fromPhone: '0900000001', content: 'Tôi với ông Long đi' },
    ],
  },
  {
    title: 'Lớp 12A2 - Họp lớp',
    memberPhones: [
      '0900000001',
      '0900000003',
      '0900000005',
      '0900000009',
      '0900000011',
      '0900000007',
    ],
    lastActivityMinutesAgo: 2000,
    gapMinutes: 20,
    lines: [
      {
        fromPhone: '0900000003',
        content: 'Mọi người ơi họp lớp năm nay tổ chức không',
      },
      { fromPhone: '0900000005', content: 'Có chứ, năm ngoái vui mà' },
      { fromPhone: '0900000009', content: 'Định làm ở đâu vậy' },
      { fromPhone: '0900000011', content: 'Về trường cũ đi mọi người' },
      { fromPhone: '0900000001', content: 'Ủng hộ về trường' },
      { fromPhone: '0900000007', content: 'Ngày nào vậy' },
      {
        fromPhone: '0900000003',
        content: 'Chắc cuối tháng, để mình lập danh sách',
      },
      { fromPhone: '0900000005', content: 'Ai đi thì thả tim nha' },
    ],
  },
];
