'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, ClockIcon } from "lucide-react";

interface ProjectInfoProps {
  project: {
    id: string;
    name: string;
    summary?: string | null;
    description?: string | null;
    lead?: {
      profile: {
        name: string;
        imageUrl: string;
      }
    } | null;
  };
  startDate: string;
  targetDate: string;
}

export const ProjectInfo = ({
  project,
  startDate,
  targetDate
}: ProjectInfoProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Project Summary</CardTitle>
          <CardDescription>
            Brief overview of the project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {project.summary || "No summary provided"}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Project Lead</CardTitle>
          </CardHeader>
          <CardContent>
            {project.lead ? (
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={project.lead.profile.imageUrl} />
                  <AvatarFallback>
                    {project.lead.profile.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {project.lead.profile.name}
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No lead assigned</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Start Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm">{startDate}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <ClockIcon className="h-4 w-4 mr-2" />
              Target Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm">{targetDate}</span>
          </CardContent>
        </Card>
      </div>

      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>
              Detailed description of the project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm whitespace-pre-wrap">
              {project.description}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 