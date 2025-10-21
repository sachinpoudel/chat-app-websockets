import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { Message } from "./model/msgSchema.js";
import { addMsg, getMessages } from "./controller/msgController.js";
import { User } from "./model/nameSchema.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "https://chat-mu73.onrender.com" },
});

app.use(express.json());
app.use(cors());

// Presence tracking: room -> (socketId -> userName)
const roomUsers = new Map<string, Map<string, string>>();
const ROOM = "group";

function getRoomUserNames(room: string): string[] {
  const m = roomUsers.get(room);
  if (!m) return [];
  return Array.from(new Set(Array.from(m.values())));
}

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("join", async (userName: string) => {
    try { const name = String(userName || "").trim();
      if (!name) return;

      // If this socket already joined with the same name, avoid duplicate notice
      let currentUsers = roomUsers.get(ROOM) ?? new Map<string, string>();
      roomUsers.set(ROOM, currentUsers);
      const alreadyJoinedSameName = currentUsers.get(socket.id) === name;

      if (alreadyJoinedSameName) {
        // still send a fresh presence snapshot to the client
        socket.emit("presence", getRoomUserNames(ROOM));
        return;
      }
      await socket.join(ROOM);
      if (!currentUsers) {
        currentUsers = new Map();
        roomUsers.set(ROOM, currentUsers);
      }
      currentUsers.set(socket.id, userName);

    
      io.to(ROOM).emit("presence", getRoomUserNames(ROOM));
      io.to(ROOM).emit("group_notice", userName);
    } catch (e) {
      console.error("join error:", e);
    }
    socket.on("disconnect", () => {
    const users = roomUsers.get(ROOM);
    if (users && users.has(socket.id)) {
      users.delete(socket.id);
      if (users.size === 0) roomUsers.delete(ROOM);
      io.to(ROOM).emit("presence", getRoomUserNames(ROOM));
    }
    console.log("user disconnected:", socket.id);
  });
  });

  socket.on("message", async (msg: { sender: string; text: string; id: number }) => {
    try {
      const saved = await Message.create({
        room: ROOM,
        sender: msg.sender,
        message: { text: msg.text },
        text: msg.text,
        ts: new Date(),
      });
      io.to(ROOM).emit("message", {
        id: msg.id,
        sender: saved.sender,
        text: saved.message?.text ?? saved.text,
        ts: saved.ts,
      });
    } catch (err) {
      console.error("Failed to save message", err);
    }
  });

  socket.on("typing", (userName: string) => {
    socket.to(ROOM).emit("typing", userName);
  });

  socket.on("stop_typing", (userName: string) => {
    socket.to(ROOM).emit("stop_typing", userName);
  });

  socket.on("disconnect", () => {
    const users = roomUsers.get(ROOM);
    if (users && users.has(socket.id)) {
      users.delete(socket.id);
      if (users.size === 0) roomUsers.delete(ROOM);
      io.to(ROOM).emit("presence", getRoomUserNames(ROOM));
    }
    console.log("user disconnected:", socket.id);
  });
});

const PORT = Number(process.env.PORT || 3000);

mongoose
  .connect(process.env.MONGO_URL!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

app.post("/api/users", async(req: Request, res: Response) => {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ msg: "name required" });
    const saveUser = await User.create({ name });
    console.log(saveUser)
    return res.status(201).json({ ok: true, name });
  } catch {
    return res.status(500).json({ ok: false });
  }
});

app.post("/api/messages", addMsg); 
app.get("/api/messages", getMessages); 

app.get("/healthz", (_req, res) => res.send("ok"));

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 