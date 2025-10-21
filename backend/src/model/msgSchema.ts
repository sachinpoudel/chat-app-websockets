import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    room: { type: String, index: true },
    sender: { type: String, index: true },
    // keep both for compatibility; frontend reads message.text || text
    text: String,
    message: { text: String },
    users: [String],
    ts: { type: Date, index: true, default: Date.now },
  },
  { versionKey: false }
);

export const Message = mongoose.model("Message", MessageSchema);