import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectWS = (): Socket => {
  if (!socket) {
    const base = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_BASE || "http://localhost:3000";
    socket = io(base, {
      transports: ["websocket", "polling"], 
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => console.log(" Connected:", socket!.id));
    socket.on("connect_error", (err) => console.error(" Connection error:", err.message));
    socket.on("disconnect", (reason) => console.log(" Disconnected:", reason));
  }
  return socket;
};