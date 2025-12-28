import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  QrCode,
  Calendar,
  Car,
  Shield,
  Activity,
  FileText,
  Clock,
  User,
  Heart,
  Eye,
  Ear,
  Gauge,
  FlaskConical,
  ClipboardCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DrivingTestData {
  trafficTestScore?: number;
  trafficTestTotal?: number;
  trafficTestPassed?: boolean;
  practicalTestPassed?: boolean;
  vehicleControlScore?: number;
  parallelParkingScore?: number;
  hillDrivingScore?: number;
  emergencyHandlingScore?: number;
  defensiveDrivingScore?: number;
  inspectionTestPassed?: boolean;
  brakeSystemScore?: number;
  engineFluidsScore?: number;
  tyresScore?: number;
  lightsSafetyScore?: number;
  totalScore?: number;
  overallPassed?: boolean;
}

interface MedicalTestData {
  fitnessStatus?: string;
  bloodPressure?: string;
  bloodPressureStatus?: string;
  bmi?: number;
  bmiStatus?: string;
  heartRate?: number;
  heartRateStatus?: string;
  visionLeft?: string;
  visionRight?: string;
  visionStatus?: string;
  hearingStatus?: string;
  healthScreeningPassed?: boolean;
  alcoholResult?: string;
  drugScreeningPassed?: boolean;
  substanceScreeningResult?: string;
}

interface VerificationResult {
  found: boolean;
  valid: boolean;
  certificateNo?: string;
  driverName?: string;
  fullName?: string;
  status?: string;
  vehicleClass?: string;
  skillGrade?: string;
  medicalFitness?: string;
  expiryDate?: string;
  certificateStatus?: string;
  renewalType?: string;
  isExpiringSoon?: boolean;
  isConditionalFit?: boolean;
  recommendation?: "eligible" | "eligible_conditions" | "not_eligible";
  applicationId?: string;
  drivingTestData?: DrivingTestData;
  medicalTestData?: MedicalTestData;
}

interface SingleVerificationProps {
  dataUserId: string;
  companyName: string;
  onVerificationComplete: (result: VerificationResult, query: string) => void;
}

