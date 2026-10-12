export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      aliases: {
        Row: {
          alias: string;
          entity: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          id: number;
          search_key: string;
        };
        Insert: {
          alias: string;
          entity: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          id?: number;
          search_key: string;
        };
        Update: {
          alias?: string;
          entity?: Database["public"]["Enums"]["entity_type"];
          entity_id?: string;
          id?: number;
          search_key?: string;
        };
        Relationships: [];
      };
      areas: {
        Row: {
          district_id: number;
          id: number;
          name_bn: string;
          name_en: string | null;
          slug: string;
        };
        Insert: {
          district_id: number;
          id?: number;
          name_bn: string;
          name_en?: string | null;
          slug: string;
        };
        Update: {
          district_id?: number;
          id?: number;
          name_bn?: string;
          name_en?: string | null;
          slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "areas_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
        ];
      };
      claim_votes: {
        Row: {
          claim_id: string;
          created_at: string;
          evidence_media_id: string | null;
          evidence_type: Database["public"]["Enums"]["evidence_type"] | null;
          evidence_url: string | null;
          id: string;
          note: string | null;
          reason: Database["public"]["Enums"]["wrong_reason"] | null;
          user_id: string;
          verdict: Database["public"]["Enums"]["verdict"];
        };
        Insert: {
          claim_id: string;
          created_at?: string;
          evidence_media_id?: string | null;
          evidence_type?: Database["public"]["Enums"]["evidence_type"] | null;
          evidence_url?: string | null;
          id?: string;
          note?: string | null;
          reason?: Database["public"]["Enums"]["wrong_reason"] | null;
          user_id: string;
          verdict: Database["public"]["Enums"]["verdict"];
        };
        Update: {
          claim_id?: string;
          created_at?: string;
          evidence_media_id?: string | null;
          evidence_type?: Database["public"]["Enums"]["evidence_type"] | null;
          evidence_url?: string | null;
          id?: string;
          note?: string | null;
          reason?: Database["public"]["Enums"]["wrong_reason"] | null;
          user_id?: string;
          verdict?: Database["public"]["Enums"]["verdict"];
        };
        Relationships: [
          {
            foreignKeyName: "claim_votes_claim_id_fkey";
            columns: ["claim_id"];
            isOneToOne: false;
            referencedRelation: "claims";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "claim_votes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "claim_votes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "public_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      claims: {
        Row: {
          correct_count: number;
          created_at: string;
          created_by: string | null;
          entity: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          expires_at: string | null;
          id: string;
          last_confirmed_at: string | null;
          partial_count: number;
          status: Database["public"]["Enums"]["claim_status"];
          type: Database["public"]["Enums"]["claim_type"];
          value: NonNullable<Json>;
          wrong_count: number;
        };
        Insert: {
          correct_count?: number;
          created_at?: string;
          created_by?: string | null;
          entity: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          expires_at?: string | null;
          id?: string;
          last_confirmed_at?: string | null;
          partial_count?: number;
          status?: Database["public"]["Enums"]["claim_status"];
          type: Database["public"]["Enums"]["claim_type"];
          value: NonNullable<Json>;
          wrong_count?: number;
        };
        Update: {
          correct_count?: number;
          created_at?: string;
          created_by?: string | null;
          entity?: Database["public"]["Enums"]["entity_type"];
          entity_id?: string;
          expires_at?: string | null;
          id?: string;
          last_confirmed_at?: string | null;
          partial_count?: number;
          status?: Database["public"]["Enums"]["claim_status"];
          type?: Database["public"]["Enums"]["claim_type"];
          value?: NonNullable<Json>;
          wrong_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "claims_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "claims_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "public_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      dishes: {
        Row: {
          created_at: string;
          disliked_count: number;
          display_name: string | null;
          experience_count: number | null;
          food_id: string;
          id: string;
          is_seed: boolean;
          last_experience_at: string | null;
          loved_count: number;
          okay_count: number;
          place_id: string;
          price_confirmed_at: string | null;
          price_max: number | null;
          price_min: number | null;
          status: Database["public"]["Enums"]["content_status"];
          wilson_score: number;
        };
        Insert: {
          created_at?: string;
          disliked_count?: number;
          display_name?: string | null;
          experience_count?: never;
          food_id: string;
          id?: string;
          is_seed?: boolean;
          last_experience_at?: string | null;
          loved_count?: number;
          okay_count?: number;
          place_id: string;
          price_confirmed_at?: string | null;
          price_max?: number | null;
          price_min?: number | null;
          status?: Database["public"]["Enums"]["content_status"];
          wilson_score?: number;
        };
        Update: {
          created_at?: string;
          disliked_count?: number;
          display_name?: string | null;
          experience_count?: never;
          food_id?: string;
          id?: string;
          is_seed?: boolean;
          last_experience_at?: string | null;
          loved_count?: number;
          okay_count?: number;
          place_id?: string;
          price_confirmed_at?: string | null;
          price_max?: number | null;
          price_min?: number | null;
          status?: Database["public"]["Enums"]["content_status"];
          wilson_score?: number;
        };
        Relationships: [
          {
            foreignKeyName: "dishes_food_id_fkey";
            columns: ["food_id"];
            isOneToOne: false;
            referencedRelation: "foods";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dishes_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
        ];
      };
      district_stamps: {
        Row: {
          created_at: string;
          district_id: number;
          food_id: string | null;
          kind: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          district_id: number;
          food_id?: string | null;
          kind?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          district_id?: number;
          food_id?: string | null;
          kind?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "district_stamps_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "district_stamps_food_id_fkey";
            columns: ["food_id"];
            isOneToOne: false;
            referencedRelation: "foods";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "district_stamps_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "district_stamps_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "public_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      districts: {
        Row: {
          center: unknown;
          division_bn: string;
          division_en: string;
          id: number;
          name_bn: string;
          name_en: string;
          place_count: number;
          search_key: string;
          search_text: string;
          slug: string;
        };
        Insert: {
          center?: unknown;
          division_bn: string;
          division_en: string;
          id: number;
          name_bn: string;
          name_en: string;
          place_count?: number;
          search_key?: string;
          search_text?: string;
          slug: string;
        };
        Update: {
          center?: unknown;
          division_bn?: string;
          division_en?: string;
          id?: number;
          name_bn?: string;
          name_en?: string;
          place_count?: number;
          search_key?: string;
          search_text?: string;
          slug?: string;
        };
        Relationships: [];
      };
      edit_suggestions: {
        Row: {
          created_at: string;
          current_value: string | null;
          entity: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          field: string;
          id: string;
          note: string | null;
          proposed_value: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["review_status"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_value?: string | null;
          entity: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          field: string;
          id?: string;
          note?: string | null;
          proposed_value: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["review_status"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_value?: string | null;
          entity?: Database["public"]["Enums"]["entity_type"];
          entity_id?: string;
          field?: string;
          id?: string;
          note?: string | null;
          proposed_value?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["review_status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "edit_suggestions_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "edit_suggestions_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "public_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "edit_suggestions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "edit_suggestions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "public_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      experiences: {
        Row: {
          comment: string | null;
          created_at: string;
          dish_id: string;
          id: string;
          price_paid: number | null;
          reaction: Database["public"]["Enums"]["reaction"];
          status: Database["public"]["Enums"]["content_status"];
          updated_at: string;
          user_id: string;
          visited_on: string | null;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          dish_id: string;
          id?: string;
          price_paid?: number | null;
          reaction: Database["public"]["Enums"]["reaction"];
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
          user_id: string;
          visited_on?: string | null;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          dish_id?: string;
          id?: string;
          price_paid?: number | null;
          reaction?: Database["public"]["Enums"]["reaction"];
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
          user_id?: string;
          visited_on?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "experiences_dish_id_fkey";
            columns: ["dish_id"];
            isOneToOne: false;
            referencedRelation: "dishes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "experiences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "experiences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "public_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      foods: {
        Row: {
          about_bn: string | null;
          cover_media_id: string | null;
          created_at: string;
          created_by: string | null;
          experience_count: number;
          id: string;
          is_seed: boolean;
          loved_count: number;
          merged_into: string | null;
          name_bn: string;
          name_en: string | null;
          search_key: string;
          search_text: string;
          slug: string;
          status: Database["public"]["Enums"]["content_status"];
        };
        Insert: {
          about_bn?: string | null;
          cover_media_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          experience_count?: number;
          id?: string;
          is_seed?: boolean;
          loved_count?: number;
          merged_into?: string | null;
          name_bn: string;
          name_en?: string | null;
          search_key?: string;
          search_text?: string;
          slug: string;
          status?: Database["public"]["Enums"]["content_status"];
        };
        Update: {
          about_bn?: string | null;
          cover_media_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          experience_count?: number;
          id?: string;
          is_seed?: boolean;
          loved_count?: number;
          merged_into?: string | null;
          name_bn?: string;
          name_en?: string | null;
          search_key?: string;
          search_text?: string;
          slug?: string;
          status?: Database["public"]["Enums"]["content_status"];
        };
        Relationships: [
          {
            foreignKeyName: "foods_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "foods_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "public_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "foods_merged_into_fkey";
            columns: ["merged_into"];
            isOneToOne: false;
            referencedRelation: "foods";
            referencedColumns: ["id"];
          },
        ];
      };
      media: {
        Row: {
          created_at: string;
          dominant_color: string | null;
          entity: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          height: number;
          id: string;
          owner_id: string;
          provider: string;
          provider_key: string;
          status: Database["public"]["Enums"]["content_status"];
          width: number;
        };
        Insert: {
          created_at?: string;
          dominant_color?: string | null;
          entity: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          height: number;
          id?: string;
          owner_id: string;
          provider: string;
          provider_key: string;
          status?: Database["public"]["Enums"]["content_status"];
          width: number;
        };
        Update: {
          created_at?: string;
          dominant_color?: string | null;
          entity?: Database["public"]["Enums"]["entity_type"];
          entity_id?: string;
          height?: number;
          id?: string;
          owner_id?: string;
          provider?: string;
          provider_key?: string;
          status?: Database["public"]["Enums"]["content_status"];
          width?: number;
        };
        Relationships: [
          {
            foreignKeyName: "media_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "public_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      places: {
        Row: {
          address: string | null;
          area_id: number | null;
          created_at: string;
          created_by: string | null;
          district_id: number;
          id: string;
          is_seed: boolean;
          location: unknown;
          merged_into: string | null;
          name_bn: string;
          name_en: string | null;
          opening_hours: Json | null;
          price_max: number | null;
          price_min: number | null;
          search_key: string;
          search_text: string;
          slug: string;
          status: Database["public"]["Enums"]["content_status"];
          type: Database["public"]["Enums"]["place_type"];
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          area_id?: number | null;
          created_at?: string;
          created_by?: string | null;
          district_id: number;
          id?: string;
          is_seed?: boolean;
          location?: unknown;
          merged_into?: string | null;
          name_bn: string;
          name_en?: string | null;
          opening_hours?: Json | null;
          price_max?: number | null;
          price_min?: number | null;
          search_key?: string;
          search_text?: string;
          slug: string;
          status?: Database["public"]["Enums"]["content_status"];
          type?: Database["public"]["Enums"]["place_type"];
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          area_id?: number | null;
          created_at?: string;
          created_by?: string | null;
          district_id?: number;
          id?: string;
          is_seed?: boolean;
          location?: unknown;
          merged_into?: string | null;
          name_bn?: string;
          name_en?: string | null;
          opening_hours?: Json | null;
          price_max?: number | null;
          price_min?: number | null;
          search_key?: string;
          search_text?: string;
          slug?: string;
          status?: Database["public"]["Enums"]["content_status"];
          type?: Database["public"]["Enums"]["place_type"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "places_area_id_fkey";
            columns: ["area_id"];
            isOneToOne: false;
            referencedRelation: "areas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "places_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "places_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "public_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "places_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "places_merged_into_fkey";
            columns: ["merged_into"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
        ];
      };
      point_events: {
        Row: {
          created_at: string;
          entity: string;
          entity_id: string;
          id: number;
          kind: string;
          points: number;
          revoked_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          entity: string;
          entity_id: string;
          id?: number;
          kind: string;
          points: number;
          revoked_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          entity?: string;
          entity_id?: string;
          id?: number;
          kind?: string;
          points?: number;
          revoked_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "point_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "point_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "public_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          home_district_id: number | null;
          id: string;
          is_banned: boolean;
          leaderboard_opt_in: boolean;
          points_total: number;
          role: Database["public"]["Enums"]["user_role"];
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name: string;
          home_district_id?: number | null;
          id: string;
          is_banned?: boolean;
          leaderboard_opt_in?: boolean;
          points_total?: number;
          role?: Database["public"]["Enums"]["user_role"];
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          home_district_id?: number | null;
          id?: string;
          is_banned?: boolean;
          leaderboard_opt_in?: boolean;
          points_total?: number;
          role?: Database["public"]["Enums"]["user_role"];
        };
        Relationships: [
          {
            foreignKeyName: "profiles_home_district_id_fkey";
            columns: ["home_district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
        ];
      };
      rate_limit_events: {
        Row: {
          action: string;
          created_at: string;
          id: number;
          user_id: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          id?: number;
          user_id: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          id?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      regional_fame: {
        Row: {
          area_id: number | null;
          district_id: number;
          food_id: string;
          id: number;
          is_seed: boolean;
          note_bn: string | null;
          sort_order: number;
          source_url: string | null;
        };
        Insert: {
          area_id?: number | null;
          district_id: number;
          food_id: string;
          id?: number;
          is_seed?: boolean;
          note_bn?: string | null;
          sort_order?: number;
          source_url?: string | null;
        };
        Update: {
          area_id?: number | null;
          district_id?: number;
          food_id?: string;
          id?: number;
          is_seed?: boolean;
          note_bn?: string | null;
          sort_order?: number;
          source_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "regional_fame_area_id_fkey";
            columns: ["area_id"];
            isOneToOne: false;
            referencedRelation: "areas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "regional_fame_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "regional_fame_food_id_fkey";
            columns: ["food_id"];
            isOneToOne: false;
            referencedRelation: "foods";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          created_at: string;
          entity: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          id: string;
          note: string | null;
          reason: string;
          status: Database["public"]["Enums"]["review_status"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          entity: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          id?: string;
          note?: string | null;
          reason: string;
          status?: Database["public"]["Enums"]["review_status"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          entity?: Database["public"]["Enums"]["entity_type"];
          entity_id?: string;
          id?: string;
          note?: string | null;
          reason?: string;
          status?: Database["public"]["Enums"]["review_status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "public_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_items: {
        Row: {
          created_at: string;
          entity: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          kind: Database["public"]["Enums"]["saved_kind"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          entity: Database["public"]["Enums"]["entity_type"];
          entity_id: string;
          kind?: Database["public"]["Enums"]["saved_kind"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          entity?: Database["public"]["Enums"]["entity_type"];
          entity_id?: string;
          kind?: Database["public"]["Enums"]["saved_kind"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "public_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      search_misses: {
        Row: {
          count: number;
          last_seen_at: string;
          sample_query: string;
          search_key: string;
        };
        Insert: {
          count?: number;
          last_seen_at?: string;
          sample_query: string;
          search_key: string;
        };
        Update: {
          count?: number;
          last_seen_at?: string;
          sample_query?: string;
          search_key?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null;
          display_name: string | null;
          id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          display_name?: string | null;
          id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          display_name?: string | null;
          id?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      award_points: {
        Args: {
          p_entity: string;
          p_entity_id: string;
          p_kind: string;
          p_points: number;
          p_user: string;
        };
        Returns: number;
      };
      check_rate_limit: {
        Args: { p_action: string; p_max: number; p_user: string; p_window: string };
        Returns: boolean;
      };
      is_active_user: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      merge_foods: { Args: { p_from: string; p_into: string }; Returns: number };
      merge_places: { Args: { p_from: string; p_into: string }; Returns: number };
      purge_seed_data: { Args: { p_keep_used?: boolean }; Returns: Json };
      record_search_miss: { Args: { p_key: string; p_text: string }; Returns: undefined };
      refresh_dish_stats: { Args: { p_dish: string }; Returns: undefined };
      revoke_points: { Args: { p_entity: string; p_entity_id: string }; Returns: number };
      search_all: {
        Args: { lim?: number; q_key: string; q_text: string };
        Returns: {
          id: string;
          kind: string;
          score: number;
          slug: string;
          subtitle: string;
          title: string;
        }[];
      };
      similar_food_pairs: {
        Args: { p_limit?: number; p_min?: number };
        Returns: {
          a_experiences: number;
          a_id: string;
          a_name: string;
          a_slug: string;
          b_experiences: number;
          b_id: string;
          b_name: string;
          b_slug: string;
          similarity: number;
        }[];
      };
      unlock_stamp: {
        Args: { p_district: number; p_food: string; p_kind: string; p_user: string };
        Returns: boolean;
      };
      weekly_leaderboard: {
        Args: { p_limit: number; p_since: string };
        Returns: {
          display_name: string;
          user_id: string;
          xp: number;
        }[];
      };
      wilson_lower_bound: { Args: { n: number; pos: number; z?: number }; Returns: number };
    };
    Enums: {
      claim_status: "unverified" | "confirmed" | "mixed" | "disputed";
      claim_type: "availability" | "price" | "place_status" | "location" | "opening_hours";
      content_status: "active" | "pending" | "hidden" | "closed" | "merged";
      entity_type:
        "food" | "place" | "dish" | "district" | "experience" | "claim" | "media" | "profile";
      evidence_type: "photo" | "link";
      place_type: "restaurant" | "shop" | "street_food" | "bakery" | "home_kitchen" | "other";
      reaction: "loved" | "okay" | "disliked";
      review_status: "open" | "approved" | "rejected";
      saved_kind: "want_to_try";
      user_role: "user" | "moderator" | "admin";
      verdict: "correct" | "partial" | "wrong";
      wrong_reason: "not_available" | "wrong_price" | "wrong_location" | "closed" | "other";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      claim_status: ["unverified", "confirmed", "mixed", "disputed"],
      claim_type: ["availability", "price", "place_status", "location", "opening_hours"],
      content_status: ["active", "pending", "hidden", "closed", "merged"],
      entity_type: ["food", "place", "dish", "district", "experience", "claim", "media", "profile"],
      evidence_type: ["photo", "link"],
      place_type: ["restaurant", "shop", "street_food", "bakery", "home_kitchen", "other"],
      reaction: ["loved", "okay", "disliked"],
      review_status: ["open", "approved", "rejected"],
      saved_kind: ["want_to_try"],
      user_role: ["user", "moderator", "admin"],
      verdict: ["correct", "partial", "wrong"],
      wrong_reason: ["not_available", "wrong_price", "wrong_location", "closed", "other"],
    },
  },
} as const;
