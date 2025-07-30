import mongoose, { Schema, Document, models, model, Types } from "mongoose";

export interface NotificationDocument extends Document {
  recipientEmail: string;
  senderEmail: string;
  postId: Types.ObjectId;
  type: "comment" | "like";
  commentText: string;
  read?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    recipientEmail: { type: String, required: true },
    senderEmail: { type: String, required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    type: { type: String, enum: ["like", "comment"], required: true },
    read: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    commentText: { type: String },
  },
  {
    timestamps: true,
  }
);

const Notification =
  models.Notification ||
  model<NotificationDocument>("Notification", NotificationSchema);
export default Notification;
