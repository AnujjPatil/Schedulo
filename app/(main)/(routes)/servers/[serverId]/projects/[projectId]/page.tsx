import { currentProfile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ProjectTabs } from '@/components/project/project-tabs'
import { ProjectOverview } from '@/components/project/project-overview'
import { ProjectTasks } from '@/components/project/project-tasks'
import { ProjectCalendar } from '@/components/project/project-calendar'
import { ProjectTaskManagement } from '@/components/project/project-task-management'

interface ProjectIdPageProps {
  params: {
    projectId: string
    serverId: string
  }
}

const ProjectIdPage = async ({ params }: ProjectIdPageProps) => {
  const profile = await currentProfile()

  if (!profile) {
    return auth().redirectToSignIn()
  }

  const project = await db.project.findUnique({
    where: {
      id: params.projectId,
      serverId: params.serverId,
    },
    include: {
      members: {
        include: {
          member: {
            include: {
              profile: true
            }
          }
        }
      },
      lead: {
        include: {
          profile: true
        }
      }
    }
  })

  if (!project) {
    return redirect('/')
  }

  return (
    <div className='h-full'>
      <ProjectTabs project={project} />
    </div>
  )
}

export default ProjectIdPage 