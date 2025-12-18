"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Send, CheckCircle2, XCircle, Clock } from "lucide-react"

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState("all")

  const messagingPlatforms = [
    {
      name: "WhatsApp",
      status: "Connected",
      icon: "💬",
      connected: true,
    },
    {
      name: "Facebook Messenger",
      status: "Connected",
      icon: "📘",
      connected: true,
    },
    {
      name: "Instagram Messages",
      status: "Not Connected",
      icon: "📷",
      connected: false,
    },
  ]

  const allMessages = [
    {
      id: 1,
      type: "Promotion",
      channel: "WhatsApp",
      status: "Sent",
      timestamp: "2025-01-15 11:52:34",
      preview: "Special offer: Get 20% off on your next purchase! Use code VOCA20 at checkout.",
      recipient: "+1 (555) 123-4567",
    },
    {
      id: 2,
      type: "Booking Confirmation",
      channel: "WhatsApp",
      status: "Sent",
      timestamp: "2025-01-15 11:48:12",
      preview: "Your appointment has been confirmed for January 18, 2025 at 2:30 PM.",
      recipient: "+1 (555) 234-5678",
    },
    {
      id: 3,
      type: "Feature Update",
      channel: "Facebook Messenger",
      status: "Sent",
      timestamp: "2025-01-15 11:45:56",
      preview: "We've just launched new AI voice features! Check out what's new in your dashboard.",
      recipient: "john.smith@email.com",
    },
    {
      id: 4,
      type: "Promotion",
      channel: "WhatsApp",
      status: "Failed",
      timestamp: "2025-01-15 11:42:23",
      preview: "Flash sale alert! Limited time offer on premium plans.",
      recipient: "+1 (555) 345-6789",
    },
    {
      id: 5,
      type: "Booking Confirmation",
      channel: "Facebook Messenger",
      status: "Pending",
      timestamp: "2025-01-15 11:38:45",
      preview: "Booking request received. We'll confirm your slot within 24 hours.",
      recipient: "sarah.johnson@email.com",
    },
    {
      id: 6,
      type: "Feature Update",
      channel: "WhatsApp",
      status: "Sent",
      timestamp: "2025-01-15 11:35:12",
      preview: "New analytics dashboard is now available. Track your call metrics in real-time.",
      recipient: "+1 (555) 456-7890",
    },
  ]

  const getFilteredMessages = () => {
    if (activeTab === "all") return allMessages
    return allMessages.filter((msg) => msg.type.toLowerCase().replace(" ", "-") === activeTab)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Sent":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "Failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Send className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
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
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1">Manage your messaging channels and view message logs</p>
        </div>

        {/* Connected Messaging Platforms */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Messaging Platforms</CardTitle>
            <CardDescription>Manage your integrated messaging channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {messagingPlatforms.map((platform) => (
                <div
                  key={platform.name}
                  className="flex flex-col gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{platform.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{platform.name}</p>
                      <Badge
                        variant="outline"
                        className={
                          platform.connected
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 mt-1"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 mt-1"
                        }
                      >
                        {platform.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    {platform.connected ? "Manage" : "Connect"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Message Logs</CardTitle>
            <CardDescription>View and filter your message history across all channels</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="promotion">Promotions</TabsTrigger>
                <TabsTrigger value="booking-confirmation">Bookings</TabsTrigger>
                <TabsTrigger value="feature-update">Updates</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="space-y-4 mt-4">
                {getFilteredMessages().length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No messages found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getFilteredMessages().map((message) => (
                      <div
                        key={message.id}
                        className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          {getStatusIcon(message.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <p className="text-sm font-medium">{message.type}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {message.channel}
                                </Badge>
                                <Badge variant="outline" className={`text-xs ${getStatusBadge(message.status)}`}>
                                  {message.status}
                                </Badge>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{message.timestamp}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{message.preview}</p>
                          <p className="text-xs text-muted-foreground">To: {message.recipient}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
