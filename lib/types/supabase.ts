export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    CompositeTypes: {
      [_ in never]: never
    }
    Enums: {
      interview_type: "CULTURE" | "FINAL" | "HR" | "OTHER" | "TECH"
      job_platform: "LINKEDIN" | "MANUAL" | "SARAMIN" | "WANTED"
      job_status:
        | "APPLIED"
        | "DOCS_PASSED"
        | "INTERVIEWING"
        | "OFFERED"
        | "REJECTED"
    }
    Functions: {
      [_ in never]: never
    }
    Tables: {
      applications: {
        Insert: {
          applied_at?: string
          created_at?: string
          id?: string
          job_id: string
          notes?: null | string
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          user_id: string
        }
        Relationships: [
          {
            columns: ["job_id"]
            foreignKeyName: "applications_job_id_fkey"
            isOneToOne: false
            referencedColumns: ["id"]
            referencedRelation: "jobs"
          },
        ]
        Row: {
          applied_at: string
          created_at: string
          id: string
          job_id: string
          notes: null | string
          status: Database["public"]["Enums"]["job_status"]
          updated_at: string
          user_id: string
        }
        Update: {
          applied_at?: string
          created_at?: string
          id?: string
          job_id?: string
          notes?: null | string
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          user_id?: string
        }
      }
      interviews: {
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          interview_type: Database["public"]["Enums"]["interview_type"]
          is_draft?: boolean
          location?: null | string
          round: number
          scheduled_at: string
          scratchpad?: null | string
          updated_at?: string
        }
        Relationships: [
          {
            columns: ["application_id"]
            foreignKeyName: "interviews_application_id_fkey"
            isOneToOne: false
            referencedColumns: ["id"]
            referencedRelation: "applications"
          },
        ]
        Row: {
          application_id: string
          created_at: string
          id: string
          interview_type: Database["public"]["Enums"]["interview_type"]
          is_draft: boolean
          location: null | string
          round: number
          scheduled_at: string
          scratchpad: null | string
          updated_at: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          interview_type?: Database["public"]["Enums"]["interview_type"]
          is_draft?: boolean
          location?: null | string
          round?: number
          scheduled_at?: string
          scratchpad?: null | string
          updated_at?: string
        }
      }
      job_snapshots: {
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          raw_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Relationships: [
          {
            columns: ["job_id"]
            foreignKeyName: "job_snapshots_job_id_fkey"
            isOneToOne: false
            referencedColumns: ["id"]
            referencedRelation: "jobs"
          },
        ]
        Row: {
          created_at: string
          id: string
          job_id: string
          raw_data: Json | null
          updated_at: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          raw_data?: Json | null
          updated_at?: string
          user_id?: string
        }
      }
      jobs: {
        Insert: {
          company_name: string
          created_at?: string
          description?: null | string
          id?: string
          origin_url: string
          platform: Database["public"]["Enums"]["job_platform"]
          position_title: string
        }
        Relationships: []
        Row: {
          company_name: string
          created_at: string
          description: null | string
          id: string
          origin_url: string
          platform: Database["public"]["Enums"]["job_platform"]
          position_title: string
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: null | string
          id?: string
          origin_url?: string
          platform?: Database["public"]["Enums"]["job_platform"]
          position_title?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
  }
}

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type Json =
  | boolean
  | Json[]
  | null
  | number
  | string
  | { [key: string]: Json | undefined }

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export const Constants = {
  public: {
    Enums: {
      interview_type: ["TECH", "HR", "CULTURE", "FINAL", "OTHER"],
      job_platform: ["WANTED", "SARAMIN", "LINKEDIN", "MANUAL"],
      job_status: [
        "APPLIED",
        "DOCS_PASSED",
        "INTERVIEWING",
        "OFFERED",
        "REJECTED",
      ],
    },
  },
} as const
