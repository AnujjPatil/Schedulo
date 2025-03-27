'use client';

import { useModal } from "@/hooks/use-modal-store";
import { ProjectStatus, ProjectPriority } from "@prisma/client";
import { Edit, Trash, Users } from "lucide-react";
import { ActionTooltip } from "@/components/action-tooltip";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";

interface ProjectHeaderProps {
  project: {
    id: string;
    name: string;
    status: ProjectStatus;
    priority: ProjectPriority;
  };
}

export const ProjectHeader = ({
  project
}: ProjectHeaderProps) => {
  const { onOpen } = useModal();
  const params = useParams();
  const serverId = params?.serverId as string;

  const statusColorMap = {
    [ProjectStatus.BACKLOG]: "bg-gray-500",
    [ProjectStatus.PLANNED]: "bg-blue-500",
    [ProjectStatus.IN_PROGRESS]: "bg-yellow-500",
    [ProjectStatus.COMPLETED]: "bg-green-500",
    [ProjectStatus.CANCELED]: "bg-red-500",
  };

  const priorityColorMap = {
    [ProjectPriority.NO_PRIORITY]: "bg-gray-500",
    [ProjectPriority.LOW]: "bg-blue-500",
    [ProjectPriority.MEDIUM]: "bg-yellow-500",
    [ProjectPriority.HIGH]: "bg-orange-500",
    [ProjectPriority.URGENT]: "bg-red-500",
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center gap-x-2">
        <h1 className="text-xl font-semibold">{project.name}</h1>
        <Badge className={`${statusColorMap[project.status]} text-white`}>
          {project.status.replace("_", " ")}
        </Badge>
        <Badge className={`${priorityColorMap[project.priority]} text-white`}>
          {project.priority === "NO_PRIORITY" ? "No Priority" : project.priority.replace("_", " ")}
        </Badge>
      </div>
      <div className="flex items-center gap-x-2">
        <ActionTooltip label="Project Members">
          <Users 
            onClick={() => onOpen("addProjectMember", { project, serverId })}
            className="w-5 h-5 text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300 transition"
          />
        </ActionTooltip>
        <ActionTooltip label="Edit Project">
          <Edit 
            onClick={() => onOpen("editProject", { project, serverId })}
            className="w-5 h-5 text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300 transition"
          />
        </ActionTooltip>
        <ActionTooltip label="Delete Project">
          <Trash 
            onClick={() => onOpen("deleteProject", { project, serverId })}
            className="w-5 h-5 text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300 transition"
          />
        </ActionTooltip>
      </div>
    </div>
  );
}; 