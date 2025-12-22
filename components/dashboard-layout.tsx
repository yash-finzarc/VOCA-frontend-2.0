"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Phone, LayoutDashboard, PhoneCall, MessageSquare, FileText, Settings, LogOut, Menu, X, Bot, FolderKanban, ChevronDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useProject } from "@/lib/project-context"
import { CreateProjectModal } from "@/components/create-project-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Project Overview" },
  { href: "/dashboard/calling", icon: PhoneCall, label: "Calling" },
  { href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
  { href: "/dashboard/system-prompts", icon: Bot, label: "System Prompts" },
  { href: "/dashboard/logs", icon: FileText, label: "Logs" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()
  const { activeProject, projects, setActiveProject, isLoading: projectLoading } = useProject()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [createProjectOpen, setCreateProjectOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:fixed md:inset-y-0 md:z-50 md:flex md:w-64 lg:w-72 md:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-4 md:px-6 pb-4">
          <div className="flex h-14 md:h-16 shrink-0 items-center gap-2 border-b border-border">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-accent flex items-center justify-center">
              <Phone className="w-4 h-4 md:w-5 md:h-5 text-accent-foreground" />
            </div>
            <span className="text-lg md:text-xl font-bold">VOCA</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              {/* Overall Dashboard - Always at top */}
              <li>
                <div className="space-y-2">
                  <div className="px-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overview</span>
                  </div>
                  <ul role="list" className="-mx-2 space-y-1">
                    <li>
                      <Link
                        href="/dashboard/overall"
                        className={`group flex gap-x-2 md:gap-x-3 rounded-lg p-2 md:p-3 text-xs md:text-sm font-semibold leading-6 transition-colors ${
                          pathname === "/dashboard/overall"
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <LayoutDashboard className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                        <span className="truncate">Overall Dashboard</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>

              {/* Project Switcher */}
              <li>
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setCreateProjectOpen(true)}
                      title="Create Project"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {!projectLoading && activeProject && (
                    <div className="px-2">
                      <Select value={activeProject.id} onValueChange={setActiveProject}>
                        <SelectTrigger className="w-full">
                          <div className="flex items-center gap-2">
                            <FolderKanban className="h-4 w-4 text-muted-foreground" />
                            <SelectValue>
                              <span className="font-medium">{activeProject.name}</span>
                            </SelectValue>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{project.name}</span>
                                {project.description && (
                                  <span className="text-xs text-muted-foreground">{project.description}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </li>

              {/* Navigation Items */}
              <li>
                <div className="space-y-2">
                  <div className="px-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Navigation</span>
                  </div>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navItems
                      .filter((item) => item.href !== "/dashboard/overall") // Remove overall from navItems since it's at top
                      .map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={`group flex gap-x-2 md:gap-x-3 rounded-lg p-2 md:p-3 text-xs md:text-sm font-semibold leading-6 transition-colors ${
                                isActive
                                  ? "bg-accent text-accent-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              }`}
                            >
                              <item.icon className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          </li>
                        )
                      })}
                  </ul>
                </div>
              </li>
              <li className="mt-auto">
                <div className="rounded-lg border border-border bg-muted/50 p-3 md:p-4">
                  <p className="text-xs md:text-sm font-medium truncate">{user.name}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">{user.email}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1 truncate">{user.company}</p>
                  <Button variant="outline" size="sm" className="w-full mt-2 md:mt-3 bg-transparent text-xs md:text-sm h-8 md:h-9" onClick={handleLogout}>
                    <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 md:hidden">
        <div className="flex h-14 items-center gap-x-3 border-b border-border bg-card px-4 sm:gap-x-4 sm:px-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-foreground lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Phone className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold">VOCA</span>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background">
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center gap-x-3 border-b border-border px-4">
              <button type="button" className="-m-2.5 p-2.5 text-foreground" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <Phone className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="text-xl font-bold">VOCA</span>
              </div>
            </div>
            <nav className="flex-1 px-4 py-6 overflow-y-auto">
              {/* Overall Dashboard - Mobile */}
              <div className="mb-6 space-y-2">
                <div className="px-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overview</span>
                </div>
                <Link
                  href="/dashboard/overall"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 transition-colors ${
                    pathname === "/dashboard/overall"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5 shrink-0" />
                  Overall Dashboard
                </Link>
              </div>

              {/* Project Switcher - Mobile */}
              {!projectLoading && activeProject && (
                <div className="mb-6 space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        setCreateProjectOpen(true)
                        setMobileMenuOpen(false)
                      }}
                      title="Create Project"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Select value={activeProject.id} onValueChange={setActiveProject}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                        <SelectValue>
                          <span className="font-medium">{activeProject.name}</span>
                        </SelectValue>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{project.name}</span>
                            {project.description && (
                              <span className="text-xs text-muted-foreground">{project.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Navigation Items - Mobile */}
              <div className="space-y-2">
                <div className="px-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Navigation</span>
                </div>
                <ul role="list" className="space-y-2">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`group flex gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 transition-colors ${
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </nav>
            <div className="border-t border-border p-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">{user.company}</p>
                <Button variant="outline" size="sm" className="w-full mt-3 bg-transparent" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="md:pl-64 lg:pl-72">
        <div className="px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
          {/* Project Header - Only show on project-specific pages, not on overall dashboard */}
          {!projectLoading && activeProject && pathname !== "/dashboard/overall" && (
            <div className="mb-4 pb-4 border-b border-border">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <FolderKanban className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Active Project:</span>
                <span className="font-medium text-foreground truncate">{activeProject.name}</span>
              </div>
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Create Project Modal */}
      <CreateProjectModal open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
    </div>
  )
}
