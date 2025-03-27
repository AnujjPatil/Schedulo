import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

// Get all members of a project
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

    // Get all members of the project
    const projectMembers = await db.projectMember.findMany({
      where: {
        project: {
          id: params.projectId,
          serverId: params.serverId
        }
      },
      include: {
        member: {
          include: {
            profile: true
          }
        }
      }
    });

    return NextResponse.json(projectMembers);
  } catch (error) {
    console.log("[PROJECT_MEMBERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Add a member to a project
export async function POST(
  req: Request,
  { params }: { params: { serverId: string; projectId: string } }
) {
  try {
    const profile = await currentProfile();
    const { memberId } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!params.projectId) {
      return new NextResponse("Project ID Missing", { status: 400 });
    }

    if (!memberId) {
      return new NextResponse("Member ID is required", { status: 400 });
    }

    // Check if user is a project lead or server admin/moderator
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

    // Check if the member to add exists in the server
    const memberToAdd = server.members.find(member => member.id === memberId);

    if (!memberToAdd) {
      return new NextResponse("Member not found in server", { status: 404 });
    }

    // Check if member is already in the project
    const existingProjectMember = await db.projectMember.findFirst({
      where: {
        projectId: params.projectId,
        memberId
      }
    });

    if (existingProjectMember) {
      return new NextResponse("Member already in project", { status: 400 });
    }

    // Add member to project
    const projectMember = await db.projectMember.create({
      data: {
        projectId: params.projectId,
        memberId
      },
      include: {
        member: {
          include: {
            profile: true
          }
        }
      }
    });

    return NextResponse.json(projectMember);
  } catch (error) {
    console.log("[PROJECT_MEMBERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 