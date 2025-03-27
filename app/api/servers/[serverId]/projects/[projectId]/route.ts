import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { serverId: string; projectId: string } }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!params.projectId) {
      return new NextResponse("Project ID Missing", { status: 400 });
    }

    // Check if user is a member of the server
    const server = await db.server.findFirst({
      where: {
        id: params.serverId,
        members: {
          some: {
            profileId: profile.id,
          }
        }
      }
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    // Get the project with all its details
    const project = await db.project.findUnique({
      where: {
        id: params.projectId,
        serverId: params.serverId
      },
      include: {
        members: {
          include: {
            member: {
              include: {
                profile: true
              }
            }
          }
        },
        milestones: true,
        lead: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.log("[PROJECT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string, projectId: string } }
) {
  try {
    const profile = await currentProfile();
    const { serverId, projectId } = params;
    const values = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!projectId) {
      return new NextResponse("Project ID missing", { status: 400 });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id
          }
        }
      }
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    const project = await db.project.update({
      where: {
        id: projectId,
        serverId: serverId,
      },
      data: {
        name: values.name,
        summary: values.summary,
        description: values.description,
        status: values.status,
        priority: values.priority,
        leadId: values.leadId,
        startDate: values.startDate,
        targetDate: values.targetDate,
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.log("[PROJECT_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { serverId: string, projectId: string } }
) {
  try {
    const profile = await currentProfile();
    const { serverId, projectId } = params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!projectId) {
      return new NextResponse("Project ID missing", { status: 400 });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id
          }
        }
      }
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    const project = await db.project.delete({
      where: {
        id: projectId,
        serverId: serverId,
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.log("[PROJECT_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 