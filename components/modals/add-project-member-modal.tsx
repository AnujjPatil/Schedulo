import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Check, Loader2, UserPlus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const AddProjectMemberModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();

  const isModalOpen = isOpen && type === "addProjectMember";
  const { project, serverId } = data;

  const [loadingId, setLoadingId] = useState("");
  const [serverMembers, setServerMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchServerMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/servers/${serverId}/members`);
      
      // Filter out members who are already in the project
      const projectMemberIds = project?.members.map((pm: any) => pm.member.id) || [];
      const filteredMembers = response.data.filter((member: any) => 
        !projectMemberIds.includes(member.id)
      );
      
      setServerMembers(filteredMembers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onAddMember = async (memberId: string) => {
    try {
      setLoadingId(memberId);
      await axios.post(`/api/servers/${serverId}/projects/${project.id}/members`, {
        memberId
      });
      
      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId("");
    }
  };

  const onOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    } else if (open && serverId && project) {
      fetchServerMembers();
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add Project Member
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Add a server member to the project &quot;{project?.name}&quot;
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 text-zinc-500 animate-spin" />
            </div>
          ) : serverMembers.length === 0 ? (
            <div className="text-center text-zinc-500 p-6">
              No available members to add to this project.
            </div>
          ) : (
            <ScrollArea className="mt-2 max-h-[420px]">
              <div className="space-y-2">
                {serverMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-md p-3 hover:bg-zinc-100"
                  >
                    <div className="flex items-center gap-x-2">
                      <Avatar>
                        <AvatarImage src={member.profile.imageUrl} />
                        <AvatarFallback>
                          {member.profile.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {member.profile.name}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {member.role}
                        </span>
                      </div>
                    </div>
                    <Button
                      disabled={loadingId === member.id}
                      onClick={() => onAddMember(member.id)}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "text-zinc-500",
                        loadingId === member.id && "cursor-not-allowed opacity-50"
                      )}
                    >
                      {loadingId === member.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 