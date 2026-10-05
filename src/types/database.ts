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
    PostgrestVersion: "14.18"
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
      admin_allowlist: {
        Row: {
          id: string
          email: string
          invited_by: string | null
          created_at: string
          used_at: string | null
          revoked_at: string | null
        }
        Insert: {
          id?: string
          email: string
          invited_by?: string | null
          created_at?: string
          used_at?: string | null
          revoked_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          invited_by?: string | null
          created_at?: string
          used_at?: string | null
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_allowlist_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      },
      attendance_records: {
        Row: {
          event_id: string
          id: string
          participant_id: string
          scanned_at: string | null
          scanned_by: string
        }
        Insert: {
          event_id: string
          id?: string
          participant_id: string
          scanned_at?: string | null
          scanned_by: string
        }
        Update: {
          event_id?: string
          id?: string
          participant_id?: string
          scanned_at?: string | null
          scanned_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_scanned_by_fkey"
            columns: ["scanned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_coordinators: {
        Row: {
          assigned_at: string | null
          coordinator_id: string
          custom_tasks: Json
          event_id: string
          id: string
          station: string | null
          task_attendance: boolean | null
          task_breakfast: boolean | null
          task_dinner: boolean | null
          task_lunch: boolean | null
        }
        Insert: {
          assigned_at?: string | null
          coordinator_id: string
          custom_tasks?: Json
          event_id: string
          id?: string
          station?: string | null
          task_attendance?: boolean | null
          task_breakfast?: boolean | null
          task_dinner?: boolean | null
          task_lunch?: boolean | null
        }
        Update: {
          assigned_at?: string | null
          coordinator_id?: string
          custom_tasks?: Json
          event_id?: string
          id?: string
          station?: string | null
          task_attendance?: boolean | null
          task_breakfast?: boolean | null
          task_dinner?: boolean | null
          task_lunch?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "event_coordinators_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_coordinators_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          breakfast_opted: boolean | null
          dinner_opted: boolean | null
          event_id: string
          id: string
          lunch_opted: boolean | null
          participant_id: string
          registered_at: string | null
          status: string | null
          team_id: string | null
          team_role: string | null
        }
        Insert: {
          breakfast_opted?: boolean | null
          dinner_opted?: boolean | null
          event_id: string
          id?: string
          lunch_opted?: boolean | null
          participant_id: string
          registered_at?: string | null
          status?: string | null
          team_id?: string | null
          team_role?: string | null
        }
        Update: {
          breakfast_opted?: boolean | null
          dinner_opted?: boolean | null
          event_id?: string
          id?: string
          lunch_opted?: boolean | null
          participant_id?: string
          registered_at?: string | null
          status?: string | null
          team_id?: string | null
          team_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "event_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      event_problem_statements: {
        Row: {
          created_at: string | null
          description: string
          event_id: string
          id: string
          is_published: boolean | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          event_id: string
          id?: string
          is_published?: boolean | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          event_id?: string
          id?: string
          is_published?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_problem_statements_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          academic_year: string | null
          branch: string | null
          breakfast_opted: boolean | null
          college: string | null
          dinner_opted: boolean | null
          email: string
          event_id: string
          full_name: string | null
          id: string
          imported_at: string | null
          lunch_opted: boolean | null
          phone: string | null
          registration_data: Json | null
          team_id: string | null
          team_role: string | null
        }
        Insert: {
          academic_year?: string | null
          branch?: string | null
          breakfast_opted?: boolean | null
          college?: string | null
          dinner_opted?: boolean | null
          email: string
          event_id: string
          full_name?: string | null
          id?: string
          imported_at?: string | null
          lunch_opted?: boolean | null
          phone?: string | null
          registration_data?: Json | null
          team_id?: string | null
          team_role?: string | null
        }
        Update: {
          academic_year?: string | null
          branch?: string | null
          breakfast_opted?: boolean | null
          college?: string | null
          dinner_opted?: boolean | null
          email?: string
          event_id?: string
          full_name?: string | null
          id?: string
          imported_at?: string | null
          lunch_opted?: boolean | null
          phone?: string | null
          registration_data?: Json | null
          team_id?: string | null
          team_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "event_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      event_teams: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          name: string
          problem_statement_id: string | null
          github_url: string | null
          deployed_url: string | null
          submitted_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          name: string
          problem_statement_id?: string | null
          github_url?: string | null
          deployed_url?: string | null
          submitted_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          name?: string
          problem_statement_id?: string | null
          github_url?: string | null
          deployed_url?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_teams_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_teams_problem_statement_id_fkey"
            columns: ["problem_statement_id"]
            isOneToOne: false
            referencedRelation: "event_problem_statements"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendance_enabled: boolean | null
          breakfast_enabled: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          dinner_enabled: boolean | null
          end_date: string
          id: string
          lunch_enabled: boolean | null
          max_participants: number | null
          name: string
          registration_open: boolean | null
          start_date: string
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          attendance_enabled?: boolean | null
          breakfast_enabled?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          dinner_enabled?: boolean | null
          end_date: string
          id?: string
          lunch_enabled?: boolean | null
          max_participants?: number | null
          name: string
          registration_open?: boolean | null
          start_date: string
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          attendance_enabled?: boolean | null
          breakfast_enabled?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          dinner_enabled?: boolean | null
          end_date?: string
          id?: string
          lunch_enabled?: boolean | null
          max_participants?: number | null
          name?: string
          registration_open?: boolean | null
          start_date?: string
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      food_records: {
        Row: {
          event_id: string
          id: string
          meal_type: string
          participant_id: string
          scanned_at: string | null
          scanned_by: string
        }
        Insert: {
          event_id: string
          id?: string
          meal_type: string
          participant_id: string
          scanned_at?: string | null
          scanned_by: string
        }
        Update: {
          event_id?: string
          id?: string
          meal_type?: string
          participant_id?: string
          scanned_at?: string | null
          scanned_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_records_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_records_scanned_by_fkey"
            columns: ["scanned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_matrix_tokens: {
        Row: {
          created_at: string | null
          event_participant_id: string
          id: string
          token: string
          token_type: string
        }
        Insert: {
          created_at?: string | null
          event_participant_id: string
          id?: string
          token: string
          token_type: string
        }
        Update: {
          created_at?: string | null
          event_participant_id?: string
          id?: string
          token?: string
          token_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_matrix_tokens_event_participant_id_fkey"
            columns: ["event_participant_id"]
            isOneToOne: false
            referencedRelation: "event_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          linkedin_url: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          linkedin_url?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      registration_allowlist: {
        Row: {
          created_at: string | null
          email: string
          event_id: string
          id: string
          invited_role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          event_id: string
          id?: string
          invited_role?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          event_id?: string
          id?: string
          invited_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_allowlist_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_coordinator_event: {
        Args: { p_event_id: string }
        Returns: undefined
      }
      exec_sql: { Args: { sql_string: string }; Returns: undefined }
      exec_sql_json: { Args: { sql_string: string }; Returns: Json }
      get_admin_scan_history: {
        Args: { event_id_param: string }
        Returns: Json
      }
      get_coordinator_scan_history: {
        Args: { event_id_param: string }
        Returns: Json
      }
      get_eligible_coordinator_events: {
        Args: never
        Returns: {
          end_date: string
          id: string
          name: string
          start_date: string
          venue: string
        }[]
      }
      get_eligible_participant_events: {
        Args: never
        Returns: {
          end_date: string
          id: string
          name: string
          registration_open: boolean
          start_date: string
          venue: string
        }[]
      }
      get_event_participants_directory: {
        Args: { p_event_id: string }
        Returns: {
          academic_year: string
          college: string
          full_name: string
          linkedin_url: string
          participant_id: string
        }[]
      }
      get_my_event_registrations: {
        Args: never
        Returns: {
          academic_year: string
          branch: string
          breakfast_opted: boolean
          college: string
          dinner_opted: boolean
          email: string
          event_id: string
          full_name: string
          imported_at: string
          lunch_opted: boolean
          phone: string
          registration_data: Json
        }[]
      }
      get_my_role: { Args: never; Returns: string }
      import_event_allowlist: {
        Args: { p_event_id: string; p_rows: Json }
        Returns: undefined
      }
      import_teams_allowlist: {
        Args: { p_event_id: string; p_members: Json; p_teams: Json }
        Returns: undefined
      }
      record_matrix_operation: {
        Args: { p_event_id: string; p_operation: string; p_token: string }
        Returns: Json
      }
      sync_participant_registrations: { Args: never; Returns: undefined }
      update_my_linkedin: { Args: { p_url: string }; Returns: undefined }
      validate_matrix_token: {
        Args: { p_event_id: string; p_operation: string; p_token: string }
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
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
