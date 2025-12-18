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
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { PieChart, Pie, Cell } from "recharts"

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    {
      title: "Avg Call Duration",
      value: "4:32",
      change: "-0:12",
      icon: Clock,
      trend: "down",
    },
    {
      title: "Cost Savings",
      value: "$12,450",
      change: "+18.2%",
      icon: DollarSign,
      trend: "up",
    },
  ]

  const callingStatus = {
    active: 2,
    queued: 5,
    completed: 234,
    failed: 12,
  }

  const messageStatus = {
    sent: 1234,
    pending: 45,
    failed: 23,
    delivered: 1156,
  }

  const recentCalls = [
    { id: 1, contact: "John Smith", type: "Outbound", duration: "5:23", status: "Completed", time: "2 mins ago" },
    { id: 2, contact: "Sarah Johnson", type: "Inbound", duration: "3:45", status: "Completed", time: "15 mins ago" },
    { id: 3, contact: "Mike Davis", type: "Outbound", duration: "7:12", status: "Completed", time: "1 hour ago" },
    { id: 4, contact: "Emily Brown", type: "Inbound", duration: "2:34", status: "Missed", time: "2 hours ago" },
  ]

  const recentMessages = [
    {
      id: 1,
      type: "Promotion",
      channel: "WhatsApp",
      status: "Sent",
      recipient: "+1 (555) 123-4567",
      time: "5 mins ago",
    },
    {
      id: 2,
      type: "Booking Confirmation",
      channel: "WhatsApp",
      status: "Sent",
      recipient: "+1 (555) 234-5678",
      time: "12 mins ago",
    },
    {
      id: 3,
      type: "Feature Update",
      channel: "Facebook Messenger",
      status: "Pending",
      recipient: "john.smith@email.com",
      time: "25 mins ago",
    },
    {
      id: 4,
      type: "Promotion",
      channel: "WhatsApp",
      status: "Failed",
      recipient: "+1 (555) 345-6789",
      time: "1 hour ago",
    },
  ]

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your voice agents and messaging today.</p>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <Link href="/dashboard/calling">
                <button className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors text-left w-full">
                  <PhoneCall className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-medium">Make a Call</p>
                    <p className="text-xs text-muted-foreground">Start new conversation</p>
                  </div>
                </button>
              </Link>
              <Link href="/dashboard/messages">
                <button className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors text-left w-full">
                  <MessageSquare className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-medium">View Messages</p>
                    <p className="text-xs text-muted-foreground">Check message logs</p>
                  </div>
                </button>
              </Link>
              <Link href="/dashboard/logs">
                <button className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors text-left w-full">
                  <AlertCircle className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-medium">View Logs</p>
                    <p className="text-xs text-muted-foreground">System & call logs</p>
                  </div>
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
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
                  <p className={`text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"} mt-1`}>
                    {stat.change} from last month
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
                    Calling Status
                  </CardTitle>
                  <CardDescription>Overview of your call activity</CardDescription>
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
              <CallingStatusChart data={callingStatus} total={Object.values(callingStatus).reduce((sum, val) => sum + val, 0)} />
            </CardContent>
          </Card>

          {/* Message Status Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Message Status
                  </CardTitle>
                  <CardDescription>Overview of your messaging activity</CardDescription>
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
              <MessageStatusChart data={messageStatus} total={Object.values(messageStatus).reduce((sum, val) => sum + val, 0)} />
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
                  <CardTitle>Recent Calls</CardTitle>
                  <CardDescription>Your latest call activity</CardDescription>
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
                {recentCalls.map((call) => (
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
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Messages</CardTitle>
                  <CardDescription>Your latest messaging activity</CardDescription>
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
                {recentMessages.map((message) => (
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
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{message.recipient}</p>
                      <p className="text-xs text-muted-foreground">{message.time}</p>
                    </div>
                  </div>
                ))}
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
  total 
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
    <div className="flex items-center justify-center relative">
      <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
        <PieChart>
          <ChartTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0]
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium">{data.name}</span>
                        <span className="text-sm font-bold">{data.value}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
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
            innerRadius={60}
            outerRadius={80}
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
        <p className="text-xs text-muted-foreground">Total Calls</p>
        <p className="text-2xl font-bold">{total.toLocaleString()}</p>
      </div>
    </div>
  )
}

// Message Status Chart Component
function MessageStatusChart({ 
  data, 
  total 
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
    <div className="flex items-center justify-center relative">
      <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
        <PieChart>
          <ChartTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0]
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium">{data.name}</span>
                        <span className="text-sm font-bold">{data.value}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
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
            innerRadius={60}
            outerRadius={80}
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
        <p className="text-xs text-muted-foreground">Total Messages</p>
        <p className="text-2xl font-bold">{total.toLocaleString()}</p>
      </div>
    </div>
  )
}
