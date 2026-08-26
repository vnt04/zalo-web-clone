import { createContext } from "react";
import { io } from "socket.io-client";

// autoConnect tắt: handshake cần cookie phiên, dial trước khi đăng nhập chỉ tạo
// ra vòng reconnect lỗi auth. Connect ở LoginForm và AppPage.
export const socket = io(import.meta.env.VITE_WEBSOCKET_URL!, {
	withCredentials: true,
	autoConnect: false,
});
export const SocketContext = createContext(socket);
