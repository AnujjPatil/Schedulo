// Trigger redeploy - test commit
import { currentProfile } from '@/lib/current-profile'
import { db } from '@/lib/db'
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
    redirect("/sign-in")
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
      <ProjectTabs project={project} serverId={params.serverId} />
    </div>
  )
}

export default ProjectIdPage 