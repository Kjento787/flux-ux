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
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          requirement_type: string
          requirement_value: number
          slug: string
          tier: string | null
          title: string
          xp_reward: number
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          requirement_type: string
          requirement_value?: number
          slug: string
          tier?: string | null
          title: string
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          requirement_type?: string
          requirement_value?: number
          slug?: string
          tier?: string | null
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          comment_text: string
          content_id: number
          content_type: string
          created_at: string
          id: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment_text: string
          content_id: number
          content_type: string
          created_at?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment_text?: string
          content_id?: number
          content_type?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      featured_content: {
        Row: {
          backdrop_path: string | null
          content_id: number
          content_type: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          poster_path: string | null
          priority: number | null
          start_date: string | null
          title: string
        }
        Insert: {
          backdrop_path?: string | null
          content_id: number
          content_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          poster_path?: string | null
          priority?: number | null
          start_date?: string | null
          title: string
        }
        Update: {
          backdrop_path?: string | null
          content_id?: number
          content_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          poster_path?: string | null
          priority?: number | null
          start_date?: string | null
          title?: string
        }
        Relationships: []
      }
      ip_bans: {
        Row: {
          banned_at: string
          banned_by: string | null
          created_at: string
          expires_at: string | null
          id: string
          ip_address: string
          is_permanent: boolean | null
          reason: string
        }
        Insert: {
          banned_at?: string
          banned_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address: string
          is_permanent?: boolean | null
          reason: string
        }
        Update: {
          banned_at?: string
          banned_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address?: string
          is_permanent?: boolean | null
          reason?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          discord_dm_enabled: boolean
          id: string
          in_app_enabled: boolean
          new_releases: boolean
          new_seasons: boolean
          social_activity: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discord_dm_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          new_releases?: boolean
          new_seasons?: boolean
          social_activity?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discord_dm_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          new_releases?: boolean
          new_seasons?: boolean
          social_activity?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content_id: number | null
          content_type: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          poster_path: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content_id?: number | null
          content_type?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          poster_path?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          content_id?: number | null
          content_type?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          poster_path?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      notified_movies: {
        Row: {
          id: string
          notified_at: string
          title: string
          tmdb_id: number
        }
        Insert: {
          id?: string
          notified_at?: string
          title: string
          tmdb_id: number
        }
        Update: {
          id?: string
          notified_at?: string
          title?: string
          tmdb_id?: number
        }
        Relationships: []
      }
      notified_tv: {
        Row: {
          id: string
          notified_at: string
          season_number: number
          title: string
          tmdb_id: number
        }
        Insert: {
          id?: string
          notified_at?: string
          season_number: number
          title: string
          tmdb_id: number
        }
        Update: {
          id?: string
          notified_at?: string
          season_number?: number
          title?: string
          tmdb_id?: number
        }
        Relationships: []
      }
      pending_changelogs: {
        Row: {
          changes: string[]
          created_at: string
          id: string
          is_published: boolean
          published_at: string | null
          site_visible: boolean
          type: string
          version: string | null
        }
        Insert: {
          changes?: string[]
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          site_visible?: boolean
          type?: string
          version?: string | null
        }
        Update: {
          changes?: string[]
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          site_visible?: boolean
          type?: string
          version?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          discord_user_id: string | null
          display_name: string | null
          email: string | null
          id: string
          theme_preference: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          discord_user_id?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          theme_preference?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          discord_user_id?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          theme_preference?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content_id: number
          content_type: string
          created_at: string
          id: string
          is_approved: boolean | null
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_id: number
          content_type: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_id?: number
          content_type?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_watchlist_items: {
        Row: {
          added_at: string
          added_by: string
          content_id: number
          content_type: string
          id: string
          poster_path: string | null
          title: string
          watchlist_id: string
        }
        Insert: {
          added_at?: string
          added_by: string
          content_id: number
          content_type: string
          id?: string
          poster_path?: string | null
          title: string
          watchlist_id: string
        }
        Update: {
          added_at?: string
          added_by?: string
          content_id?: number
          content_type?: string
          id?: string
          poster_path?: string | null
          title?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_watchlist_items_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "shared_watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_watchlist_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          user_id: string
          watchlist_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          user_id: string
          watchlist_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_watchlist_members_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "shared_watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_watchlists: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bans: {
        Row: {
          banned_at: string
          banned_by: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          is_permanent: boolean | null
          reason: string
          user_id: string
        }
        Insert: {
          banned_at?: string
          banned_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_permanent?: boolean | null
          reason: string
          user_id: string
        }
        Update: {
          banned_at?: string
          banned_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_permanent?: boolean | null
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          content_type: string
          created_at: string
          id: string
          last_known_seasons: number | null
          notified: boolean
          poster_path: string | null
          release_date: string | null
          title: string
          tmdb_id: number
          user_id: string
        }
        Insert: {
          content_type?: string
          created_at?: string
          id?: string
          last_known_seasons?: number | null
          notified?: boolean
          poster_path?: string | null
          release_date?: string | null
          title: string
          tmdb_id: number
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string
          id?: string
          last_known_seasons?: number | null
          notified?: boolean
          poster_path?: string | null
          release_date?: string | null
          title?: string
          tmdb_id?: number
          user_id?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          comments_count: number | null
          id: string
          movies_watched: number | null
          reviews_count: number | null
          total_watch_time: number | null
          tv_shows_watched: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          id?: string
          movies_watched?: number | null
          reviews_count?: number | null
          total_watch_time?: number | null
          tv_shows_watched?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          id?: string
          movies_watched?: number | null
          reviews_count?: number | null
          total_watch_time?: number | null
          tv_shows_watched?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          current_streak: number
          id: string
          last_activity_date: string | null
          level: number
          longest_streak: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      viewer_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_kids: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_kids?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_kids?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      watch_parties: {
        Row: {
          content_id: number
          content_type: string
          created_at: string
          current_time_seconds: number | null
          ended_at: string | null
          host_id: string
          id: string
          invite_code: string
          is_active: boolean
          is_playing: boolean | null
          max_participants: number | null
          poster_path: string | null
          title: string
        }
        Insert: {
          content_id: number
          content_type?: string
          created_at?: string
          current_time_seconds?: number | null
          ended_at?: string | null
          host_id: string
          id?: string
          invite_code?: string
          is_active?: boolean
          is_playing?: boolean | null
          max_participants?: number | null
          poster_path?: string | null
          title: string
        }
        Update: {
          content_id?: number
          content_type?: string
          created_at?: string
          current_time_seconds?: number | null
          ended_at?: string | null
          host_id?: string
          id?: string
          invite_code?: string
          is_active?: boolean
          is_playing?: boolean | null
          max_participants?: number | null
          poster_path?: string | null
          title?: string
        }
        Relationships: []
      }
      watch_party_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string | null
          party_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type?: string | null
          party_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string | null
          party_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_party_messages_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "watch_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_party_participants: {
        Row: {
          id: string
          is_active: boolean | null
          joined_at: string
          party_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          joined_at?: string
          party_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          joined_at?: string
          party_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_party_participants_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "watch_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          added_at: string
          content_id: number
          content_type: string
          id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          content_id: number
          content_type: string
          id?: string
          user_id: string
        }
        Update: {
          added_at?: string
          content_id?: number
          content_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_email: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
