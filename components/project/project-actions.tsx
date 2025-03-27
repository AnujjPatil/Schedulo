'use client';

import { MoreHorizontal, Edit, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/hooks/use-modal-store';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ActionTooltip } from '@/components/action-tooltip';

interface ProjectActionsProps {
  project: any;
  serverId: string;
}

export const ProjectActions = ({
  project,
  serverId
}: ProjectActionsProps) => {
  const { onOpen } = useModal();
  const router = useRouter();

  const handleEdit = () => {
    onOpen('editProject', { project, serverId });
  };

  const handleDelete = () => {
    onOpen('deleteProject', { project, serverId });
  };

  return (
    <div className="flex items-center gap-x-2">
      <ActionTooltip label="Edit Project">
        <Edit 
          onClick={handleEdit}
          className="h-4 w-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 cursor-pointer transition"
        />
      </ActionTooltip>
      <ActionTooltip label="Project Actions">
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <MoreHorizontal className="h-4 w-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 cursor-pointer transition" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="center">
            <DropdownMenuItem 
              onClick={handleEdit}
              className="text-xs cursor-pointer px-3 py-2 text-indigo-600 dark:text-indigo-400"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-xs cursor-pointer px-3 py-2 text-rose-500"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ActionTooltip>
    </div>
  );
}; 