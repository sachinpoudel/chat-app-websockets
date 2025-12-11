import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    room: { type: String, index: true },
    sender: { type: String, index: true },
    text: String,
    message: { text: String },
    users: [String],
    ts: { type: Date, index: true, default: Date.now },
  },
  { versionKey: false }
);
MessageSchema.index({ room: 1, ts: 1 });

export const Message = mongoose.model("Message", MessageSchema);