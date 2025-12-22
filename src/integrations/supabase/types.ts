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
          certificate_expiry_date: string | null
          certificate_number: string | null
          certificate_status: string | null
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
          renewal_type: string | null
          skill_grade: string | null
          status: string | null
          test_district: string | null
          test_state: string | null
          updated_at: string | null
          vehicle_classes: string[] | null
          verification_agent_id: string | null
        }
        Insert: {
          aadhaar_number?: string | null
          admin_approved?: boolean | null
          certificate_expiry_date?: string | null
          certificate_number?: string | null
          certificate_status?: string | null
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
          renewal_type?: string | null
          skill_grade?: string | null
          status?: string | null
          test_district?: string | null
          test_state?: string | null
          updated_at?: string | null
          vehicle_classes?: string[] | null
          verification_agent_id?: string | null
        }
        Update: {
          aadhaar_number?: string | null
          admin_approved?: boolean | null
          certificate_expiry_date?: string | null
          certificate_number?: string | null
          certificate_status?: string | null
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
          renewal_type?: string | null
          skill_grade?: string | null
          status?: string | null
          test_district?: string | null
          test_state?: string | null
          updated_at?: string | null
          vehicle_classes?: string[] | null
          verification_agent_id?: string | null
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
            foreignKeyName: "applications_driving_school_id_fkey"
            columns: ["driving_school_id"]
            isOneToOne: false
            referencedRelation: "partners_discovery"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_medical_lab_id_fkey"
            columns: ["medical_lab_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_medical_lab_id_fkey"
            columns: ["medical_lab_id"]
            isOneToOne: false
            referencedRelation: "partners_discovery"
            referencedColumns: ["id"]
          },
        ]
      }
      company_users: {
        Row: {
          created_at: string | null
          data_user_id: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["company_user_role"]
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_user_id: string
          email: string
          id?: string
          name: string
          role?: Database["public"]["Enums"]["company_user_role"]
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_user_id?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["company_user_role"]
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_users_data_user_id_fkey"
            columns: ["data_user_id"]
            isOneToOne: false
            referencedRelation: "data_users"
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
          industry_type: string | null
          phone: string
          recruitment_access: boolean | null
          recruitment_access_approved_at: string | null
          recruitment_access_approved_by: string | null
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
          industry_type?: string | null
          phone: string
          recruitment_access?: boolean | null
          recruitment_access_approved_at?: string | null
          recruitment_access_approved_by?: string | null
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
          industry_type?: string | null
          phone?: string
          recruitment_access?: boolean | null
          recruitment_access_approved_at?: string | null
          recruitment_access_approved_by?: string | null
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
      driver_employment_status: {
        Row: {
          availability: string | null
          created_at: string | null
          driver_id: string
          employment_status: string | null
          expected_salary_max: number | null
          expected_salary_min: number | null
          id: string
          is_visible_to_employers: boolean | null
          preferred_locations: string[] | null
          preferred_work_types: string[] | null
          updated_at: string | null
          visibility_updated_at: string | null
        }
        Insert: {
          availability?: string | null
          created_at?: string | null
          driver_id: string
          employment_status?: string | null
          expected_salary_max?: number | null
          expected_salary_min?: number | null
          id?: string
          is_visible_to_employers?: boolean | null
          preferred_locations?: string[] | null
          preferred_work_types?: string[] | null
          updated_at?: string | null
          visibility_updated_at?: string | null
        }
        Update: {
          availability?: string | null
          created_at?: string | null
          driver_id?: string
          employment_status?: string | null
          expected_salary_max?: number | null
          expected_salary_min?: number | null
          id?: string
          is_visible_to_employers?: boolean | null
          preferred_locations?: string[] | null
          preferred_work_types?: string[] | null
          updated_at?: string | null
          visibility_updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_employment_status_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_shortlist: {
        Row: {
          created_at: string | null
          driver_id: string
          employer_id: string
          id: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          employer_id: string
          id?: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          employer_id?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_shortlist_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_shortlist_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "data_users"
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
            foreignKeyName: "driving_test_results_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications_driving_school"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driving_test_results_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications_medical_lab"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driving_test_results_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications_verification"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driving_test_results_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications_verification_agent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driving_test_results_driving_school_id_fkey"
            columns: ["driving_school_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driving_test_results_driving_school_id_fkey"
            columns: ["driving_school_id"]
            isOneToOne: false
            referencedRelation: "partners_discovery"
            referencedColumns: ["id"]
          },
        ]
      }
      education_verifications: {
        Row: {
          application_id: string
          created_at: string | null
          id: string
          notes: string | null
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          verification_agent_id: string
          verified_at: string | null
        }
        Insert: {
          application_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          verification_agent_id: string
          verified_at?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          verification_agent_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "education_verifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_verifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications_driving_school"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_verifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications_medical_lab"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_verifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications_verification"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_verifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications_verification_agent"
            referencedColumns: ["id"]
          },
        ]
      }
      employment_history: {
        Row: {
          created_at: string | null
          driver_id: string
          employer_id: string
          end_date: string | null
          id: string
          position: string | null
          start_date: string
          status: string | null
          termination_reason: string | null
          updated_at: string | null
          vehicle_class: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          employer_id: string
          end_date?: string | null
          id?: string
          position?: string | null
          start_date: string
          status?: string | null
          termination_reason?: string | null
          updated_at?: string | null
          vehicle_class?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          employer_id?: string
          end_date?: string | null
          id?: string
          position?: string | null
          start_date?: string
          status?: string | null
          termination_reason?: string | null
          updated_at?: string | null
          vehicle_class?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employment_history_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employment_history_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "data_users"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_certificates: {
        Row: {
          certificate_number: string
          created_at: string | null
          driver_id: string
          employer_id: string
          employment_duration_months: number | null
          employment_history_id: string
          id: string
          issue_date: string | null
          performance_summary: string | null
          vehicle_class: string
          verification_id: string
        }
        Insert: {
          certificate_number: string
          created_at?: string | null
          driver_id: string
          employer_id: string
          employment_duration_months?: number | null
          employment_history_id: string
          id?: string
          issue_date?: string | null
          performance_summary?: string | null
          vehicle_class: string
          verification_id: string
        }
        Update: {
          certificate_number?: string
          created_at?: string | null
          driver_id?: string
          employer_id?: string
          employment_duration_months?: number | null
          employment_history_id?: string
          id?: string
          issue_date?: string | null
          performance_summary?: string | null
          vehicle_class?: string
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_certificates_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_certificates_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "data_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_certificates_employment_history_id_fkey"
            columns: ["employment_history_id"]
            isOneToOne: false
            referencedRelation: "employment_history"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          availability_required: string | null
          created_at: string | null
          description: string | null
          employer_id: string
          experience_years_min: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          location: string | null
          salary_max: number | null
          salary_min: number | null
          skill_grade_required: string[] | null
          title: string
          updated_at: string | null
          vehicle_class_required: string[] | null
          work_type: string | null
        }
        Insert: {
          availability_required?: string | null
          created_at?: string | null
          description?: string | null
          employer_id: string
          experience_years_min?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skill_grade_required?: string[] | null
          title: string
          updated_at?: string | null
          vehicle_class_required?: string[] | null
          work_type?: string | null
        }
        Update: {
          availability_required?: string | null
          created_at?: string | null
          description?: string | null
          employer_id?: string
          experience_years_min?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skill_grade_required?: string[] | null
          title?: string
          updated_at?: string | null
          vehicle_class_required?: string[] | null
          work_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "data_users"
            referencedColumns: ["id"]
          },
        ]
      }
      job_requests: {
        Row: {
          created_at: string | null
          driver_id: string
          driver_response_at: string | null
          employer_id: string
          id: string
          job_description: string | null
          job_title: string
          location: string | null
          salary_offered: number | null
          status: string | null
          updated_at: string | null
          vehicle_class_required: string | null
          work_type: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          driver_response_at?: string | null
          employer_id: string
          id?: string
          job_description?: string | null
          job_title: string
          location?: string | null
          salary_offered?: number | null
          status?: string | null
          updated_at?: string | null
          vehicle_class_required?: string | null
          work_type?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          driver_response_at?: string | null
          employer_id?: string
          id?: string
          job_description?: string | null
          job_title?: string
          location?: string | null
          salary_offered?: number | null
          status?: string | null
          updated_at?: string | null
          vehicle_class_required?: string | null
          work_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_requests_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_requests_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "data_users"
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
            foreignKeyName: "medical_test_results_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications_driving_school"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_test_results_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications_medical_lab"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_test_results_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications_verification"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_test_results_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications_verification_agent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_test_results_medical_lab_id_fkey"
            columns: ["medical_lab_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_test_results_medical_lab_id_fkey"
            columns: ["medical_lab_id"]
            isOneToOne: false
            referencedRelation: "partners_discovery"
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
      performance_ratings: {
        Row: {
          behaviour_rating: number | null
          created_at: string | null
          driver_id: string
          employer_id: string
          employment_history_id: string
          id: string
          overall_rating: number | null
          punctuality_rating: number | null
          remarks: string | null
          safety_rating: number | null
          vehicle_handling_rating: number | null
        }
        Insert: {
          behaviour_rating?: number | null
          created_at?: string | null
          driver_id: string
          employer_id: string
          employment_history_id: string
          id?: string
          overall_rating?: number | null
          punctuality_rating?: number | null
          remarks?: string | null
          safety_rating?: number | null
          vehicle_handling_rating?: number | null
        }
        Update: {
          behaviour_rating?: number | null
          created_at?: string | null
          driver_id?: string
          employer_id?: string
          employment_history_id?: string
          id?: string
          overall_rating?: number | null
          punctuality_rating?: number | null
          remarks?: string | null
          safety_rating?: number | null
          vehicle_handling_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_ratings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_ratings_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "data_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_ratings_employment_history_id_fkey"
            columns: ["employment_history_id"]
            isOneToOne: false
            referencedRelation: "employment_history"
            referencedColumns: ["id"]
          },
        ]
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
      rating_disputes: {
        Row: {
          created_at: string | null
          driver_id: string
          id: string
          performance_rating_id: string
          reason: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          id?: string
          performance_rating_id: string
          reason: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          id?: string
          performance_rating_id?: string
          reason?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rating_disputes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rating_disputes_performance_rating_id_fkey"
            columns: ["performance_rating_id"]
            isOneToOne: false
            referencedRelation: "performance_ratings"
            referencedColumns: ["id"]
          },
        ]
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
          image_url: string | null
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
          image_url?: string | null
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
          image_url?: string | null
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
      traffic_test_login_attempts: {
        Row: {
          attempted_at: string | null
          id: string
          ip_address: string | null
          success: boolean | null
          test_user_id: string
        }
        Insert: {
          attempted_at?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          test_user_id: string
        }
        Update: {
          attempted_at?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          test_user_id?: string
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
          expires_at: string | null
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
          expires_at?: string | null
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
          expires_at?: string | null
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
            foreignKeyName: "traffic_test_sessions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications_driving_school"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traffic_test_sessions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications_medical_lab"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traffic_test_sessions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications_verification"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traffic_test_sessions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications_verification_agent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traffic_test_sessions_driving_school_id_fkey"
            columns: ["driving_school_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traffic_test_sessions_driving_school_id_fkey"
            columns: ["driving_school_id"]
            isOneToOne: false
            referencedRelation: "partners_discovery"
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
      verification_logs: {
        Row: {
          application_id: string | null
          certificate_number: string | null
          company_user_id: string | null
          created_at: string | null
          data_user_id: string
          driver_name: string | null
          id: string
          ip_address: string | null
          result_details: Json | null
          result_status: string
          search_query: string
          search_type: string
          user_agent: string | null
          verified_by_name: string
          verified_by_role: string | null
        }
        Insert: {
          application_id?: string | null
          certificate_number?: string | null
          company_user_id?: string | null
          created_at?: string | null
          data_user_id: string
          driver_name?: string | null
          id?: string
          ip_address?: string | null
          result_details?: Json | null
          result_status: string
          search_query: string
          search_type: string
          user_agent?: string | null
          verified_by_name: string
          verified_by_role?: string | null
        }
        Update: {
          application_id?: string | null
          certificate_number?: string | null
          company_user_id?: string | null
          created_at?: string | null
          data_user_id?: string
          driver_name?: string | null
          id?: string
          ip_address?: string | null
          result_details?: Json | null
          result_status?: string
          search_query?: string
          search_type?: string
          user_agent?: string | null
          verified_by_name?: string
          verified_by_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_logs_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_logs_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications_driving_school"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_logs_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications_medical_lab"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_logs_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications_verification"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_logs_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications_verification_agent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_logs_company_user_id_fkey"
            columns: ["company_user_id"]
            isOneToOne: false
            referencedRelation: "company_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_logs_data_user_id_fkey"
            columns: ["data_user_id"]
            isOneToOne: false
            referencedRelation: "data_users"
            referencedColumns: ["id"]
          },
        ]
      }
      visibility_consent_logs: {
        Row: {
          action: string
          created_at: string | null
          driver_id: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          driver_id: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          driver_id?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visibility_consent_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      applications_driving_school: {
        Row: {
          aadhaar_number: string | null
          certification_purpose: string | null
          certification_vehicle_class: string | null
          created_at: string | null
          date_of_birth: string | null
          driver_id: string | null
          driving_school_id: string | null
          driving_test_passed: boolean | null
          driving_test_slot: string | null
          driving_validity_date: string | null
          full_name: string | null
          gender: string | null
          hazardous_endorsement: boolean | null
          id: string | null
          identity_verified: boolean | null
          issuing_rto: string | null
          licence_expiry_date: string | null
          licence_issue_date: string | null
          licence_number: string | null
          licence_type: string | null
          notes: string | null
          skill_grade: string | null
          status: string | null
          updated_at: string | null
          vehicle_classes: string[] | null
        }
        Insert: {
          aadhaar_number?: string | null
          certification_purpose?: string | null
          certification_vehicle_class?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          driver_id?: string | null
          driving_school_id?: string | null
          driving_test_passed?: boolean | null
          driving_test_slot?: string | null
          driving_validity_date?: string | null
          full_name?: string | null
          gender?: string | null
          hazardous_endorsement?: boolean | null
          id?: string | null
          identity_verified?: boolean | null
          issuing_rto?: string | null
          licence_expiry_date?: string | null
          licence_issue_date?: string | null
          licence_number?: string | null
          licence_type?: string | null
          notes?: string | null
          skill_grade?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_classes?: string[] | null
        }
        Update: {
          aadhaar_number?: string | null
          certification_purpose?: string | null
          certification_vehicle_class?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          driver_id?: string | null
          driving_school_id?: string | null
          driving_test_passed?: boolean | null
          driving_test_slot?: string | null
          driving_validity_date?: string | null
          full_name?: string | null
          gender?: string | null
          hazardous_endorsement?: boolean | null
          id?: string | null
          identity_verified?: boolean | null
          issuing_rto?: string | null
          licence_expiry_date?: string | null
          licence_issue_date?: string | null
          licence_number?: string | null
          licence_type?: string | null
          notes?: string | null
          skill_grade?: string | null
          status?: string | null
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
            foreignKeyName: "applications_driving_school_id_fkey"
            columns: ["driving_school_id"]
            isOneToOne: false
            referencedRelation: "partners_discovery"
            referencedColumns: ["id"]
          },
        ]
      }
      applications_medical_lab: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          driver_id: string | null
          full_name: string | null
          gender: string | null
          id: string | null
          medical_lab_id: string | null
          medical_test_passed: boolean | null
          medical_test_slot: string | null
          medical_validity_date: string | null
          notes: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          driver_id?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string | null
          medical_lab_id?: string | null
          medical_test_passed?: boolean | null
          medical_test_slot?: string | null
          medical_validity_date?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          driver_id?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string | null
          medical_lab_id?: string | null
          medical_test_passed?: boolean | null
          medical_test_slot?: string | null
          medical_validity_date?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
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
            foreignKeyName: "applications_medical_lab_id_fkey"
            columns: ["medical_lab_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_medical_lab_id_fkey"
            columns: ["medical_lab_id"]
            isOneToOne: false
            referencedRelation: "partners_discovery"
            referencedColumns: ["id"]
          },
        ]
      }
      applications_verification: {
        Row: {
          admin_approved: boolean | null
          certificate_expiry_date: string | null
          certificate_number: string | null
          certificate_status: string | null
          certification_purpose: string | null
          certification_vehicle_class: string | null
          created_at: string | null
          driving_test_passed: boolean | null
          driving_validity_date: string | null
          education_verified: boolean | null
          full_name: string | null
          gender: string | null
          id: string | null
          issuing_rto: string | null
          licence_number: string | null
          licence_type: string | null
          medical_test_passed: boolean | null
          medical_validity_date: string | null
          skill_grade: string | null
          status: string | null
          updated_at: string | null
          vehicle_classes: string[] | null
        }
        Insert: {
          admin_approved?: boolean | null
          certificate_expiry_date?: string | null
          certificate_number?: string | null
          certificate_status?: string | null
          certification_purpose?: string | null
          certification_vehicle_class?: string | null
          created_at?: string | null
          driving_test_passed?: boolean | null
          driving_validity_date?: string | null
          education_verified?: boolean | null
          full_name?: string | null
          gender?: string | null
          id?: string | null
          issuing_rto?: string | null
          licence_number?: string | null
          licence_type?: string | null
          medical_test_passed?: boolean | null
          medical_validity_date?: string | null
          skill_grade?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_classes?: string[] | null
        }
        Update: {
          admin_approved?: boolean | null
          certificate_expiry_date?: string | null
          certificate_number?: string | null
          certificate_status?: string | null
          certification_purpose?: string | null
          certification_vehicle_class?: string | null
          created_at?: string | null
          driving_test_passed?: boolean | null
          driving_validity_date?: string | null
          education_verified?: boolean | null
          full_name?: string | null
          gender?: string | null
          id?: string | null
          issuing_rto?: string | null
          licence_number?: string | null
          licence_type?: string | null
          medical_test_passed?: boolean | null
          medical_validity_date?: string | null
          skill_grade?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_classes?: string[] | null
        }
        Relationships: []
      }
      applications_verification_agent: {
        Row: {
          aadhaar_number: string | null
          created_at: string | null
          current_address: string | null
          date_of_birth: string | null
          documents: Json | null
          driver_id: string | null
          education_verified: boolean | null
          full_name: string | null
          gender: string | null
          highest_qualification: string | null
          id: string | null
          issuing_rto: string | null
          licence_expiry_date: string | null
          licence_issue_date: string | null
          licence_number: string | null
          licence_type: string | null
          notes: string | null
          permanent_address: string | null
          status: string | null
          updated_at: string | null
          vehicle_classes: string[] | null
          verification_agent_id: string | null
        }
        Insert: {
          aadhaar_number?: string | null
          created_at?: string | null
          current_address?: string | null
          date_of_birth?: string | null
          documents?: Json | null
          driver_id?: string | null
          education_verified?: boolean | null
          full_name?: string | null
          gender?: string | null
          highest_qualification?: string | null
          id?: string | null
          issuing_rto?: string | null
          licence_expiry_date?: string | null
          licence_issue_date?: string | null
          licence_number?: string | null
          licence_type?: string | null
          notes?: string | null
          permanent_address?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_classes?: string[] | null
          verification_agent_id?: string | null
        }
        Update: {
          aadhaar_number?: string | null
          created_at?: string | null
          current_address?: string | null
          date_of_birth?: string | null
          documents?: Json | null
          driver_id?: string | null
          education_verified?: boolean | null
          full_name?: string | null
          gender?: string | null
          highest_qualification?: string | null
          id?: string | null
          issuing_rto?: string | null
          licence_expiry_date?: string | null
          licence_issue_date?: string | null
          licence_number?: string | null
          licence_type?: string | null
          notes?: string | null
          permanent_address?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_classes?: string[] | null
          verification_agent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      partners_discovery: {
        Row: {
          district: string | null
          id: string | null
          name: string | null
          partner_type: string | null
          state: string | null
          status: string | null
        }
        Insert: {
          district?: string | null
          id?: string | null
          name?: string | null
          partner_type?: string | null
          state?: string | null
          status?: string | null
        }
        Update: {
          district?: string | null
          id?: string | null
          name?: string | null
          partner_type?: string | null
          state?: string | null
          status?: string | null
        }
        Relationships: []
      }
      traffic_questions_public: {
        Row: {
          category: string | null
          id: string | null
          image_url: string | null
          is_hazardous_only: boolean | null
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          question: string | null
          status: string | null
        }
        Insert: {
          category?: string | null
          id?: string | null
          image_url?: string | null
          is_hazardous_only?: boolean | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          question?: string | null
          status?: string | null
        }
        Update: {
          category?: string | null
          id?: string | null
          image_url?: string | null
          is_hazardous_only?: boolean | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          question?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_traffic_test_rate_limit: {
        Args: { p_test_user_id: string }
        Returns: boolean
      }
      company_can_view_app: {
        Args: { _application_id: string; _user_id: string }
        Returns: boolean
      }
      driver_can_view_partner: {
        Args: { _partner_id: string; _user_id: string }
        Returns: boolean
      }
      driver_is_visible: { Args: { _driver_id: string }; Returns: boolean }
      driver_owns_application: {
        Args: { _driver_id: string; _user_id: string }
        Returns: boolean
      }
      driver_owns_test_result: {
        Args: { _application_id: string; _user_id: string }
        Returns: boolean
      }
      employer_has_recruitment_access: {
        Args: { _user_id: string }
        Returns: boolean
      }
      enterprise_can_view_driver: {
        Args: { _driver_id: string; _user_id: string }
        Returns: boolean
      }
      get_driver_id: { Args: { _user_id: string }; Returns: string }
      get_employer_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      partner_can_access_application: {
        Args: {
          _app_driving_school_id: string
          _app_medical_lab_id: string
          _app_verification_agent_id: string
          _partner_type: string
          _user_id: string
        }
        Returns: boolean
      }
      partner_can_view_driver: {
        Args: { _driver_id: string; _user_id: string }
        Returns: boolean
      }
      validate_traffic_answer: {
        Args: { _question_id: string; _selected_answer: string }
        Returns: boolean
      }
      verify_certificate: {
        Args: { p_certificate_number: string }
        Returns: {
          certificate_expiry_date: string
          certificate_number: string
          certification_vehicle_class: string
          issue_date: string
          masked_name: string
          skill_grade: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "driver"
        | "driving_school"
        | "medical_lab"
        | "company_verifier"
        | "verification_agent"
      company_user_role: "admin" | "recruiter" | "compliance_officer"
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
        "verification_agent",
      ],
      company_user_role: ["admin", "recruiter", "compliance_officer"],
    },
  },
} as const
