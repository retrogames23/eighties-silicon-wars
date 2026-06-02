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
          current_price_multiplier?: number
          game_quarter: number
          game_year: number
          id?: string
          is_visible_to_player?: boolean
          market_event_id: string
          remaining_quarters?: number
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
      ai_competitors: {
        Row: {
          archetype: string
          cash_estimate: number
          created_at: string
          description: string
          id: string
          last_action: Json
          last_action_quarter: number | null
          last_action_year: number | null
          market_share: number
          name: string
          persona_key: string
          relationship_score: number
          reputation: number
          updated_at: string
          user_id: string
        }
        Insert: {
          archetype: string
          cash_estimate?: number
          created_at?: string
          description?: string
          id?: string
          last_action?: Json
          last_action_quarter?: number | null
          last_action_year?: number | null
          market_share?: number
          name: string
          persona_key: string
          relationship_score?: number
          reputation?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          archetype?: string
          cash_estimate?: number
          created_at?: string
          description?: string
          id?: string
          last_action?: Json
          last_action_quarter?: number | null
          last_action_year?: number | null
          market_share?: number
          name?: string
          persona_key?: string
          relationship_score?: number
          reputation?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_press_articles: {
        Row: {
          body: string
          category: string
          created_at: string
          era: string | null
          game_quarter: number
          game_year: number
          headline: string
          id: string
          kind: string
          source_event_id: string | null
          tone: string | null
          user_id: string
        }
        Insert: {
          body: string
          category?: string
          created_at?: string
          era?: string | null
          game_quarter: number
          game_year: number
          headline: string
          id?: string
          kind: string
          source_event_id?: string | null
          tone?: string | null
          user_id: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          era?: string | null
          game_quarter?: number
          game_year?: number
          headline?: string
          id?: string
          kind?: string
          source_event_id?: string | null
          tone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_press_articles_source_event_id_fkey"
            columns: ["source_event_id"]
            isOneToOne: false
            referencedRelation: "ai_world_events"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_world_events: {
        Row: {
          affected_segments: string[]
          applied_effects: Json
          body: string
          category: string
          created_at: string
          duration_quarters: number
          game_quarter: number
          game_year: number
          headline: string
          id: string
          magnitude: number
          remaining_quarters: number
          user_id: string
        }
        Insert: {
          affected_segments?: string[]
          applied_effects?: Json
          body: string
          category: string
          created_at?: string
          duration_quarters?: number
          game_quarter: number
          game_year: number
          headline: string
          id?: string
          magnitude: number
          remaining_quarters?: number
          user_id: string
        }
        Update: {
          affected_segments?: string[]
          applied_effects?: Json
          body?: string
          category?: string
          created_at?: string
          duration_quarters?: number
          game_quarter?: number
          game_year?: number
          headline?: string
          id?: string
          magnitude?: number
          remaining_quarters?: number
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
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
          cost?: number
          created_at?: string
          description?: string
          exclusive_until_quarter: number
          exclusive_until_year: number
          id?: string
          is_active?: boolean
          performance?: number
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
      loan_payments: {
        Row: {
          amount_paid: number
          created_at: string
          game_quarter: number
          game_year: number
          id: string
          interest_portion: number
          is_default: boolean
          loan_id: string
          principal_portion: number
          user_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string
          game_quarter: number
          game_year: number
          id?: string
          interest_portion: number
          is_default?: boolean
          loan_id: string
          principal_portion: number
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          game_quarter?: number
          game_year?: number
          id?: string
          interest_portion?: number
          is_default?: boolean
          loan_id?: string
          principal_portion?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          annual_interest_rate: number
          consecutive_defaults: number
          created_at: string
          id: string
          outstanding_balance: number
          principal: number
          quarterly_payment: number
          quarters_paid: number
          quarters_total: number
          status: string
          taken_quarter: number
          taken_year: number
          updated_at: string
          user_id: string
        }
        Insert: {
          annual_interest_rate: number
          consecutive_defaults?: number
          created_at?: string
          id?: string
          outstanding_balance: number
          principal: number
          quarterly_payment: number
          quarters_paid?: number
          quarters_total: number
          status?: string
          taken_quarter: number
          taken_year: number
          updated_at?: string
          user_id: string
        }
        Update: {
          annual_interest_rate?: number
          consecutive_defaults?: number
          created_at?: string
          id?: string
          outstanding_balance?: number
          principal?: number
          quarterly_payment?: number
          quarters_paid?: number
          quarters_total?: number
          status?: string
          taken_quarter?: number
          taken_year?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          market_impact: number
          price_multiplier: number
          severity: string
          start_quarter: number
          start_year: number
          trigger_probability: number
        }
        Insert: {
          affected_categories?: string[]
          created_at?: string
          description?: string
          duration_quarters?: number
          end_quarter?: number
          end_year?: number
          event_name: string
          event_type: string
          id?: string
          is_active?: boolean
          is_global?: boolean
          market_impact?: number
          price_multiplier?: number
          severity?: string
          start_quarter?: number
          start_year?: number
          trigger_probability?: number
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
          market_impact?: number
          price_multiplier?: number
          severity?: string
          start_quarter?: number
          start_year?: number
          trigger_probability?: number
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
          component_specs?: Json
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
          total_cost_required?: number
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
      staff: {
        Row: {
          created_at: string
          hired_quarter: number
          hired_year: number
          id: string
          morale: number
          name: string
          role: string
          salary_per_quarter: number
          skill: number
          specialty: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hired_quarter: number
          hired_year: number
          id?: string
          morale?: number
          name: string
          role: string
          salary_per_quarter?: number
          skill?: number
          specialty?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hired_quarter?: number
          hired_year?: number
          id?: string
          morale?: number
          name?: string
          role?: string
          salary_per_quarter?: number
          skill?: number
          specialty?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      vc_pitch_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          question_index: number | null
          role: string
          round_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          question_index?: number | null
          role: string
          round_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          question_index?: number | null
          role?: string
          round_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vc_pitch_messages_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "vc_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      vc_rounds: {
        Row: {
          accepted: boolean | null
          cash_received: number | null
          created_at: string
          feedback: string | null
          game_quarter: number
          game_year: number
          id: string
          negotiated_valuation_multiplier: number | null
          offered_equity_pct: number
          proposed_valuation: number
          round_number: number
          status: string
          updated_at: string
          use_of_funds: string
          user_id: string
          vc_persona: string
        }
        Insert: {
          accepted?: boolean | null
          cash_received?: number | null
          created_at?: string
          feedback?: string | null
          game_quarter: number
          game_year: number
          id?: string
          negotiated_valuation_multiplier?: number | null
          offered_equity_pct: number
          proposed_valuation: number
          round_number: number
          status?: string
          updated_at?: string
          use_of_funds?: string
          user_id: string
          vc_persona?: string
        }
        Update: {
          accepted?: boolean | null
          cash_received?: number | null
          created_at?: string
          feedback?: string | null
          game_quarter?: number
          game_year?: number
          id?: string
          negotiated_valuation_multiplier?: number | null
          offered_equity_pct?: number
          proposed_valuation?: number
          round_number?: number
          status?: string
          updated_at?: string
          use_of_funds?: string
          user_id?: string
          vc_persona?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
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
