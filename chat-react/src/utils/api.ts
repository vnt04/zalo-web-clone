import axios, { AxiosRequestConfig } from "axios";
import {
  AcceptFriendRequestResponse,
  AddGroupRecipientParams,
  CancelFriendRequestResponse,
  Conversation,
  ConversationStateResponse,
  ConversationType,
  CreateConversationParams,
  CreateGroupParams,
  CreateMessageParams,
  CreateUserParams,
  DeleteGroupMessageParams,
  DeleteGroupMessageResponse,
  DeleteMessageParams,
  DeleteMessageResponse,
  EditMessagePayload,
  FetchGroupMessagePayload,
  FetchMessagePayload,
  Friend,
  FriendRequest,
  Group,
  GroupMessageType,
  MessageType,
  RemoveGroupRecipientParams,
  UpdateConversationStateParams,
  UpdateGroupDetailsPayload,
  UpdateGroupOwnerParams,
  UpdateStatusParams,
  User,
  UserCredentialsParams,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL;

const axiosClient = axios.create({ baseURL: API_URL });
const config: AxiosRequestConfig = { withCredentials: true };

export const postRegisterUser = (data: CreateUserParams) =>
  axiosClient.post(`/auth/register`, data, config);

export const postLoginUser = (data: UserCredentialsParams) =>
  axiosClient.post(`/auth/login`, data, config);

export const getAuthUser = () => axiosClient.get<User>(`/auth/status`, config);

export const getConversations = () =>
  axiosClient.get<Conversation[]>(`/conversations`, config);

export const getConversationById = (id: number) =>
  axiosClient.get<Conversation>(`/conversations/${id}`, config);

export const postConversationRead = (id: number) =>
  axiosClient.post<ConversationStateResponse>(
    `/conversations/${id}/read`,
    {},
    config
  );

export const patchConversationState = ({
  id,
  ...params
}: UpdateConversationStateParams) =>
  axiosClient.patch<ConversationStateResponse>(
    `/conversations/${id}/state`,
    params,
    config
  );

// before = id tin nhắn cũ nhất đang giữ; bỏ trống để lấy trang mới nhất.
export const getConversationMessages = (
  conversationId: number,
  before?: number
) =>
  axiosClient.get<FetchMessagePayload>(
    `/conversations/${conversationId}/messages`,
    before ? { ...config, params: { before } } : config
  );

export const createMessage = (
  id: string,
  type: ConversationType,
  data: FormData
) => {
  const url =
    type === "private"
      ? `/conversations/${id}/messages`
      : `/groups/${id}/messages`;
  return axiosClient.post(url, data, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });
};

export const postNewConversation = (data: CreateConversationParams) =>
  axiosClient.post<Conversation>(`/conversations`, data, config);

export const getConversationByPhoneNumber = (phoneNumber: string) =>
  axiosClient.post<Conversation>(
    `/conversations/by-phone-number`,
    { phoneNumber },
    config
  );

export const deleteMessage = ({ id, messageId }: DeleteMessageParams) =>
  axiosClient.delete<DeleteMessageResponse>(
    `/conversations/${id}/messages/${messageId}`,
    config
  );

export const editMessage = ({ content, id, messageId }: EditMessagePayload) =>
  axiosClient.patch<MessageType>(
    `/conversations/${id}/messages/${messageId}`,
    { content },
    config
  );

export const fetchGroups = () => axiosClient.get<Group[]>(`/groups`, config);

export const fetchGroupById = (id: number) =>
  axiosClient.get<Group>(`/groups/${id}`, config);

export const fetchGroupMessages = (id: number) =>
  axiosClient.get<FetchGroupMessagePayload>(`/groups/${id}/messages`, config);

export const postGroupMessage = ({ id, content }: CreateMessageParams) =>
  axiosClient.post(`/groups/${id}/messages`, { content }, config);

// Không tìm thấy thì API trả về thân rỗng, nên phía gọi phải tự kiểm tra data.
export const searchUsers = (query: string) =>
  axiosClient.get<User | null>(`/users/search?query=${query}`, config);

export const createGroup = (params: CreateGroupParams) =>
  axiosClient.post(`/groups`, params, config);

export const deleteGroupMessage = ({
  id,
  messageId,
}: DeleteGroupMessageParams) =>
  axiosClient.delete<DeleteGroupMessageResponse>(
    `/groups/${id}/messages/${messageId}`,
    config
  );

export const editGroupMessage = ({
  content,
  id,
  messageId,
}: EditMessagePayload) =>
  axiosClient.patch<GroupMessageType>(
    `/groups/${id}/messages/${messageId}`,
    { content },
    config
  );

export const addGroupRecipient = ({ id, phoneNumber }: AddGroupRecipientParams) =>
  axiosClient.post(`/groups/${id}/recipients`, { phoneNumber }, config);

export const removeGroupRecipient = ({
  id,
  userId,
}: RemoveGroupRecipientParams) =>
  axiosClient.delete<Group>(`/groups/${id}/recipients/${userId}`, config);

export const updateGroupOwner = ({ id, newOwnerId }: UpdateGroupOwnerParams) =>
  axiosClient.patch(`/groups/${id}/owner`, { newOwnerId }, config);

export const leaveGroup = (id: number) =>
  axiosClient.delete(`/groups/${id}/recipients/leave`, config);

export const fetchFriends = () => axiosClient.get<Friend[]>("/friends", config);

export const fetchFriendRequests = () =>
  axiosClient.get<FriendRequest[]>("/friends/requests", config);

export const createFriendRequest = (phoneNumber: string) =>
  axiosClient.post<FriendRequest>("/friends/requests", { phoneNumber }, config);

export const cancelFriendRequest = (id: number) =>
  axiosClient.delete<CancelFriendRequestResponse>(
    `/friends/requests/${id}/cancel`,
    config
  );

export const acceptFriendRequest = (id: number) =>
  axiosClient.patch<AcceptFriendRequestResponse>(
    `/friends/requests/${id}/accept`,
    {},
    config
  );

export const rejectFriendRequest = (id: number) =>
  axiosClient.patch<FriendRequest>(
    `/friends/requests/${id}/reject`,
    {},
    config
  );

export const removeFriend = (id: number) =>
  axiosClient.delete<Friend>(`/friends/${id}/delete`, config);

export const checkConversationOrCreate = (recipientId: number) =>
  axiosClient.get<Conversation>(`/exists/conversations/${recipientId}`, config);

export const completeUserProfile = (data: FormData) =>
  axiosClient.post("/users/profiles", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getCaptcha = () =>
  axiosClient.get<{ svg: string }>(`/auth/captcha`, config);

export const checkPhoneNumberExists = (phoneNumber: string) =>
  axiosClient.get(`/users/check?phoneNumber=${phoneNumber}`, config);

export const updateUserProfile = (data: FormData) =>
  axiosClient.patch<User>("/users/profiles", data, {
    ...config,
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateStatusMessage = (data: UpdateStatusParams) =>
  axiosClient.patch("/users/presence/status", data, config);

export const updateGroupDetails = ({ id, data }: UpdateGroupDetailsPayload) =>
  axiosClient.patch<Group>(`/groups/${id}/details`, data, config);

export const logoutUser = () => axiosClient.post("/auth/logout", {}, config);