const SingleVerification = ({ dataUserId, companyName, onVerificationComplete }: SingleVerificationProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setResult(null);
    
    // Use secure view that excludes sensitive data (Aadhaar, addresses, DOB, documents)
    // Company verifiers can only search by certificate number (driver_id not exposed in view)
    const { data: app } = await supabase
      .from("applications_verification")
      .select(`
        id,
        certificate_number,
        status,
        admin_approved,
        skill_grade,
        certification_vehicle_class,
        vehicle_classes,
        certificate_status,
        certificate_expiry_date,
        medical_test_passed,
        driving_test_passed,
        full_name
      `)
      .eq("certificate_number", searchQuery.trim().toUpperCase())
      .maybeSingle();
    
    let verificationResult: VerificationResult;
    
    if (app && app.certificate_number) {
      // Use full_name from the secure view (driver_id not exposed)
      const driverName = app.full_name || "Unknown";

      // Fetch driving test results
      const { data: drivingResults } = await supabase
        .from("driving_test_results")
        .select("*")
        .eq("application_id", app.id)
        .maybeSingle();

      // Fetch medical test results
      const { data: medicalResults } = await supabase
        .from("medical_test_results")
        .select("*")
        .eq("application_id", app.id)
        .maybeSingle();

      const isExpired = app.certificate_expiry_date && new Date(app.certificate_expiry_date) < new Date();
      const isExpiringSoon = app.certificate_expiry_date && 
        new Date(app.certificate_expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
        !isExpired;
      
      const fitnessStatus = medicalResults?.fitness_status || "Unknown";
      const isConditionalFit = fitnessStatus === "conditionally_fit";
      
      // Determine recommendation
      let recommendation: "eligible" | "eligible_conditions" | "not_eligible" = "eligible";
      if (isExpired || app.certificate_status === "expired" || app.certificate_status === "revoked") {
        recommendation = "not_eligible";
      } else if (isExpiringSoon || isConditionalFit) {
        recommendation = "eligible_conditions";
      }

      // Build driving test data
      const drivingTestData: DrivingTestData = drivingResults ? {
        trafficTestScore: drivingResults.traffic_test_score,
        trafficTestTotal: drivingResults.traffic_test_total || 20,
        trafficTestPassed: drivingResults.traffic_test_passed,
        practicalTestPassed: drivingResults.practical_test_passed,
        vehicleControlScore: drivingResults.vehicle_control_score,
        parallelParkingScore: drivingResults.parallel_parking_score,
        hillDrivingScore: drivingResults.hill_driving_score,
        emergencyHandlingScore: drivingResults.emergency_handling_score,
        defensiveDrivingScore: drivingResults.defensive_driving_score,
        inspectionTestPassed: drivingResults.inspection_test_passed,
        brakeSystemScore: drivingResults.brake_system_score,
        engineFluidsScore: drivingResults.engine_fluids_score,
        tyresScore: drivingResults.tyres_score,
        lightsSafetyScore: drivingResults.lights_safety_score,
        totalScore: drivingResults.total_score,
        overallPassed: drivingResults.overall_passed
      } : undefined;

      // Build medical test data (excluding individual drug names)
      const medicalTestData: MedicalTestData = medicalResults ? {
        fitnessStatus: medicalResults.fitness_status,
        bloodPressure: medicalResults.blood_pressure_systolic && medicalResults.blood_pressure_diastolic 
          ? `${medicalResults.blood_pressure_systolic}/${medicalResults.blood_pressure_diastolic}` 
          : undefined,
        bloodPressureStatus: medicalResults.blood_pressure_status,
        bmi: medicalResults.bmi ? Number(medicalResults.bmi) : undefined,
        bmiStatus: medicalResults.bmi_status,
        heartRate: medicalResults.heart_rate,
        heartRateStatus: medicalResults.heart_rate_status,
        visionLeft: medicalResults.vision_left,
        visionRight: medicalResults.vision_right,
        visionStatus: medicalResults.vision_status,
        hearingStatus: medicalResults.hearing_status,
        healthScreeningPassed: medicalResults.health_screening_passed,
        alcoholResult: medicalResults.alcohol_result,
        drugScreeningPassed: medicalResults.drug_screening_passed,
        substanceScreeningResult: medicalResults.drug_screening_passed === false ? "Detected" : "Clean"
      } : undefined;

      verificationResult = {
        found: true,
        valid: app.admin_approved && app.status === "approved" && !isExpired && app.certificate_status === "active",
        certificateNo: app.certificate_number,
        driverName,
        fullName: app.full_name,
        status: app.status,
        vehicleClass: app.certification_vehicle_class || (app.vehicle_classes as string[])?.join(", ") || "N/A",
        skillGrade: app.skill_grade || "N/A",
        medicalFitness: fitnessStatus,
        expiryDate: app.certificate_expiry_date,
        certificateStatus: app.certificate_status,
        renewalType: undefined, // Not exposed in secure view
        isExpiringSoon,
        isConditionalFit,
        recommendation,
        applicationId: app.id,
        drivingTestData,
        medicalTestData
      };
    } else {
      verificationResult = {
        found: false,
        valid: false,
        recommendation: "not_eligible"
      };
    }
    
    setResult(verificationResult);
    onVerificationComplete(verificationResult, searchQuery);
    setSearching(false);
  };

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case "eligible":
        return <Badge className="bg-success text-success-foreground">Eligible for Onboarding</Badge>;
      case "eligible_conditions":
        return <Badge variant="outline" className="border-warning text-warning">Eligible with Conditions</Badge>;
      case "not_eligible":
        return <Badge variant="destructive">Not Eligible</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (passed: boolean | undefined | null) => {
    if (passed === true) return <Badge className="bg-success/20 text-success">Passed</Badge>;
    if (passed === false) return <Badge variant="destructive">Failed</Badge>;
    return <Badge variant="secondary">N/A</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <Card className="border-primary/30">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Driver Verification</h3>
                <p className="text-sm text-muted-foreground">Search by certificate number</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter certificate number (e.g., MOTRACT-001)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleVerify} disabled={searching}>
                {searching ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardContent className="pt-6">
            {result.found ? (
              <div className="space-y-6">
                {/* Status Header */}
                <div className={`p-4 rounded-lg flex items-center justify-between ${
                  result.valid 
                    ? "bg-success/10 border border-success/30" 
                    : "bg-destructive/10 border border-destructive/30"
                }`}>
                  <div className="flex items-center gap-3">
                    {result.valid ? (
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    ) : (
                      <XCircle className="w-8 h-8 text-destructive" />
                    )}
                    <div>
                      <p className="font-semibold text-lg">
                        {result.valid ? "Valid Certificate" : "Invalid / Expired Certificate"}
                      </p>
                      <p className="text-muted-foreground">{result.certificateNo}</p>
                    </div>
                  </div>
                  {result.recommendation && getRecommendationBadge(result.recommendation)}
                </div>

                {/* Warnings */}
                {(result.isExpiringSoon || result.isConditionalFit) && (
                  <div className="flex flex-wrap gap-2">
                    {result.isExpiringSoon && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 border border-warning/30 rounded-lg">
                        <Clock className="w-4 h-4 text-warning" />
                        <span className="text-sm font-medium text-warning">Expiring Soon</span>
                      </div>
                    )}
                    {result.isConditionalFit && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 border border-warning/30 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        <span className="text-sm font-medium text-warning">Conditional Medical Fitness</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Basic Details */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" /> Driver Information
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Driver Name</p>
                      <p className="font-medium">{result.driverName || result.fullName || "N/A"}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Vehicle Class</p>
                      <p className="font-medium">{result.vehicleClass}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Skill Grade</p>
                      <p className="font-medium text-lg">{result.skillGrade}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Certificate Status</p>
                      <p className="font-medium capitalize">{result.certificateStatus || "N/A"}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Expiry Date</p>
                      <p className="font-medium">
                        {result.expiryDate ? new Date(result.expiryDate).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Renewal Type</p>
                      <p className="font-medium capitalize">{result.renewalType || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Driving Test Results */}
                {result.drivingTestData && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Car className="w-4 h-4" /> Driving Test Results
                    </h4>
                    <div className="space-y-4">
                      {/* Traffic Law Test */}
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Traffic Law Test</span>
                          {getStatusBadge(result.drivingTestData.trafficTestPassed)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Score: {result.drivingTestData.trafficTestScore ?? "N/A"} / {result.drivingTestData.trafficTestTotal || 20}
                        </p>
                      </div>

                      {/* Practical Driving Test */}
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">Practical Driving Test</span>
                          {getStatusBadge(result.drivingTestData.practicalTestPassed)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-xs text-muted-foreground">Vehicle Control</p>
                            <p className="font-medium">{result.drivingTestData.vehicleControlScore ?? "N/A"}/20</p>
                          </div>
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-xs text-muted-foreground">Parallel Parking</p>
                            <p className="font-medium">{result.drivingTestData.parallelParkingScore ?? "N/A"}/10</p>
                          </div>
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-xs text-muted-foreground">Hill Driving</p>
                            <p className="font-medium">{result.drivingTestData.hillDrivingScore ?? "N/A"}/10</p>
                          </div>
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-xs text-muted-foreground">Emergency</p>
                            <p className="font-medium">{result.drivingTestData.emergencyHandlingScore ?? "N/A"}/10</p>
                          </div>
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-xs text-muted-foreground">Defensive</p>
                            <p className="font-medium">{result.drivingTestData.defensiveDrivingScore ?? "N/A"}/10</p>
                          </div>
                        </div>
                      </div>

                      {/* Vehicle Inspection */}
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">Vehicle Inspection Test</span>
                          {getStatusBadge(result.drivingTestData.inspectionTestPassed)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-xs text-muted-foreground">Brake System</p>
                            <p className="font-medium">{result.drivingTestData.brakeSystemScore ?? "N/A"}/5</p>
                          </div>
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-xs text-muted-foreground">Engine Fluids</p>
                            <p className="font-medium">{result.drivingTestData.engineFluidsScore ?? "N/A"}/5</p>
                          </div>
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-xs text-muted-foreground">Tyres</p>
                            <p className="font-medium">{result.drivingTestData.tyresScore ?? "N/A"}/5</p>
                          </div>
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-xs text-muted-foreground">Lights & Safety</p>
                            <p className="font-medium">{result.drivingTestData.lightsSafetyScore ?? "N/A"}/5</p>
                          </div>
                        </div>
                      </div>

                      {/* Overall Score */}
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">Overall Driving Score</span>
                            <p className="text-2xl font-bold text-primary">
                              {result.drivingTestData.totalScore ?? "N/A"} / 100
                            </p>
                          </div>
                          {getStatusBadge(result.drivingTestData.overallPassed)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Medical Test Results */}
                {result.medicalTestData && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Medical Test Results
                    </h4>
                    <div className="space-y-4">
                      {/* Health Screening */}
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium flex items-center gap-2">
                            <Heart className="w-4 h-4" /> Health Screening
                          </span>
                          {getStatusBadge(result.medicalTestData.healthScreeningPassed)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-xs text-muted-foreground">Blood Pressure</p>
                            <p className="font-medium">{result.medicalTestData.bloodPressure || "N/A"}</p>
                            {result.medicalTestData.bloodPressureStatus && (
                              <p className="text-xs capitalize text-muted-foreground">{result.medicalTestData.bloodPressureStatus}</p>
                            )}
                          </div>
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-xs text-muted-foreground">BMI</p>
                            <p className="font-medium">{result.medicalTestData.bmi?.toFixed(1) || "N/A"}</p>
                            {result.medicalTestData.bmiStatus && (
                              <p className="text-xs capitalize text-muted-foreground">{result.medicalTestData.bmiStatus}</p>
                            )}
                          </div>
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-xs text-muted-foreground">Heart Rate</p>
                            <p className="font-medium">{result.medicalTestData.heartRate ? `${result.medicalTestData.heartRate} bpm` : "N/A"}</p>
                            {result.medicalTestData.heartRateStatus && (
                              <p className="text-xs capitalize text-muted-foreground">{result.medicalTestData.heartRateStatus}</p>
                            )}
                          </div>
                          <div className="p-2 bg-muted/30 rounded flex items-start gap-2">
                            <Eye className="w-4 h-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Vision</p>
                              <p className="font-medium">
                                L: {result.medicalTestData.visionLeft || "N/A"} / R: {result.medicalTestData.visionRight || "N/A"}
                              </p>
                              {result.medicalTestData.visionStatus && (
                                <p className="text-xs capitalize text-muted-foreground">{result.medicalTestData.visionStatus}</p>
                              )}
                            </div>
                          </div>
                          <div className="p-2 bg-muted/30 rounded flex items-start gap-2">
                            <Ear className="w-4 h-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Hearing</p>
                              <p className="font-medium capitalize">{result.medicalTestData.hearingStatus || "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Substance Screening */}
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium flex items-center gap-2">
                            <FlaskConical className="w-4 h-4" /> Substance Screening
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-muted/30 rounded">
                            <p className="text-xs text-muted-foreground">Alcohol</p>
                            <p className={`font-medium capitalize ${
                              result.medicalTestData.alcoholResult === "negative" ? "text-success" : 
                              result.medicalTestData.alcoholResult === "positive" ? "text-destructive" : ""
                            }`}>
                              {result.medicalTestData.alcoholResult || "N/A"}
                            </p>
                          </div>
                          <div className="p-3 bg-muted/30 rounded">
                            <p className="text-xs text-muted-foreground">Drug Screening</p>
                            <p className={`font-medium ${
                              result.medicalTestData.drugScreeningPassed === true ? "text-success" : 
                              result.medicalTestData.drugScreeningPassed === false ? "text-destructive" : ""
                            }`}>
                              {result.medicalTestData.substanceScreeningResult || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Medical Fitness Status */}
                      <div className={`p-4 rounded-lg border ${
                        result.medicalTestData.fitnessStatus === "fit" ? "bg-success/10 border-success/30" :
                        result.medicalTestData.fitnessStatus === "conditionally_fit" ? "bg-warning/10 border-warning/30" :
                        result.medicalTestData.fitnessStatus === "unfit" ? "bg-destructive/10 border-destructive/30" :
                        "bg-muted/50"
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5" />
                            <span className="font-medium">Medical Fitness Status</span>
                          </div>
                          <Badge className={
                            result.medicalTestData.fitnessStatus === "fit" ? "bg-success text-success-foreground" :
                            result.medicalTestData.fitnessStatus === "conditionally_fit" ? "bg-warning text-warning-foreground" :
                            result.medicalTestData.fitnessStatus === "unfit" ? "bg-destructive" :
                            ""
                          }>
                            {result.medicalTestData.fitnessStatus?.replace("_", " ").toUpperCase() || "PENDING"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* No test data message */}
                {!result.drivingTestData && !result.medicalTestData && (
                  <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
                    No detailed test results available for this certificate.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-destructive" />
                  <div>
                    <p className="font-semibold text-lg">Certificate Not Found</p>
                    <p className="text-muted-foreground">
                      No certificate found with number: {searchQuery}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SingleVerification;
