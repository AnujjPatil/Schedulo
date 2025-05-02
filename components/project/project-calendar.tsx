"use client";

import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  name: string;
  startDate?: Date;
  endDate?: Date;
  priority: "Low" | "Medium" | "High";
  status: "On track" | "Off track";
  projectId: string;
}

interface ProjectCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  projectId: string;
}

export const ProjectCalendar = ({
  tasks,
  onTaskClick,
  projectId
}: ProjectCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filter tasks for this specific project
  const projectTasks = useMemo(() => {
    return tasks.filter(task => task.projectId === projectId);
  }, [tasks, projectId]);

  // Get the full week range including days from previous/next month
  const weekStart = startOfWeek(startOfMonth(currentDate));
  const weekEnd = endOfWeek(endOfMonth(currentDate));
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  // Generate unique colors for tasks within this project
  const taskColors = useMemo(() => {
    const colors = [
      "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
      "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30",
      "bg-pink-500/20 text-pink-500 hover:bg-pink-500/30",
      "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30",
      "bg-green-500/20 text-green-500 hover:bg-green-500/30",
      "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30",
      "bg-red-500/20 text-red-500 hover:bg-red-500/30",
      "bg-indigo-500/20 text-indigo-500 hover:bg-indigo-500/30",
    ];
    return projectTasks.reduce((acc, task) => {
      if (!acc[task.id]) {
        acc[task.id] = colors[Object.keys(acc).length % colors.length];
      }
      return acc;
    }, {} as Record<string, string>);
  }, [projectTasks]);

  const getTaskStyle = (task: Task) => {
    return cn(
      "h-6 rounded px-2 text-xs flex items-center cursor-pointer transition-all duration-200",
      taskColors[task.id]
    );
  };

  const isTaskActive = (task: Task, date: Date) => {
    if (!task.startDate || !task.endDate) return false;
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    return date >= start && date <= end;
  };

  const isTaskStart = (task: Task, date: Date) => {
    if (!task.startDate) return false;
    return format(new Date(task.startDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  };

  const isTaskEnd = (task: Task, date: Date) => {
    if (!task.endDate) return false;
    return format(new Date(task.endDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  };

  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <Button
          variant="ghost"
          size="sm"
          onClick={prevMonth}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={nextMonth}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-border">
        {/* Day Headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-muted-foreground bg-background"
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((day, dayIdx) => {
          const activeTasks = projectTasks.filter(task => isTaskActive(task, day));
          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-[100px] p-2 bg-background relative",
                !isSameMonth(day, currentDate) && "text-muted-foreground",
                isToday(day) && "bg-muted/50"
              )}
            >
              <div className="text-sm mb-1">{format(day, "d")}</div>
              <div className="space-y-1">
                {activeTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      getTaskStyle(task),
                      isTaskStart(task, day) && "rounded-l-none",
                      isTaskEnd(task, day) && "rounded-r-none",
                      !isTaskStart(task, day) && !isTaskEnd(task, day) && "rounded-none"
                    )}
                    onClick={() => onTaskClick(task)}
                    title={`${task.name} (${task.priority})`}
                  >
                    {isTaskStart(task, day) && task.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 