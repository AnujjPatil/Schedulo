import { Channel, ChannelType, Server } from '@prisma/client'
import { create } from 'zustand'

export type ModalType =
  | 'createServer'
  | 'invite'
  | 'editServer'
  | 'members'
  | 'createChannel'
  | 'leaveServer'
  | 'deleteServer'
  | 'deleteChannel'
  | 'editChannel'
  | 'messageFile'
  | 'deleteMessage'
  | 'createProject'
  | 'editProject'
  | 'deleteProject'
  | 'addProjectMember'
  | 'removeProjectMember'
  | 'addProjectMilestone'
  | 'editProjectMilestone'
  | 'deleteProjectMilestone'

interface ModalData {
  server?: Server
  channel?: Channel
  channelType?: ChannelType
  apiUrl?: string
  query?: Record<string, any>
  project?: any
  serverId?: string
  memberId?: string
  memberName?: string
  milestone?: any
}

interface ModalStore {
  type: ModalType | null
  data: ModalData
  isOpen: boolean
  onOpen: (type: ModalType, data?: ModalData) => void
  onClose: () => void
  onProjectDeleted: (serverId: string) => void
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {} as ModalData,
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false }),
  onProjectDeleted: (serverId: string) => {
    // This function will be called after a project is deleted
    // It will close the modal and trigger a UI refresh
    set({ type: null, isOpen: false })
  }
}))
