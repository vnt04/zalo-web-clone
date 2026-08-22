import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Kept identical inside and outside the container so Vite's HMR client dials
// back on the port the browser actually used.
const port = Number(process.env.WEB_PORT) || 3000;

// Bind-mounted sources on macOS/Windows do not deliver inotify events reliably.
const usePolling = process.env.CHOKIDAR_USEPOLLING === "true";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: true,
		port,
		strictPort: true,
		watch: usePolling ? { usePolling: true, interval: 300 } : undefined,
	},
});
