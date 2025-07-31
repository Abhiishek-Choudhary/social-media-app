import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

// Define a lean user type if you haven't already
type LeanUser = {
  _id: string;
  email: string;
  username: string;
  image?: string;
  following: string[];
};

export const GET = async () => {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUserEmail = session.user.email;

  try {
    const user = await User.findOne({ email: currentUserEmail }).lean();

    if (!user || typeof user !== "object") {
      console.log("User not found or invalid format");
      return NextResponse.json([], { status: 200 });
    }

    // ✅ Safe assertion through unknown to LeanUser
    const followingEmails = (user as unknown as LeanUser).following || [];

    console.log("Following emails:", followingEmails);

    const followingUsers = await User.find({
      email: { $in: followingEmails },
    }).select("email username image");

    console.log("Following Users Found:", followingUsers);

    return NextResponse.json(followingUsers, { status: 200 });
  } catch (error) {
    console.error("Error fetching following users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
