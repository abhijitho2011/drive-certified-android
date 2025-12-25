# Motract - Driver Certification & Recruitment Platform

## Project Overview

Motract is a comprehensive driver certification management and recruitment platform that connects drivers, employers, driving schools, medical labs, and verification agents in a unified ecosystem.

---

## User Roles & Portals

### 1. Driver Portal
- **Registration**: Drivers register with personal details (name, phone, address, state, district, pin code)
- **Application Management**: Submit applications for driver certification
- **Dashboard Features**:
  - View application status and progress
  - Track certification milestones (medical test, driving test, education verification)
  - View issued certificates
  - Manage employment preferences and visibility
  - Browse job openings from employers
  - Respond to job requests/offers
  - View employment history and performance ratings
  - Access experience certificates

### 2. Company/Employer Portal (Data Users)
- **Registration**: Companies register with company name, contact person, phone, email, address, state, district, industry type
- **Features**:
  - **Verification Tab**: Verify driver certificates (single & bulk verification)
  - **Employees Tab**: Manage current employees, employment history, performance ratings, experience certificates
  - **Recruit Tab** (requires recruitment_access approval):
    - Search certified drivers (filter by vehicle class, skill grade, location, availability)
    - View driver profiles and certifications
    - Shortlist drivers
    - Create and manage job postings
    - Send job requests to drivers
  - **Audit Logs**: Track all verification activities

### 3. Driving School Portal (Partner - driving_school)
- **Dashboard**: View assigned applications pending driving tests
- **Features**:
  - Conduct driving tests with scoring system:
    - Identity verification (photo match, licence verification, police clearance)
    - Traffic law test (20 questions from question bank)
    - Practical driving test (vehicle control, parking, hill driving, emergency handling, defensive driving)
    - Vehicle inspection test (brakes, engine fluids, tyres, lights, diagnosis)
  - Grade drivers (Grade A, B, C, or Fail)
  - Submit test results

### 4. Medical Lab Portal (Partner - medical_lab)
- **Dashboard**: View assigned applications pending medical tests
- **Features**:
  - Conduct medical examinations:
    - Health screening (blood pressure, BMI, heart rate, vision, hearing)
    - Drug screening (cannabis, opioids, cocaine, amphetamines, methamphetamine, MDMA, benzodiazepines, barbiturates)
    - Alcohol testing
  - Determine fitness status and validity period
  - Submit medical test results

### 5. Verification Agent Portal (Partner - verification_agent)
- **Dashboard**: View assigned applications pending education verification
- **Features**:
  - Verify driver education documents
  - Review uploaded documents (education certificates, ID proofs)
  - Approve or reject with notes

### 6. Admin Portal
- **Full system management**:
  - View and manage all applications
  - Approve/reject applications after all tests pass
  - Issue certificate numbers
  - Manage traffic law questions
  - Manage states and districts
  - View all users (drivers, companies, partners)
  - Grant recruitment access to companies
  - Manage partner accounts

---

## Application/Certification Workflow

### Step 1: Driver Submits Application
- **Basic Details**: Full name, date of birth, gender, Aadhaar number, addresses
- **Education**: Highest qualification
- **Licence Details**: Licence number, type, issuing RTO, issue/expiry dates, vehicle classes
- **Test Center Selection**: Choose state, district, driving school, medical lab
- **Document Upload**: 
  - Driver photo
  - Aadhaar front/back
  - Driving licence front/back
  - Education certificate
  - Police verification report
  - Address proof
- **Certification Details**: Purpose (new/renewal), vehicle class for certification, hazardous endorsement
- **Declaration**: Sign declaration with date

### Step 2: Verification Request
- Application assigned to selected verification agent
- Education documents verified

### Step 3: Medical Test
- Driver visits selected medical lab
- Health and drug screening conducted
- Results submitted with pass/fail status

### Step 4: Driving Test
- Driver visits selected driving school
- Three-part test:
  1. Traffic law theory test (online)
  2. Practical driving test
  3. Vehicle inspection test
- Skill grade assigned (A/B/C/Fail)

