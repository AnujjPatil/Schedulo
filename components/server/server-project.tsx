'use client'

import { cn } from '@/lib/utils'
import { Folder } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

interface ServerProjectProps {
  project: {
    id: string
    name: string
  }
  server: {
    id: string
  }
}

const ServerProject = ({ project, server }: ServerProjectProps) => {
  const params = useParams()
  const router = useRouter()

  const onClick = () => {
    router.push(`/servers/${server.id}/projects/${project.id}`)
  }

  return (
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
      <p
        className={cn(
          'line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition',
          params?.projectId === project.id &&
            'text-primary dark:text-zinc-200 dark:group-hover:text-white'
        )}
      >
        {project.name}
      </p>
    </button>
  )
}

export default ServerProject 