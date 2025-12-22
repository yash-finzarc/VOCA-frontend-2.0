import { supabase } from "../client"
import type { Database } from "../types"

type Organization = Database["public"]["Tables"]["organizations"]["Row"]
type OrganizationInsert = Database["public"]["Tables"]["organizations"]["Insert"]
type OrganizationUpdate = Database["public"]["Tables"]["organizations"]["Update"]

/**
 * Get organization by ID
 */
export async function getOrganizationById(id: string) {
  const { data, error } = await supabase.from("organizations").select("*").eq("id", id).single()
  return { data: data as Organization | null, error }
}

/**
 * Get organization by slug
 */
export async function getOrganizationBySlug(slug: string) {
  const { data, error } = await supabase.from("organizations").select("*").eq("slug", slug).single()
  return { data: data as Organization | null, error }
}

/**
 * Create a new organization
 */
export async function createOrganization(org: OrganizationInsert) {
  const { data, error } = await supabase.from("organizations").insert(org).select().single()
  return { data: data as Organization | null, error }
}

/**
 * Update organization
 */
export async function updateOrganization(id: string, updates: OrganizationUpdate) {
  const { data, error } = await supabase
    .from("organizations")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  return { data: data as Organization | null, error }
}

/**
 * Get user's organizations
 * Fixed: Use a simpler query to avoid RLS recursion issues
 */
export async function getUserOrganizations(userId: string) {
  // First get the organization IDs the user belongs to
  const { data: memberships, error: membersError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .eq("status", "active")

  if (membersError || !memberships || memberships.length === 0) {
    return { data: [], error: membersError }
  }

  // Then get the organizations
  const orgIds = memberships.map((m) => m.organization_id)
  const { data: orgs, error: orgsError } = await supabase
    .from("organizations")
    .select("*")
    .in("id", orgIds)

  if (orgsError) {
    return { data: [], error: orgsError }
  }

  // Transform to match expected format
  const transformedData = orgs?.map((org) => ({
    organization: org,
  }))

  return { data: transformedData || [], error: null }
}

