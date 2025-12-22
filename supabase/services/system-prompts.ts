import { supabase } from "../client"
import type { Database } from "../types"

type SystemPrompt = Database["public"]["Tables"]["system_prompts"]["Row"]
type SystemPromptInsert = Database["public"]["Tables"]["system_prompts"]["Insert"]
type SystemPromptUpdate = Database["public"]["Tables"]["system_prompts"]["Update"]

/**
 * Get system prompts by organization
 */
export async function getSystemPromptsByOrganization(organizationId: string, modelType?: "calling" | "messaging") {
  let query = supabase.from("system_prompts").select("*").eq("organization_id", organizationId)

  if (modelType) {
    query = query.eq("model_type", modelType)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  return { data: data as SystemPrompt[] | null, error }
}

/**
 * Get system prompts by project (through organization)
 */
export async function getSystemPromptsByProject(projectId: string, modelType?: "calling" | "messaging") {
  // First get the project to get organization_id
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("organization_id")
    .eq("id", projectId)
    .single()

  if (projectError || !project) {
    return { data: null, error: projectError }
  }

  return getSystemPromptsByOrganization(project.organization_id, modelType)
}

/**
 * Get system prompt by ID
 */
export async function getSystemPromptById(id: string) {
  const { data, error } = await supabase.from("system_prompts").select("*").eq("id", id).single()
  return { data: data as SystemPrompt | null, error }
}

/**
 * Create a new system prompt
 */
export async function createSystemPrompt(prompt: SystemPromptInsert) {
  const { data, error } = await supabase.from("system_prompts").insert(prompt).select().single()
  return { data: data as SystemPrompt | null, error }
}

/**
 * Update system prompt
 */
export async function updateSystemPrompt(id: string, updates: SystemPromptUpdate) {
  const { data, error } = await supabase.from("system_prompts").update(updates).eq("id", id).select().single()
  return { data: data as SystemPrompt | null, error }
}

/**
 * Delete system prompt
 */
export async function deleteSystemPrompt(id: string) {
  const { data, error } = await supabase.from("system_prompts").delete().eq("id", id)
  return { data, error }
}

/**
 * Set default system prompt (unset others first)
 */
export async function setDefaultSystemPrompt(organizationId: string, promptId: string, modelType: "calling" | "messaging") {
  // First unset all defaults for this organization and model type
  await supabase
    .from("system_prompts")
    .update({ is_default: false })
    .eq("organization_id", organizationId)
    .eq("model_type", modelType)

  // Then set the new default
  const { data, error } = await supabase
    .from("system_prompts")
    .update({ is_default: true })
    .eq("id", promptId)
    .select()
    .single()

  return { data: data as SystemPrompt | null, error }
}

