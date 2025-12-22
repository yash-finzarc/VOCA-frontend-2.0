import { supabase } from "../client"
import type { Database } from "../types"

type Call = Database["public"]["Tables"]["calls"]["Row"]
type CallInsert = Database["public"]["Tables"]["calls"]["Insert"]

/**
 * Get calls by project (through campaign)
 */
export async function getCallsByProject(projectId: string, limit = 50) {
  const { data, error } = await supabase
    .from("calls")
    .select(
      `
      *,
      campaign:calling_campaigns!inner(
        project_id
      )
    `
    )
    .eq("campaign.project_id", projectId)
    .order("started_at", { ascending: false })
    .limit(limit)

  return { data: data as Call[] | null, error }
}

/**
 * Get calls by organization
 */
export async function getCallsByOrganization(organizationId: string, limit = 50) {
  const { data, error } = await supabase
    .from("calls")
    .select("*")
    .eq("organization_id", organizationId)
    .order("started_at", { ascending: false })
    .limit(limit)

  return { data: data as Call[] | null, error }
}

/**
 * Get calls by campaign
 */
export async function getCallsByCampaign(campaignId: string) {
  const { data, error } = await supabase
    .from("calls")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("started_at", { ascending: false })

  return { data: data as Call[] | null, error }
}

/**
 * Get call by ID
 */
export async function getCallById(id: string) {
  const { data, error } = await supabase.from("calls").select("*").eq("id", id).single()
  return { data: data as Call | null, error }
}

/**
 * Create a new call
 */
export async function createCall(call: CallInsert) {
  const { data, error } = await supabase.from("calls").insert(call).select().single()
  return { data: data as Call | null, error }
}

/**
 * Update call status
 */
export async function updateCallStatus(id: string, status: Call["status"], endedAt?: string) {
  const updates: any = { status }
  if (endedAt) {
    updates.ended_at = endedAt
  }

  const { data, error } = await supabase.from("calls").update(updates).eq("id", id).select().single()
  return { data: data as Call | null, error }
}

/**
 * Get call statistics for a project
 */
export async function getCallStatsByProject(projectId: string) {
  const { data: calls, error } = await supabase
    .from("calls")
    .select(
      `
      status,
      campaign:calling_campaigns!inner(
        project_id
      )
    `
    )
    .eq("campaign.project_id", projectId)

  if (error) {
    return { data: null, error }
  }

  const stats = {
    active: 0,
    queued: 0,
    completed: 0,
    failed: 0,
  }

  calls?.forEach((call) => {
    if (call.status === "in-progress" || call.status === "ringing") {
      stats.active++
    } else if (call.status === "queued") {
      stats.queued++
    } else if (call.status === "completed") {
      stats.completed++
    } else if (call.status === "failed" || call.status === "busy" || call.status === "no-answer") {
      stats.failed++
    }
  })

  return { data: stats, error: null }
}

/**
 * Get call statistics for an organization (all projects)
 */
export async function getCallStatsByOrganization(organizationId: string) {
  const { data: calls, error } = await supabase
    .from("calls")
    .select("status")
    .eq("organization_id", organizationId)

  if (error) {
    return { data: null, error }
  }

  const stats = {
    active: 0,
    queued: 0,
    completed: 0,
    failed: 0,
  }

  calls?.forEach((call) => {
    if (call.status === "in-progress" || call.status === "ringing") {
      stats.active++
    } else if (call.status === "queued") {
      stats.queued++
    } else if (call.status === "completed") {
      stats.completed++
    } else if (call.status === "failed" || call.status === "busy" || call.status === "no-answer") {
      stats.failed++
    }
  })

  return { data: stats, error: null }
}

