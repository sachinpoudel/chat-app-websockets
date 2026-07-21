import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { Message } from "./model/msgSchema.js";
import { addMsg, getMessages } from "./controller/msgController.js";
import { User } from "./model/nameSchema.js";
import { addUser, getAllUsers } from "./controller/userController.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());

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
    try {
      const name = String(userName || "").trim();
      if (!name) return;

      await socket.join(ROOM);

      let users = roomUsers.get(ROOM);
      if (!users) {
        users = new Map();
        roomUsers.set(ROOM, users);
      }

      const alreadyJoined = users.get(socket.id) === name;
      users.set(socket.id, name);

      io.to(ROOM).emit("presence", getRoomUserNames(ROOM));

      // Only emit join notice if this is a new join
    if (!alreadyJoined) {
      const recentJoin = await Message.findOne({
        room: ROOM,
        sender: "system",
        text: `${name} joined the chat`,
        ts: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
      });

      if (!recentJoin) {
        // Save system message
        await Message.create({
          room: ROOM,
          sender: "system",
          message: { text: `${name} joined the chat` },
          text: `${name} joined the chat`,
          ts: new Date(),
        });

        io.to(ROOM).emit("group_notice", name);
      }
    }
    } catch (e) {
      console.error("join error:", e);
    }
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
      
      // Echo to ALL clients in the room (sender + receivers)
      io.to(ROOM).emit("message", {
        id: saved._id.toString(),
        sender: saved.sender,
        text: saved.message?.text ?? saved.text,
        ts: new Date(saved.ts).getTime(),
      });
    } catch (err) {
      console.error("Failed to save message", err);
    }
  });


// socket.on("private_msg", async (data: { from: string; to: string; text: string }) => {
//   try {
//     const { from, to, text } = data;
//     const saved = await Message.create({
//       room: "private",
//       sender: from,
//       message: { text },
//       text,
//       ts: new Date(),
//     });
//     console.log("Private message saved:", saved);
//     // Emit only to the sender and receiver if they are connected
//     const senderSocket = Array.from(io.sockets.sockets.values()).find((s) => s.id === from);
//     const receiverSocket = Array.from(io.sockets.sockets.values()).find((s) => s.id === to);
//     if (senderSocket && receiverSocket) {
//       senderSocket.emit("private_msg", {
//         from,
//         to,
//         text,
//         ts: new Date(),
//       });
//       receiverSocket.emit("private_msg", {
//         from,
//         to,
//         text,
//         ts: new Date(),
//       });
//     }
//   } catch (error) {
//     console.error("Error handling private message:", error);
//   }
// })



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

app.post('/api/users', addUser)
app.get('/api/users', getAllUsers)

app.post("/api/messages", addMsg); // for 1:1 (optional)
app.get("/api/messages", getMessages); // group history

app.get("/healthz", (_req, res) => res.send("ok"));

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});