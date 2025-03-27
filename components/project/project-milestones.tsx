'use client';

import { useModal } from "@/hooks/use-modal-store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash } from "lucide-react";

interface Milestone {
  id: string;
  name: string;
  completed: boolean;
}

interface ProjectMilestonesProps {
  project: {
    id: string;
    name: string;
  };
  milestones: Milestone[];
}

export const ProjectMilestones = ({
  project,
  milestones
}: ProjectMilestonesProps) => {
  const { onOpen } = useModal();

  const toggleMilestone = async (milestoneId: string, completed: boolean) => {
    try {
      await fetch(`/api/projects/${project.id}/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !completed }),
      });
      // In a real app, you would update the UI state here
    } catch (error) {
      console.error("Failed to update milestone:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle>Milestones</CardTitle>
          <CardDescription>
            Track progress with key milestones
          </CardDescription>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onOpen("addProjectMilestone", { project })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No milestones have been added yet
          </p>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div 
                key={milestone.id} 
                className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={milestone.id}
                    checked={milestone.completed}
                    onCheckedChange={() => toggleMilestone(milestone.id, milestone.completed)}
                  />
                  <label 
                    htmlFor={milestone.id}
                    className={`text-sm font-medium ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {milestone.name}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onOpen("editProjectMilestone", { project, milestone })}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onOpen("deleteProjectMilestone", { project, milestone })}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {milestones.length > 0 && (
        <CardFooter className="border-t pt-4">
          <div className="text-sm text-muted-foreground">
            {milestones.filter(m => m.completed).length} of {milestones.length} completed
          </div>
        </CardFooter>
      )}
    </Card>
  );
}; 