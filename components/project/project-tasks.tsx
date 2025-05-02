"use client";

import { useState, useEffect } from "react";
import { Plus, Check, ChevronDown, Filter, SortDesc, Grid, Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format, isValid, parseISO } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ProjectCalendar } from "./project-calendar";
import { ProjectTaskManagement } from "./project-task-management";

interface Member {
  id: string;
  name: string;
  image?: string;
  role: string;
}

interface Task {
  id: string;
  name: string;
  assignee?: Member;
  priority: "Low" | "Medium" | "High";
  status: "On track" | "Off track";
  startDate?: Date;
  endDate?: Date;
  projectId: string;
  description?: string;
}

interface ProjectTasksProps {
  project: {
    id: string;
    name: string;
  };
  serverId: string;
}

export const ProjectTasks = ({
  project,
  serverId
}: ProjectTasksProps) => {
  const { isAdmin } = useAuth();
  const params = useParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Record<string, Task[]>>(() => {
    // Load tasks from localStorage using both serverId and projectId
    const storageKey = `tasks-${serverId}-${project.id}`;
    const savedTasks = localStorage.getItem(storageKey);
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      // Convert string dates back to Date objects
      Object.keys(parsedTasks).forEach(key => {
        parsedTasks[key] = parsedTasks[key].map((task: any) => ({
          ...task,
          startDate: task.startDate ? new Date(task.startDate) : undefined,
          endDate: task.endDate ? new Date(task.endDate) : undefined
        }));
      });
      return parsedTasks;
    }
    // Initialize with empty tasks for new projects
    return {
      todo: [],
    doing: [],
    done: []
    };
  });
  
  const [newTaskName, setNewTaskName] = useState("");
  const [showTodo, setShowTodo] = useState(true);
  const [showDoing, setShowDoing] = useState(true);
  const [showDone, setShowDone] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskPriority, setNewTaskPriority] = useState<"Low" | "Medium" | "High">("Low");
  const [newTaskStatus, setNewTaskStatus] = useState<"On track" | "Off track">("On track");
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("");
  const [newTaskStartDate, setNewTaskStartDate] = useState<Date | null>(null);
  const [newTaskEndDate, setNewTaskEndDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "management">("list");

  // Save tasks to localStorage whenever they change, using project-specific key
  useEffect(() => {
    const storageKey = `tasks-${serverId}-${project.id}`;
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks, serverId, project.id]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoadingMembers(true);
        setError(null);
        const response = await fetch(`/api/servers/${params?.serverId}/members`);
        if (response.ok) {
          const data = await response.json();
          setMembers(data);
        } else {
          setError("Failed to fetch members");
          console.error("Failed to fetch members");
        }
      } catch (error) {
        setError("Error fetching members");
        console.error("Error fetching members:", error);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    if (params?.serverId) {
      fetchMembers();
    }
  }, [params?.serverId]);

  const updateTaskPriority = (taskId: string, section: string, priority: "Low" | "Medium" | "High") => {
    if (!isAdmin) return;
    
    setTasks(prev => ({
      ...prev,
      [section]: prev[section].map(task => 
        task.id === taskId ? { ...task, priority } : task
      )
    }));
  };

  const updateTaskStatus = (taskId: string, section: string, status: "On track" | "Off track") => {
    if (!isAdmin) return;
    
    setTasks(prev => ({
      ...prev,
      [section]: prev[section].map(task => 
        task.id === taskId ? { ...task, status } : task
      )
    }));
  };

  const updateTaskAssignee = (taskId: string, section: string, assigneeId: string) => {
    if (!isAdmin) return;
    
    const assignee = assigneeId ? members.find(member => member.id === assigneeId) : undefined;
    if (!assignee && assigneeId) return;

    setTasks(prev => ({
      ...prev,
      [section]: prev[section].map(task => 
        task.id === taskId ? { ...task, assignee } : task
      )
    }));
  };

  const renderPriorityBadge = (priority: string, taskId: string, section: string) => {
    if (isAdmin) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className={cn(
              "px-2 py-1 rounded text-xs inline-flex items-center justify-center w-20 cursor-pointer",
              priority === "Low" && "bg-teal-500/20 text-teal-500",
              priority === "Medium" && "bg-amber-500/20 text-amber-500",
              priority === "High" && "bg-purple-500/20 text-purple-500"
            )}>
              {priority}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => updateTaskPriority(taskId, section, "Low")}>
              Low
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateTaskPriority(taskId, section, "Medium")}>
              Medium
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateTaskPriority(taskId, section, "High")}>
              High
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <div className={cn(
        "px-2 py-1 rounded text-xs inline-flex items-center justify-center w-20",
        priority === "Low" && "bg-teal-500/20 text-teal-500",
        priority === "Medium" && "bg-amber-500/20 text-amber-500",
        priority === "High" && "bg-purple-500/20 text-purple-500"
      )}>
        {priority}
      </div>
    );
  };

  const renderStatusBadge = (status: string, taskId: string, section: string) => {
    if (isAdmin) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className={cn(
              "px-2 py-1 rounded text-xs inline-flex items-center justify-center w-20 cursor-pointer",
              status === "On track" && "bg-teal-500/20 text-teal-500",
              status === "Off track" && "bg-red-500/20 text-red-500"
            )}>
              {status}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => updateTaskStatus(taskId, section, "On track")}>
              On track
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateTaskStatus(taskId, section, "Off track")}>
              Off track
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <div className={cn(
        "px-2 py-1 rounded text-xs inline-flex items-center justify-center w-20",
        status === "On track" && "bg-teal-500/20 text-teal-500",
        status === "Off track" && "bg-red-500/20 text-red-500"
      )}>
        {status}
      </div>
    );
  };

  const renderAssigneeDropdown = (task: Task, taskId: string, section: string) => {
    if (isAdmin) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center cursor-pointer">
              {task.assignee ? (
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 bg-purple-500/20 text-purple-500">
                    <AvatarFallback>{task.assignee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span className="ml-2 text-sm">{task.assignee.name}</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 bg-zinc-800 text-zinc-400">
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                  <span className="ml-2 text-sm text-zinc-400">Unassigned</span>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
            <DropdownMenuItem onClick={() => updateTaskAssignee(taskId, section, "")}>
              Unassigned
            </DropdownMenuItem>
            {members.map(member => (
              <DropdownMenuItem 
                key={member.id}
                onClick={() => updateTaskAssignee(taskId, section, member.id)}
              >
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2 bg-purple-500/20 text-purple-500">
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span>{member.name}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return task.assignee ? (
      <div className="flex items-center">
        <Avatar className="h-6 w-6 bg-purple-500/20 text-purple-500">
          <AvatarFallback>{task.assignee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <span className="ml-2 text-sm">{task.assignee.name}</span>
      </div>
    ) : (
      <div className="flex items-center">
        <Avatar className="h-6 w-6 bg-zinc-800 text-zinc-400">
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <span className="ml-2 text-sm text-zinc-400">Unassigned</span>
      </div>
    );
  };

  const addTask = () => {
    if (!newTaskName.trim()) return;
    
    const assignee = newTaskAssignee ? members.find(member => member.id === newTaskAssignee) : undefined;
    
    const newTask: Task = {
      id: `${project.id}-${Date.now()}`, // Make task ID project-specific
      name: newTaskName,
      priority: newTaskPriority,
      status: newTaskStatus,
      assignee,
      startDate: newTaskStartDate || undefined,
      endDate: newTaskEndDate || undefined,
      projectId: project.id // Add project reference to task
    };
    
    setTasks(prev => ({
      ...prev,
      todo: [...prev.todo, newTask]
    }));
    
    // Reset form
    setNewTaskName("");
    setNewTaskPriority("Low");
    setNewTaskStatus("On track");
    setNewTaskAssignee("");
    setNewTaskStartDate(null);
    setNewTaskEndDate(null);
    setIsAddingTask(false);
  };

  const handleAddTask = () => {
    addTask();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const deleteTask = (taskId: string, section: 'todo' | 'doing' | 'done') => {
    setTasks(prev => ({
      ...prev,
      [section]: prev[section].filter(task => task.id !== taskId)
    }));
  };

  // Add function to move tasks between sections
  const moveTask = (taskId: string, fromSection: string, toSection: string) => {
    setTasks(prev => {
      const taskToMove = prev[fromSection].find(task => task.id === taskId);
      if (!taskToMove) return prev;
      
      // Remove from current section
      const updatedFromSection = prev[fromSection].filter(task => task.id !== taskId);
      
      // Add to new section
      const updatedToSection = [...prev[toSection], taskToMove];
      
      return {
        ...prev,
        [fromSection]: updatedFromSection,
        [toSection]: updatedToSection
      };
    });
  };

  // Handle checkbox click to move to Done or back
  const handleCheckboxClick = (taskId: string, section: string) => {
    if (section === "todo") {
      moveTask(taskId, "todo", "doing");
    } else if (section === "doing") {
      // When moving from doing to done, add to task management
      const taskToComplete = tasks.doing.find(task => task.id === taskId);
      if (taskToComplete) {
        const completedTask = {
          id: taskToComplete.id,
          name: taskToComplete.name,
          description: taskToComplete.description || "",
          completionDate: new Date(),
          dailyProgress: [],
          feedback: [],
          projectId: project.id
        };

        // Save to completed tasks
        const storageKey = `completed-tasks-${serverId}-${project.id}`;
        const savedTasks = localStorage.getItem(storageKey);
        const completedTasks = savedTasks ? JSON.parse(savedTasks) : [];
        localStorage.setItem(storageKey, JSON.stringify([...completedTasks, completedTask]));
      }
      moveTask(taskId, "doing", "done");
    } else if (section === "done") {
      deleteTask(taskId, 'done');
    }
  };

  const renderNewTaskForm = () => {
    return (
      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogTrigger asChild>
          <div className="px-4 py-3 border-b border-border">
            <Input 
              placeholder="Add task..." 
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none hover:bg-muted/30 pl-8 text-sm"
            />
          </div>
        </DialogTrigger>
        <DialogContent className="bg-background text-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Task Name</label>
              <Input 
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                className="bg-background border-border text-foreground"
                placeholder="Enter task name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Priority</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-background border-border text-foreground">
                      {newTaskPriority}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-background border-border">
                    <DropdownMenuItem onClick={() => setNewTaskPriority("Low")}>
                      Low
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNewTaskPriority("High")}>
                      High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNewTaskPriority("Medium")}>
                      Medium
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Status</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-background border-border text-foreground">
                      {newTaskStatus}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-background border-border">
                    <DropdownMenuItem onClick={() => setNewTaskStatus("On track")}>
                      On track
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNewTaskStatus("Off track")}>
                      Off track
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Task Timeline</label>
              <div className="grid grid-cols-2 gap-4 p-4 bg-background rounded-lg border border-border">
                <div className="space-y-3">
                  <label className="text-xs text-muted-foreground block">Start Date</label>
                  <DatePicker
                    selected={newTaskStartDate}
                    onChange={(date: Date) => {
                      setNewTaskStartDate(date);
                      if (newTaskEndDate && date > newTaskEndDate) {
                        setNewTaskEndDate(null);
    }
                    }}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500"
                    dateFormat="MMM d, yyyy"
                    placeholderText="Select start date"
                    isClearable
                    showPopperArrow={false}
                    customInput={
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background border-border text-foreground",
                          !newTaskStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTaskStartDate ? format(newTaskStartDate, "MMM d, yyyy") : "Pick start date"}
                      </Button>
                    }
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs text-muted-foreground block">End Date</label>
                  <DatePicker
                    selected={newTaskEndDate}
                    onChange={(date: Date) => setNewTaskEndDate(date)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500"
                    dateFormat="MMM d, yyyy"
                    placeholderText="Select end date"
                    isClearable
                    showPopperArrow={false}
                    minDate={newTaskStartDate || undefined}
                    customInput={
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background border-border text-foreground",
                          !newTaskEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTaskEndDate ? format(newTaskEndDate, "MMM d, yyyy") : "Pick end date"}
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Assignee</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-background border-border text-foreground">
                    {isLoadingMembers ? (
                      <span className="text-muted-foreground">Loading members...</span>
                    ) : error ? (
                      <span className="text-red-400">Error loading members</span>
                    ) : newTaskAssignee ? (
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2 bg-purple-500/20 text-purple-500">
                          <AvatarFallback>
                            {members.find(m => m.id === newTaskAssignee)?.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{members.find(m => m.id === newTaskAssignee)?.name}</span>
                      </div>
                    ) : (
                      "Unassigned"
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background border-border">
                  <DropdownMenuItem onClick={() => setNewTaskAssignee("")}>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2 bg-zinc-700 text-zinc-400">
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                      <span>Unassigned</span>
                    </div>
                  </DropdownMenuItem>
                  {isLoadingMembers ? (
                    <DropdownMenuItem disabled>
                      <span className="text-muted-foreground">Loading members...</span>
                    </DropdownMenuItem>
                  ) : error ? (
                    <DropdownMenuItem disabled>
                      <span className="text-red-400">Error loading members</span>
                    </DropdownMenuItem>
                  ) : members.length > 0 ? (
                    members.map(member => (
                      <DropdownMenuItem 
                        key={member.id}
                        onClick={() => setNewTaskAssignee(member.id)}
                      >
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2 bg-purple-500/20 text-purple-500">
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span>{member.name}</span>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      <span className="text-muted-foreground">No members found</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-border">
              <Button 
                variant="ghost" 
                onClick={() => setIsAddingTask(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button 
                onClick={addTask}
                className="bg-teal-500 hover:bg-teal-600"
              >
                Add Task
              </Button>
            </div>
      </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Update the task rendering to show both dates
  const renderTaskItem = (task: Task, section: string) => (
    <div key={task.id} className="grid grid-cols-12 sm:grid-cols-12 grid-cols-6 gap-2 sm:gap-4 items-center px-2 sm:px-4 py-2 sm:py-3 border-b border-border hover:bg-muted/30 text-xs sm:text-sm">
      <div className="col-span-3 sm:col-span-3 flex items-center gap-2 sm:gap-3">
        <div 
          className="w-5 h-5 rounded-full border border-border flex items-center justify-center cursor-pointer hover:bg-muted/30 flex-shrink-0"
          onClick={() => handleCheckboxClick(task.id, section)}
        >
          <Check className="h-3 w-3 text-transparent" />
        </div>
        <span className="font-medium truncate">{task.name}</span>
      </div>
      <div className="col-span-2 sm:col-span-2">
        {renderAssigneeDropdown(task, task.id, section)}
      </div>
      <div className="col-span-2 sm:col-span-2">
        {renderPriorityBadge(task.priority, task.id, section)}
      </div>
      <div className="col-span-2 sm:col-span-2">
        {renderStatusBadge(task.status, task.id, section)}
      </div>
      <div className="col-span-3 sm:col-span-2">
        <div className="text-xs sm:text-sm text-muted-foreground">
          {task.startDate && task.endDate ? (
            <div className="flex flex-col">
              <span>Start: {format(new Date(task.startDate), "MMM d, yyyy")}</span>
              <span>End: {format(new Date(task.endDate), "MMM d, yyyy")}</span>
            </div>
          ) : task.startDate ? (
            <span>Start: {format(new Date(task.startDate), "MMM d, yyyy")}</span>
          ) : task.endDate ? (
            <span>End: {format(new Date(task.endDate), "MMM d, yyyy")}</span>
          ) : (
            <span>No dates set</span>
          )}
        </div>
      </div>
      <div className="col-span-1 flex justify-end">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => deleteTask(task.id, section as 'todo' | 'doing' | 'done')}
          className="h-8 w-8 p-0 hover:bg-muted/30"
        >
          <Trash className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );

  // Update the column headers to include both dates
  const renderColumnHeaders = () => (
    <div className="grid grid-cols-12 sm:grid-cols-12 grid-cols-6 gap-2 sm:gap-4 px-2 sm:px-4 py-2 sm:py-3 border-b border-border text-muted-foreground text-xs sm:text-sm">
      <div className="col-span-3 sm:col-span-3">Name</div>
      <div className="col-span-2 sm:col-span-2">Assignee</div>
      <div className="col-span-2 sm:col-span-2">Priority</div>
      <div className="col-span-2 sm:col-span-2">Status</div>
      <div className="col-span-3 sm:col-span-2">Dates</div>
      <div className="col-span-1"></div>
      </div>
    );

  const handleTaskClick = (task: Task) => {
    // You can implement task details view or editing here
    console.log("Task clicked:", task);
  };

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      {/* Project Header */}
      <div className="p-4 border-b border-border flex items-center bg-background">
        <div className="flex-1">
          {/* Icon content removed */}
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center border-b border-border px-4 bg-background">
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "rounded-none border-b-2 px-4 py-2 text-foreground",
              viewMode === "list" ? "border-teal-500" : "border-transparent"
            )}
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "rounded-none border-b-2 px-4 py-2 text-foreground",
              viewMode === "calendar" ? "border-teal-500" : "border-transparent"
            )}
            onClick={() => setViewMode("calendar")}
          >
            Calendar
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "rounded-none border-b-2 px-4 py-2 text-foreground",
              viewMode === "management" ? "border-teal-500" : "border-transparent"
            )}
            onClick={() => setViewMode("management")}
          >
            Task Management
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1 bg-background text-foreground overflow-x-auto">
        <div className="min-w-[600px] sm:min-w-0">
          {viewMode === "list" ? (
        <div className="min-h-full">
          {/* To do Section */}
          <div>
            <div 
                className="flex items-center px-4 py-3 border-b border-border cursor-pointer bg-background"
              onClick={() => setShowTodo(!showTodo)}
            >
                <ChevronDown className={cn("h-5 w-5 mr-2 transition-transform text-muted-foreground", !showTodo && "transform -rotate-90")} />
              <h3 className="font-medium">To do</h3>
            </div>
            
            {showTodo && (
              <div>
                    {renderColumnHeaders()}
                    {tasks.todo.map(task => renderTaskItem(task, "todo"))}
                    {renderNewTaskForm()}
              </div>
            )}
          </div>

          {/* Doing Section */}
          <div>
            <div 
                className="flex items-center px-4 py-3 border-b border-border cursor-pointer bg-background"
              onClick={() => setShowDoing(!showDoing)}
            >
                <ChevronDown className={cn("h-5 w-5 mr-2 transition-transform text-muted-foreground", !showDoing && "transform -rotate-90")} />
              <h3 className="font-medium">Doing</h3>
            </div>
            
            {showDoing && (
              <div>
                    {renderColumnHeaders()}
                {tasks.doing.length > 0 ? (
                      tasks.doing.map(task => renderTaskItem(task, "doing"))
                  ) : (
                    <div className="px-4 py-3 border-b border-border bg-background">
                    <Input 
                      placeholder="Add task..." 
                        className="bg-transparent border-none hover:bg-muted/30 pl-8 text-sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Done Section */}
          <div>
            <div 
                className="flex items-center px-4 py-3 border-b border-border cursor-pointer bg-background"
              onClick={() => setShowDone(!showDone)}
            >
                <ChevronDown className={cn("h-5 w-5 mr-2 transition-transform text-muted-foreground", !showDone && "transform -rotate-90")} />
              <h3 className="font-medium">Done</h3>
            </div>
            
            {showDone && (
              <div>
                    {renderColumnHeaders()}
                {tasks.done.length > 0 ? (
                      tasks.done.map(task => renderTaskItem(task, "done"))
                  ) : (
                    <div className="px-4 py-3 border-b border-border bg-background">
                    <Input 
                      placeholder="Add task..." 
                        className="bg-transparent border-none hover:bg-muted/30 pl-8 text-sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add Section Button */}
            <div className="px-4 py-3 bg-background">
              <Button variant="ghost" className="text-muted-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Add section
            </Button>
          </div>
          </div>
          ) : viewMode === "calendar" ? (
            <div className="p-4 bg-background text-foreground">
              <ProjectCalendar 
                tasks={[...tasks.todo, ...tasks.doing, ...tasks.done]}
                onTaskClick={handleTaskClick}
                projectId={project.id}
              />
            </div>
          ) : (
            <ProjectTaskManagement
              projectId={project.id}
              serverId={serverId}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}; 