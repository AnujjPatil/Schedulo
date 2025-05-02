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
  if (!serverId) {
    // If serverId is not provided, do not render the sidebar
    return null;
  }

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

  // Fetch projects using Prisma's query builder
  const projects = await db.project.findMany({
    where: {
      serverId: serverId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

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