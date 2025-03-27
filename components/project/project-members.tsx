'use client';

import { useModal } from "@/hooks/use-modal-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, UserMinus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Member {
  member: {
    id: string;
    profile: {
      id: string;
      name: string;
      imageUrl: string;
    }
  }
}

interface ProjectMembersProps {
  project: {
    id: string;
    name: string;
  };
  members: Member[];
  lead?: {
    id: string;
    profile: {
      id: string;
      name: string;
      imageUrl: string;
    }
  } | null;
}

export const ProjectMembers = ({
  project,
  members,
  lead
}: ProjectMembersProps) => {
  const { onOpen } = useModal();

  // Filter out the lead from the members list to avoid duplication
  const filteredMembers = lead 
    ? members.filter(m => m.member.id !== lead.id)
    : members;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {members.length} {members.length === 1 ? "member" : "members"}
          </CardDescription>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onOpen("addProjectMember", { project })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          {lead && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Project Lead</h4>
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={lead.profile.imageUrl} />
                    <AvatarFallback>
                      {lead.profile.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{lead.profile.name}</p>
                    <p className="text-xs text-muted-foreground">Lead</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {filteredMembers.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold mb-2">Team Members</h4>
              <div className="space-y-2">
                {filteredMembers.map(({ member }) => (
                  <div 
                    key={member.id} 
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.profile.imageUrl} />
                        <AvatarFallback>
                          {member.profile.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">{member.profile.name}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onOpen("removeProjectMember", { project, member })}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                {lead ? "No additional members" : "No members added yet"}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}; 