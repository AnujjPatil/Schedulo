import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function PATCH(
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

    const task = await db.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...body,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.log("[TASK_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { taskId } = params;

    const task = await db.task.delete({
      where: {
        id: taskId,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.log("[TASK_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 