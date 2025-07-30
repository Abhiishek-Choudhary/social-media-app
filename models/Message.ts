import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: string;
  receiver: string;
  text: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: String, required: true },     // sender email
    receiver: { type: String, required: true },   // receiver email
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
