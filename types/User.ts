export interface LeanUser {
  _id: string;
  email: string;
  username?: string;
  bio?: string;
  image?: string;
  followers: string[];
}