### Step 5: Admin Approval
- Admin reviews all test results
- If all passed: Approves and issues certificate number
- Certificate status: active/suspended/revoked
- Certificate expiry date set

### Step 6: Certificate Issued
- Driver receives certificate
- Certificate verifiable by employers

---

## Database Schema

### Core Tables

#### `drivers`
- id, user_id, first_name, last_name, phone, address, district, state, pin_code, status

#### `applications`
- Personal: full_name, date_of_birth, gender, aadhaar_number, current_address, permanent_address
- Education: highest_qualification, education_verified
- Licence: licence_number, licence_type, issuing_rto, licence_issue_date, licence_expiry_date, vehicle_classes
- Test assignments: driving_school_id, medical_lab_id, verification_agent_id
- Test results: driving_test_passed, medical_test_passed, driving_validity_date, medical_validity_date
- Test slots: driving_test_slot, medical_test_slot
- Certification: certification_purpose, certification_vehicle_class, hazardous_endorsement, skill_grade
- Certificate: certificate_number, certificate_status, certificate_expiry_date, admin_approved
- Declaration: declaration_signed, declaration_date
- Documents: documents (JSONB), identity_verified

#### `partners`
- id, user_id, name, partner_type (driving_school/medical_lab/verification_agent)
- contact_number, email, address, district, state, gst, status

#### `data_users` (Companies/Employers)
- id, user_id, company_name, contact_person, phone, email, address, district, state
- industry_type, recruitment_access, recruitment_access_approved_at/by, status

#### `company_users`
- Sub-users under a company with roles: admin, recruiter, compliance_officer

### Test Results Tables

#### `driving_test_results`
- Identity verification: identity_verified, identity_photo_match, licence_verified, police_clearance_verified
- Traffic test: traffic_test_score, traffic_test_total, traffic_test_answers, traffic_test_passed
- Practical test: vehicle_control_score, parallel_parking_score, hill_driving_score, emergency_handling_score, defensive_driving_score
- Inspection test: brake_system_score, engine_fluids_score, tyres_score, lights_safety_score, diagnosis_score
- Results: skill_grade, total_score, overall_passed, tested_by, test_date

#### `medical_test_results`
- Health: blood_pressure, bmi, heart_rate, vision, hearing, color_blindness
- Drugs: cannabis, opioids, cocaine, amphetamines, methamphetamine, mdma, benzodiazepines, barbiturates results
- Alcohol: alcohol_level, alcohol_result, alcohol_test_method
- Fitness: fitness_status, fitness_validity_months, health_screening_passed, drug_screening_passed

#### `education_verifications`
- application_id, verification_agent_id, status, verified_at, notes, rejection_reason

### Employment & Recruitment Tables

#### `employment_history`
- driver_id, employer_id, start_date, end_date, position, vehicle_class, status, termination_reason

#### `performance_ratings`
- driver_id, employer_id, employment_history_id
- Ratings: overall, vehicle_handling, behaviour, safety, punctuality (1-5 scale)
- remarks

#### `experience_certificates`
- driver_id, employer_id, employment_history_id
- certificate_number, vehicle_class, employment_duration_months, performance_summary, issue_date

#### `driver_employment_status`
- driver_id, employment_status, availability, is_visible_to_employers
- preferred_work_types[], preferred_locations[], expected_salary_min/max

#### `job_postings`
- employer_id, title, description, location, work_type, availability_required
- vehicle_class_required[], skill_grade_required[], experience_years_min
- salary_min/max, is_active, expires_at

#### `job_requests`
- employer_id, driver_id, job_title, job_description, location, work_type
- vehicle_class_required, salary_offered, status (pending/accepted/rejected/applied/withdrawn)

#### `driver_shortlist`
- employer_id, driver_id, notes

### Verification & Logs

#### `verification_logs`
- data_user_id, company_user_id, search_type, search_query, result_status
- application_id, certificate_number, driver_name, verified_by_name/role
- result_details (JSONB), ip_address, user_agent

#### `visibility_consent_logs`
- driver_id, action, ip_address, user_agent

### Supporting Tables

