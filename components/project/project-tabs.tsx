"use client";

import { useState } from "react";
import { List, ClipboardList, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectTasks } from "./project-tasks";
import { TaskDashboard } from "@/components/TaskManagement/TaskDashboard";
import { Button } from "@/components/ui/button";

interface ProjectTabsProps {
  project: any;
  serverId: string;
}

export const ProjectTabs = ({
  project,
  serverId
}: ProjectTabsProps) => {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="flex flex-col h-full">
      {/* Tabs Header */}
      <div className="flex items-center border-b border-border px-4 bg-background">
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "rounded-none border-b-2 px-4 py-2 text-foreground bg-background",
              activeTab === "list" ? "border-teal-500" : "border-transparent"
            )}
            onClick={() => setActiveTab("list")}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Overview
          </Button>
        </div>
      </div>
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden bg-background text-foreground">
        {activeTab === "list" ? (
          <div className="h-full">
            <ProjectTasks project={project} serverId={serverId} />
          </div>
        ) : (
          <div className="h-full p-4">
            <TaskDashboard />
          </div>
        )}
      </div>
    </div>
  );
}; 