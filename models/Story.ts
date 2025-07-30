import mongoose, { Schema, Document, models } from 'mongoose';

export interface StoryDocument extends Document {
  userId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: Date;
  expiresAt: Date;
  username?: string;
  userImage?: string;
}

const StorySchema = new Schema<StoryDocument>({
  userId: {
    type: String,
    required: true,
  },
  mediaUrl: {
    type: String,
    required: true,
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  username: {
    type: String,
  },
  userImage: {
    type: String,
  },
});


const Story = models.Story || mongoose.model<StoryDocument>('Story', StorySchema);
export default Story;
