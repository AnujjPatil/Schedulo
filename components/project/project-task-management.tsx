"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompletedTask {
  id: string;
  name: string;
  description: string;
  completionDate: Date;
  dailyProgress: {
    date: Date;
    progress: string;
  }[];
  feedback: {
    date: Date;
    type: "complaint" | "suggestion" | "change";
    content: string;
  }[];
  projectId: string;
}

interface ProjectTaskManagementProps {
  projectId: string;
  serverId: string;
}

export const ProjectTaskManagement = ({
  projectId,
  serverId
}: ProjectTaskManagementProps) => {
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>(() => {
    const storageKey = `completed-tasks-${serverId}-${projectId}`;
    const savedTasks = localStorage.getItem(storageKey);
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      return parsedTasks.map((task: any) => ({
        ...task,
        completionDate: new Date(task.completionDate),
        dailyProgress: task.dailyProgress.map((progress: any) => ({
          ...progress,
          date: new Date(progress.date)
        })),
        feedback: task.feedback.map((item: any) => ({
          ...item,
          date: new Date(item.date)
        }))
      }));
    }
    return [];
  });

  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [selectedTask, setSelectedTask] = useState<CompletedTask | null>(null);
  const [newProgress, setNewProgress] = useState("");
  const [newFeedback, setNewFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"complaint" | "suggestion" | "change">("suggestion");

  // Save completed tasks to localStorage whenever they change
  useEffect(() => {
    const storageKey = `completed-tasks-${serverId}-${projectId}`;
    localStorage.setItem(storageKey, JSON.stringify(completedTasks));
  }, [completedTasks, serverId, projectId]);

  const addCompletedTask = () => {
    if (!newTaskName.trim()) return;

    const newTask: CompletedTask = {
      id: `${projectId}-${Date.now()}`,
      name: newTaskName,
      description: newTaskDescription,
      completionDate: new Date(),
      dailyProgress: [],
      feedback: [],
      projectId
    };

    setCompletedTasks(prev => [...prev, newTask]);
    setNewTaskName("");
    setNewTaskDescription("");
    setShowAddTask(false);
  };

  const addDailyProgress = (taskId: string) => {
    if (!newProgress.trim()) return;

    setCompletedTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          dailyProgress: [
            ...task.dailyProgress,
            {
              date: new Date(),
              progress: newProgress
            }
          ]
        };
      }
      return task;
    }));

    setNewProgress("");
  };

  const addFeedback = (taskId: string) => {
    if (!newFeedback.trim()) return;

    setCompletedTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          feedback: [
            ...task.feedback,
            {
              date: new Date(),
              type: feedbackType,
              content: newFeedback
            }
          ]
        };
      }
      return task;
    }));

    setNewFeedback("");
  };

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      <div className="p-4 border-b border-border bg-background">
        <h2 className="text-xl font-semibold">Task Management</h2>
        <p className="text-sm text-muted-foreground mt-1">Overview of completed tasks and project progress</p>
      </div>

      <ScrollArea className="flex-1 bg-background text-foreground">
        <div className="p-4 space-y-4">
          {/* Add New Task Button */}
          <Button
            onClick={() => setShowAddTask(true)}
            className="bg-primary hover:bg-primary/80 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Completed Task
          </Button>

          {/* Add Task Dialog */}
          {showAddTask && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-background p-6 rounded-lg w-[500px] border border-border text-foreground">
                <h3 className="text-lg font-semibold mb-4">Add Completed Task</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Task Name</label>
                    <Input
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      className="bg-background border-border text-foreground"
                      placeholder="Enter task name"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Description</label>
                    <Textarea
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      className="bg-background border-border text-foreground"
                      placeholder="Enter task description"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowAddTask(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addCompletedTask}
                      className="bg-primary hover:bg-primary/80 text-primary-foreground"
                    >
                      Add Task
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Completed Tasks List */}
          <div className="space-y-4">
            {completedTasks.map(task => (
              <div
                key={task.id}
                className="bg-card rounded-lg border border-border overflow-hidden text-card-foreground"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{task.name}</h3>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform",
                        selectedTask?.id === task.id && "transform rotate-180"
                      )}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Completed on {format(task.completionDate, "MMM d, yyyy")}
                  </p>
                </div>

                {selectedTask?.id === task.id && (
                  <div className="p-4 border-t border-border space-y-4 bg-background text-foreground">
                    {/* Daily Progress */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Daily Progress</h4>
                      <div className="space-y-2">
                        {task.dailyProgress.map((progress, index) => (
                          <div key={index} className="text-sm bg-muted p-2 rounded">
                            <p className="text-muted-foreground text-xs">
                              {format(progress.date, "MMM d, yyyy")}
                            </p>
                            <p className="mt-1">{progress.progress}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Input
                          value={newProgress}
                          onChange={(e) => setNewProgress(e.target.value)}
                          className="bg-background border-border text-foreground"
                          placeholder="Add today's progress"
                        />
                        <Button
                          onClick={() => addDailyProgress(task.id)}
                          className="bg-primary hover:bg-primary/80 text-primary-foreground"
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Feedback & Changes</h4>
                      <div className="space-y-2">
                        {task.feedback.map((item, index) => (
                          <div
                            key={index}
                            className={cn(
                              "text-sm p-2 rounded",
                              item.type === "complaint" && "bg-destructive/20 text-destructive",
                              item.type === "suggestion" && "bg-primary/20 text-primary",
                              item.type === "change" && "bg-yellow-200/20 text-yellow-700"
                            )}
                          >
                            <p className="text-xs opacity-75">
                              {format(item.date, "MMM d, yyyy")} - {item.type}
                            </p>
                            <p className="mt-1">{item.content}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 space-y-2">
                        <select
                          value={feedbackType}
                          onChange={(e) => setFeedbackType(e.target.value as any)}
                          className="w-full bg-background border border-border rounded p-2 text-sm text-foreground"
                        >
                          <option value="complaint">Complaint</option>
                          <option value="suggestion">Suggestion</option>
                          <option value="change">Change Required</option>
                        </select>
                        <div className="flex gap-2">
                          <Input
                            value={newFeedback}
                            onChange={(e) => setNewFeedback(e.target.value)}
                            className="bg-background border-border text-foreground"
                            placeholder="Add feedback"
                          />
                          <Button
                            onClick={() => addFeedback(task.id)}
                            className="bg-primary hover:bg-primary/80 text-primary-foreground"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}; 