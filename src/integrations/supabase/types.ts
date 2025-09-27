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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      active_market_events: {
        Row: {
          created_at: string
          current_price_multiplier: number
          game_quarter: number
          game_year: number
          id: string
          is_visible_to_player: boolean
          market_event_id: string
          remaining_quarters: number
          user_id: string
        }
        Insert: {
          created_at?: string
          current_price_multiplier: number
          game_quarter: number
          game_year: number
          id?: string
          is_visible_to_player?: boolean
          market_event_id: string
          remaining_quarters: number
          user_id: string
        }
        Update: {
          created_at?: string
          current_price_multiplier?: number
          game_quarter?: number
          game_year?: number
          id?: string
          is_visible_to_player?: boolean
          market_event_id?: string
          remaining_quarters?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_market_events_market_event_id_fkey"
            columns: ["market_event_id"]
            isOneToOne: false
            referencedRelation: "market_events"
            referencedColumns: ["id"]
          },
        ]
      }
      exclusive_components: {
        Row: {
          available_from_quarter: number
          available_from_year: number
          component_name: string
          component_type: string
          cost: number
          created_at: string
          description: string
          exclusive_until_quarter: number
          exclusive_until_year: number
          id: string
          is_active: boolean
          performance: number
          research_project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          available_from_quarter: number
          available_from_year: number
          component_name: string
          component_type: string
          cost: number
          created_at?: string
          description: string
          exclusive_until_quarter: number
          exclusive_until_year: number
          id?: string
          is_active?: boolean
          performance: number
          research_project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          available_from_quarter?: number
          available_from_year?: number
          component_name?: string
          component_type?: string
          cost?: number
          created_at?: string
          description?: string
          exclusive_until_quarter?: number
          exclusive_until_year?: number
          id?: string
          is_active?: boolean
          performance?: number
          research_project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exclusive_components_research_project_id_fkey"
            columns: ["research_project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      market_events: {
        Row: {
          affected_categories: string[]
          created_at: string
          description: string
          duration_quarters: number
          end_quarter: number
          end_year: number
          event_name: string
          event_type: string
          id: string
          is_active: boolean
          is_global: boolean
          market_impact: number | null
          price_multiplier: number
          severity: string
          start_quarter: number
          start_year: number
          trigger_probability: number | null
          updated_at: string
        }
        Insert: {
          affected_categories: string[]
          created_at?: string
          description: string
          duration_quarters?: number
          end_quarter: number
          end_year: number
          event_name: string
          event_type: string
          id?: string
          is_active?: boolean
          is_global?: boolean
          market_impact?: number | null
          price_multiplier?: number
          severity?: string
          start_quarter: number
          start_year: number
          trigger_probability?: number | null
          updated_at?: string
        }
        Update: {
          affected_categories?: string[]
          created_at?: string
          description?: string
          duration_quarters?: number
          end_quarter?: number
          end_year?: number
          event_name?: string
          event_type?: string
          id?: string
          is_active?: boolean
          is_global?: boolean
          market_impact?: number | null
          price_multiplier?: number
          severity?: string
          start_quarter?: number
          start_year?: number
          trigger_probability?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      research_projects: {
        Row: {
          completion_quarter: number | null
          completion_year: number | null
          component_specs: Json
          cost_invested: number
          created_at: string
          exclusive_until_quarter: number | null
          exclusive_until_year: number | null
          id: string
          project_name: string
          project_type: string
          start_quarter: number
          start_year: number
          status: string
          total_cost_required: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completion_quarter?: number | null
          completion_year?: number | null
          component_specs: Json
          cost_invested?: number
          created_at?: string
          exclusive_until_quarter?: number | null
          exclusive_until_year?: number | null
          id?: string
          project_name: string
          project_type: string
          start_quarter: number
          start_year: number
          status?: string
          total_cost_required: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completion_quarter?: number | null
          completion_year?: number | null
          component_specs?: Json
          cost_invested?: number
          created_at?: string
          exclusive_until_quarter?: number | null
          exclusive_until_year?: number | null
          id?: string
          project_name?: string
          project_type?: string
          start_quarter?: number
          start_year?: number
          status?: string
          total_cost_required?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      save_games: {
        Row: {
          created_at: string
          game_state: Json
          id: string
          save_name: string
          slot_number: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_state: Json
          id?: string
          save_name: string
          slot_number: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_state?: Json
          id?: string
          save_name?: string
          slot_number?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
