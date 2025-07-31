// app/users/[email]/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ProfileUI from "@/components/ProfileUI";
import { notFound } from "next/navigation";

export default async function UserProfilePage({ params }: { params: { email: string } }) {
  const session = await getServerSession(authOptions);
  await connectDB();

  const decodedEmail = decodeURIComponent(params.email);
  const user = await User.findOne({ email: decodedEmail }).lean();

  // ✅ Use Next.js's built-in 404 mechanism
  if (!user) return notFound();

  const plainUser = JSON.parse(JSON.stringify(user));
  return <ProfileUI session={session} user={plainUser} />;
}
