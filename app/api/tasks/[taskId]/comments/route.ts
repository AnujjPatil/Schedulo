import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { taskId } = params;
    const body = await req.json();

    const comment = await db.taskComment.create({
      data: {
        content: body.content,
        imageUrl: body.imageUrl,
        isCompleted: body.isCompleted,
        taskId,
        userId: profile.id,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.log("[TASK_COMMENT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 