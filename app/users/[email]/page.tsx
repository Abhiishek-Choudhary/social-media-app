// app/users/[email]/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ProfileUI from "@/components/ProfileUI";
import { notFound } from "next/navigation";

// ✅ NO custom interface, NO PageProps — just accept params directly
export default async function UserProfilePage({
  params,
}: {
  params: Record<string, string>;
}) {
  await connectDB();

  const session = await getServerSession(authOptions);
  const decodedEmail = decodeURIComponent(params.email);

  const user = await User.findOne({ email: decodedEmail }).lean();

  if (!user) return notFound();

  const plainUser = JSON.parse(JSON.stringify(user));
  return <ProfileUI session={session} user={plainUser} />;
}
