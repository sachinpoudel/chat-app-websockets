import { io } from "socket.io-client";


export const connectWS = () => {
    const socket = io(import.meta.env.VITE_WS_URL || "http://localhost:3000");
    return socket;
};