#### `traffic_law_questions`
- question, option_a/b/c/d, correct_answer, category, is_hazardous_only, image_url, status

#### `traffic_test_sessions`
- application_id, driving_school_id, test_user_id, secret_key
- answers (JSONB), score, total_questions, status, started_at, completed_at, expires_at

#### `states` & `districts`
- State and district master data for location selection

#### `user_roles`
- Maps user_id to role (admin, driver, driving_school, medical_lab, company_verifier, verification_agent)

#### `profiles`
- Basic profile for all users (id, first_name, last_name, phone)

---

## Key Features

### Certificate Verification
- Single verification by certificate number
- Bulk verification via Excel upload
- Returns masked driver name, vehicle class, skill grade, expiry date
- All verifications logged for audit

### Traffic Test Portal
- Standalone test-taking interface
- Login with test_user_id and secret_key
- Timed 20-question test from question bank
- Auto-submit on completion or timeout
- Results stored and linked to application

### Driver Discovery (Recruitment)
- Employers with recruitment_access can:
  - Search drivers by filters
  - View only drivers who opted-in (is_visible_to_employers = true)
  - See certification details, skill grades, ratings
  - Shortlist and send job requests

### Job Flow
1. Employer creates job posting
2. Driver browses matching openings
3. Driver applies to job posting (creates job_request with status 'applied')
4. OR Employer sends direct job request to driver
5. Driver accepts/rejects/withdraws
6. If accepted, employer can onboard to employment_history

---

## Security & RLS Policies

### Row-Level Security
- **Drivers**: Can only view/update own data and applications
- **Partners**: Can only access applications assigned to them
- **Companies**: Can only view verified certificates, own employees, visible drivers (with recruitment access)
- **Admins**: Full access to all tables

### Key Security Functions
- `has_role(user_id, role)` - Check user role
- `get_driver_id(user_id)` - Get driver ID from auth user
- `get_employer_id(user_id)` - Get employer ID from auth user
- `driver_is_visible(driver_id)` - Check if driver opted in for recruitment
- `employer_has_recruitment_access(user_id)` - Check employer access
- `verify_certificate(certificate_number)` - Secure certificate verification

---

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Lovable Cloud)
- **Database**: PostgreSQL with RLS
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (application-documents bucket)
- **Edge Functions**: Deno-based serverless functions

---

## File Structure

```
src/
├── components/
│   ├── ui/                    # shadcn components
│   ├── admin/                 # Admin-specific components
│   ├── application/           # Application form sections
│   ├── company/               # Employer dashboard components
│   ├── driving-school/        # Driving school components
│   └── medical-lab/           # Medical lab components
├── pages/
│   ├── driver/                # Driver portal pages
│   ├── admin/                 # Admin dashboard
│   ├── company/               # Company dashboard
│   ├── driving-school/        # Driving school dashboard
│   ├── medical-lab/           # Medical lab dashboard
│   └── verification-agent/    # Verification agent dashboard
├── contexts/
│   └── AuthContext.tsx        # Authentication context
└── integrations/
    └── supabase/              # Supabase client and types

supabase/
├── functions/                 # Edge functions
│   ├── set-data-user-password/
│   ├── set-partner-password/
│   └── submit-traffic-test/
└── config.toml
```

---

## Edge Functions

### submit-traffic-test
- Validates and scores traffic test submissions
- Updates driving_test_results with scores
- Called from Traffic Test Portal

### set-partner-password / set-data-user-password
- Admin functions to set passwords for partner and company accounts

---

## UI/UX Features

- Responsive design (mobile + desktop)
- Dark/light theme toggle
- Dashboard layouts with sidebar navigation
- Tab-based interfaces for multi-section views
- Toast notifications for user feedback
- Form validation with Zod
- Loading states and skeletons
- Empty state handling

---

## Status Values

### Application Status
- pending, approved, rejected

### Certificate Status
- active, suspended, revoked

### Test Status
- pending, passed, failed

### Job Request Status
- pending, accepted, rejected, applied, withdrawn

### Employment Status
- unemployed, employed, contract

### Availability
- immediate, 15_days, 30_days, not_available
