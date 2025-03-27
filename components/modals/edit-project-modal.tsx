'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useParams, useRouter } from 'next/navigation'
import { useModal } from '@/hooks/use-modal-store'
import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Clock, Box, ListTodo, Target, Users, Check, AlertCircle, Circle, CalendarIcon, Trash2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Project name is required."
  }),
  summary: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  leadId: z.string().optional(),
  startDate: z.date().optional(),
  targetDate: z.date().optional(),
})

// Project status options
const statusOptions = [
  { id: 1, label: 'BACKLOG', icon: <ListTodo className="h-4 w-4" /> },
  { id: 2, label: 'PLANNING', icon: <Circle className="h-4 w-4" /> },
  { id: 3, label: 'IN_PROGRESS', icon: <AlertCircle className="h-4 w-4 text-yellow-500" /> },
  { id: 4, label: 'COMPLETED', icon: <Check className="h-4 w-4 text-green-500" /> },
  { id: 5, label: 'CANCELED', icon: <Circle className="h-4 w-4 text-gray-500" /> },
];

// Priority options
const priorityOptions = [
  { id: 0, label: 'NO_PRIORITY', icon: <span className="h-2 w-2 rounded-full bg-gray-400"></span> },
  { id: 1, label: 'URGENT', icon: <AlertCircle className="h-4 w-4 text-red-500" /> },
  { id: 2, label: 'HIGH', icon: <span className="h-4 w-1 bg-orange-500"></span> },
  { id: 3, label: 'MEDIUM', icon: <span className="h-4 w-1 bg-yellow-500"></span> },
  { id: 4, label: 'LOW', icon: <span className="h-4 w-1 bg-blue-500"></span> },
];

