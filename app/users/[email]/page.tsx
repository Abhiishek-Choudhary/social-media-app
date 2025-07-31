// app/users/[email]/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ProfileUI from "@/components/ProfileUI";
import { notFound } from "next/navigation";

// ✅ Explicitly define and export the Page component with correct typing
interface Props {
  params: {
    email: string;
  };
}

export default async function UserProfilePage({ params }: Props) {
  await connectDB();

  const session = await getServerSession(authOptions);
  const decodedEmail = decodeURIComponent(params.email);
  const user = await User.findOne({ email: decodedEmail }).lean();

  if (!user) return notFound();

  const plainUser = JSON.parse(JSON.stringify(user));
  return <ProfileUI session={session} user={plainUser} />;
}
