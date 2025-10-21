import { io } from "socket.io-client";


export const connectWS = () => {
    const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000");
    return socket;
};
