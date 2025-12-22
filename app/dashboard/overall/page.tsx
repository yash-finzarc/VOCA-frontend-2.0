"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  PhoneCall,
  Clock,
  DollarSign,
  Phone,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  FolderKanban,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useProject } from "@/lib/project-context"
import {
  getAllProjectsCalls,
  getAllProjectsMessages,
  getAllProjectsCallingStatus,
  getAllProjectsMessageStatus,
  getAllProjectsStats,
} from "@/lib/mock-data"
import { PieChart, Pie, Cell } from "recharts"
import { useMemo } from "react"

export default function OverallDashboardPage() {
  const { user } = useAuth()
  const { projects } = useProject()

  const projectIds = useMemo(() => projects.map((p) => p.id), [projects])

  // Get aggregated data across all projects
  const allProjectsStats = useMemo(() => {
    if (projectIds.length === 0) return null
    return getAllProjectsStats(projectIds)
  }, [projectIds])

  const callingStatus = useMemo(() => {
    if (projectIds.length === 0) return { active: 0, queued: 0, completed: 0, failed: 0 }
    return getAllProjectsCallingStatus(projectIds)
  }, [projectIds])

  const messageStatus = useMemo(() => {
    if (projectIds.length === 0) return { sent: 0, pending: 0, failed: 0, delivered: 0 }
    return getAllProjectsMessageStatus(projectIds)
  }, [projectIds])

  const recentCalls = useMemo(() => {
    if (projectIds.length === 0) return []
    const allCalls = getAllProjectsCalls(projectIds)
    // Return all calls from all projects, sorted by most recent
    return allCalls.map((call) => ({
      id: call.id,
      contact: call.contact,
      type: call.type,
      duration: call.duration,
      status: call.status,
      time: call.time,
      projectId: call.projectId,
    }))
  }, [projectIds])

  const recentMessages = useMemo(() => {
    if (projectIds.length === 0) return []
    const allMessages = getAllProjectsMessages(projectIds)
    // Return all messages from all projects
    return allMessages.map((msg) => ({
      id: msg.id,
      type: msg.type,
      channel: msg.channel,
      status: msg.status,
      recipient: msg.recipient,
      time: msg.time,
      preview: msg.preview,
      projectId: msg.projectId,
    }))
  }, [projectIds])

  const stats = useMemo(() => {
    if (!allProjectsStats) {
      return [
        {
          title: "Total Projects",
          value: "0",
          change: "-",
          icon: FolderKanban,
          trend: "neutral" as const,
        },
        {
          title: "Avg Call Duration",
          value: "0:00",
          change: "-",
          icon: Clock,
          trend: "down" as const,
        },
        {
          title: "Total Cost Savings",
          value: "$0",
          change: "-",
          icon: DollarSign,
          trend: "up" as const,
        },
      ]
    }
    return [
      {
        title: "Total Projects",
        value: allProjectsStats.totalProjects.toString(),
        change: "+" + (allProjectsStats.totalProjects - 3),
        icon: FolderKanban,
        trend: "up" as const,
      },
      {
        title: "Avg Call Duration",
        value: allProjectsStats.avgCallDuration,
        change: "-0:04",
        icon: Clock,
        trend: "down" as const,
      },
      {
        title: "Total Cost Savings",
        value: allProjectsStats.totalCostSavings,
        change: "+18.2%",
        icon: DollarSign,
        trend: "up" as const,
      },
    ]
  }, [allProjectsStats])

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case "Sent":
        return <CheckCircle2 className="h-3 w-3 text-green-600" />
      case "Failed":
        return <XCircle className="h-3 w-3 text-red-600" />
      case "Pending":
        return <Clock className="h-3 w-3 text-yellow-600" />
      default:
        return <MessageSquare className="h-3 w-3 text-muted-foreground" />
    }
  }

  const getMessageStatusBadge = (status: string) => {
    const variants = {
      Sent: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      Failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    }
    return variants[status as keyof typeof variants] || ""
  }

  if (projects.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Overall Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">No projects found. Create a project to see aggregated statistics.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Overall Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Aggregated statistics across all {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs ${stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-muted-foreground"} mt-1`}>
                    {stat.change} {stat.trend !== "neutral" && "from last month"}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Status Overview */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Calling Status Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Calling Status (All Projects)
                  </CardTitle>
                  <CardDescription>Aggregated call activity across all projects</CardDescription>
                </div>
                <Link href="/dashboard/calling">
                  <Button variant="ghost" size="sm" className="gap-2">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <CallingStatusChart
                data={callingStatus}
                total={Object.values(callingStatus).reduce((sum, val) => sum + val, 0)}
              />
            </CardContent>
          </Card>

          {/* Message Status Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Message Status (All Projects)
                  </CardTitle>
                  <CardDescription>Aggregated messaging activity across all projects</CardDescription>
                </div>
                <Link href="/dashboard/messages">
                  <Button variant="ghost" size="sm" className="gap-2">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <MessageStatusChart
                data={messageStatus}
                total={Object.values(messageStatus).reduce((sum, val) => sum + val, 0)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Recent Calls */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Calls (All Projects)</CardTitle>
                  <CardDescription>Latest call activity across all projects</CardDescription>
                </div>
                <Link href="/dashboard/calling">
                  <Button variant="ghost" size="sm" className="gap-2">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCalls.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Phone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No calls found across all projects</p>
                  </div>
                ) : (
                  recentCalls.map((call) => {
                    const project = projects.find((p) => p.id === call.projectId)
                    return (
                      <div key={call.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            {call.type === "Outbound" ? (
                              <Phone className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <PhoneCall className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{call.contact}</p>
                            <p className="text-xs text-muted-foreground">
                              {call.type} • {call.duration}
                              {project && (
                                <>
                                  {" • "}
                                  <span className="font-medium">{project.name}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-xs font-medium ${
                              call.status === "Completed" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {call.status}
                          </p>
                          <p className="text-xs text-muted-foreground">{call.time}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Messages (All Projects)</CardTitle>
                  <CardDescription>Latest messaging activity across all projects</CardDescription>
                </div>
                <Link href="/dashboard/messages">
                  <Button variant="ghost" size="sm" className="gap-2">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No messages found across all projects</p>
                  </div>
                ) : (
                  recentMessages.map((message) => {
                    const project = projects.find((p) => p.id === message.projectId)
                    return (
                      <div key={message.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            {getMessageStatusIcon(message.status)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{message.type}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {message.channel}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${getMessageStatusBadge(message.status)}`}>
                                {message.status}
                              </Badge>
                              {project && (
                                <Badge variant="outline" className="text-xs">
                                  {project.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{message.recipient}</p>
                          <p className="text-xs text-muted-foreground">{message.time}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Calling Status Chart Component
function CallingStatusChart({
  data,
  total,
}: {
  data: { active: number; queued: number; completed: number; failed: number }
  total: number
}) {
  const chartData = [
    { name: "Active", value: data.active, color: "#22c55e" },
    { name: "Queued", value: data.queued, color: "#eab308" },
    { name: "Completed", value: data.completed, color: "#3b82f6" },
    { name: "Failed", value: data.failed, color: "#ef4444" },
  ]

  const chartConfig = {
    Active: { label: "Active", color: "#22c55e" },
    Queued: { label: "Queued", color: "#eab308" },
    Completed: { label: "Completed", color: "#3b82f6" },
    Failed: { label: "Failed", color: "#ef4444" },
  }

  return (
    <div className="flex items-center justify-center relative w-full max-w-[200px] mx-auto">
      <ChartContainer config={chartConfig} className="h-[160px] w-[160px] sm:h-[180px] sm:w-[180px] md:h-[200px] md:w-[200px]">
        <PieChart>
          <ChartTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0]
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs sm:text-sm font-medium">{data.name}</span>
                        <span className="text-xs sm:text-sm font-bold">{data.value}</span>
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        {total > 0 ? `${(((data.value as number) / total) * 100).toFixed(1)}%` : "0%"}
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="45%"
            outerRadius="60%"
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-[10px] sm:text-xs text-muted-foreground">Total Calls</p>
        <p className="text-lg sm:text-xl md:text-2xl font-bold">{total.toLocaleString()}</p>
      </div>
    </div>
  )
}

// Message Status Chart Component
function MessageStatusChart({
  data,
  total,
}: {
  data: { sent: number; pending: number; failed: number; delivered: number }
  total: number
}) {
  const chartData = [
    { name: "Sent", value: data.sent, color: "#22c55e" },
    { name: "Pending", value: data.pending, color: "#eab308" },
    { name: "Delivered", value: data.delivered, color: "#3b82f6" },
    { name: "Failed", value: data.failed, color: "#ef4444" },
  ]

  const chartConfig = {
    Sent: { label: "Sent", color: "#22c55e" },
    Pending: { label: "Pending", color: "#eab308" },
    Delivered: { label: "Delivered", color: "#3b82f6" },
    Failed: { label: "Failed", color: "#ef4444" },
  }

  return (
    <div className="flex items-center justify-center relative w-full max-w-[200px] mx-auto">
      <ChartContainer config={chartConfig} className="h-[160px] w-[160px] sm:h-[180px] sm:w-[180px] md:h-[200px] md:w-[200px]">
        <PieChart>
          <ChartTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0]
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs sm:text-sm font-medium">{data.name}</span>
                        <span className="text-xs sm:text-sm font-bold">{data.value}</span>
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        {total > 0 ? `${(((data.value as number) / total) * 100).toFixed(1)}%` : "0%"}
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="45%"
            outerRadius="60%"
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-[10px] sm:text-xs text-muted-foreground">Total Messages</p>
        <p className="text-lg sm:text-xl md:text-2xl font-bold">{total.toLocaleString()}</p>
      </div>
    </div>
  )
}

