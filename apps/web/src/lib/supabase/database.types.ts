// Generated from the live Supabase schema (project investkea). Regenerate after migrations.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      advisor_availability: {
        Row: { advisor_id: string; ends_at: string; id: string; starts_at: string };
        Insert: { advisor_id: string; ends_at: string; id?: string; starts_at: string };
        Update: { advisor_id?: string; ends_at?: string; id?: string; starts_at?: string };
        Relationships: [
          {
            foreignKeyName: "advisor_availability_advisor_id_fkey";
            columns: ["advisor_id"];
            isOneToOne: false;
            referencedRelation: "advisors";
            referencedColumns: ["id"];
          },
        ];
      };
      advisors: {
        Row: {
          bio: string | null;
          created_at: string;
          credential_type: string;
          display_name: string;
          id: string;
          languages: string[];
          registration_number: string;
          status: Database["public"]["Enums"]["advisor_status"];
          verified_at: string | null;
        };
        Insert: {
          bio?: string | null;
          created_at?: string;
          credential_type: string;
          display_name: string;
          id: string;
          languages?: string[];
          registration_number: string;
          status?: Database["public"]["Enums"]["advisor_status"];
          verified_at?: string | null;
        };
        Update: {
          bio?: string | null;
          created_at?: string;
          credential_type?: string;
          display_name?: string;
          id?: string;
          languages?: string[];
          registration_number?: string;
          status?: Database["public"]["Enums"]["advisor_status"];
          verified_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "advisors_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          advisor_id: string;
          created_at: string;
          id: string;
          starts_at: string | null;
          status: Database["public"]["Enums"]["booking_status"];
          topic: string | null;
          user_id: string;
          user_note: string | null;
        };
        Insert: {
          advisor_id: string;
          created_at?: string;
          id?: string;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          topic?: string | null;
          user_id: string;
          user_note?: string | null;
        };
        Update: {
          advisor_id?: string;
          created_at?: string;
          id?: string;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          topic?: string | null;
          user_id?: string;
          user_note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_advisor_id_fkey";
            columns: ["advisor_id"];
            isOneToOne: false;
            referencedRelation: "advisors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      data_shares: {
        Row: {
          advisor_id: string;
          granted_at: string;
          id: string;
          revoked_at: string | null;
          user_id: string;
        };
        Insert: {
          advisor_id: string;
          granted_at?: string;
          id?: string;
          revoked_at?: string | null;
          user_id: string;
        };
        Update: {
          advisor_id?: string;
          granted_at?: string;
          id?: string;
          revoked_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "data_shares_advisor_id_fkey";
            columns: ["advisor_id"];
            isOneToOne: false;
            referencedRelation: "advisors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "data_shares_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      goals: {
        Row: {
          created_at: string;
          current_savings: number;
          expected_return: number;
          id: string;
          inflation_rate: number;
          name: string;
          present_cost: number;
          target_year: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_savings?: number;
          expected_return: number;
          id?: string;
          inflation_rate: number;
          name: string;
          present_cost: number;
          target_year: number;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          current_savings?: number;
          expected_return?: number;
          id?: string;
          inflation_rate?: number;
          name?: string;
          present_cost?: number;
          target_year?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      holdings: {
        Row: {
          asset_class: string;
          current_value: number;
          id: string;
          label: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          asset_class: string;
          current_value: number;
          id?: string;
          label: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          asset_class?: string;
          current_value?: number;
          id?: string;
          label?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "holdings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      ledger_entries: {
        Row: {
          amount: number;
          category: string;
          created_at: string;
          id: string;
          kind: Database["public"]["Enums"]["entry_kind"];
          note: string | null;
          occurred_on: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          category: string;
          created_at?: string;
          id?: string;
          kind: Database["public"]["Enums"]["entry_kind"];
          note?: string | null;
          occurred_on: string;
          user_id?: string;
        };
        Update: {
          amount?: number;
          category?: string;
          created_at?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["entry_kind"];
          note?: string | null;
          occurred_on?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ledger_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string | null;
          id: string;
          is_adult_confirmed: boolean;
          privacy_consent_at: string | null;
          role: Database["public"]["Enums"]["app_role"];
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          id: string;
          is_adult_confirmed?: boolean;
          privacy_consent_at?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          is_adult_confirmed?: boolean;
          privacy_consent_at?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      advisor_status: "pending" | "verified" | "rejected" | "suspended";
      app_role: "user" | "advisor" | "admin";
      booking_status: "requested" | "confirmed" | "completed" | "cancelled";
      entry_kind: "income" | "expense";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
