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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          aadhaar_number: string | null
          admin_approved: boolean | null
          certificate_number: string | null
          certification_purpose: string | null
          certification_vehicle_class: string | null
          created_at: string | null
          current_address: string | null
          date_of_birth: string | null
          declaration_date: string | null
          declaration_signed: boolean | null
          documents: Json | null
          driver_id: string
          driving_school_id: string | null
          driving_test_passed: boolean | null
          driving_test_slot: string | null
          driving_validity_date: string | null
          education_verified: boolean | null
          full_name: string | null
          gender: string | null
          hazardous_endorsement: boolean | null
          highest_qualification: string | null
          id: string
          identity_verified: boolean | null
          issuing_rto: string | null
          licence_expiry_date: string | null
          licence_issue_date: string | null
          licence_number: string | null
          licence_type: string | null
          medical_lab_id: string | null
          medical_test_passed: boolean | null
          medical_test_slot: string | null
          medical_validity_date: string | null
          notes: string | null
          permanent_address: string | null
          skill_grade: string | null
          status: string | null
          test_district: string | null
          test_state: string | null
          updated_at: string | null
          vehicle_classes: string[] | null
        }
        Insert: {
          aadhaar_number?: string | null
          admin_approved?: boolean | null
          certificate_number?: string | null
          certification_purpose?: string | null
          certification_vehicle_class?: string | null
          created_at?: string | null
          current_address?: string | null
          date_of_birth?: string | null
          declaration_date?: string | null
          declaration_signed?: boolean | null
          documents?: Json | null
          driver_id: string
          driving_school_id?: string | null
          driving_test_passed?: boolean | null
          driving_test_slot?: string | null
          driving_validity_date?: string | null
          education_verified?: boolean | null
          full_name?: string | null
          gender?: string | null
          hazardous_endorsement?: boolean | null
          highest_qualification?: string | null
          id?: string
          identity_verified?: boolean | null
          issuing_rto?: string | null
          licence_expiry_date?: string | null
          licence_issue_date?: string | null
          licence_number?: string | null
          licence_type?: string | null
          medical_lab_id?: string | null
          medical_test_passed?: boolean | null
          medical_test_slot?: string | null
          medical_validity_date?: string | null
          notes?: string | null
          permanent_address?: string | null
          skill_grade?: string | null
          status?: string | null
          test_district?: string | null
          test_state?: string | null
          updated_at?: string | null
          vehicle_classes?: string[] | null
        }
        Update: {
          aadhaar_number?: string | null
          admin_approved?: boolean | null
          certificate_number?: string | null
          certification_purpose?: string | null
          certification_vehicle_class?: string | null
          created_at?: string | null
          current_address?: string | null
          date_of_birth?: string | null
          declaration_date?: string | null
          declaration_signed?: boolean | null
          documents?: Json | null
          driver_id?: string
          driving_school_id?: string | null
          driving_test_passed?: boolean | null
          driving_test_slot?: string | null
          driving_validity_date?: string | null
          education_verified?: boolean | null
          full_name?: string | null
          gender?: string | null
          hazardous_endorsement?: boolean | null
          highest_qualification?: string | null
          id?: string
          identity_verified?: boolean | null
          issuing_rto?: string | null
          licence_expiry_date?: string | null
          licence_issue_date?: string | null
          licence_number?: string | null
          licence_type?: string | null
          medical_lab_id?: string | null
          medical_test_passed?: boolean | null
          medical_test_slot?: string | null
          medical_validity_date?: string | null
          notes?: string | null
          permanent_address?: string | null
          skill_grade?: string | null
          status?: string | null
          test_district?: string | null
          test_state?: string | null
          updated_at?: string | null
          vehicle_classes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_driving_school_id_fkey"
            columns: ["driving_school_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_medical_lab_id_fkey"
            columns: ["medical_lab_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      data_users: {
        Row: {
          address: string | null
          company_name: string
          contact_person: string
          created_at: string | null
          district: string | null
          email: string | null
          id: string
          phone: string
          state: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_person: string
          created_at?: string | null
          district?: string | null
          email?: string | null
          id?: string
          phone: string
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_person?: string
          created_at?: string | null
          district?: string | null
          email?: string | null
          id?: string
          phone?: string
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      districts: {
        Row: {
          code: string | null
          created_at: string | null
          id: string
          name: string
          state_id: string
          status: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          id?: string
          name: string
          state_id: string
          status?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          id?: string
          name?: string
          state_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "districts_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          address: string
          created_at: string | null
          district: string
          first_name: string
          id: string
          last_name: string
          phone: string
          pin_code: string
          state: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string | null
          district: string
          first_name: string
          id?: string
          last_name: string
          phone: string
          pin_code: string
          state: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string | null
          district?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          pin_code?: string
          state?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          address: string
          contact_number: string
          created_at: string | null
          district: string
          email: string | null
          gst: string | null
          id: string
          name: string
          partner_type: string
          state: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address: string
          contact_number: string
          created_at?: string | null
          district: string
          email?: string | null
          gst?: string | null
          id?: string
          name: string
          partner_type: string
          state: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string
          contact_number?: string
          created_at?: string | null
          district?: string
          email?: string | null
          gst?: string | null
          id?: string
          name?: string
          partner_type?: string
          state?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      states: {
        Row: {
          code: string | null
          created_at: string | null
          id: string
          name: string
          status: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          id?: string
          name: string
          status?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          id?: string
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "driver"
        | "driving_school"
        | "medical_lab"
        | "company_verifier"
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
      app_role: [
        "admin",
        "driver",
        "driving_school",
        "medical_lab",
        "company_verifier",
      ],
    },
  },
} as const
