"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, PhoneOff, ChevronDown, ChevronUp, FileSpreadsheet, Play, Square } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/ui/file-upload"
import { Progress } from "@/components/ui/progress"
import { useProject } from "@/lib/project-context"
import { useMemo } from "react"

type CallingMode = "normal" | "dead-leads"

interface DeadLeadsSummary {
  totalLeads: number
  validLeads: number
  invalidLeads: number
  lastUploadTimestamp: Date | null
}

interface UploadedFile {
  name: string
  size: number
  uploadedAt: Date
}

type ServiceType = "conversation" | "announcement"

export default function CallingPage() {
  const { activeProject } = useProject()
  const [callingMode, setCallingMode] = useState<CallingMode>("normal")
  const [serviceType, setServiceType] = useState<ServiceType>("conversation")
  const [selectedSystemPromptId, setSelectedSystemPromptId] = useState<string>("default")
  const [countryCode, setCountryCode] = useState("+1")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [lastUpdated, setLastUpdated] = useState(new Date())
  
  // Dead Leads state
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | undefined>(undefined)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "uploaded" | "failed">("idle")
  const [uploadError, setUploadError] = useState<string>("")
  const [uploadId, setUploadId] = useState<string>("")
  const [deadLeadsSummary, setDeadLeadsSummary] = useState<DeadLeadsSummary>({
    totalLeads: 0,
    validLeads: 0,
    invalidLeads: 0,
    lastUploadTimestamp: null,
  })
  const [campaignStatus, setCampaignStatus] = useState<"idle" | "running" | "stopped">("idle")
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("")
  const [deadLeadsSystemPromptId, setDeadLeadsSystemPromptId] = useState<string>("")
  const [maxCalls, setMaxCalls] = useState<string>("50")
  const [campaignProgress, setCampaignProgress] = useState(0)
  const [expandedSections, setExpandedSections] = useState({
    active: true,
    queued: true,
    completed: false,
    declined: false,
  })

  const fullPhoneNumber = phoneNumber ? `${countryCode} ${phoneNumber}` : ""

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 25000)
    return () => clearInterval(interval)
  }, [])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Dead Leads handlers
  const handleFileUpload = async (file: File) => {
    setUploadError("")
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError(`File size exceeds the maximum limit of ${(maxSize / (1024 * 1024)).toFixed(0)}MB`)
      setUploadStatus("failed")
      return
    }

    setUploadStatus("uploading")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/calling/dead-leads/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Upload failed")
      }

      const data = await response.json()
      const newUploadId = data.upload_id
      setUploadId(newUploadId)
      setUploadedFile({
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
      })
      setUploadStatus("uploaded")

      // Fetch summary after successful upload
      await fetchDeadLeadsSummary(newUploadId)
    } catch (error) {
      setUploadStatus("failed")
      setUploadError(error instanceof Error ? error.message : "Failed to upload file")
    }
  }

  const fetchDeadLeadsSummary = async (uploadIdParam?: string) => {
    try {
      const id = uploadIdParam || uploadId
      if (!id) return

      // This would be fetched from backend API
      // Example API call (to be implemented by backend):
      // const response = await fetch(`/api/calling/dead-leads/summary?upload_id=${id}`)
      // const data = await response.json()
      // setDeadLeadsSummary({
      //   totalLeads: data.total_leads,
      //   validLeads: data.valid_leads,
      //   invalidLeads: data.invalid_leads,
      //   lastUploadTimestamp: new Date(data.last_upload_timestamp),
      // })

      // Placeholder response structure - will be replaced by actual API
      // Note: In production, this data should come from the backend response
      setDeadLeadsSummary({
        totalLeads: 120,
        validLeads: 110,
        invalidLeads: 10,
        lastUploadTimestamp: new Date(),
      })
    } catch (error) {
      console.error("Failed to fetch summary:", error)
    }
  }

  const handleStartDeadLeadsCampaign = async () => {
    if (!uploadId || !selectedCampaignId || !deadLeadsSystemPromptId) {
      setUploadError("Please select all required options")
      return
    }

    try {
      const response = await fetch("/api/calling/dead-leads/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          upload_id: uploadId,
          campaign_id: selectedCampaignId,
          system_prompt_id: deadLeadsSystemPromptId,
          max_calls: parseInt(maxCalls, 10),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to start campaign")
      }

      setCampaignStatus("running")
      setCampaignProgress(0)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Failed to start campaign")
    }
  }

  const handleStopDeadLeadsCampaign = async () => {
    try {
      // API call to stop campaign
      // await fetch("/api/calling/dead-leads/stop", { method: "POST" })
      setCampaignStatus("stopped")
    } catch (error) {
      console.error("Failed to stop campaign:", error)
    }
  }

  // TODO: Replace with Supabase query: SELECT * FROM calls WHERE project_id = $1 AND status = 'completed'
  const completedCalls = useMemo(() => {
    if (!activeProject) return []
    // Mock data - in production, this would be fetched from Supabase filtered by projectId
    return [
      {
        sid: `CA${activeProject.id.slice(-6)}123456`,
        to: "+1 (555) 123-4567",
        duration: "00:05:23",
        endTime: "11:45:32 AM",
        status: "Completed",
      },
      {
        sid: `CA${activeProject.id.slice(-6)}234567`,
        to: "+1 (555) 234-5678",
        duration: "00:03:45",
        endTime: "11:42:18 AM",
        status: "Completed",
      },
    ]
  }, [activeProject])

  // TODO: Replace with Supabase query: SELECT * FROM calls WHERE project_id = $1 AND status IN ('declined', 'failed')
  const declinedCalls = useMemo(() => {
    if (!activeProject) return []
    return [
      {
        sid: `CA${activeProject.id.slice(-6)}456789`,
        to: "+1 (555) 456-7890",
        reason: "No answer",
        timestamp: "11:48:23 AM",
      },
      {
        sid: `CA${activeProject.id.slice(-6)}567890`,
        to: "+1 (555) 567-8901",
        reason: "Busy",
        timestamp: "11:46:15 AM",
      },
    ]
  }, [activeProject])

  // TODO: Replace with Supabase query: SELECT * FROM calls WHERE project_id = $1 ORDER BY timestamp DESC
  const callHistory = useMemo(() => {
    if (!activeProject) return []
    return [
      {
        sid: `CA${activeProject.id.slice(-6)}123456`,
        direction: "Outbound",
        status: "Completed",
        duration: "00:05:23",
        timestamp: "2025-01-15 11:45:32",
      },
      {
        sid: `CA${activeProject.id.slice(-6)}234567`,
        direction: "Outbound",
        status: "Completed",
        duration: "00:03:45",
        timestamp: "2025-01-15 11:42:18",
      },
      {
        sid: `CA${activeProject.id.slice(-6)}345678`,
        direction: "Inbound",
        status: "Completed",
        duration: "00:07:12",
        timestamp: "2025-01-15 11:38:56",
      },
    ]
  }, [activeProject])

  if (!activeProject) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calling</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Please select a project to configure and monitor your AI-powered calling system.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calling</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Configure and monitor your AI-powered calling system</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <Label htmlFor="calling-mode" className="text-sm font-medium whitespace-nowrap">
              Mode:
            </Label>
            <Select value={callingMode} onValueChange={(value) => setCallingMode(value as CallingMode)}>
              <SelectTrigger id="calling-mode" className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal Calls</SelectItem>
                <SelectItem value="dead-leads">Dead Leads</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {callingMode === "normal" ? (
          <>
            {/* Phone Configuration */}
            <Card>
          <CardHeader>
            <CardTitle>Phone Configuration</CardTitle>
            <CardDescription>Configure your calling phone number and select system prompt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="service-type-select">Service Type</Label>
                <Select value={serviceType} onValueChange={(value) => setServiceType(value as ServiceType)}>
                  <SelectTrigger id="service-type-select">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversation">Conversation Calls</SelectItem>
                    <SelectItem value="announcement">Announcement Calls</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose between interactive conversation calls or one-way announcement calls
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="system-prompt-select">System Prompt</Label>
                <Select value={selectedSystemPromptId} onValueChange={setSelectedSystemPromptId}>
                  <SelectTrigger id="system-prompt-select">
                    <SelectValue placeholder="Select system prompt" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Prompt</SelectItem>
                    <SelectItem value="custom">Custom Prompt (from System Prompts page)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Manage system prompts in the{" "}
                  <Link href="/dashboard/system-prompts" className="text-accent hover:underline">
                    System Prompts
                  </Link>{" "}
                  page
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country-code">Country Code</Label>
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger id="country-code">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">+1 (US/Canada)</SelectItem>
                    <SelectItem value="+44">+44 (UK)</SelectItem>
                    <SelectItem value="+91">+91 (India)</SelectItem>
                    <SelectItem value="+61">+61 (Australia)</SelectItem>
                    <SelectItem value="+81">+81 (Japan)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone-number">Phone Number</Label>
                <Input
                  id="phone-number"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="full-phone">Full Phone Number</Label>
              <Input id="full-phone" value={fullPhoneNumber} disabled className="bg-muted" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="gap-2">
                <Phone className="h-4 w-4" />
                Make Call
              </Button>
              <Button variant="destructive" className="gap-2">
                <PhoneOff className="h-4 w-4" />
                Hang Up All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Call Status */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Detailed Call Status</CardTitle>
                <CardDescription>Live Twilio call breakdown (auto-refreshes every 25 seconds)</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Active / In Progress */}
            <div className="border border-border rounded-lg">
              <button
                onClick={() => toggleSection("active")}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div className="text-left">
                    <p className="font-medium">Active / In Progress (0)</p>
                    <p className="text-xs text-muted-foreground">Calls currently connecting or in progress</p>
                  </div>
                </div>
                {expandedSections.active ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSections.active && (
                <div className="p-4 pt-0 border-t border-border">
                  <p className="text-sm text-muted-foreground italic">No calls</p>
                </div>
              )}
            </div>

            {/* Queued / Ringing */}
            <div className="border border-border rounded-lg">
              <button
                onClick={() => toggleSection("queued")}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="text-left">
                    <p className="font-medium">Queued / Ringing (0)</p>
                    <p className="text-xs text-muted-foreground">Queued or ringing calls awaiting connection</p>
                  </div>
                </div>
                {expandedSections.queued ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSections.queued && (
                <div className="p-4 pt-0 border-t border-border">
                  <p className="text-sm text-muted-foreground italic">No calls</p>
                </div>
              )}
            </div>

            {/* Completed */}
            <div className="border border-border rounded-lg">
              <button
                onClick={() => toggleSection("completed")}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div className="text-left">
                    <p className="font-medium">Completed ({completedCalls.length})</p>
                    <p className="text-xs text-muted-foreground">Successfully completed calls</p>
                  </div>
                </div>
                {expandedSections.completed ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSections.completed && (
                <div className="p-4 pt-0 border-t border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-2 font-medium">Call SID</th>
                          <th className="text-left py-2 px-2 font-medium">To Number</th>
                          <th className="text-left py-2 px-2 font-medium">Duration</th>
                          <th className="text-left py-2 px-2 font-medium">End Time</th>
                          <th className="text-left py-2 px-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedCalls.map((call) => (
                          <tr key={call.sid} className="border-b border-border last:border-0">
                            <td className="py-2 px-2 font-mono text-xs">{call.sid}</td>
                            <td className="py-2 px-2">{call.to}</td>
                            <td className="py-2 px-2">{call.duration}</td>
                            <td className="py-2 px-2">{call.endTime}</td>
                            <td className="py-2 px-2">
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              >
                                {call.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Declined / Failed */}
            <div className="border border-border rounded-lg">
              <button
                onClick={() => toggleSection("declined")}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="text-left">
                    <p className="font-medium">Declined / Failed ({declinedCalls.length})</p>
                    <p className="text-xs text-muted-foreground">Calls that failed or were declined</p>
                  </div>
                </div>
                {expandedSections.declined ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSections.declined && (
                <div className="p-4 pt-0 border-t border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-2 font-medium">Call SID</th>
                          <th className="text-left py-2 px-2 font-medium">To Number</th>
                          <th className="text-left py-2 px-2 font-medium">Failure Reason</th>
                          <th className="text-left py-2 px-2 font-medium">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {declinedCalls.map((call) => (
                          <tr key={call.sid} className="border-b border-border last:border-0">
                            <td className="py-2 px-2 font-mono text-xs">{call.sid}</td>
                            <td className="py-2 px-2">{call.to}</td>
                            <td className="py-2 px-2">
                              <Badge
                                variant="outline"
                                className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              >
                                {call.reason}
                              </Badge>
                            </td>
                            <td className="py-2 px-2">{call.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Call History */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Call History</CardTitle>
                <CardDescription>Complete list of all calls fetched from backend</CardDescription>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 mt-4">
              <p>Last fetch: {new Date().toLocaleTimeString()}</p>
              <p>Total calls in history: 45 | Active: 0 | Queued: 0 | Completed: 15 | Declined: 30</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium">Call SID</th>
                    <th className="text-left py-3 px-2 font-medium">Direction</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                    <th className="text-left py-3 px-2 font-medium">Duration</th>
                    <th className="text-left py-3 px-2 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {callHistory.map((call) => (
                    <tr key={call.sid} className="border-b border-border last:border-0">
                      <td className="py-3 px-2 font-mono text-xs">{call.sid}</td>
                      <td className="py-3 px-2">
                        <Badge variant="outline">{call.direction}</Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant="outline"
                          className={
                            call.status === "Completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }
                        >
                          {call.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">{call.duration}</td>
                      <td className="py-3 px-2 text-muted-foreground">{call.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
          </>
        ) : (
          <>
            {/* Dead Leads Section */}
            {/* Card 1: Upload Dead Leads Sheet */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Upload Dead Leads Sheet
                </CardTitle>
                <CardDescription>
                  Upload a CSV or Excel file containing dead lead phone numbers. The file will be processed securely on the backend.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  accept=".csv,.xlsx,.xls"
                  maxSize={5 * 1024 * 1024}
                  onFileSelect={handleFileUpload}
                  uploadedFile={uploadedFile}
                  uploadStatus={uploadStatus}
                  error={uploadError}
                />
              </CardContent>
            </Card>

            {/* Card 2: Dead Leads Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Dead Leads Summary</CardTitle>
                <CardDescription>Metrics from the last uploaded file</CardDescription>
              </CardHeader>
              <CardContent>
                {deadLeadsSummary.totalLeads === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Upload a file to see summary metrics</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Leads Uploaded</p>
                      <p className="text-2xl font-bold">{deadLeadsSummary.totalLeads}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Valid Leads</p>
                      <p className="text-2xl font-bold text-green-600">{deadLeadsSummary.validLeads}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Invalid / Skipped</p>
                      <p className="text-2xl font-bold text-orange-600">{deadLeadsSummary.invalidLeads}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Last Upload</p>
                      <p className="text-sm font-medium">
                        {deadLeadsSummary.lastUploadTimestamp
                          ? new Intl.DateTimeFormat("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(deadLeadsSummary.lastUploadTimestamp)
                          : "Never"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 3: Initiate Dead Lead Calling */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Initiate Dead Lead Calling
                </CardTitle>
                <CardDescription>Configure and start a calling campaign for dead leads</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dead-leads-system-prompt-select">System Prompt</Label>
                    <Select
                      value={deadLeadsSystemPromptId}
                      onValueChange={setDeadLeadsSystemPromptId}
                    >
                      <SelectTrigger id="dead-leads-system-prompt-select">
                        <SelectValue placeholder="Select system prompt" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Prompt</SelectItem>
                        <SelectItem value="custom">Custom Prompt (from System Prompts page)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campaign-select">Campaign</Label>
                    <Select
                      value={selectedCampaignId}
                      onValueChange={setSelectedCampaignId}
                    >
                      <SelectTrigger id="campaign-select">
                        <SelectValue placeholder="Select campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="campaign-1">Dead Leads Recovery</SelectItem>
                        <SelectItem value="campaign-2">Re-engagement Campaign</SelectItem>
                        <SelectItem value="campaign-3">Win-back Campaign</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-calls">Max Calls</Label>
                  <Input
                    id="max-calls"
                    type="number"
                    min="1"
                    value={maxCalls}
                    onChange={(e) => setMaxCalls(e.target.value)}
                    placeholder="50"
                  />
                </div>

                {campaignStatus === "running" && (
                  <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Campaign Progress</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Running
                      </Badge>
                    </div>
                    <Progress value={campaignProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {campaignProgress}% complete
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleStartDeadLeadsCampaign}
                    disabled={
                      uploadStatus !== "uploaded" ||
                      deadLeadsSummary.validLeads === 0 ||
                      !selectedCampaignId ||
                      !selectedSystemPromptId ||
                      campaignStatus === "running"
                    }
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Initiate Calls
                  </Button>
                  {campaignStatus === "running" && (
                    <Button
                      variant="destructive"
                      onClick={handleStopDeadLeadsCampaign}
                      className="gap-2"
                    >
                      <Square className="h-4 w-4" />
                      Stop Campaign
                    </Button>
                  )}
                </div>

                {uploadStatus !== "uploaded" && (
                  <p className="text-xs text-muted-foreground">
                    Please upload a file before starting a campaign
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
