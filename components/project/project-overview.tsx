"use client";

import { format } from "date-fns";
import { ProjectStatus, ProjectPriority } from "@prisma/client";
import { 
  CircleCheck, 
  Calendar, 
  Target, 
  Users, 
  Plus, 
  FileEdit, 
  Package,
  Link,
  PenSquare,
  ChevronDown
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "./project-header";

interface ProjectOverviewProps {
  project: any;
  serverId: string;
}

export const ProjectOverview = ({
  project,
  serverId
}: ProjectOverviewProps) => {
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
    <div className="p-6 space-y-8">
      {/* Project Header */}
      <ProjectHeader project={{
        ...project,
        serverId
      }} />

      {/* Properties Section - Horizontal Layout */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Properties</h2>
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4 mr-2" />
          </Button>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          {/* Status - Interactive */}
          <div className="bg-zinc-800/50 p-3 rounded-md">
            <span className="text-zinc-400 text-sm block mb-2">Status</span>
            <Button 
              variant="ghost" 
              className="p-0 h-auto w-full flex justify-between items-center hover:bg-zinc-700/50"
            >
              <Badge className={statusColorMap[project.status as ProjectStatus]}>
                {project.status.replace("_", " ")}
              </Badge>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </Button>
          </div>
          
          {/* Priority - Interactive */}
          <div className="bg-zinc-800/50 p-3 rounded-md">
            <span className="text-zinc-400 text-sm block mb-2">Priority</span>
            <Button 
              variant="ghost" 
              className="p-0 h-auto w-full flex justify-between items-center hover:bg-zinc-700/50"
            >
              <Badge className={priorityColorMap[project.priority as ProjectPriority]}>
                {project.priority === "NO_PRIORITY" ? "No Priority" : project.priority.replace("_", " ")}
              </Badge>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </Button>
          </div>
          
          {/* Lead - Interactive */}
          <div className="bg-zinc-800/50 p-3 rounded-md">
            <span className="text-zinc-400 text-sm block mb-2">Lead</span>
            <Button 
              variant="ghost" 
              className="p-0 h-auto w-full flex justify-between items-center hover:bg-zinc-700/50"
            >
              <div className="flex items-center">
                {project.lead ? (
                  <>
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={project.lead.profile.imageUrl} />
                      <AvatarFallback>
                        {project.lead.profile.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{project.lead.profile.name}</span>
                  </>
                ) : (
                  <span className="text-zinc-500">Unassigned</span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </Button>
          </div>
          
          {/* Members - Interactive */}
          <div className="bg-zinc-800/50 p-3 rounded-md">
            <span className="text-zinc-400 text-sm block mb-2">Members</span>
            <Button 
              variant="ghost" 
              className="p-0 h-auto w-full flex justify-between items-center hover:bg-zinc-700/50"
            >
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                <span className="text-zinc-400">Add members</span>
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </Button>
          </div>
          
          {/* Teams - Interactive */}
          <div className="bg-zinc-800/50 p-3 rounded-md">
            <span className="text-zinc-400 text-sm block mb-2">Teams</span>
            <Button 
              variant="ghost" 
              className="p-0 h-auto w-full flex justify-between items-center hover:bg-zinc-700/50"
            >
              <div className="flex items-center">
                <Package className="h-4 w-4 mr-2 text-emerald-500" />
                <span>{project.server.name}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </Button>
          </div>
          
          {/* Start date - Interactive */}
          <div className="bg-zinc-800/50 p-3 rounded-md">
            <span className="text-zinc-400 text-sm block mb-2">Start date</span>
            <Button 
              variant="ghost" 
              className="p-0 h-auto w-full flex justify-between items-center hover:bg-zinc-700/50"
            >
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formattedStartDate}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </Button>
          </div>
          
          {/* Target date - Interactive */}
          <div className="bg-zinc-800/50 p-3 rounded-md">
            <span className="text-zinc-400 text-sm block mb-2">Target date</span>
            <Button 
              variant="ghost" 
              className="p-0 h-auto w-full flex justify-between items-center hover:bg-zinc-700/50"
            >
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                <span>{formattedTargetDate}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Resources Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Resources</h2>
        </div>
        <div className="flex items-center text-zinc-400">
          <Button variant="ghost" size="sm" className="flex items-center text-zinc-400 p-0 h-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span>Document or link</span>
          </Button>
        </div>
      </div>
    </div>
  );
}; 