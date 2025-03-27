import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Package } from "lucide-react";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ProjectStatus, ProjectPriority } from "@prisma/client";
import { ProjectHeader } from "@/components/project/project-header";
import { ProjectSlider } from "@/components/project/project-slider";

import { 
  CircleCheck, 
  Calendar, 
  Target, 
  Users, 
  Plus, 
  FileEdit, 
  Link,
  PenSquare,
  ChevronDown
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ProjectIdPageProps {
  params: {
    serverId: string;
    projectId: string;
  }
}

const ProjectIdPage = async ({
  params
}: ProjectIdPageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  const project = await db.project.findUnique({
    where: {
      id: params.projectId
    },
    include: {
      lead: {
        include: {
          profile: true
        }
      },
      members: {
        include: {
          member: {
            include: {
              profile: true
            }
          }
        }
      },
      milestones: {
        orderBy: {
          createdAt: "asc"
        }
      },
      server: true
    }
  });

  if (!project) {
    return redirect(`/servers/${params.serverId}`);
  }

  const formattedStartDate = project.startDate ? format(project.startDate, "MMM d") : "Not set";
  const formattedTargetDate = project.targetDate ? format(project.targetDate, "MMM yyyy") : "Not set";
  const createdDate = format(project.createdAt, "MMM d");

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
    <div className="flex flex-col h-full bg-zinc-900 text-white">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 shadow-sm">
        <div className="flex items-center p-4">
          <Package className="h-6 w-6 mr-3 text-zinc-400" />
          <h1 className="text-xl font-bold truncate">{project.name}</h1>
        </div>
      </div>

      {/* Project Slider */}
      <ProjectSlider project={project} serverId={params.serverId} />
    </div>
  );
}

export default ProjectIdPage; 