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
  public: {
    Tables: {
      plan_assignments: {
        Row: {
          assigned_at: string
          plan_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          plan_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          plan_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_assignments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      planned_workouts: {
        Row: {
          created_at: string
          day_name: string
          id: string
          notes: string | null
          plan_id: string
          planned_km: number
          session_type: string
          target_pace: string
          week_number: number
          workout_date: string
          workout_detail: string
        }
        Insert: {
          created_at?: string
          day_name: string
          id: string
          notes?: string | null
          plan_id: string
          planned_km: number
          session_type: string
          target_pace: string
          week_number: number
          workout_date: string
          workout_detail: string
        }
        Update: {
          created_at?: string
          day_name?: string
          id?: string
          notes?: string | null
          plan_id?: string
          planned_km?: number
          session_type?: string
          target_pace?: string
          week_number?: number
          workout_date?: string
          workout_detail?: string
        }
        Relationships: [
          {
            foreignKeyName: "planned_workouts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email: string
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      run_logs: {
        Row: {
          average_pace_seconds: number | null
          created_at: string
          deleted_at: string | null
          distance_km: number
          duration_seconds: number
          effort: Database["public"]["Enums"]["run_effort"] | null
          id: string
          notes: string
          planned_workout_id: string | null
          run_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          average_pace_seconds?: number | null
          created_at?: string
          deleted_at?: string | null
          distance_km: number
          duration_seconds: number
          effort?: Database["public"]["Enums"]["run_effort"] | null
          id?: string
          notes?: string
          planned_workout_id?: string | null
          run_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          average_pace_seconds?: number | null
          created_at?: string
          deleted_at?: string | null
          distance_km?: number
          duration_seconds?: number
          effort?: Database["public"]["Enums"]["run_effort"] | null
          id?: string
          notes?: string
          planned_workout_id?: string | null
          run_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "run_logs_planned_workout_id_fkey"
            columns: ["planned_workout_id"]
            isOneToOne: false
            referencedRelation: "planned_workouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plans: {
        Row: {
          created_at: string
          end_date: string
          id: string
          name: string
          slug: string
          source_name: string | null
          start_date: string
          timezone: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          name: string
          slug: string
          source_name?: string | null
          start_date: string
          timezone?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          slug?: string
          source_name?: string | null
          start_date?: string
          timezone?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_runner_comparison: {
        Args: { reference_date?: string }
        Returns: {
          completed_due: number
          completion_rate: number
          consistency_streak: number
          longest_run_km: number
          monthly_km: number
          planned_due: number
          runner_id: string
          runner_name: string
          weekly_km: number
        }[]
      }
      get_weekly_comparison: {
        Args: never
        Returns: {
          raunaq_km: number
          vipul_km: number
          week_number: number
          week_start: string
        }[]
      }
    }
    Enums: {
      run_effort: "easy" | "moderate" | "hard" | "max"
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
  public: {
    Enums: {
      run_effort: ["easy", "moderate", "hard", "max"],
    },
  },
} as const
