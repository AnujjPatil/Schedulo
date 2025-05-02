"use client";

import { ProjectTasks } from "./project-tasks";

interface ProjectSliderProps {
  project: any;
  serverId: string;
}

export const ProjectSlider = ({
  project,
  serverId
}: ProjectSliderProps) => {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <ProjectTasks project={project} serverId={serverId} />
      </div>
    </div>
  );
}; 