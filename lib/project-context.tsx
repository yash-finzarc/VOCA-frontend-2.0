"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import { getOrganizationById, getUserOrganizations } from "@/supabase/services/organizations"
import { getProjectsByOrganization, createProject as createProjectService, getProjectById } from "@/supabase/services/projects"
import type { Database } from "@/supabase/types"

export interface Organization {
  id: string
  name: string
  slug: string
  subscription_tier: string
  status: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description?: string | null
  organizationId: string
  isActive: boolean
  createdBy?: string | null
  createdAt: string
  updatedAt: string
}

interface ProjectContextType {
  organization: Organization | null
  projects: Project[]
  activeProject: Project | null
  setActiveProject: (projectId: string) => void
  createProject: (name: string, description?: string) => Promise<Project>
  isLoading: boolean
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user, supabaseUser } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProject, setActiveProjectState] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user || !supabaseUser) {
      setIsLoading(false)
      return
    }

    loadOrganizationAndProjects()
  }, [user, supabaseUser])

  const loadOrganizationAndProjects = async () => {
    if (!user || !supabaseUser) return

    try {
      setIsLoading(true)

      // Get user's organizations
      const { data: orgsData, error: orgsError } = await getUserOrganizations(supabaseUser.id)

      if (orgsError) {
        console.error("Error loading organizations:", orgsError)
        // Set empty state and let UI render
        setOrganization(null)
        setProjects([])
        setActiveProjectState(null)
        return
      }

      // Handle empty data gracefully - just show empty state
      if (!orgsData || orgsData.length === 0) {
        setOrganization(null)
        setProjects([])
        setActiveProjectState(null)
        return
      }

      // Use first organization (or get from user.organizationId if available)
      const orgData = orgsData.find((o: any) => o.organization.id === user.organizationId) || orgsData[0]
      const org = orgData.organization as Organization
      setOrganization(org)

      // Load projects for this organization
      const { data: projectsData, error: projectsError } = await getProjectsByOrganization(org.id)

      if (projectsError) {
        console.error("Error loading projects:", projectsError)
      } else {
        const formattedProjects: Project[] = (projectsData || []).map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          organizationId: p.organization_id,
          isActive: p.is_active,
          createdBy: p.created_by,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }))

        setProjects(formattedProjects)

        // Load active project from localStorage
        const activeProjectId = localStorage.getItem(`voca_active_project_${user.id}`)
        if (activeProjectId) {
          const project = formattedProjects.find((p) => p.id === activeProjectId)
          if (project) {
            setActiveProjectState(project)
          } else if (formattedProjects.length > 0) {
            // If saved project not found, use first project
            setActiveProjectState(formattedProjects[0])
            localStorage.setItem(`voca_active_project_${user.id}`, formattedProjects[0].id)
          }
        } else if (formattedProjects.length > 0) {
          // Set first project as active by default
          setActiveProjectState(formattedProjects[0])
          localStorage.setItem(`voca_active_project_${user.id}`, formattedProjects[0].id)
        }
      }
    } catch (error) {
      console.error("Error loading organization and projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const setActiveProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (project && user) {
      setActiveProjectState(project)
      localStorage.setItem(`voca_active_project_${user.id}`, projectId)
    }
  }

  const createProject = async (name: string, description?: string): Promise<Project> => {
    if (!organization) {
      // Try to reload organization first
      await loadOrganizationAndProjects()
      if (!organization) {
        throw new Error("No organization found. Please ensure you have an organization set up. If you just signed up, please refresh the page.")
      }
    }
    
    if (!supabaseUser) {
      throw new Error("User not authenticated")
    }

    const { data: newProject, error } = await createProjectService({
      organization_id: organization.id,
      name: name.trim(),
      description: description?.trim() || null,
      is_active: true,
      created_by: supabaseUser.id,
    })

    if (error || !newProject) {
      throw new Error(error?.message || "Failed to create project")
    }

    const formattedProject: Project = {
      id: newProject.id,
      name: newProject.name,
      description: newProject.description,
      organizationId: newProject.organization_id,
      isActive: newProject.is_active,
      createdBy: newProject.created_by,
      createdAt: newProject.created_at,
      updatedAt: newProject.updated_at,
    }

    const updatedProjects = [...projects, formattedProject]
    setProjects(updatedProjects)

    // Set as active project
    setActiveProject(formattedProject.id)

    // Reload projects to ensure consistency
    await loadOrganizationAndProjects()

    return formattedProject
  }

  return (
    <ProjectContext.Provider
      value={{
        organization,
        projects,
        activeProject,
        setActiveProject,
        createProject,
        isLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}

