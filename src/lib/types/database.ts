export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string | null
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          org_id: string
          user_id: string | null
        }
        Insert: {
          action?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          org_id: string
          user_id?: string | null
        }
        Update: {
          action?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          org_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      datapoint_mappings: {
        Row: {
          conversion_factor: number
          conversion_from_unit: string | null
          created_at: string
          datapoint_key: string
          framework_code: string
          id: string
          question_id: string
        }
        Insert: {
          conversion_factor?: number
          conversion_from_unit?: string | null
          created_at?: string
          datapoint_key: string
          framework_code: string
          id?: string
          question_id: string
        }
        Update: {
          conversion_factor?: number
          conversion_from_unit?: string | null
          created_at?: string
          datapoint_key?: string
          framework_code?: string
          id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "datapoint_mappings_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      frameworks: {
        Row: {
          code: string
          country: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          regulator: string | null
          version: string
        }
        Insert: {
          code: string
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          regulator?: string | null
          version: string
        }
        Update: {
          code?: string
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          regulator?: string | null
          version?: string
        }
        Relationships: []
      }
      indicators: {
        Row: {
          category: string
          code: string
          created_at: string
          data_type: string | null
          id: string
          name: string
          principle_id: string
          sort_order: number
          unit: string | null
        }
        Insert: {
          category?: string
          code: string
          created_at?: string
          data_type?: string | null
          id?: string
          name: string
          principle_id: string
          sort_order?: number
          unit?: string | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          data_type?: string | null
          id?: string
          name?: string
          principle_id?: string
          sort_order?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indicators_principle_id_fkey"
            columns: ["principle_id"]
            isOneToOne: false
            referencedRelation: "principles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string | null
          org_id: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          org_id: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          org_id?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_departments: {
        Row: {
          code: string
          created_at: string
          head_email: string | null
          head_name: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
        }
        Insert: {
          code: string
          created_at?: string
          head_email?: string | null
          head_name?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
        }
        Update: {
          code?: string
          created_at?: string
          head_email?: string | null
          head_name?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_departments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_frameworks: {
        Row: {
          config: Json | null
          created_at: string
          enabled_at: string | null
          framework_id: string
          id: string
          is_active: boolean
          org_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          enabled_at?: string | null
          framework_id: string
          id?: string
          is_active?: boolean
          org_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          enabled_at?: string | null
          framework_id?: string
          id?: string
          is_active?: boolean
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_frameworks_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_frameworks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          fiscal_start: number
          id: string
          industry: string | null
          is_active: boolean
          listed_on: string | null
          logo_url: string | null
          market_cap: string | null
          name: string
          sector: string | null
          slug: string | null
        }
        Insert: {
          created_at?: string
          fiscal_start?: number
          id?: string
          industry?: string | null
          is_active?: boolean
          listed_on?: string | null
          logo_url?: string | null
          market_cap?: string | null
          name: string
          sector?: string | null
          slug?: string | null
        }
        Update: {
          created_at?: string
          fiscal_start?: number
          id?: string
          industry?: string | null
          is_active?: boolean
          listed_on?: string | null
          logo_url?: string | null
          market_cap?: string | null
          name?: string
          sector?: string | null
          slug?: string | null
        }
        Relationships: []
      }
      principles: {
        Row: {
          code: string
          created_at: string
          description: string | null
          framework_id: string
          id: string
          name: string
          section: string | null
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          framework_id: string
          id?: string
          name: string
          section?: string | null
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          framework_id?: string
          id?: string
          name?: string
          section?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "principles_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "frameworks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department_id: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          org_id: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department_id?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          org_id?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department_id?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          org_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profile_dept"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "org_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      question_assignments: {
        Row: {
          assigned_to: string | null
          created_at: string
          department_id: string
          due_date: string | null
          id: string
          org_id: string
          question_id: string
          report_period_id: string
          status: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          department_id: string
          due_date?: string | null
          id?: string
          org_id: string
          question_id: string
          report_period_id: string
          status?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          department_id?: string
          due_date?: string | null
          id?: string
          org_id?: string
          question_id?: string
          report_period_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_assignments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "org_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_assignments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_assignments_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_assignments_report_period_id_fkey"
            columns: ["report_period_id"]
            isOneToOne: false
            referencedRelation: "report_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          code: string
          created_at: string
          default_dept: string | null
          help_text: string | null
          id: string
          indicator_id: string
          is_assurable: boolean
          is_required: boolean
          options: Json | null
          response_type: string
          sort_order: number
          text: string
          validation_rules: Json | null
        }
        Insert: {
          code: string
          created_at?: string
          default_dept?: string | null
          help_text?: string | null
          id?: string
          indicator_id: string
          is_assurable?: boolean
          is_required?: boolean
          options?: Json | null
          response_type?: string
          sort_order?: number
          text: string
          validation_rules?: Json | null
        }
        Update: {
          code?: string
          created_at?: string
          default_dept?: string | null
          help_text?: string | null
          id?: string
          indicator_id?: string
          is_assurable?: boolean
          is_required?: boolean
          options?: Json | null
          response_type?: string
          sort_order?: number
          text?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["id"]
          },
        ]
      }
      report_periods: {
        Row: {
          code: string
          created_at: string
          end_date: string | null
          id: string
          name: string
          org_id: string
          start_date: string | null
          status: string
        }
        Insert: {
          code: string
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          org_id: string
          start_date?: string | null
          status?: string
        }
        Update: {
          code?: string
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          org_id?: string
          start_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_periods_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          file_url: string | null
          id: string
          notes: string | null
          numeric_value: number | null
          org_id: string
          question_id: string
          rejection_reason: string | null
          report_period_id: string
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string | null
          value: string | null
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          numeric_value?: number | null
          org_id: string
          question_id: string
          rejection_reason?: string | null
          report_period_id: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
          value?: string | null
          version?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          numeric_value?: number | null
          org_id?: string
          question_id?: string
          rejection_reason?: string | null
          report_period_id?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
          value?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "responses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_report_period_id_fkey"
            columns: ["report_period_id"]
            isOneToOne: false
            referencedRelation: "report_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      requesting_org_id: { Args: never; Returns: string }
      requesting_user_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

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

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
A new version of Supabase CLI is available: v2.102.0 (currently installed v2.101.0)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
