import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

// Get all milestones for a project
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

    // Get all milestones for the project
    const milestones = await db.milestone.findMany({
      where: {
        projectId: params.projectId,
        project: {
          serverId: params.serverId
        }
      },
      orderBy: {
        targetDate: "asc"
      }
    });

    return NextResponse.json(milestones);
  } catch (error) {
    console.log("[PROJECT_MILESTONES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Create a new milestone for a project
export async function POST(
  req: Request,
  { params }: { params: { serverId: string; projectId: string } }
) {
  try {
    const profile = await currentProfile();
    const { name, description, targetDate, status } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!params.projectId) {
      return new NextResponse("Project ID Missing", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Milestone name is required", { status: 400 });
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
      },
      include: {
        members: true
      }
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    const currentMember = server.members.find(member => member.profileId === profile.id);

    if (!currentMember) {
      return new NextResponse("Member not found", { status: 404 });
    }

    // Get the project
    const project = await db.project.findUnique({
      where: {
        id: params.projectId,
        serverId: params.serverId
      }
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    // Check if user is project lead or server admin/moderator
    const isProjectLead = project.leadId === currentMember.id;
    const isServerAdmin = currentMember.role === MemberRole.ADMIN || currentMember.role === MemberRole.MODERATOR;

    if (!isProjectLead && !isServerAdmin) {
      return new NextResponse("Insufficient permissions", { status: 403 });
    }

    // Create the milestone
    const milestone = await db.milestone.create({
      data: {
        name,
        description: description || "",
        targetDate: targetDate ? new Date(targetDate) : null,
        status: status || "PENDING",
        projectId: params.projectId
      }
    });

    return NextResponse.json(milestone);
  } catch (error) {
    console.log("[PROJECT_MILESTONES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 