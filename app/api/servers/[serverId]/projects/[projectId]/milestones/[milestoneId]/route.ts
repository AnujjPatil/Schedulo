import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

// Get a specific milestone
export async function GET(
  req: Request,
  { params }: { params: { serverId: string; projectId: string; milestoneId: string } }
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

    if (!params.milestoneId) {
      return new NextResponse("Milestone ID Missing", { status: 400 });
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

    // Get the milestone
    const milestone = await db.milestone.findUnique({
      where: {
        id: params.milestoneId,
        projectId: params.projectId,
        project: {
          serverId: params.serverId
        }
      }
    });

    if (!milestone) {
      return new NextResponse("Milestone not found", { status: 404 });
    }

    return NextResponse.json(milestone);
  } catch (error) {
    console.log("[MILESTONE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Update a milestone
export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string; projectId: string; milestoneId: string } }
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

    if (!params.milestoneId) {
      return new NextResponse("Milestone ID Missing", { status: 400 });
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

    // Update the milestone
    const updatedMilestone = await db.milestone.update({
      where: {
        id: params.milestoneId,
        projectId: params.projectId,
        project: {
          serverId: params.serverId
        }
      },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        targetDate: targetDate !== undefined ? (targetDate ? new Date(targetDate) : null) : undefined,
        status: status !== undefined ? status : undefined
      }
    });

    return NextResponse.json(updatedMilestone);
  } catch (error) {
    console.log("[MILESTONE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Delete a milestone
export async function DELETE(
  req: Request,
  { params }: { params: { serverId: string; projectId: string; milestoneId: string } }
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

    if (!params.milestoneId) {
      return new NextResponse("Milestone ID Missing", { status: 400 });
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

    // Delete the milestone
    await db.milestone.delete({
      where: {
        id: params.milestoneId,
        projectId: params.projectId,
        project: {
          serverId: params.serverId
        }
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log("[MILESTONE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 