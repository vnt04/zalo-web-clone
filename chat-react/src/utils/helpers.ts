import { format, isSameDay } from "date-fns";
import {
  LuMessageCircle,
  LuUsers,
  LuUser,
  LuSettings,
} from "react-icons/lu";
import {
  IoIosPerson,
  IoIosNotifications,
  IoIosLock,
  IoMdInfinite,
  IoMdColorPalette,
  IoMdVideocam,
} from "react-icons/io";
import {
  Conversation,
  Friend,
  FriendRequest,
  FriendRequestDetailsType,
  Group,
  SettingsSidebarRouteType,
  User,
  UserSidebarRouteType,
} from "./types";

export const getRecipientFromConversation = (
  conversation?: Conversation,
  user?: User
) => {
  return user?.id === conversation?.creator.id
    ? conversation?.recipient
    : conversation?.creator;
};

export const isGroupOwner = (user?: User, group?: Group) =>
  user?.id === group?.owner.id;

export const getUserSidebarIcon = (id: UserSidebarRouteType) => {
  switch (id) {
    case "conversations":
      return LuMessageCircle;
    case "groups":
      return LuUsers;
    case "friends":
      return LuUser;
    case "settings":
      return LuSettings;
    case "calls":
      return IoMdVideocam;
    default:
      return LuMessageCircle;
  }
};

export const getSettingSidebarIcon = (id: SettingsSidebarRouteType) => {
  switch (id) {
    case "profile":
      return IoIosPerson;
    case "security":
      return IoIosLock;
    case "notifications":
      return IoIosNotifications;
    case "integrations":
      return IoMdInfinite;
    case "appearance":
      return IoMdColorPalette;
  }
};

export const getFriendRequestDetails = (
  { receiver, sender }: FriendRequest,
  user?: User
): FriendRequestDetailsType =>
  user?.id === receiver.id
    ? {
        status: "Muốn kết bạn với bạn",
        displayName: `${sender.firstName} ${sender.lastName}`,
        user: sender,
        incoming: true,
      }
    : {
        status: "Đã gửi lời mời kết bạn",
        displayName: `${receiver.firstName} ${receiver.lastName}`,
        user: receiver,
        incoming: false,
      };

export const getUserFriendInstance = (
  authenticatedUser: User,
  selectedFriend: Friend
) =>
  authenticatedUser?.id === selectedFriend?.sender.id
    ? selectedFriend?.receiver
    : selectedFriend?.sender;

/**
 * TH1: < 24h =>  giờ, phút, giây
 * TH2: 24h < ... < 48h => Hôm qua
 * TH3: 48h < ... < 7 days => x ngày
 * TH4: 7 days < ...< current year => dd/mm
 * TH5: < current year => dd/mm/yy
 */
export const getLastMessageSentTime = (rawDate: Date | string) => {
  const date = new Date(rawDate);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isSameYear = now.getFullYear() === date.getFullYear();

  if (diffSeconds < 60) {
    return `Vài giây`;
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} phút`;
  }

  if (diffHours < 24) {
    return `${diffHours} giờ`;
  }

  if (diffHours < 48) {
    return "Hôm qua";
  }

  if (diffDays < 7) {
    return `${diffDays} ngày`;
  }

  if (isSameYear) {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

/**
 * Nhãn cho dải phân cách ngày giữa luồng tin: "Hôm nay", "Hôm qua", còn lại là
 * dd/MM/yyyy.
 */
export const getMessageDayLabel = (rawDate: Date | string) => {
  const date = new Date(rawDate);
  if (isNaN(date.getTime())) return "";

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Hôm nay";
  if (isSameDay(date, yesterday)) return "Hôm qua";
  return format(date, "dd/MM/yyyy");
};

export const getMessageSentTime = (isoString: string) => {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const isPhoneNumber = (phone: string): boolean => {
  const regex = /^(?:\+84|0)(3|5|7|8|9)\d{8}$/;
  return regex.test(phone);
};

const VN_MOBILE = /^[35789]\d{8}$/;

/**
 * Bỏ tiền tố quốc gia/số 0 và trả về 9 số thuê bao, null nếu không hợp lệ.
 * Rộng hơn isPhoneNumber ở trên: chấp nhận cả dạng không tiền tố mà API nhận.
 * Chân lý vẫn nằm ở chat-nestjs/src/utils/phone.ts, đây chỉ để báo lỗi sớm.
 */
export const toNationalPhoneNumber = (raw: string): string | null => {
  const digits = raw.replace(/\D/g, "");
  let national = digits;
  if (digits.startsWith("84")) national = digits.slice(2);
  else if (digits.startsWith("0")) national = digits.slice(1);
  return VN_MOBILE.test(national) ? national : null;
};

export const formatPhoneNumber = (raw: string): string => {
  const national = toNationalPhoneNumber(raw);
  if (!national) return raw;
  // Dùng +84 thì bỏ số 0 đứng đầu, không viết cả hai.
  return `(+84) ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(
    6
  )}`;
};
