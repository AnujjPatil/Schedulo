'use client';

import { redirect, useParams } from 'next/navigation'
import { ChannelType, MemberRole } from '@prisma/client'
import { useEffect } from 'react';

import { currentProfile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { ServerWithMembersWithProfiles } from '@/types'

import { ServerHeader } from './server-header'
import { ServerSearch } from './server-search'
import ServerSection from './server-section'
import ServerChannel from './server-channel'
import ServerMember from './server-member'
import ServerProject from './server-project'
import { 
  Hash, 
  Mic, 
  ShieldAlert, 
  ShieldCheck, 
  Video,
  Folder
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useProjectsStore } from '@/hooks/use-projects-store'

interface ServerSidebarProps {
  serverId: string;
  server: any;
  profile: any;
  projects: any[];
  textChannels: any[];
  audioChannels: any[];
  videoChannels: any[];
  members: any[];
  role: MemberRole;
}

export const ServerSidebar = ({
  serverId,
  server,
  profile,
  projects,
  textChannels,
  audioChannels,
  videoChannels,
  members,
  role
}: ServerSidebarProps) => {
  const params = useParams();
  const { setProjects, getServerProjects } = useProjectsStore();
  
  // Initialize the projects store with the server's projects
  useEffect(() => {
    if (projects && projects.length > 0) {
      setProjects(projects);
    }
  }, [projects, setProjects]);
  
  // Get projects from the store
  const storeProjects = getServerProjects(serverId);
  
  // Use store projects if available, otherwise use the server-rendered projects
  const displayProjects = storeProjects.length > 0 ? storeProjects : projects;

  const iconMap = {
    [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
    [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
    [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />
  };

  const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />,
    [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />
  };

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader
        server={server}
        role={role}
      />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: "Projects",
                type: "project",
                data: displayProjects?.map((project) => ({
                  id: project.id,
                  name: project.name,
                  icon: <Folder className="h-4 w-4 mr-2" />
                })) || []
              },
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type]
                }))
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: audioChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type]
                }))
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type]
                }))
              },
              {
                label: "Members",
                type: "member",
                data: members?.map((member) => ({
                  id: member.id,
                  name: member.profile.name,
                  icon: roleIconMap[member.role]
                }))
              },
            ]}
          />
        </div>
        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
        <div className="mb-2">
          <ServerSection
            sectionType="projects"
            role={role}
            label="Projects"
            server={server}
          />
          {!!displayProjects?.length && (
            <div className="space-y-[2px]">
              {displayProjects.map((project) => (
                <ServerProject
                  key={project.id}
                  project={project}
                  server={server}
                />
              ))}
            </div>
          )}
        </div>
        {!!textChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.TEXT}
              role={role}
              label="Text Channels"
              server={server}
            />
            <div className="space-y-[2px]">
              {textChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
        {!!audioChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.AUDIO}
              role={role}
              label="Voice Channels"
              server={server}
            />
            <div className="space-y-[2px]">
              {audioChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
        {!!videoChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.VIDEO}
              role={role}
              label="Video Channels"
              server={server}
            />
            <div className="space-y-[2px]">
              {videoChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
        {!!members?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="members"
              role={role}
              label="Members"
              server={server}
            />
            <div className="space-y-[2px]">
              {members.map((member) => (
                <ServerMember
                  key={member.id}
                  member={member}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
