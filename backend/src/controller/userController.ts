import {User} from "../model/nameSchema.js";
import  type { Request, Response }  from "express";

export const addUser = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ msg: "name required" });

    // Save or update user (upsert)
    const user = await User.findOneAndUpdate(
      { name },
      { $setOnInsert: { joinedAt: new Date() } },
      { upsert: true, new: true }
    );

    res.status(201).json({ ok: true, user });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ ok: false });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ joinedAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ msg: "Error fetching users" });
  }
};