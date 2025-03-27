import { redirect } from 'next/navigation';
import { ChannelType } from '@prisma/client';

import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { ServerWithMembersWithProfiles } from '@/types';
import { ServerSidebar } from './server-sidebar';

interface ServerSidebarWrapperProps {
  serverId: string;
}

export const ServerSidebarWrapper = async ({
  serverId
}: ServerSidebarWrapperProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
      members: {
        include: {
          profile: true,
        },
        orderBy: {
          role: "asc",
        },
      },
    }
  }) as ServerWithMembersWithProfiles;

  if (!server) {
    return redirect("/");
  }

  // Fetch projects separately
  const projects = await db.$queryRaw<Array<{
    id: string;
    name: string;
    summary: string | null;
    description: string | null;
    status: string;
    priority: string;
    leadId: string | null;
    serverId: string;
    startDate: Date | null;
    targetDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }>>`
    SELECT id, name, summary, description, status, priority, "leadId", "serverId", "startDate", "targetDate", "createdAt", "updatedAt"
    FROM "Project"
    WHERE "serverId" = ${serverId}
    ORDER BY "createdAt" ASC
  `;

  const textChannels = server.channels?.filter((channel) => channel.type === ChannelType.TEXT) || [];
  const audioChannels = server.channels?.filter((channel) => channel.type === ChannelType.AUDIO) || [];
  const videoChannels = server.channels?.filter((channel) => channel.type === ChannelType.VIDEO) || [];
  const members = server.members.filter((member) => member.profileId !== profile.id);

  const role = server.members.find((member) => member.profileId === profile.id)?.role;

  return (
    <ServerSidebar
      serverId={serverId}
      server={server}
      profile={profile}
      projects={projects}
      textChannels={textChannels}
      audioChannels={audioChannels}
      videoChannels={videoChannels}
      members={members}
      role={role}
    />
  );
}; 