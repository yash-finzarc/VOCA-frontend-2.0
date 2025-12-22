import { supabase } from "../client"

/**
 * Get activity logs by organization
 */
export async function getActivityLogsByOrganization(organizationId: string, limit = 50) {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit)

  return { data, error }
}

/**
 * Get activity logs by project (through organization)
 */
export async function getActivityLogsByProject(projectId: string, limit = 50) {
  // First get the project to get organization_id
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("organization_id")
    .eq("id", projectId)
    .single()

  if (projectError || !project) {
    return { data: null, error: projectError }
  }

  return getActivityLogsByOrganization(project.organization_id, limit)
}

/**
 * Create activity log
 */
export async function createActivityLog(
  organizationId: string,
  userId: string,
  actionType: string,
  metadata?: Record<string, any>
) {
  const { data, error } = await supabase
    .from("activity_logs")
    .insert({
      organization_id: organizationId,
      user_id: userId,
      action_type: actionType,
      metadata: metadata || {},
    })
    .select()
    .single()

  return { data, error }
}

