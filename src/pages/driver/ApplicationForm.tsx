import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import BasicDetailsSection from "@/components/application/BasicDetailsSection";
import EducationSection from "@/components/application/EducationSection";
import LicenceDetailsSection from "@/components/application/LicenceDetailsSection";
import VerificationRequestSection from "@/components/application/VerificationRequestSection";
import DocumentUploadSection from "@/components/application/DocumentUploadSection";
import DeclarationSection from "@/components/application/DeclarationSection";
import TestCenterSection from "@/components/application/TestCenterSection";

export interface ApplicationFormData {
  // Section 1: Basic Details
  fullName: string;
  dateOfBirth: string;
  gender: string;
  currentAddress: string;
  currentState: string;
  currentDistrict: string;
  currentPinCode: string;
  permanentAddress: string;
  permanentState: string;
  permanentDistrict: string;
  permanentPinCode: string;
  aadhaarNumber: string;
  // Section 2: Educational Qualification
  highestQualification: string;
  // Section 3: Licence Details
  licenceNumber: string;
  issuingRto: string;
  licenceIssueDate: string;
  licenceExpiryDate: string;
  licenceType: string;
  vehicleClasses: string[];
  hazardousEndorsement: boolean;
  // Section 4: Verification Request
  certificationVehicleClasses: string[];
  certificationPurposes: string[];
  // Section 5: Documents
  documents: {
    licenceFront?: string;
    licenceBack?: string;
    aadhaarId?: string;
    policeClearance?: string;
    photograph?: string;
    educationCertificate?: string;
  };
  // Section 6: Declaration
  declarationSigned: boolean;
  // Section 7: Test Center
  testState: string;
  testDistrict: string;
  drivingSchoolId: string;
  medicalLabId: string;
  drivingTestSlot: string;
  medicalTestSlot: string;
}

const initialFormData: ApplicationFormData = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  currentAddress: "",
  currentState: "",
  currentDistrict: "",
  currentPinCode: "",
  permanentAddress: "",
  permanentState: "",
  permanentDistrict: "",
  permanentPinCode: "",
  aadhaarNumber: "",
  highestQualification: "",
  licenceNumber: "",
  issuingRto: "",
  licenceIssueDate: "",
  licenceExpiryDate: "",
  licenceType: "",
  vehicleClasses: [],
  hazardousEndorsement: false,
  certificationVehicleClasses: [],
  certificationPurposes: [],
  documents: {},
  declarationSigned: false,
  testState: "",
  testDistrict: "",
  drivingSchoolId: "",
  medicalLabId: "",
  drivingTestSlot: "",
  medicalTestSlot: "",
};

const STEPS = [
  { id: 1, title: "Basic Details", description: "Personal information" },
  { id: 2, title: "Education", description: "Educational qualification" },
  { id: 3, title: "Licence Details", description: "Driving licence information" },
  { id: 4, title: "Verification Request", description: "Certification details" },
  { id: 5, title: "Documents", description: "Upload required documents" },
  { id: 6, title: "Declaration", description: "Legal declaration" },
  { id: 7, title: "Test Center", description: "Schedule appointments" },
];

const ApplicationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ApplicationFormData>(initialFormData);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDriverData = async () => {
      if (!user) return;
      
      try {
        // Get driver ID
        const { data: driver, error: driverError } = await supabase
          .from("drivers")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (driverError) throw driverError;
        setDriverId(driver.id);

        // Pre-fill form with driver data
        setFormData(prev => ({
          ...prev,
          fullName: `${driver.first_name} ${driver.last_name}`,
          currentAddress: driver.address || "",
        }));

        // Check for existing pending application (not approved/rejected ones)
        const { data: existingApp } = await supabase
          .from("applications")
          .select("*")
          .eq("driver_id", driver.id)
          .eq("status", "pending")
          .maybeSingle();

        // If pending application exists, load its data
        if (existingApp) {
          setFormData(prev => ({
            ...prev,
            fullName: existingApp.full_name || prev.fullName,
            dateOfBirth: existingApp.date_of_birth || "",
            gender: existingApp.gender || "",
            currentAddress: existingApp.current_address || prev.currentAddress,
            permanentAddress: existingApp.permanent_address || "",
            aadhaarNumber: existingApp.aadhaar_number || "",
            highestQualification: existingApp.highest_qualification || "",
            licenceNumber: existingApp.licence_number || "",
            issuingRto: existingApp.issuing_rto || "",
            licenceIssueDate: existingApp.licence_issue_date || "",
            licenceExpiryDate: existingApp.licence_expiry_date || "",
            licenceType: existingApp.licence_type || "",
            vehicleClasses: existingApp.vehicle_classes || [],
            hazardousEndorsement: existingApp.hazardous_endorsement || false,
            certificationVehicleClasses: existingApp.certification_vehicle_class ? existingApp.certification_vehicle_class.split(',') : [],
            certificationPurposes: existingApp.certification_purpose ? existingApp.certification_purpose.split(',') : [],
            documents: (existingApp.documents as ApplicationFormData['documents']) || {},
            declarationSigned: existingApp.declaration_signed || false,
            testState: existingApp.test_state || "",
            testDistrict: existingApp.test_district || "",
            drivingSchoolId: existingApp.driving_school_id || "",
            medicalLabId: existingApp.medical_lab_id || "",
            drivingTestSlot: existingApp.driving_test_slot || "",
            medicalTestSlot: existingApp.medical_test_slot || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching driver data:", error);
        toast.error("Failed to load application data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriverData();
  }, [user, navigate]);

  const updateFormData = (data: Partial<ApplicationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.fullName || !formData.dateOfBirth || !formData.gender || 
            !formData.currentAddress || !formData.aadhaarNumber) {
          toast.error("Please fill in all required fields");
          return false;
        }
        if (!/^\d{12}$/.test(formData.aadhaarNumber.replace(/\s/g, ''))) {
          toast.error("Please enter a valid 12-digit Aadhaar number");
          return false;
        }
        return true;
      case 2:
        if (!formData.highestQualification) {
          toast.error("Please select your highest qualification");
          return false;
        }
        return true;
      case 3:
        if (!formData.licenceNumber || !formData.issuingRto || 
            !formData.licenceIssueDate || !formData.licenceExpiryDate || !formData.licenceType) {
          toast.error("Please fill in all licence details");
          return false;
        }
        if (formData.vehicleClasses.length === 0) {
          toast.error("Please select at least one vehicle class");
          return false;
        }
        return true;
      case 4:
        if (formData.certificationVehicleClasses.length === 0 || formData.certificationPurposes.length === 0) {
          toast.error("Please select at least one vehicle class and purpose");
          return false;
        }
        return true;
      case 5:
        if (!formData.documents.licenceFront || !formData.documents.licenceBack || 
            !formData.documents.aadhaarId || !formData.documents.educationCertificate || !formData.documents.photograph) {
          toast.error("Please upload all required documents");
          return false;
        }
        return true;
      case 6:
        if (!formData.declarationSigned) {
          toast.error("Please sign the declaration to proceed");
          return false;
        }
        return true;
      case 7:
        if (!formData.testState || !formData.testDistrict || 
            !formData.drivingSchoolId || !formData.medicalLabId) {
          toast.error("Please select test centers");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep() || !driverId) return;

    setIsSubmitting(true);
    try {
      // Auto-assign a verification agent from the selected district
      let verificationAgentId = null;
      
      // Get district and state names for finding available verification agents
      const { data: districtData } = await supabase
        .from("districts")
        .select("name, state_id")
        .eq("id", formData.testDistrict)
        .single();
      
      const { data: stateData } = await supabase
        .from("states")
        .select("name")
        .eq("id", formData.testState)
        .single();
      
      if (districtData && stateData) {
        // Find available verification agents in the area
        const { data: agents } = await supabase
          .from("partners")
          .select("id")
          .eq("partner_type", "verification_agent")
          .eq("state", stateData.name)
          .eq("district", districtData.name)
          .eq("status", "active")
          .limit(1);
        
        if (agents && agents.length > 0) {
          verificationAgentId = agents[0].id;
        }
      }

      const applicationData = {
        driver_id: driverId,
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        current_address: formData.currentAddress,
        permanent_address: formData.permanentAddress || formData.currentAddress,
        aadhaar_number: formData.aadhaarNumber,
        highest_qualification: formData.highestQualification,
        licence_number: formData.licenceNumber,
        issuing_rto: formData.issuingRto,
        licence_issue_date: formData.licenceIssueDate,
        licence_expiry_date: formData.licenceExpiryDate,
        licence_type: formData.licenceType,
        vehicle_classes: formData.vehicleClasses,
        hazardous_endorsement: formData.hazardousEndorsement,
        certification_vehicle_class: formData.certificationVehicleClasses.join(','),
        certification_purpose: formData.certificationPurposes.join(','),
        documents: formData.documents,
        declaration_signed: formData.declarationSigned,
        declaration_date: new Date().toISOString(),
        test_state: formData.testState,
        test_district: formData.testDistrict,
        driving_school_id: formData.drivingSchoolId,
        medical_lab_id: formData.medicalLabId,
        verification_agent_id: verificationAgentId,
        driving_test_slot: formData.drivingTestSlot || null,
        medical_test_slot: formData.medicalTestSlot || null,
        status: "pending",
      };

      // Check if application exists
      const { data: existingApp } = await supabase
        .from("applications")
        .select("id")
        .eq("driver_id", driverId)
        .maybeSingle();

      if (existingApp) {
        const { error } = await supabase
          .from("applications")
          .update(applicationData)
          .eq("id", existingApp.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("applications")
          .insert(applicationData);
        if (error) throw error;
      }

      toast.success("Application submitted successfully!");
      navigate("/driver");
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicDetailsSection formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <EducationSection formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <LicenceDetailsSection formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <VerificationRequestSection formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <DocumentUploadSection formData={formData} updateFormData={updateFormData} userId={user?.id || ""} />;
      case 6:
        return <DeclarationSection formData={formData} updateFormData={updateFormData} />;
      case 7:
        return <TestCenterSection formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/driver")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Driver Verification Application</h1>
          <p className="text-muted-foreground mt-2">Complete all sections to submit your application</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center flex-1 ${
                  step.id <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1 ${
                    step.id < currentStep
                      ? "bg-primary text-primary-foreground"
                      : step.id === currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span className="text-xs hidden md:block text-center">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} className="h-2" />
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-primary">Step {currentStep}:</span> {STEPS[currentStep - 1].title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{STEPS[currentStep - 1].description}</p>
          </CardHeader>
          <CardContent>
            {renderCurrentStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < STEPS.length ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApplicationForm;
