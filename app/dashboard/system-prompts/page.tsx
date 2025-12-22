"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Save, Loader2, Plus, Trash2, Phone, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useProject } from "@/lib/project-context"

type PromptType = "calling" | "messaging"

interface SystemPrompt {
  id: string
  name: string
  prompt: string
  type: PromptType
  welcomeMessage: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function SystemPromptsPage() {
  const { activeProject } = useProject()
  const { toast } = useToast()
  const [promptType, setPromptType] = useState<PromptType>("calling")
  const [prompts, setPrompts] = useState<SystemPrompt[]>([])
  const [selectedPromptId, setSelectedPromptId] = useState<string>("")
  const [promptName, setPromptName] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [welcomeMessage, setWelcomeMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingSystemPrompt, setIsSavingSystemPrompt] = useState(false)
  const [isSavingWelcomeMessage, setIsSavingWelcomeMessage] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null)

  // Load prompts on mount and when prompt type changes
  useEffect(() => {
    loadPrompts()
  }, [promptType])

  // Update selected prompt when selection changes
  useEffect(() => {
    if (selectedPromptId && prompts.length > 0) {
      const prompt = prompts.find((p) => p.id === selectedPromptId)
      if (prompt) {
        setPromptName(prompt.name)
        setSystemPrompt(prompt.prompt)
        setWelcomeMessage(prompt.welcomeMessage)
        setEditingPrompt(prompt)
      }
    } else if (prompts.length === 0) {
      // Reset form if no prompts
      setPromptName("")
      setSystemPrompt("")
      setWelcomeMessage("")
      setEditingPrompt(null)
    }
  }, [selectedPromptId, prompts])

