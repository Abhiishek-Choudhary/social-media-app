import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
// import Post from "@/models/Post";
import ProfileUI from "@/components/ProfileUI";

export default async function UserProfilePage({ params }: { params: { email: string } }) {
  const session = await getServerSession(authOptions);
  await connectDB();

  // ✅ decode the email safely
  const decodedEmail = decodeURIComponent(params.email);

  const user = await User.findOne({ email: decodedEmail }).lean();

  if (!user) {
    return <p className="text-center text-red-500">User not found</p>;
  }

  // ✅ Convert to JSON-safe object before passing to Client Component
  const plainUser = JSON.parse(JSON.stringify(user));

  return <ProfileUI session={session} user={plainUser} />;
}
