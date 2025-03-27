'use client'

import { useEffect, useState } from 'react'
import { CreateServerModal } from '@/components/modals/create-server-modal'
import { InviteModal } from '@/components/modals/invite-modal'
import { EditServerModal } from '@/components/modals/edit-server-modal'
import { MembersModal } from '@/components/modals/members-modal'
import { CreateChannelModal } from '@/components/modals/create-channel-modal'
import { LeaveServerModal } from '@/components/modals/leave-server-modal'
import { DeleteServerModal } from '@/components/modals/delete-server-modal'
import { DeleteChannelModal } from '@/components/modals/delete-channel-modal'
import { EditChannelModal } from '@/components/modals/edit-channel-modal'
import { MessageFileModal } from '@/components/modals/message-file-modal'
import { DeleteMessageModal } from '@/components/modals/delete-message-modal'
import { CreateProjectModal } from '@/components/modals/create-project-modal'
import { EditProjectModal } from '@/components/modals/edit-project-modal'
import { DeleteProjectModal } from '@/components/modals/delete-project-modal'
import { AddProjectMemberModal } from '@/components/modals/add-project-member-modal'
import { RemoveProjectMemberModal } from '@/components/modals/remove-project-member-modal'
import { AddProjectMilestoneModal } from '@/components/modals/add-project-milestone-modal'
import { EditProjectMilestoneModal } from '@/components/modals/edit-project-milestone-modal'
import { DeleteProjectMilestoneModal } from '@/components/modals/delete-project-milestone-modal'

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <CreateServerModal />
      <InviteModal />
      <EditServerModal />
      <MembersModal />
      <CreateChannelModal />
      <LeaveServerModal />
      <DeleteServerModal />
      <DeleteChannelModal />
      <EditChannelModal />
      <MessageFileModal />
      <DeleteMessageModal />
      <CreateProjectModal />
      <EditProjectModal />
      <DeleteProjectModal />
      <AddProjectMemberModal />
      <RemoveProjectMemberModal />
      <AddProjectMilestoneModal />
      <EditProjectMilestoneModal />
      <DeleteProjectMilestoneModal />
    </>
  )
}