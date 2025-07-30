import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username?: string;
  bio?: string;
  image?: string;
  followers: string[]; // emails of followers
  following: string[]; // emails of people this user follows
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  username: String,
  bio: String,
  image: String,
  followers: {
    type: [String], // list of user emails
    default: [],
  },
  following: {
    type: [String], // list of user emails
    default: [],
  },
});

export default models.User || model<IUser>('User', UserSchema);
