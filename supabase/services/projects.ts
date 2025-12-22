import { supabase } from "../client"
import type { Database } from "../types"

type Project = Database["public"]["Tables"]["projects"]["Row"]
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"]
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"]

/**
 * Get project by ID
 */
export async function getProjectById(id: string) {
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single()
  return { data: data as Project | null, error }
}

/**
 * Get all projects for an organization
 */
export async function getProjectsByOrganization(organizationId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return { data: data as Project[] | null, error }
}

/**
 * Get user's projects (through organization membership)
 */
export async function getUserProjects(userId: string, organizationId: string) {
  // First check if user is member of organization
  const { data: memberData, error: memberError } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .single()

  if (memberError || !memberData) {
    return { data: null, error: memberError }
  }

  // Get all active projects for the organization
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return { data: data as Project[] | null, error }
}

/**
 * Create a new project
 */
export async function createProject(project: ProjectInsert) {
  const { data, error } = await supabase.from("projects").insert(project).select().single()
  return { data: data as Project | null, error }
}

/**
 * Update project
 */
export async function updateProject(id: string, updates: ProjectUpdate) {
  const { data, error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  return { data: data as Project | null, error }
}

/**
 * Delete project (soft delete by setting is_active to false)
 */
export async function deleteProject(id: string) {
  const { data, error } = await supabase
    .from("projects")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  return { data: data as Project | null, error }
}

