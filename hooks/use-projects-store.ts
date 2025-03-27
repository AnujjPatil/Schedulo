import { create } from 'zustand';

interface Project {
  id: string;
  name: string;
  summary: string | null;
  description: string | null;
  status: string;
  priority: string;
  leadId: string | null;
  serverId: string;
  startDate: Date | null;
  targetDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectsStore {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  getServerProjects: (serverId: string) => Project[];
}

export const useProjectsStore = create<ProjectsStore>((set, get) => ({
  projects: [],
  
  setProjects: (projects) => set({ projects }),
  
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project]
  })),
  
  updateProject: (project) => set((state) => ({
    projects: state.projects.map((p) => 
      p.id === project.id ? project : p
    )
  })),
  
  deleteProject: (projectId) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== projectId)
  })),
  
  getServerProjects: (serverId) => {
    return get().projects.filter((p) => p.serverId === serverId);
  }
})); 