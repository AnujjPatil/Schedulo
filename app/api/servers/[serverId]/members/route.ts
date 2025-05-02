import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

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
      },
      include: {
        members: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    // Return all members with their profiles
    const members = server.members.map(member => ({
      id: member.id,
      name: member.profile.name,
      image: member.profile.imageUrl,
      role: member.role
    }));

    return NextResponse.json(members);
  } catch (error) {
    console.log("[SERVER_MEMBERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 