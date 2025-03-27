"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProjectTasksProps {
  project: any;
  serverId: string;
}

export const ProjectTasks = ({
  project,
  serverId
}: ProjectTasksProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Tasks Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <Input 
              placeholder="Search tasks..." 
              className="w-[300px] bg-zinc-800/50 border-zinc-700"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {/* Task List Header */}
          <div className="grid grid-cols-12 gap-4 text-sm text-zinc-400 mb-4">
            <div className="col-span-1"></div>
            <div className="col-span-4">Task</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-2">Assigned To</div>
            <div className="col-span-1"></div>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <div className="text-zinc-400 mb-2">No tasks yet</div>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create your first task
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}; 