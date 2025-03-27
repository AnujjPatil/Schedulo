'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useModal } from '@/hooks/use-modal-store'
import { useProjectsStore } from '@/hooks/use-projects-store'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export const DeleteProjectModal = () => {
  const { isOpen, onClose, type, data, onProjectDeleted } = useModal()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { deleteProject } = useProjectsStore()

  const isModalOpen = isOpen && type === 'deleteProject'
  const { project } = data

  const onClick = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/servers/${project?.serverId}/projects/${project?.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete project')
      }
      
      if (project?.id) {
        deleteProject(project.id)
      }
      
      onProjectDeleted(project?.serverId)
      
      router.push(`/servers/${project?.serverId}`)
      
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-[#1E1F22] text-black dark:text-white p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Project
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to delete <span className="font-semibold text-indigo-500">{project?.name}</span>?
            <br />
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 dark:bg-zinc-800 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button
              disabled={isLoading}
              onClick={onClose}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              variant="destructive"
              onClick={onClick}
            >
              Delete Project
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 