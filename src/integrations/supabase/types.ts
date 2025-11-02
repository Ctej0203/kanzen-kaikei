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
      ai_conversations: {
        Row: {
          created_at: string | null
          id: string
          message: string
          response: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          response: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          response?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ai_quota: {
        Row: {
          free_messages_used: number | null
          reset_at: string | null
          user_id: string
        }
        Insert: {
          free_messages_used?: number | null
          reset_at?: string | null
          user_id: string
        }
        Update: {
          free_messages_used?: number | null
          reset_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          metadata: Json | null
          source: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      favorite_messages: {
        Row: {
          created_at: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "homehome_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      gacha_history: {
        Row: {
          cost: number
          created_at: string | null
          id: string
          item_id: string
          roll_number: number
          user_id: string
        }
        Insert: {
          cost: number
          created_at?: string | null
          id?: string
          item_id: string
          roll_number: number
          user_id: string
        }
        Update: {
          cost?: number
          created_at?: string | null
          id?: string
          item_id?: string
          roll_number?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gacha_history_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      gacha_pity: {
        Row: {
          current_count: number | null
          last_ssr_at: string | null
          user_id: string
        }
        Insert: {
          current_count?: number | null
          last_ssr_at?: string | null
          user_id: string
        }
        Update: {
          current_count?: number | null
          last_ssr_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      homehome_messages: {
        Row: {
          category: string | null
          created_at: string
          id: string
          message: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          message: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          message?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          is_default: boolean | null
          name: string
          rarity: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          is_default?: boolean | null
          name: string
          rarity: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          is_default?: boolean | null
          name?: string
          rarity?: string
        }
        Relationships: []
      }
      login_streaks: {
        Row: {
          created_at: string | null
          current_streak: number
          last_login_date: string
          login_history: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number
          last_login_date: string
          login_history?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number
          last_login_date?: string
          login_history?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mental_health_records: {
        Row: {
          created_at: string
          diagnosis_name: string | null
          doctor_appointment: string | null
          id: string
          medication_evening: string | null
          medication_morning: string | null
          medication_noon: string | null
          medication_notes: string | null
          notes: string | null
          symptom_severity: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          diagnosis_name?: string | null
          doctor_appointment?: string | null
          id?: string
          medication_evening?: string | null
          medication_morning?: string | null
          medication_noon?: string | null
          medication_notes?: string | null
          notes?: string | null
          symptom_severity?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          diagnosis_name?: string | null
          doctor_appointment?: string | null
          id?: string
          medication_evening?: string | null
          medication_morning?: string | null
          medication_noon?: string | null
          medication_notes?: string | null
          notes?: string | null
          symptom_severity?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          condition_types: string[] | null
          created_at: string
          currently_treating: boolean | null
          customization_preferences: Json | null
          diagnosed: boolean | null
          diagnosis_year: number | null
          id: string
          onboarding_completed: boolean | null
          triggers: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          condition_types?: string[] | null
          created_at?: string
          currently_treating?: boolean | null
          customization_preferences?: Json | null
          diagnosed?: boolean | null
          diagnosis_year?: number | null
          id?: string
          onboarding_completed?: boolean | null
          triggers?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          condition_types?: string[] | null
          created_at?: string
          currently_treating?: boolean | null
          customization_preferences?: Json | null
          diagnosed?: boolean | null
          diagnosis_year?: number | null
          id?: string
          onboarding_completed?: boolean | null
          triggers?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan: string
          status: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      symptom_records: {
        Row: {
          ai_comment: string | null
          ai_score: number | null
          created_at: string
          id: string
          memo: string | null
          mood_score: number
          recorded_at: string
          tags: string[] | null
          user_id: string
        }
        Insert: {
          ai_comment?: string | null
          ai_score?: number | null
          created_at?: string
          id?: string
          memo?: string | null
          mood_score: number
          recorded_at?: string
          tags?: string[] | null
          user_id: string
        }
        Update: {
          ai_comment?: string | null
          ai_score?: number | null
          created_at?: string
          id?: string
          memo?: string | null
          mood_score?: number
          recorded_at?: string
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      user_currency: {
        Row: {
          free_coins: number | null
          paid_coins: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          free_coins?: number | null
          paid_coins?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          free_coins?: number | null
          paid_coins?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_items: {
        Row: {
          id: string
          is_equipped: boolean | null
          item_id: string
          obtained_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          is_equipped?: boolean | null
          item_id: string
          obtained_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          is_equipped?: boolean | null
          item_id?: string
          obtained_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_coins: {
        Args: { p_amount: number; p_source: string; p_user_id: string }
        Returns: undefined
      }
      claim_daily_login_bonus: {
        Args: { p_user_id: string }
        Returns: {
          coins_earned: number
          current_streak: number
          is_new_day: boolean
        }[]
      }
      increment_ai_quota: { Args: { p_user_id: string }; Returns: undefined }
      perform_gacha: {
        Args: { p_roll_count: number; p_user_id: string }
        Returns: {
          is_new: boolean
          item_id: string
          rarity: string
        }[]
      }
      spend_coins: {
        Args: { p_amount: number; p_source: string; p_user_id: string }
        Returns: undefined
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
