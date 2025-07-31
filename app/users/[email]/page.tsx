import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ProfileUI from "@/components/ProfileUI";
import { notFound } from "next/navigation";

// ✅ Correct PageProps for app router
interface PageProps {
  params: {
    email: string;
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  await connectDB();

  const decodedEmail = decodeURIComponent(params.email);
  const user = await User.findOne({ email: decodedEmail }).lean();

  if (!user) return notFound();

  const plainUser = JSON.parse(JSON.stringify(user));
  return <ProfileUI session={session} user={plainUser} />;
}
