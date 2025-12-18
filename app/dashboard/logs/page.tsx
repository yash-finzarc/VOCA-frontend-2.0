"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Phone, Cpu, Activity, ChevronDown, ChevronRight } from "lucide-react"

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedLog, setExpandedLog] = useState<number | null>(null)

  const systemLogs = [
    {
      id: 1,
      level: "info",
      timestamp: "2025-01-15 11:52:45",
      message: "System health check completed successfully",
      details: "All services operational. Response time: 45ms",
    },
    {
      id: 2,
      level: "warning",
      timestamp: "2025-01-15 11:48:23",
      message: "High memory usage detected",
      details: "Memory usage at 85%. Consider scaling resources.",
    },
    {
      id: 3,
      level: "info",
      timestamp: "2025-01-15 11:45:12",
      message: "Database backup completed",
      details: "Backup size: 2.3 GB. Stored in S3 bucket.",
    },
    {
      id: 4,
      level: "error",
      timestamp: "2025-01-15 11:42:56",
      message: "Failed to connect to external API",
      details: "Timeout error after 30s. Retrying with exponential backoff.",
    },
  ]

  const callLogs = [
    {
      id: 1,
      callSid: "CA1234567890abcdef",
      timestamp: "2025-01-15 11:45:32",
      direction: "Outbound",
      status: "Completed",
      duration: "00:05:23",
      from: "+1 (555) 000-0000",
      to: "+1 (555) 123-4567",
      details: "Customer inquiry about pricing. Successfully qualified lead.",
    },
    {
      id: 2,
      callSid: "CA2345678901bcdefg",
      timestamp: "2025-01-15 11:42:18",
      direction: "Inbound",
      status: "Completed",
      duration: "00:03:45",
      from: "+1 (555) 234-5678",
      to: "+1 (555) 000-0000",
      details: "Support request resolved. Customer satisfaction: High.",
    },
    {
      id: 3,
      callSid: "CA3456789012cdefgh",
      timestamp: "2025-01-15 11:38:56",
      direction: "Outbound",
      status: "No Answer",
      duration: "00:00:00",
      from: "+1 (555) 000-0000",
      to: "+1 (555) 345-6789",
      details: "Call not answered. Scheduled for retry.",
    },
  ]

  const aiDecisionLogs = [
    {
      id: 1,
      timestamp: "2025-01-15 11:45:34",
      callSid: "CA1234567890abcdef",
      decision: "Transferred to sales team",
      confidence: 0.92,
      reasoning: "Customer expressed interest in enterprise plan with 100+ users",
      context: "Keywords detected: pricing, enterprise, team size, integration",
    },
    {
      id: 2,
      timestamp: "2025-01-15 11:42:20",
      callSid: "CA2345678901bcdefg",
      decision: "Resolved query autonomously",
      confidence: 0.88,
      reasoning: "Standard technical question about API authentication",
      context: "Provided documentation link and code example",
    },
    {
      id: 3,
      timestamp: "2025-01-15 11:35:45",
      callSid: "CA4567890123defghi",
      decision: "Scheduled callback",
      confidence: 0.95,
      reasoning: "Customer requested specific time for detailed discussion",
      context: "Callback scheduled for Jan 16, 2025 at 3:00 PM",
    },
  ]

  const getLevelColor = (level: string) => {
    const colors = {
      info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    }
    return colors[level as keyof typeof colors] || colors.info
  }

  const toggleLogExpansion = (id: number) => {
    setExpandedLog(expandedLog === id ? null : id)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
          <p className="text-muted-foreground mt-1">Monitor system activity, calls, and AI decisions</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Log Tabs */}
        <Tabs defaultValue="system" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="system" className="gap-2">
              <Activity className="h-4 w-4" />
              System Logs
            </TabsTrigger>
            <TabsTrigger value="calls" className="gap-2">
              <Phone className="h-4 w-4" />
              Call Logs
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Cpu className="h-4 w-4" />
              AI Decisions
            </TabsTrigger>
          </TabsList>

          {/* System Logs */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>Application and infrastructure events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemLogs.map((log) => (
                    <div key={log.id} className="rounded-lg border border-border">
                      <button
                        onClick={() => toggleLogExpansion(log.id)}
                        className="w-full flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
                      >
                        {expandedLog === log.id ? (
                          <ChevronDown className="h-4 w-4 mt-1 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-xs ${getLevelColor(log.level)}`}>
                                {log.level.toUpperCase()}
                              </Badge>
                              <span className="text-sm font-medium">{log.message}</span>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</span>
                          </div>
                        </div>
                      </button>
                      {expandedLog === log.id && (
                        <div className="px-4 pb-4 pt-0 border-t border-border mt-2">
                          <p className="text-sm text-muted-foreground mt-3">{log.details}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Call Logs */}
          <TabsContent value="calls">
            <Card>
              <CardHeader>
                <CardTitle>Call Logs</CardTitle>
                <CardDescription>Detailed records of all voice calls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {callLogs.map((log) => (
                    <div key={log.id} className="rounded-lg border border-border">
                      <button
                        onClick={() => toggleLogExpansion(log.id + 100)}
                        className="w-full flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
                      >
                        {expandedLog === log.id + 100 ? (
                          <ChevronDown className="h-4 w-4 mt-1 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <p className="text-sm font-medium font-mono">{log.callSid}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {log.direction}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    log.status === "Completed"
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  }`}
                                >
                                  {log.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{log.duration}</span>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {log.from} → {log.to}
                          </div>
                        </div>
                      </button>
                      {expandedLog === log.id + 100 && (
                        <div className="px-4 pb-4 pt-0 border-t border-border mt-2">
                          <p className="text-sm text-muted-foreground mt-3">{log.details}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Decision Logs */}
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle>AI Decision Logs</CardTitle>
                <CardDescription>AI reasoning and decision-making records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiDecisionLogs.map((log) => (
                    <div key={log.id} className="rounded-lg border border-border">
                      <button
                        onClick={() => toggleLogExpansion(log.id + 200)}
                        className="w-full flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
                      >
                        {expandedLog === log.id + 200 ? (
                          <ChevronDown className="h-4 w-4 mt-1 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <p className="text-sm font-medium">{log.decision}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs font-mono">
                                  {log.callSid}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    log.confidence >= 0.9
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  }`}
                                >
                                  {(log.confidence * 100).toFixed(0)}% confidence
                                </Badge>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</span>
                          </div>
                        </div>
                      </button>
                      {expandedLog === log.id + 200 && (
                        <div className="px-4 pb-4 pt-0 border-t border-border mt-2">
                          <div className="space-y-3 mt-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Reasoning:</p>
                              <p className="text-sm">{log.reasoning}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Context:</p>
                              <p className="text-sm text-muted-foreground">{log.context}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
