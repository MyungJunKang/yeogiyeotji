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
      place: {
        Row: {
          address: string | null
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          is_custom: boolean
          kakao_place_id: string | null
          location: unknown
          name: string
        }
        Insert: {
          address?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_custom?: boolean
          kakao_place_id?: string | null
          location: unknown
          name: string
        }
        Update: {
          address?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_custom?: boolean
          kakao_place_id?: string | null
          location?: unknown
          name?: string
        }
        Relationships: []
      }
      place_tag: {
        Row: {
          place_id: string
          tag_id: number
          user_id: string
        }
        Insert: {
          place_id: string
          tag_id: number
          user_id?: string
        }
        Update: {
          place_id?: string
          tag_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_tag_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "place"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_tag_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tag"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          avatar_url: string | null
          base_area: string | null
          base_lat: number | null
          base_lng: number | null
          birth_year: number | null
          created_at: string
          gender: string | null
          is_onboarded: boolean
          nickname: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          base_area?: string | null
          base_lat?: number | null
          base_lng?: number | null
          birth_year?: number | null
          created_at?: string
          gender?: string | null
          is_onboarded?: boolean
          nickname: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          avatar_url?: string | null
          base_area?: string | null
          base_lat?: number | null
          base_lng?: number | null
          birth_year?: number | null
          created_at?: string
          gender?: string | null
          is_onboarded?: boolean
          nickname?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tag: {
        Row: {
          group: string
          id: number
          key: string
          label: string
          sort_order: number
        }
        Insert: {
          group: string
          id: number
          key: string
          label: string
          sort_order?: number
        }
        Update: {
          group?: string
          id?: number
          key?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      user_tag: {
        Row: {
          pinned: boolean
          tag_id: number
          use_count: number
          user_id: string
        }
        Insert: {
          pinned?: boolean
          tag_id: number
          use_count?: number
          user_id?: string
        }
        Update: {
          pinned?: boolean
          tag_id?: number
          use_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tag_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tag"
            referencedColumns: ["id"]
          },
        ]
      }
      visit: {
        Row: {
          created_at: string
          id: string
          memo: string | null
          place_id: string
          rating: number | null
          revisit_intent: string
          user_id: string
          visibility: string
          visited_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          memo?: string | null
          place_id: string
          rating?: number | null
          revisit_intent: string
          user_id?: string
          visibility?: string
          visited_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          memo?: string | null
          place_id?: string
          rating?: number | null
          revisit_intent?: string
          user_id?: string
          visibility?: string
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "place"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profile_public: {
        Row: {
          avatar_url: string | null
          nickname: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          nickname?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          nickname?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      places_in_bounds: {
        Args: {
          max_lat: number
          max_lng: number
          min_lat: number
          min_lng: number
          tag_ids?: number[]
        }
        Returns: {
          address: string
          category: string
          id: string
          lat: number
          latest_revisit_intent: string
          latest_visited_at: string
          lng: number
          name: string
          visit_count: number
        }[]
      }
      save_visit: {
        Args: {
          p_memo?: string
          p_place_id: string
          p_rating?: number
          p_revisit_intent: string
          p_tag_ids?: number[]
          p_visibility?: string
          p_visited_at?: string
        }
        Returns: string
      }
      upsert_place: {
        Args: {
          p_address: string
          p_category: string
          p_kakao_place_id: string
          p_lat: number
          p_lng: number
          p_name: string
        }
        Returns: string
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
