"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectOverview } from "./project-overview";
import { ProjectTasks } from "./project-tasks";
import { cn } from "@/lib/utils";

interface ProjectSliderProps {
  project: any;
  serverId: string;
}

export const ProjectSlider = ({
  project,
  serverId
}: ProjectSliderProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex-1 overflow-hidden">
      <Tabs defaultValue="overview" className="h-full flex flex-col" onValueChange={setActiveTab}>
        <div className="border-b border-zinc-800">
          <TabsList className="w-full justify-start bg-transparent p-0 h-12">
            <TabsTrigger 
              value="overview" 
              className={cn(
                "data-[state=active]:bg-zinc-800/50 data-[state=active]:text-white",
                "h-12 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500"
              )}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className={cn(
                "data-[state=active]:bg-zinc-800/50 data-[state=active]:text-white",
                "h-12 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500"
              )}
            >
              Tasks
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="overview" className="h-full m-0">
            <ProjectOverview project={project} serverId={serverId} />
          </TabsContent>
          <TabsContent value="tasks" className="h-full m-0">
            <ProjectTasks project={project} serverId={serverId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}; 