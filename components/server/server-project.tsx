'use client'

import { cn } from '@/lib/utils'
import { Folder, MoreVertical } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ServerProjectProps {
  project: {
    id: string
    name: string
  }
  server: {
    id: string
  }
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

const ServerProject = ({ project, server, onRename, onDelete }: ServerProjectProps) => {
  const params = useParams()
  const router = useRouter()
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(project.name);

  const onClick = () => {
    router.push(`/servers/${server.id}/projects/${project.id}`)
  }

  const handleRename = () => {
    if (newName.trim() && newName !== project.name) {
      onRename(project.id, newName.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div className="flex items-center group">
      <button
        onClick={onClick}
        className={cn(
          'group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1',
          params?.projectId === project.id && 'bg-zinc-700/20 dark:bg-zinc-700'
        )}
      >
        <Folder
          className={cn(
            'h-5 w-5 text-zinc-500 dark:text-zinc-400',
            params?.projectId === project.id &&
              'text-primary dark:text-zinc-200'
          )}
        />
        {isRenaming ? (
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setIsRenaming(false);
            }}
            className="w-32 h-7 text-sm px-2 py-1"
            autoFocus
          />
        ) : (
          <p
            className={cn(
              'line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition',
              params?.projectId === project.id &&
                'text-primary dark:text-zinc-200 dark:group-hover:text-white'
            )}
          >
            {project.name}
          </p>
        )}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4 text-zinc-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
          <DropdownMenuItem onClick={() => setIsRenaming(true)}>
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(project.id)} className="text-red-500">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default ServerProject 