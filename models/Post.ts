// models/Post.ts

import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IPost extends Document {
  userId: string;
  content: string;
  image?: string;
  video?: string;               // ✅ New field
  createdAt: Date;
  likes: number;
  comments: { userId: string; text: string }[];
}


const PostSchema = new Schema<IPost>({
  userId: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, default: null },
  video: { type: String, default: null },   // ✅ New field for video URL
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  comments: [
    {
      userId: String,
      text: String,
      createdAt:Date,
    },
  ],
});


export default models.Post || model<IPost>('Post', PostSchema);
