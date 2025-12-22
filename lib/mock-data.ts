// Mock data helpers for project-scoped data
// TODO: Replace with Supabase queries when backend is ready

export interface MockCall {
  id: number
  projectId: string
  contact: string
  type: "Outbound" | "Inbound"
  duration: string
  status: string
  time: string
  callSid?: string
  timestamp?: string
}

export interface MockMessage {
  id: number
  projectId: string
  type: string
  channel: string
  status: string
  recipient: string
  time: string
  timestamp?: string
  preview?: string
}

// Generate project-specific mock data
export function getProjectCalls(projectId: string): MockCall[] {
  // TODO: Replace with Supabase query: SELECT * FROM calls WHERE project_id = $1
  const allCalls: MockCall[] = [
    { id: 1, projectId: "project-1", contact: "John Smith", type: "Outbound", duration: "5:23", status: "Completed", time: "2 mins ago" },
    { id: 2, projectId: "project-1", contact: "Sarah Johnson", type: "Inbound", duration: "3:45", status: "Completed", time: "15 mins ago" },
    { id: 3, projectId: "project-2", contact: "Mike Davis", type: "Outbound", duration: "7:12", status: "Completed", time: "1 hour ago" },
    { id: 4, projectId: "project-2", contact: "Emily Brown", type: "Inbound", duration: "2:34", status: "Missed", time: "2 hours ago" },
    { id: 5, projectId: "project-3", contact: "Robert Wilson", type: "Outbound", duration: "4:56", status: "Completed", time: "3 hours ago" },
  ]
  return allCalls.filter((call) => call.projectId === projectId)
}

export function getProjectMessages(projectId: string): MockMessage[] {
  // TODO: Replace with Supabase query: SELECT * FROM messages WHERE project_id = $1
  const allMessages: MockMessage[] = [
    {
      id: 1,
      projectId: "project-1",
      type: "Promotion",
      channel: "WhatsApp",
      status: "Sent",
      recipient: "+1 (555) 123-4567",
      time: "5 mins ago",
      preview: "Special offer: Get 20% off on your next purchase!",
    },
    {
      id: 2,
      projectId: "project-1",
      type: "Booking Confirmation",
      channel: "WhatsApp",
      status: "Sent",
      recipient: "+1 (555) 234-5678",
      time: "12 mins ago",
      preview: "Your appointment has been confirmed for January 18, 2025.",
    },
    {
      id: 3,
      projectId: "project-2",
      type: "Feature Update",
      channel: "Facebook Messenger",
      status: "Pending",
      recipient: "john.smith@email.com",
      time: "25 mins ago",
      preview: "We've just launched new AI voice features!",
    },
    {
      id: 4,
      projectId: "project-2",
      type: "Promotion",
      channel: "WhatsApp",
      status: "Failed",
      recipient: "+1 (555) 345-6789",
      time: "1 hour ago",
      preview: "Flash sale alert! Limited time offer.",
    },
    {
      id: 5,
      projectId: "project-3",
      type: "Reminder",
      channel: "WhatsApp",
      status: "Sent",
      recipient: "+1 (555) 456-7890",
      time: "2 hours ago",
      preview: "Don't forget your appointment tomorrow at 2 PM.",
    },
  ]
  return allMessages.filter((message) => message.projectId === projectId)
}

export function getProjectCallingStatus(projectId: string) {
  // TODO: Replace with Supabase aggregation query
  const calls = getProjectCalls(projectId)
  return {
    active: calls.filter((c) => c.status === "Active").length || 0,
    queued: calls.filter((c) => c.status === "Queued").length || 0,
    completed: calls.filter((c) => c.status === "Completed").length || 2,
    failed: calls.filter((c) => c.status === "Failed" || c.status === "Missed").length || 1,
  }
}

export function getProjectMessageStatus(projectId: string) {
  // TODO: Replace with Supabase aggregation query
  const messages = getProjectMessages(projectId)
  return {
    sent: messages.filter((m) => m.status === "Sent").length || 1,
    pending: messages.filter((m) => m.status === "Pending").length || 0,
    failed: messages.filter((m) => m.status === "Failed").length || 0,
    delivered: messages.filter((m) => m.status === "Delivered").length || 1,
  }
}

export function getProjectStats(projectId: string) {
  // TODO: Replace with Supabase aggregation queries
  // These would be calculated from actual project data
  return {
    avgCallDuration: "4:32",
    costSavings: "$12,450",
  }
}

// Aggregate data across all projects
export function getAllProjectsCalls(projectIds: string[]): MockCall[] {
  // TODO: Replace with Supabase query: SELECT * FROM calls WHERE project_id IN ($1, $2, ...)
  return projectIds.flatMap((projectId) => getProjectCalls(projectId))
}

export function getAllProjectsMessages(projectIds: string[]): MockMessage[] {
  // TODO: Replace with Supabase query: SELECT * FROM messages WHERE project_id IN ($1, $2, ...)
  return projectIds.flatMap((projectId) => getProjectMessages(projectId))
}

export function getAllProjectsCallingStatus(projectIds: string[]) {
  // TODO: Replace with Supabase aggregation query
  const allCalls = getAllProjectsCalls(projectIds)
  return {
    active: allCalls.filter((c) => c.status === "Active").length || 0,
    queued: allCalls.filter((c) => c.status === "Queued").length || 0,
    completed: allCalls.filter((c) => c.status === "Completed").length || 5,
    failed: allCalls.filter((c) => c.status === "Failed" || c.status === "Missed").length || 2,
  }
}

export function getAllProjectsMessageStatus(projectIds: string[]) {
  // TODO: Replace with Supabase aggregation query
  const allMessages = getAllProjectsMessages(projectIds)
  return {
    sent: allMessages.filter((m) => m.status === "Sent").length || 3,
    pending: allMessages.filter((m) => m.status === "Pending").length || 1,
    failed: allMessages.filter((m) => m.status === "Failed").length || 1,
    delivered: allMessages.filter((m) => m.status === "Delivered").length || 2,
  }
}

export function getAllProjectsStats(projectIds: string[]) {
  // TODO: Replace with Supabase aggregation queries
  // Aggregate stats across all projects
  return {
    totalProjects: projectIds.length,
    avgCallDuration: "4:28",
    totalCostSavings: "$37,350",
    totalCalls: getAllProjectsCalls(projectIds).length,
    totalMessages: getAllProjectsMessages(projectIds).length,
  }
}