export const EditProjectModal = () => {
  const { isOpen, onClose, type, data } = useModal()
  const router = useRouter()
  const params = useParams()

  const [activeStatus, setActiveStatus] = useState(statusOptions[0])
  const [activePriority, setActivePriority] = useState(priorityOptions[0])
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined)
  const [selectedTargetDate, setSelectedTargetDate] = useState<Date | undefined>(undefined)
  const [selectedLead, setSelectedLead] = useState<{id: string, name: string} | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isPriorityOpen, setIsPriorityOpen] = useState(false)
  const [isLeadOpen, setIsLeadOpen] = useState(false)
  const [isMembersOpen, setIsMembersOpen] = useState(false)
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isTargetDateOpen, setIsTargetDateOpen] = useState(false)
  const [isMilestonesOpen, setIsMilestonesOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const isModalOpen = isOpen && type === 'editProject'
  const { project } = data

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      summary: '',
      description: '',
      status: 'BACKLOG',
      priority: 'NO_PRIORITY',
      leadId: '',
      startDate: undefined,
      targetDate: undefined,
    }
  })

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        summary: project.summary || '',
        description: project.description || '',
        status: project.status,
        priority: project.priority,
        leadId: project.leadId || '',
        startDate: project.startDate ? new Date(project.startDate) : undefined,
        targetDate: project.targetDate ? new Date(project.targetDate) : undefined,
      })

      // Set active status
      const currentStatus = statusOptions.find(status => status.label === project.status)
      if (currentStatus) setActiveStatus(currentStatus)

      // Set active priority
      const currentPriority = priorityOptions.find(priority => priority.label === project.priority)
      if (currentPriority) setActivePriority(currentPriority)

      // Set dates
      if (project.startDate) setSelectedStartDate(new Date(project.startDate))
      if (project.targetDate) setSelectedTargetDate(new Date(project.targetDate))

      // Set lead
      if (project.leadId) {
        setSelectedLead({ id: project.leadId, name: project.leadName || 'Unknown' })
      }

      // Set members
      if (project.members) {
        setSelectedMembers(project.members.map(member => member.id))
      }
    }
  }, [project, form])

  const isLoading = form.formState.isSubmitting

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = `/api/servers/${params?.serverId}/projects/${project?.id}`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: values.name,
          summary: values.summary,
          description: values.description,
          status: values.status || activeStatus.label,
          priority: values.priority || activePriority.label,
          leadId: values.leadId,
          startDate: values.startDate,
          targetDate: values.targetDate
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update project');
      }
      
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error updating project:", error);
    }
  }

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      const url = `/api/servers/${params?.serverId}/projects/${project?.id}`;
      
      const response = await fetch(url, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white dark:bg-[#1E1F22] text-black dark:text-white p-0 overflow-hidden max-w-2xl">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Edit project
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="px-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 dark:bg-zinc-700/50 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0 text-lg"
                        placeholder="Project name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 dark:bg-zinc-700/50 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0 mt-2"
                        placeholder="Add a short summary..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {/* Status Button */}
                <div className="relative">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex items-center gap-2 rounded-full hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 transition cursor-pointer"
                    size="sm"
                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                  >
                    {activeStatus.icon}
                    <span>{activeStatus.label.replace(/_/g, ' ')}</span>
                  </Button>
                  
                  {isStatusOpen && (
                    <div className="absolute z-10 mt-2 w-56 rounded-md bg-white dark:bg-zinc-800 shadow-lg">
                      <div className="p-2">
                        <p className="text-sm font-medium mb-2">Change project status...</p>
                        <div className="space-y-1">
                          {statusOptions.map((option) => (
                            <button 
                              key={option.id}
                              type="button"
                              className="flex items-center gap-2 p-2 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 rounded cursor-pointer transition w-full text-left"
                              onClick={() => {
                                setActiveStatus(option);
                                form.setValue('status', option.label);
                                setIsStatusOpen(false);
                              }}
                            >
                              {option.icon}
                              <span>{option.label.replace(/_/g, ' ')}</span>
                              {activeStatus.id === option.id && (
                                <Check className="h-4 w-4 ml-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Priority Button */}
                <div className="relative">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex items-center gap-2 rounded-full hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 transition cursor-pointer"
                    size="sm"
                    onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                  >
                    {activePriority.icon}
                    <span>{activePriority.label.replace(/_/g, ' ')}</span>
                  </Button>
                  
                  {isPriorityOpen && (
                    <div className="absolute z-10 mt-2 w-56 rounded-md bg-white dark:bg-zinc-800 shadow-lg">
                      <div className="p-2">
                        <p className="text-sm font-medium mb-2">Change project priority...</p>
                        <div className="space-y-1">
                          {priorityOptions.map((option) => (
                            <button 
                              key={option.id}
                              type="button"
                              className="flex items-center gap-2 p-2 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 rounded cursor-pointer transition w-full text-left"
                              onClick={() => {
                                setActivePriority(option);
                                form.setValue('priority', option.label);
                                setIsPriorityOpen(false);
                              }}
                            >
                              {option.icon}
                              <span>{option.label.replace(/_/g, ' ')}</span>
                              {activePriority.id === option.id && (
                                <Check className="h-4 w-4 ml-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lead Button */}
                <div className="relative">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex items-center gap-2 rounded-full hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 transition cursor-pointer"
                    size="sm"
                    onClick={() => setIsLeadOpen(!isLeadOpen)}
                  >
                    <Users className="h-4 w-4" />
                    <span>{selectedLead ? selectedLead.name : 'Lead'}</span>
                  </Button>
                  
                  {isLeadOpen && (
                    <div className="absolute z-10 mt-2 w-56 rounded-md bg-white dark:bg-zinc-800 shadow-lg">
                      <div className="p-2">
                        <p className="text-sm font-medium mb-2">Set project lead...</p>
                        <div className="space-y-1">
                          <button 
                            type="button"
                            className="flex items-center gap-2 p-2 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 rounded cursor-pointer transition w-full text-left"
                            onClick={() => {
                              form.setValue('leadId', '');
                              setSelectedLead(null);
                              setIsLeadOpen(false);
                            }}
                          >
                            <Users className="h-4 w-4" />
                            <span>Unassigned</span>
                            {!selectedLead && <Check className="h-4 w-4 ml-auto" />}
                          </button>
                          <div className="pt-2">
                            <p className="text-xs text-zinc-500 mb-1">Users from the project team</p>
                            <button 
                              type="button"
                              className="flex items-center gap-2 p-2 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 rounded cursor-pointer transition w-full text-left"
                              onClick={() => {
                                const userId = 'current-user-id';
                                form.setValue('leadId', userId);
                                setSelectedLead({ id: userId, name: 'Current User' });
                                setIsLeadOpen(false);
                              }}
                            >
                              <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">U</div>
                              <span>Current User</span>
                              {selectedLead?.id === 'current-user-id' && <Check className="h-4 w-4 ml-auto" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Members Button */}
                <div className="relative">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex items-center gap-2 rounded-full hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 transition cursor-pointer"
                    size="sm"
                    onClick={() => setIsMembersOpen(!isMembersOpen)}
                  >
                    <Users className="h-4 w-4" />
                    <span>
                      {selectedMembers.length > 0 
                        ? `${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''}` 
                        : 'Members'}
                    </span>
                  </Button>
                  
                  {isMembersOpen && (
                    <div className="absolute z-10 mt-2 w-56 rounded-md bg-white dark:bg-zinc-800 shadow-lg">
                      <div className="p-2">
                        <p className="text-sm font-medium mb-2">Change project members...</p>
                        <div className="space-y-1">
                          <button 
                            type="button"
                            className="flex items-center gap-2 p-2 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 rounded cursor-pointer transition w-full text-left"
                            onClick={() => {
                              const userId = 'current-user-id';
                              if (selectedMembers.includes(userId)) {
                                setSelectedMembers(selectedMembers.filter(id => id !== userId));
                              } else {
                                setSelectedMembers([...selectedMembers, userId]);
                              }
                            }}
                          >
                            <input 
                              type="checkbox" 
                              className="rounded cursor-pointer" 
                              checked={selectedMembers.includes('current-user-id')}
                              onChange={() => {}}
                              onClick={(e) => {
                                e.stopPropagation();
                                const userId = 'current-user-id';
                                if (selectedMembers.includes(userId)) {
                                  setSelectedMembers(selectedMembers.filter(id => id !== userId));
                                } else {
                                  setSelectedMembers([...selectedMembers, userId]);
                                }
                              }}
                            />
                            <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">U</div>
                            <span>Current User</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dependencies Button */}
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex items-center gap-2 rounded-full hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 transition cursor-pointer"
                  size="sm"
                >
                  <Box className="h-4 w-4" />
                  <span>Dependencies</span>
                </Button>

                {/* Start Date Button */}
                <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex items-center gap-2 rounded-full hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 transition cursor-pointer"
                      size="sm"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      <span>{selectedStartDate ? format(selectedStartDate, 'MMM d') : 'Start date'}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white dark:bg-zinc-800" align="start">
                    <div className="p-3">
                      <p className="text-sm font-medium mb-2">Start date</p>
                      <Calendar
                        mode="single"
                        selected={selectedStartDate}
                        onSelect={(date) => {
                          setSelectedStartDate(date);
                          form.setValue('startDate', date);
                          setIsStartDateOpen(false);
                        }}
                        initialFocus
                        className="border rounded-md"
                      />
                      {selectedStartDate && (
                        <div className="flex justify-end mt-2">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedStartDate(undefined);
                              form.setValue('startDate', undefined);
                              setIsStartDateOpen(false);
                            }}
                          >
                            Clear
                          </Button>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Target Date Button */}
                <Popover open={isTargetDateOpen} onOpenChange={setIsTargetDateOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex items-center gap-2 rounded-full hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 transition cursor-pointer"
                      size="sm"
                    >
                      <Target className="h-4 w-4" />
                      <span>{selectedTargetDate ? format(selectedTargetDate, 'MMM d') : 'Target date'}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white dark:bg-zinc-800" align="start">
                    <div className="p-3">
                      <p className="text-sm font-medium mb-2">Target date</p>
                      <Calendar
                        mode="single"
                        selected={selectedTargetDate}
                        onSelect={(date) => {
                          setSelectedTargetDate(date);
                          form.setValue('targetDate', date);
                          setIsTargetDateOpen(false);
                        }}
                        initialFocus
                        className="border rounded-md"
                      />
                      {selectedTargetDate && (
                        <div className="flex justify-end mt-2">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedTargetDate(undefined);
                              form.setValue('targetDate', undefined);
                              setIsTargetDateOpen(false);
                            }}
                          >
                            Clear
                          </Button>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Milestones Button */}
                <div className="relative">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex items-center gap-2 rounded-full hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 transition cursor-pointer"
                    size="sm"
                    onClick={() => setIsMilestonesOpen(!isMilestonesOpen)}
                  >
                    <Clock className="h-4 w-4" />
                    <span>Milestones</span>
                  </Button>
                  
                  {isMilestonesOpen && (
                    <div className="absolute z-50 mt-2 rounded-md bg-white dark:bg-zinc-800 shadow-lg min-w-[300px]">
                      <div className="p-4">
                        <p className="text-lg font-medium mb-4">Milestones</p>
                        <div className="border rounded p-3 mb-2">
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 mr-2 text-zinc-500" />
                            <Input 
                              placeholder="Milestone name" 
                              className="border-0 focus-visible:ring-0 p-1 bg-zinc-100 dark:bg-zinc-700 rounded"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
                              onClick={() => {
                                // Add milestone logic would go here
                                setIsMilestonesOpen(false);
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full mt-2 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 transition cursor-pointer"
                          onClick={() => {
                            // Add another milestone input
                          }}
                        >
                          + Add another milestone
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          disabled={isLoading}
                          className="bg-zinc-300/50 dark:bg-zinc-700/50 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0 min-h-[150px]"
                          placeholder="Write a description, a project brief, or collect ideas..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="bg-gray-100 dark:bg-zinc-800 px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isLoading || isDeleting}
                  onClick={onDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Project
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="bg-indigo-500 hover:bg-indigo-600 text-white">
                    Save changes
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 