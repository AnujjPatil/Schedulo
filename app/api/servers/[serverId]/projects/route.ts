import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
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

    // Get all projects for the server
    const projects = await db.project.findMany({
      where: {
        serverId: params.serverId
      },
      include: {
        lead: {
          include: {
            profile: true
          }
        },
        milestones: true,
        members: {
          include: {
            member: {
              include: {
                profile: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.log("[PROJECTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    console.log("POST /api/servers/[serverId]/projects - Start");
    console.log("Server ID:", params.serverId);
    
    const profile = await currentProfile();
    const body = await req.json();
    console.log("Request body:", body);
    
    const { name, summary, description, status, priority, leadId, startDate, targetDate, milestones } = body;

    if (!profile) {
      console.log("Unauthorized - No profile found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      console.log("Server ID Missing");
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!name) {
      console.log("Project name is required");
      return new NextResponse("Project name is required", { status: 400 });
    }

    // Check if user is a member of the server with admin or moderator role
    const server = await db.server.findFirst({
      where: {
        id: params.serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR]
            }
          }
        }
      },
      include: {
        members: true
      }
    });

    if (!server) {
      console.log("Server not found or insufficient permissions");
      return new NextResponse("Server not found or insufficient permissions", { status: 404 });
    }

    // Find the member record for the creator
    const member = server.members.find(member => member.profileId === profile.id);

    if (!member) {
      console.log("Member not found");
      return new NextResponse("Member not found", { status: 404 });
    }

    console.log("Creating project with member ID:", member.id);
    
    // Create the project
    const project = await db.project.create({
      data: {
        name,
        summary: summary || "",
        description: description || "",
        status: status || "BACKLOG",
        priority: priority || "MEDIUM",
        serverId: params.serverId,
        leadId: leadId || member.id, // Default to creator if no lead specified
        startDate: startDate ? new Date(startDate) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        milestones: milestones ? {
          createMany: {
            data: milestones.map((milestone: any) => ({
              name: milestone.name,
              completed: false
            }))
          }
        } : undefined,
        members: {
          create: {
            memberId: member.id
          }
        }
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

    console.log("Project created successfully:", project.id);
    return NextResponse.json(project);
  } catch (error) {
    console.log("[PROJECT_POST] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 