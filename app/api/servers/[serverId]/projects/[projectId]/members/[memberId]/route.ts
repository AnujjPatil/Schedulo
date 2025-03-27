import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

// Delete a member from a project
export async function DELETE(
  req: Request,
  { params }: { params: { serverId: string; projectId: string; memberId: string } }
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

    if (!params.memberId) {
      return new NextResponse("Member ID Missing", { status: 400 });
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
    const isSelfRemoval = params.memberId === currentMember.id;

    // Only allow removal if:
    // 1. User is removing themselves, or
    // 2. User is the project lead, or
    // 3. User is a server admin/moderator
    if (!isSelfRemoval && !isProjectLead && !isServerAdmin) {
      return new NextResponse("Insufficient permissions", { status: 403 });
    }

    // Cannot remove the project lead
    if (params.memberId === project.leadId && !isServerAdmin) {
      return new NextResponse("Cannot remove project lead", { status: 403 });
    }

    // Check if the member exists in the project
    const projectMember = await db.projectMember.findFirst({
      where: {
        projectId: params.projectId,
        memberId: params.memberId
      }
    });

    if (!projectMember) {
      return new NextResponse("Member not found in project", { status: 404 });
    }

    // Remove member from project
    await db.projectMember.delete({
      where: {
        id: projectMember.id
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log("[PROJECT_MEMBER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 