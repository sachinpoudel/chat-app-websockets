import { Message } from "../model/msgSchema.js";
import type { Request, Response } from "express";

export const addMsg = async (req: Request, res: Response) => {
  try {
    const { from, to, message } = req.body;
    const data = await Message.create({
      room: to,
      sender: from,
      message: { text: message },
      users: [from, to],
      ts: new Date(),
    });
    res.status(201).json({ msg: "Message added successfully", data });
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (_req: Request, res: Response) => {
  try {
    const ROOM = "group";
    const limit = 200;
    const messages = await Message.find({ room: ROOM }).sort({ ts: 1 }).limit(limit);
    res.json(messages);
  } catch (ex) {
    console.error("Error retrieving messages:", ex);
    res.status(500).json({ msg: "Error retrieving messages" });
  }
};