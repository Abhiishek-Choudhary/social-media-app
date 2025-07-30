import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

// /api/users/following/route.ts
export const GET = async () => {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUserEmail = session.user.email;

  try {
    // ❗ Find users where *their* email is in *your* following list
    const currentUser = await User.findOne({ email: currentUserEmail }).lean();

    if (!currentUser) {
      console.log("User not found");
      return NextResponse.json([], { status: 200 });
    }

    const followingEmails = currentUser.following || [];

    console.log("Following emails:", followingEmails); // 👈 Log

    const followingUsers = await User.find({
      email: { $in: followingEmails },
    }).select("email username image");

    console.log("Following Users Found:", followingUsers); // 👈 Log

    return NextResponse.json(followingUsers, { status: 200 });
  } catch (error) {
    console.error("Error fetching following users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

