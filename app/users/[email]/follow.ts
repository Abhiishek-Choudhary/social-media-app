import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// ✅ Use correct context typing
interface Context {
  params: {
    email: string;
  };
}

export async function POST(req: NextRequest, context: Context) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserEmail = session?.user?.email;

    if (!currentUserEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetEmail = decodeURIComponent(context.params.email);

    if (currentUserEmail === targetEmail) {
      return NextResponse.json({ error: "You cannot follow yourself." }, { status: 400 });
    }

    await connectDB();

    const [targetUser, currentUser] = await Promise.all([
      User.findOne({ email: targetEmail }),
      User.findOne({ email: currentUserEmail }),
    ]);

    if (!targetUser || !currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!targetUser.followers.includes(currentUserEmail)) {
      targetUser.followers.push(currentUserEmail);
      currentUser.following.push(targetEmail);

      await Promise.all([targetUser.save(), currentUser.save()]);
    }

    return NextResponse.json({ success: true, message: "Followed successfully" });
  } catch (error) {
    console.error("Follow route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
