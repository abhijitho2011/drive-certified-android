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
      driving_test_results: {
        Row: {
          application_id: string
          brake_system_score: number | null
          created_at: string
          defensive_driving_score: number | null
          diagnosis_score: number | null
          driving_school_id: string
          emergency_handling_score: number | null
          engine_fluids_score: number | null
          hill_driving_score: number | null
          id: string
          identity_photo_match: boolean | null
          identity_status: string | null
          identity_verified: boolean | null
          inspection_notes: string | null
          inspection_test_passed: boolean | null
          inspection_test_total: number | null
          licence_verified: boolean | null
          lights_safety_score: number | null
          overall_passed: boolean | null
          parallel_parking_score: number | null
          police_clearance_verified: boolean | null
          practical_notes: string | null
          practical_test_passed: boolean | null
          practical_test_total: number | null
          skill_grade: string | null
          submitted_at: string | null
          test_date: string | null
          tested_by: string | null
          total_score: number | null
          traffic_test_answers: Json | null
          traffic_test_passed: boolean | null
          traffic_test_score: number | null
          traffic_test_total: number | null
          tyres_score: number | null
          vehicle_control_score: number | null
          verification_video_url: string | null
        }
        Insert: {
          application_id: string
          brake_system_score?: number | null
          created_at?: string
          defensive_driving_score?: number | null
          diagnosis_score?: number | null
          driving_school_id: string
          emergency_handling_score?: number | null
          engine_fluids_score?: number | null
          hill_driving_score?: number | null
          id?: string
          identity_photo_match?: boolean | null
          identity_status?: string | null
          identity_verified?: boolean | null
          inspection_notes?: string | null
          inspection_test_passed?: boolean | null
          inspection_test_total?: number | null
          licence_verified?: boolean | null
          lights_safety_score?: number | null
          overall_passed?: boolean | null
          parallel_parking_score?: number | null
          police_clearance_verified?: boolean | null
          practical_notes?: string | null
          practical_test_passed?: boolean | null
          practical_test_total?: number | null
          skill_grade?: string | null
          submitted_at?: string | null
          test_date?: string | null
          tested_by?: string | null
          total_score?: number | null
          traffic_test_answers?: Json | null
          traffic_test_passed?: boolean | null
          traffic_test_score?: number | null
          traffic_test_total?: number | null
          tyres_score?: number | null
          vehicle_control_score?: number | null
          verification_video_url?: string | null
        }
        Update: {
          application_id?: string
          brake_system_score?: number | null
          created_at?: string
          defensive_driving_score?: number | null
          diagnosis_score?: number | null
          driving_school_id?: string
          emergency_handling_score?: number | null
          engine_fluids_score?: number | null
          hill_driving_score?: number | null
          id?: string
          identity_photo_match?: boolean | null
          identity_status?: string | null
          identity_verified?: boolean | null
          inspection_notes?: string | null
          inspection_test_passed?: boolean | null
          inspection_test_total?: number | null
          licence_verified?: boolean | null
          lights_safety_score?: number | null
          overall_passed?: boolean | null
          parallel_parking_score?: number | null
          police_clearance_verified?: boolean | null
          practical_notes?: string | null
          practical_test_passed?: boolean | null
          practical_test_total?: number | null
          skill_grade?: string | null
          submitted_at?: string | null
          test_date?: string | null
          tested_by?: string | null
          total_score?: number | null
          traffic_test_answers?: Json | null
          traffic_test_passed?: boolean | null
          traffic_test_score?: number | null
          traffic_test_total?: number | null
          tyres_score?: number | null
          vehicle_control_score?: number | null
          verification_video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driving_test_results_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driving_test_results_driving_school_id_fkey"
            columns: ["driving_school_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_test_results: {
        Row: {
          alcohol_level: number | null
          alcohol_result: string | null
          alcohol_test_method: string | null
          amphetamines_result: string | null
          application_id: string
          barbiturates_result: string | null
          benzodiazepines_result: string | null
          blood_pressure_diastolic: number | null
          blood_pressure_status: string | null
          blood_pressure_systolic: number | null
          bmi: number | null
          bmi_status: string | null
          cannabis_result: string | null
          cocaine_result: string | null
          color_blindness: boolean | null
          created_at: string
          drug_notes: string | null
          drug_screening_passed: boolean | null
          drug_test_date: string | null
          fitness_status: string | null
          fitness_validity_months: number | null
          health_notes: string | null
          health_screening_passed: boolean | null
          hearing_status: string | null
          heart_rate: number | null
          heart_rate_status: string | null
          id: string
          mdma_result: string | null
          medical_lab_id: string
          methamphetamine_result: string | null
          opioids_result: string | null
          submitted_at: string | null
          test_date: string | null
          tested_by: string | null
          vision_left: string | null
          vision_right: string | null
          vision_status: string | null
        }
        Insert: {
          alcohol_level?: number | null
          alcohol_result?: string | null
          alcohol_test_method?: string | null
          amphetamines_result?: string | null
          application_id: string
          barbiturates_result?: string | null
          benzodiazepines_result?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_status?: string | null
          blood_pressure_systolic?: number | null
          bmi?: number | null
          bmi_status?: string | null
          cannabis_result?: string | null
          cocaine_result?: string | null
          color_blindness?: boolean | null
          created_at?: string
          drug_notes?: string | null
          drug_screening_passed?: boolean | null
          drug_test_date?: string | null
          fitness_status?: string | null
          fitness_validity_months?: number | null
          health_notes?: string | null
          health_screening_passed?: boolean | null
          hearing_status?: string | null
          heart_rate?: number | null
          heart_rate_status?: string | null
          id?: string
          mdma_result?: string | null
          medical_lab_id: string
          methamphetamine_result?: string | null
          opioids_result?: string | null
          submitted_at?: string | null
          test_date?: string | null
          tested_by?: string | null
          vision_left?: string | null
          vision_right?: string | null
          vision_status?: string | null
        }
        Update: {
          alcohol_level?: number | null
          alcohol_result?: string | null
          alcohol_test_method?: string | null
          amphetamines_result?: string | null
          application_id?: string
          barbiturates_result?: string | null
          benzodiazepines_result?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_status?: string | null
          blood_pressure_systolic?: number | null
          bmi?: number | null
          bmi_status?: string | null
          cannabis_result?: string | null
          cocaine_result?: string | null
          color_blindness?: boolean | null
          created_at?: string
          drug_notes?: string | null
          drug_screening_passed?: boolean | null
          drug_test_date?: string | null
          fitness_status?: string | null
          fitness_validity_months?: number | null
          health_notes?: string | null
          health_screening_passed?: boolean | null
          hearing_status?: string | null
          heart_rate?: number | null
          heart_rate_status?: string | null
          id?: string
          mdma_result?: string | null
          medical_lab_id?: string
          methamphetamine_result?: string | null
          opioids_result?: string | null
          submitted_at?: string | null
          test_date?: string | null
          tested_by?: string | null
          vision_left?: string | null
          vision_right?: string | null
          vision_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_test_results_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_test_results_medical_lab_id_fkey"
            columns: ["medical_lab_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
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
      traffic_law_questions: {
        Row: {
          category: string
          correct_answer: string
          created_at: string
          id: string
          is_hazardous_only: boolean | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          status: string | null
        }
        Insert: {
          category?: string
          correct_answer: string
          created_at?: string
          id?: string
          is_hazardous_only?: boolean | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          status?: string | null
        }
        Update: {
          category?: string
          correct_answer?: string
          created_at?: string
          id?: string
          is_hazardous_only?: boolean | null
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          status?: string | null
        }
        Relationships: []
      }
      traffic_test_sessions: {
        Row: {
          answers: Json | null
          application_id: string
          completed_at: string | null
          created_at: string
          driving_school_id: string
          id: string
          score: number | null
          secret_key: string
          started_at: string | null
          status: string | null
          test_user_id: string
          total_questions: number | null
        }
        Insert: {
          answers?: Json | null
          application_id: string
          completed_at?: string | null
          created_at?: string
          driving_school_id: string
          id?: string
          score?: number | null
          secret_key: string
          started_at?: string | null
          status?: string | null
          test_user_id: string
          total_questions?: number | null
        }
        Update: {
          answers?: Json | null
          application_id?: string
          completed_at?: string | null
          created_at?: string
          driving_school_id?: string
          id?: string
          score?: number | null
          secret_key?: string
          started_at?: string | null
          status?: string | null
          test_user_id?: string
          total_questions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "traffic_test_sessions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traffic_test_sessions_driving_school_id_fkey"
            columns: ["driving_school_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
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