  const loadPrompts = () => {
    if (!activeProject) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      // TODO: Replace with Supabase query: SELECT * FROM system_prompts WHERE project_id = $1 AND type = $2
      const storageKey = `voca_system_prompts_${activeProject.id}_${promptType}`
      const savedPrompts = localStorage.getItem(storageKey)
      
      if (savedPrompts) {
        const parsedPrompts: SystemPrompt[] = JSON.parse(savedPrompts)
        setPrompts(parsedPrompts)
        
        // Select active prompt or first prompt
        const activePrompt = parsedPrompts.find((p) => p.isActive) || parsedPrompts[0]
        if (activePrompt) {
          setSelectedPromptId(activePrompt.id)
        } else {
          setSelectedPromptId("")
        }
      } else {
        // Create default prompt if none exist
        const defaultPrompt: SystemPrompt = {
          id: `default-${promptType}-${Date.now()}`,
          name: `Default ${promptType === "calling" ? "Calling" : "Messaging"} Prompt`,
          prompt:
            promptType === "calling"
              ? "You are a professional AI voice assistant for VOCA. Your goal is to have natural, helpful conversations with callers. Be polite, concise, and stay on topic. Always confirm important details before ending the call."
              : "You are a professional AI messaging assistant for VOCA. Your goal is to provide helpful, clear, and concise responses via text messages. Be polite, friendly, and efficient in your communications.",
          type: promptType,
          welcomeMessage:
            promptType === "calling"
              ? "Hello! Thank you for calling. How can I help you today?"
              : "Hello! Thank you for contacting us. How can I help you today?",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setPrompts([defaultPrompt])
        setSelectedPromptId(defaultPrompt.id)
      }
    } catch (error) {
      console.error("Failed to load prompts:", error)
      toast({
        title: "Error",
        description: "Failed to load system prompts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewPrompt = () => {
    setEditingPrompt(null)
    setPromptName("")
    setSystemPrompt("")
    setWelcomeMessage("")
    setIsDialogOpen(true)
  }

  const handleSaveNewPrompt = () => {
    if (!promptName.trim() || !systemPrompt.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a name and system prompt",
        variant: "destructive",
      })
      return
    }

    const newPrompt: SystemPrompt = {
      id: `prompt-${Date.now()}`,
      name: promptName.trim(),
      prompt: systemPrompt.trim(),
      type: promptType,
      welcomeMessage: welcomeMessage.trim() || (promptType === "calling" 
        ? "Hello! Thank you for calling. How can I help you today?"
        : "Hello! Thank you for contacting us. How can I help you today?"),
      isActive: prompts.length === 0, // First prompt is active by default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedPrompts = [...prompts, newPrompt]
    savePrompts(updatedPrompts)
    setSelectedPromptId(newPrompt.id)
    setIsDialogOpen(false)
    
    toast({
      title: "Success",
      description: "New system prompt created successfully",
    })
  }

  const handleSaveSystemPrompt = async () => {
    if (!selectedPromptId) {
      toast({
        title: "Error",
        description: "Please select a prompt to save",
        variant: "destructive",
      })
      return
    }

    if (!systemPrompt.trim()) {
      toast({
        title: "Validation Error",
        description: "System prompt cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsSavingSystemPrompt(true)

    try {
      const updatedPrompts = prompts.map((p) =>
        p.id === selectedPromptId
          ? {
              ...p,
              prompt: systemPrompt.trim(),
              updatedAt: new Date().toISOString(),
            }
          : p,
      )

      savePrompts(updatedPrompts)
      
      toast({
        title: "Saved successfully",
        description: "System prompt has been saved.",
      })
    } catch (error) {
      toast({
        title: "Failed to save",
        description: error instanceof Error ? error.message : "An error occurred while saving.",
        variant: "destructive",
      })
    } finally {
      setIsSavingSystemPrompt(false)
    }
  }

  const handleSaveWelcomeMessage = async () => {
    if (!selectedPromptId) {
      toast({
        title: "Error",
        description: "Please select a prompt to save",
        variant: "destructive",
      })
      return
    }

    setIsSavingWelcomeMessage(true)

    try {
      const updatedPrompts = prompts.map((p) =>
        p.id === selectedPromptId
          ? {
              ...p,
              welcomeMessage: welcomeMessage.trim(),
              updatedAt: new Date().toISOString(),
            }
          : p,
      )

      savePrompts(updatedPrompts)
      
      toast({
        title: "Saved successfully",
        description: "Welcome message has been saved.",
      })
    } catch (error) {
      toast({
        title: "Failed to save",
        description: error instanceof Error ? error.message : "An error occurred while saving.",
        variant: "destructive",
      })
    } finally {
      setIsSavingWelcomeMessage(false)
    }
  }

  const handleDeletePrompt = (id: string) => {
    if (prompts.length === 1) {
      toast({
        title: "Error",
        description: "Cannot delete the last prompt",
        variant: "destructive",
      })
      return
    }

    const updatedPrompts = prompts.filter((p) => p.id !== id)
    const wasActive = prompts.find((p) => p.id === id)?.isActive

    // If deleted prompt was active, make first prompt active
    if (wasActive && updatedPrompts.length > 0) {
      updatedPrompts[0].isActive = true
    }

    savePrompts(updatedPrompts)

    // Select another prompt
    if (updatedPrompts.length > 0) {
      setSelectedPromptId(updatedPrompts[0].id)
    } else {
      setSelectedPromptId("")
    }

    toast({
      title: "Deleted",
      description: "System prompt deleted successfully",
    })
  }

  const handleSetActive = (id: string) => {
    const updatedPrompts = prompts.map((p) => ({
      ...p,
      isActive: p.id === id,
    }))
    savePrompts(updatedPrompts)
    
    toast({
      title: "Updated",
      description: "Active prompt changed successfully",
    })
  }

  const savePrompts = (promptsToSave: SystemPrompt[]) => {
    if (!activeProject) return
    // TODO: Replace with Supabase INSERT/UPDATE: INSERT INTO system_prompts (project_id, type, ...) VALUES (...)
    const storageKey = `voca_system_prompts_${activeProject.id}_${promptType}`
    localStorage.setItem(storageKey, JSON.stringify(promptsToSave))
    setPrompts(promptsToSave)
  }

  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId)

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (!activeProject) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Prompts</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Please select a project to configure AI system prompts and welcome messages.</p>
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Prompts</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Configure the AI system prompts and welcome messages for {promptType === "calling" ? "voice calls" : "messaging"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="prompt-type" className="text-sm font-medium whitespace-nowrap">
              Service Type:
            </Label>
            <Select value={promptType} onValueChange={(value) => setPromptType(value as PromptType)}>
              <SelectTrigger id="prompt-type" className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calling">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>Calling</span>
                  </div>
                </SelectItem>
                <SelectItem value="messaging">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Messaging</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Editor Card */}
        <Card>
          <CardHeader>
            <CardTitle>Edit System Prompt & Welcome Message</CardTitle>
            <CardDescription>
              Configure the welcome message and system prompt that define the AI assistant's behavior, personality, and
              instructions for {promptType === "calling" ? "voice interactions" : "text messaging"}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Select Prompt */}
            <div className="space-y-2">
              <Label>Select Prompt</Label>
              <div className="flex items-center gap-3">
                <Select value={selectedPromptId} onValueChange={setSelectedPromptId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a prompt" />
                  </SelectTrigger>
                  <SelectContent>
                    {prompts.map((prompt) => (
                      <SelectItem key={prompt.id} value={prompt.id}>
                        <div className="flex items-center gap-2">
                          <span>{prompt.name}</span>
                          {prompt.isActive && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleNewPrompt} variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New System Prompt</DialogTitle>
                      <DialogDescription>
                        Create a new {promptType === "calling" ? "calling" : "messaging"} system prompt
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-prompt-name">Prompt Name</Label>
                        <Input
                          id="new-prompt-name"
                          value={promptName}
                          onChange={(e) => setPromptName(e.target.value)}
                          placeholder="e.g., Sales Follow-up, Customer Service"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-system-prompt">System Prompt</Label>
                        <Textarea
                          id="new-system-prompt"
                          value={systemPrompt}
                          onChange={(e) => setSystemPrompt(e.target.value)}
                          className="min-h-[150px] sm:min-h-[180px] md:min-h-[200px] font-mono text-sm"
                          placeholder="Enter system prompt..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-welcome-message">Welcome Message</Label>
                        <Textarea
                          id="new-welcome-message"
                          value={welcomeMessage}
                          onChange={(e) => setWelcomeMessage(e.target.value)}
                          className="min-h-[80px] sm:min-h-[100px] text-sm"
                          placeholder="Enter welcome message..."
                        />
                        <p className="text-xs text-muted-foreground">
                          This message will be {promptType === "calling" ? "played to users" : "sent to users"} when they first
                          connect to the AI assistant.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveNewPrompt}>Create Prompt</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {selectedPrompt && (
              <>
                {/* Prompt Name and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-medium">{promptName}</Label>
                    {selectedPrompt.isActive && (
                      <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!selectedPrompt.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetActive(selectedPrompt.id)}
                      >
                        Set as Active
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePrompt(selectedPrompt.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* System Prompt Editor */}
                <div className="space-y-2">
                  <Label htmlFor="system-prompt">System Prompt</Label>
                  <Textarea
                    id="system-prompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="min-h-[150px] sm:min-h-[180px] md:min-h-[200px] font-mono text-sm"
                    placeholder="Enter system prompt..."
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{systemPrompt.length} characters</p>
                    <Button
                      onClick={handleSaveSystemPrompt}
                      disabled={isSavingSystemPrompt}
                      size="sm"
                      className="gap-2"
                    >
                      {isSavingSystemPrompt ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save System Prompt
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-6" />

                {/* Welcome Message Editor */}
                <div className="space-y-2">
                  <Label htmlFor="welcome-message">Welcome Message</Label>
                  <Textarea
                    id="welcome-message"
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    className="min-h-[100px] sm:min-h-[120px] text-sm"
                    placeholder="Enter welcome message..."
                  />
                  <p className="text-xs text-muted-foreground">
                    {welcomeMessage.length} characters. This message will be{" "}
                    {promptType === "calling" ? "played to users" : "sent to users"} when they first connect to the AI
                    assistant. It will be stored in the welcome_message column.
                  </p>
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleSaveWelcomeMessage}
                      disabled={isSavingWelcomeMessage}
                      size="lg"
                      className="gap-2"
                    >
                      {isSavingWelcomeMessage ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Welcome Message
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
