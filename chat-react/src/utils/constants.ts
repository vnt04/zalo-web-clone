import {
  ContextMenuItemType,
  ConversationTypeData,
  SettingsItemType,
  UserSidebarItemType,
} from './types';

export const chatTypes: ConversationTypeData[] = [
  {
    type: 'private',
    label: 'Private',
  },
  {
    type: 'group',
    label: 'Group',
  },
];

export const userContextMenuItems: ContextMenuItemType[] = [
  {
    label: 'Kick User',
    action: 'kick',
    color: '#ff0000',
    ownerOnly: true,
  },
  {
    label: 'Transfer Owner',
    action: 'transfer_owner',
    color: '#FFB800',
    ownerOnly: true,
  },
  {
    label: 'Profile',
    action: 'profile',
    color: '#7c7c7c',
    ownerOnly: false,
  },
];

export const friendsNavbarItems = [
  {
    id: 'friends',
    label: 'Bạn bè',
    pathname: '/friends',
  },
  {
    id: 'requests',
    label: 'Lời mời kết bạn',
    pathname: '/friends/requests',
  },
  {
    id: 'blocked',
    label: 'Đã chặn',
    pathname: '/friends/blocked',
  },
];

export const userSidebarItems: UserSidebarItemType[] = [
  {
    id: 'conversations',
    pathname: '/conversations',
    group: 'primary',
  },
  {
    id: 'groups',
    pathname: '/groups',
    group: 'primary',
  },
  {
    id: 'friends',
    pathname: '/friends',
    group: 'primary',
  },
  {
    id: 'calls',
    pathname: '/calls',
    group: 'primary',
  },
  {
    id: 'settings',
    pathname: '/settings',
    group: 'utility',
  },
];

export const settingsItems: SettingsItemType[] = [
  // Chỉ liệt kê mục đã có route trong App.tsx — security/notifications/integrations
  // chưa có màn hình nào nên bỏ ra, bấm vào chỉ ra vùng trắng.
  {
    id: 'profile',
    label: 'Thông tin tài khoản',
    pathname: '/settings/profile',
  },
  {
    id: 'appearance',
    label: 'Giao diện',
    pathname: '/settings/appearance',
  },
];


export enum SenderEvents {
  VIDEO_CALL_INITIATE = 'onVideoCallInitiate',
  VIDEO_CALL_ACCEPT = 'videoCallAccepted',
  VOICE_CALL_INITIATE = 'onVoiceCallInitiate',
  VOICE_CALL_ACCEPT = 'onVoiceCallAccepted',
}

export enum ReceiverEvents {
  VOICE_CALL = 'onVoiceCall',
}

export enum WebsocketEvents {
  VOICE_CALL_ACCEPTED = 'onVoiceCallAccepted',
  VOICE_CALL_HANG_UP = 'onVoiceCallHangUp',
  VOICE_CALL_REJECTED = 'onVoiceCallRejected',
  VIDEO_CALL_REJECTED = 'onVideoCallRejected',
}

export type CountryDialCode = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
};

// normalizePhone ở API (chat-nestjs/src/utils/phone.ts) chỉ chấp nhận đầu số di
// động Việt Nam, nên thêm quốc gia ở đây phải sửa kèm bên đó.
export const COUNTRY_DIAL_CODES: CountryDialCode[] = [
  {
    code: 'VN',
    name: 'Việt Nam',
    dialCode: '84',
    flag: '🇻🇳',
  },
];
