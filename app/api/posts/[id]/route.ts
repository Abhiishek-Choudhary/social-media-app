import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/posts/[id]
export async function DELETE(req: NextRequest) {
  await connectDB();

  const postId = req.nextUrl.pathname.split("/")[3]; // Extract ID from URL

  try {
    const deleted = await Post.findByIdAndDelete(postId);
    if (!deleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

// PUT /api/posts/[id]
export async function PUT(req: NextRequest) {
  await connectDB();

  const postId = req.nextUrl.pathname.split("/")[3]; // Extract ID from URL

  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const updated = await Post.findByIdAndUpdate(
      postId,
      { content },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// Optional GET fallback
export async function GET() {
  return NextResponse.json({ message: "GET not implemented" });
}
