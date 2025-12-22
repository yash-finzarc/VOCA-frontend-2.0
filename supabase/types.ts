// Database types based on Supabase schema

export type SubscriptionTier = "free" | "pro" | "enterprise"
export type OrgStatus = "active" | "suspended" | "inactive"
export type MemberStatus = "pending" | "active" | "inactive"
export type ProjectRole = "owner" | "admin" | "member" | "viewer"
export type CallStatus = "queued" | "ringing" | "in-progress" | "completed" | "failed" | "busy" | "no-answer" | "canceled"
export type SessionStatus = "active" | "ended" | "paused"
export type Sentiment = "positive" | "neutral" | "negative"
export type CampaignMode = "conversation" | "announcement"
export type WorkflowStatus = "running" | "completed" | "failed" | "paused"
export type AnnouncementStatus = "running" | "completed" | "failed" | "paused"
export type ExcelStatus = "uploading" | "processing" | "ready" | "error"
export type ModelType = "calling" | "messaging"
export type PermissionLevel = "read" | "write" | "admin"
export type LeadSource = "manual" | "excel" | "api" | "webhook"
export type ServiceName = "twilio" | "openai" | "anthropic" | "elevenlabs"

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string | null
          phone_number: string | null
          is_active: boolean
          last_login_at: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          subscription_tier: SubscriptionTier
          status: OrgStatus
          settings: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["organizations"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          permissions: Record<string, any>
          status: MemberStatus
          joined_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["organization_members"]["Row"], "id" | "joined_at">
        Update: Partial<Database["public"]["Tables"]["organization_members"]["Insert"]>
      }
      projects: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: ProjectRole
          joined_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["project_members"]["Row"], "id" | "joined_at">
        Update: Partial<Database["public"]["Tables"]["project_members"]["Insert"]>
      }
      calls: {
        Row: {
          id: string
          organization_id: string | null
          campaign_id: string | null
          workflow_run_id: string | null
          lead_id: string | null
          twilio_call_sid: string | null
          status: CallStatus
          from_number: string | null
          to_number: string | null
          duration_seconds: number | null
          started_at: string
          ended_at: string | null
        }
        Insert: Omit<Database["public"]["Tables"]["calls"]["Row"], "id" | "started_at">
        Update: Partial<Database["public"]["Tables"]["calls"]["Insert"]>
      }
      calling_campaigns: {
        Row: {
          id: string
          organization_id: string | null
          name: string
          mode: CampaignMode
          system_prompt_id: string | null
          is_active: boolean
          created_at: string
          project_id: string | null
        }
        Insert: Omit<Database["public"]["Tables"]["calling_campaigns"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["calling_campaigns"]["Insert"]>
      }
      system_prompts: {
        Row: {
          id: string
          organization_id: string | null
          name: string
          prompt_text: string
          model_type: ModelType
          variables: Record<string, any>
          is_default: boolean
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["system_prompts"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["system_prompts"]["Insert"]>
      }
      leads: {
        Row: {
          id: string
          organization_id: string | null
          phone_number: string
          source: LeadSource
          call_attempts: number
          last_call_status: CallStatus | null
          is_opted_out: boolean
        }
        Insert: Omit<Database["public"]["Tables"]["leads"]["Row"], "id">
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>
      }
      excel_files: {
        Row: {
          id: string
          organization_id: string | null
          filename: string
          file_path: string
          row_count: number
          column_mapping: Record<string, any>
          status: ExcelStatus
          uploaded_by: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["excel_files"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["excel_files"]["Insert"]>
      }
      // Add other tables as needed
    }
  }
}

