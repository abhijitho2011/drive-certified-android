import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  Car, 
  Stethoscope, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Shield,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ApplicationSelector from "@/components/driver/ApplicationSelector";

interface Application {
  id: string;
  certificate_number: string | null;
  status: string | null;
  created_at: string | null;
  certification_vehicle_class: string | null;
  certification_purpose: string | null;
}

interface DrivingTestResult {
  id: string;
  application_id: string;
  identity_verified: boolean | null;
  identity_photo_match: boolean | null;
  licence_verified: boolean | null;
  police_clearance_verified: boolean | null;
  traffic_test_score: number | null;
  traffic_test_total: number | null;
  traffic_test_passed: boolean | null;
  vehicle_control_score: number | null;
  parallel_parking_score: number | null;
  hill_driving_score: number | null;
  emergency_handling_score: number | null;
  defensive_driving_score: number | null;
  practical_test_total: number | null;
  practical_test_passed: boolean | null;
  brake_system_score: number | null;
  engine_fluids_score: number | null;
  tyres_score: number | null;
  lights_safety_score: number | null;
  diagnosis_score: number | null;
  inspection_test_total: number | null;
  inspection_test_passed: boolean | null;
  total_score: number | null;
  skill_grade: string | null;
  overall_passed: boolean | null;
  test_date: string | null;
  tested_by: string | null;
  submitted_at: string | null;
}

interface MedicalTestResult {
  id: string;
  application_id: string;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  blood_pressure_status: string | null;
  bmi: number | null;
  bmi_status: string | null;
  heart_rate: number | null;
  heart_rate_status: string | null;
  vision_left: string | null;
  vision_right: string | null;
  vision_status: string | null;
  color_blindness: boolean | null;
  hearing_status: string | null;
  health_screening_passed: boolean | null;
  health_notes: string | null;
  alcohol_level: number | null;
  alcohol_test_method: string | null;
  alcohol_result: string | null;
  cannabis_result: string | null;
  opioids_result: string | null;
  cocaine_result: string | null;
  amphetamines_result: string | null;
  methamphetamine_result: string | null;
  mdma_result: string | null;
  benzodiazepines_result: string | null;
  barbiturates_result: string | null;
  drug_screening_passed: boolean | null;
  drug_notes: string | null;
  fitness_status: string | null;
  fitness_validity_months: number | null;
  test_date: string | null;
  tested_by: string | null;
  submitted_at: string | null;
}

const TestResults = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [driverData, setDriverData] = useState<{ id: string; first_name: string; last_name: string } | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [drivingResult, setDrivingResult] = useState<DrivingTestResult | null>(null);
  const [medicalResult, setMedicalResult] = useState<MedicalTestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      const { data: driver } = await supabase
        .from("drivers")
        .select("id, first_name, last_name")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (driver) {
        setDriverData(driver);
        
        // Fetch all applications
        const { data: apps } = await supabase
          .from("applications")
          .select("id, certificate_number, status, created_at, certification_vehicle_class, certification_purpose")
          .eq("driver_id", driver.id)
          .order("created_at", { ascending: false });
        
        if (apps && apps.length > 0) {
          setApplications(apps);
          
          // Auto-select if only one application
          if (apps.length === 1) {
            setSelectedApplicationId(apps[0].id);
            await fetchTestResults(apps[0].id);
          }
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const fetchTestResults = async (applicationId: string) => {
    setLoadingResults(true);
    setDrivingResult(null);
    setMedicalResult(null);
    
    // Fetch driving test results
    const { data: drivingData } = await supabase
      .from("driving_test_results")
      .select("*")
      .eq("application_id", applicationId)
      .maybeSingle();
    
    if (drivingData) setDrivingResult(drivingData as DrivingTestResult);
    
    // Fetch medical test results
    const { data: medicalData } = await supabase
      .from("medical_test_results")
      .select("*")
      .eq("application_id", applicationId)
      .maybeSingle();
    
    if (medicalData) setMedicalResult(medicalData as MedicalTestResult);
    
    setLoadingResults(false);
  };

  const handleSelectApplication = async (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    await fetchTestResults(applicationId);
  };

  const userName = driverData 
    ? `${driverData.first_name} ${driverData.last_name}` 
    : "Driver";

  const getStatusBadge = (passed: boolean | null) => {
    if (passed === null) return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    return passed 
      ? <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" />Passed</Badge>
      : <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
  };

  const getGradeBadge = (grade: string | null) => {
    if (!grade) return <Badge variant="secondary">N/A</Badge>;
    const colors: Record<string, string> = {
      "A+": "bg-success text-success-foreground",
      "A": "bg-success/80 text-success-foreground",
      "B": "bg-primary text-primary-foreground",
      "C": "bg-warning text-warning-foreground",
      "D": "bg-destructive/80 text-destructive-foreground",
    };
    return <Badge className={colors[grade] || ""}>{grade}</Badge>;
  };

  const ScoreBar = ({ score, max, label }: { score: number | null; max: number; label: string }) => {
    const value = score ?? 0;
    const percentage = (value / max) * 100;
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{value}/{max}</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    );
  };

  const StatusItem = ({ label, status, icon: Icon }: { label: string; status: boolean | null; icon?: React.ComponentType<{ className?: string }> }) => (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        <span className="text-sm">{label}</span>
      </div>
      {status === null ? (
        <Clock className="w-4 h-4 text-muted-foreground" />
      ) : status ? (
        <CheckCircle2 className="w-4 h-4 text-success" />
      ) : (
        <XCircle className="w-4 h-4 text-destructive" />
      )}
    </div>
  );

  const ResultItem = ({ label, value, status }: { label: string; value: string | null; status?: string | null }) => (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{value || "N/A"}</span>
        {status && (
          <Badge 
            variant={
              status.toLowerCase().includes("normal") || status.toLowerCase().includes("negative") || status.toLowerCase().includes("fit") 
                ? "success" 
                : status.toLowerCase().includes("pending") 
                  ? "secondary" 
                  : "destructive"
            }
            className="text-xs"
          >
            {status}
          </Badge>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout role="driver" userName={userName}>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  // Show application selector if multiple applications and none selected
  if (applications.length > 1 && !selectedApplicationId) {
    return (
      <DashboardLayout role="driver" userName={userName}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Test Results</h1>
              <p className="text-muted-foreground">Select an application to view test results</p>
            </div>
          </div>

          <ApplicationSelector
            applications={applications}
            onSelect={handleSelectApplication}
            title="Your Applications"
            description="Click on an application to view its test results"
          />
        </div>
      </DashboardLayout>
    );
  }

  const selectedApp = applications.find(a => a.id === selectedApplicationId);

  return (
    <DashboardLayout role="driver" userName={userName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              if (applications.length > 1) {
                setSelectedApplicationId(null);
                setDrivingResult(null);
                setMedicalResult(null);
              } else {
                navigate(-1);
              }
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Test Results</h1>
            <p className="text-muted-foreground">
              {selectedApp?.certificate_number 
                ? `Certificate: ${selectedApp.certificate_number}` 
                : `Application from ${new Date(selectedApp?.created_at || "").toLocaleDateString()}`}
            </p>
          </div>
        </div>

        {loadingResults ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !drivingResult && !medicalResult ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Test Results Available</h3>
              <p className="text-muted-foreground mb-4">
                Test results will appear here once you complete your driving and medical tests.
              </p>
              <Button onClick={() => navigate("/driver/application")}>
                View Application
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="driving" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="driving" className="gap-2">
                <Car className="w-4 h-4" />
                Driving Test
              </TabsTrigger>
              <TabsTrigger value="medical" className="gap-2">
                <Stethoscope className="w-4 h-4" />
                Medical Report
              </TabsTrigger>
            </TabsList>

            {/* Driving Test Results */}
            <TabsContent value="driving" className="space-y-6">
              {drivingResult ? (
                <>
                  {/* Overall Summary */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Overall Result</CardTitle>
                        {getStatusBadge(drivingResult.overall_passed)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Total Score</p>
                          <p className="text-3xl font-bold">{drivingResult.total_score ?? "N/A"}</p>
                          <p className="text-xs text-muted-foreground">out of 100</p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Skill Grade</p>
                          <div className="mt-2">
                            {getGradeBadge(drivingResult.skill_grade)}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Test Date</p>
                          <p className="text-lg font-medium">
                            {drivingResult.test_date 
                              ? new Date(drivingResult.test_date).toLocaleDateString()
                              : "N/A"
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Identity Verification */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Identity Verification
                      </CardTitle>
                      <CardDescription>Document and identity verification status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <StatusItem label="Identity Verified" status={drivingResult.identity_verified} />
                      <StatusItem label="Photo Match Verified" status={drivingResult.identity_photo_match} />
                      <StatusItem label="Licence Verified" status={drivingResult.licence_verified} />
                      <StatusItem label="Police Clearance" status={drivingResult.police_clearance_verified} />
                    </CardContent>
                  </Card>

                  {/* Traffic Law Test */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Traffic Law Test</CardTitle>
                          <CardDescription>Written test on traffic rules and regulations</CardDescription>
                        </div>
                        {getStatusBadge(drivingResult.traffic_test_passed)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScoreBar 
                        score={drivingResult.traffic_test_score} 
                        max={drivingResult.traffic_test_total ?? 20} 
                        label="Score" 
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Minimum 70% required to pass
                      </p>
                    </CardContent>
                  </Card>

                  {/* Practical Driving Skills */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Practical Driving Skills</CardTitle>
                          <CardDescription>On-road driving evaluation scores</CardDescription>
                        </div>
                        {getStatusBadge(drivingResult.practical_test_passed)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ScoreBar score={drivingResult.vehicle_control_score} max={10} label="Vehicle Control" />
                      <ScoreBar score={drivingResult.parallel_parking_score} max={10} label="Parallel Parking" />
                      <ScoreBar score={drivingResult.hill_driving_score} max={10} label="Hill Driving" />
                      <ScoreBar score={drivingResult.emergency_handling_score} max={10} label="Emergency Handling" />
                      <ScoreBar score={drivingResult.defensive_driving_score} max={10} label="Defensive Driving" />
                      <ScoreBar score={drivingResult.lights_safety_score} max={10} label="Lights & Safety" />
                      <div className="pt-4 border-t">
                        <div className="flex justify-between">
                          <span className="font-medium">Practical Total</span>
                          <span className="font-bold">
                            {(drivingResult.vehicle_control_score ?? 0) +
                              (drivingResult.parallel_parking_score ?? 0) +
                              (drivingResult.hill_driving_score ?? 0) +
                              (drivingResult.emergency_handling_score ?? 0) +
                              (drivingResult.defensive_driving_score ?? 0) +
                              (drivingResult.lights_safety_score ?? 0)
                            }/{drivingResult.practical_test_total ?? 60}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vehicle Inspection */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Vehicle Inspection Knowledge</CardTitle>
                          <CardDescription>Pre-drive inspection evaluation</CardDescription>
                        </div>
                        {getStatusBadge(drivingResult.inspection_test_passed)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ScoreBar score={drivingResult.brake_system_score} max={4} label="Brake System" />
                      <ScoreBar score={drivingResult.engine_fluids_score} max={4} label="Engine & Fluids" />
                      <ScoreBar score={drivingResult.tyres_score} max={4} label="Tyres" />
                      <ScoreBar score={drivingResult.diagnosis_score} max={8} label="Diagnosis" />
                      <div className="pt-4 border-t">
                        <div className="flex justify-between">
                          <span className="font-medium">Inspection Total</span>
                          <span className="font-bold">
                            {(drivingResult.brake_system_score ?? 0) +
                              (drivingResult.engine_fluids_score ?? 0) +
                              (drivingResult.tyres_score ?? 0) +
                              (drivingResult.diagnosis_score ?? 0)
                            }/{drivingResult.inspection_test_total ?? 20}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Examiner Info */}
                  {drivingResult.tested_by && (
                    <Card>
                      <CardContent className="py-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Examined by</span>
                          <span className="font-medium">{drivingResult.tested_by}</span>
                        </div>
                        {drivingResult.submitted_at && (
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-muted-foreground">Submitted on</span>
                            <span className="font-medium">
                              {new Date(drivingResult.submitted_at).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Driving Test Results</h3>
                    <p className="text-muted-foreground">
                      Your driving test results will appear here once the test is completed.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Medical Test Results */}
            <TabsContent value="medical" className="space-y-6">
              {medicalResult ? (
                <>
                  {/* Fitness Status */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Fitness Status</CardTitle>
                        <Badge 
                          variant={
                            medicalResult.fitness_status?.toLowerCase() === "fit" 
                              ? "success" 
                              : medicalResult.fitness_status?.toLowerCase() === "unfit"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {medicalResult.fitness_status || "Pending"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Health Screening</p>
                          {getStatusBadge(medicalResult.health_screening_passed)}
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Drug Screening</p>
                          {getStatusBadge(medicalResult.drug_screening_passed)}
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Validity</p>
                          <p className="text-lg font-medium">
                            {medicalResult.fitness_validity_months 
                              ? `${medicalResult.fitness_validity_months} months`
                              : "N/A"
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vital Signs */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Vital Signs</CardTitle>
                      <CardDescription>Blood pressure, heart rate, and BMI measurements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResultItem 
                        label="Blood Pressure" 
                        value={medicalResult.blood_pressure_systolic && medicalResult.blood_pressure_diastolic 
                          ? `${medicalResult.blood_pressure_systolic}/${medicalResult.blood_pressure_diastolic} mmHg`
                          : null
                        }
                        status={medicalResult.blood_pressure_status}
                      />
                      <ResultItem 
                        label="Heart Rate" 
                        value={medicalResult.heart_rate ? `${medicalResult.heart_rate} bpm` : null}
                        status={medicalResult.heart_rate_status}
                      />
                      <ResultItem 
                        label="BMI" 
                        value={medicalResult.bmi ? medicalResult.bmi.toFixed(1) : null}
                        status={medicalResult.bmi_status}
                      />
                    </CardContent>
                  </Card>

                  {/* Vision & Hearing */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Vision & Hearing</CardTitle>
                      <CardDescription>Sensory function assessment</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResultItem label="Left Eye Vision" value={medicalResult.vision_left} />
                      <ResultItem label="Right Eye Vision" value={medicalResult.vision_right} />
                      <ResultItem label="Vision Status" value={medicalResult.vision_status} />
                      <ResultItem 
                        label="Color Blindness" 
                        value={medicalResult.color_blindness === null ? "Not tested" : medicalResult.color_blindness ? "Detected" : "Not detected"}
                      />
                      <ResultItem label="Hearing Status" value={medicalResult.hearing_status} />
                    </CardContent>
                  </Card>

                  {/* Alcohol Test */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Alcohol Screening</CardTitle>
                      <CardDescription>Blood alcohol content test</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResultItem label="Test Method" value={medicalResult.alcohol_test_method} />
                      <ResultItem 
                        label="Alcohol Level" 
                        value={medicalResult.alcohol_level !== null ? `${medicalResult.alcohol_level}%` : null}
                      />
                      <ResultItem 
                        label="Result" 
                        value={medicalResult.alcohol_result}
                        status={medicalResult.alcohol_result}
                      />
                    </CardContent>
                  </Card>

                  {/* Drug Screening */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Drug Screening</CardTitle>
                          <CardDescription>Multi-panel drug test results</CardDescription>
                        </div>
                        {getStatusBadge(medicalResult.drug_screening_passed)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-x-8">
                        <ResultItem label="Cannabis" value={medicalResult.cannabis_result} status={medicalResult.cannabis_result} />
                        <ResultItem label="Opioids" value={medicalResult.opioids_result} status={medicalResult.opioids_result} />
                        <ResultItem label="Cocaine" value={medicalResult.cocaine_result} status={medicalResult.cocaine_result} />
                        <ResultItem label="Amphetamines" value={medicalResult.amphetamines_result} status={medicalResult.amphetamines_result} />
                        <ResultItem label="Methamphetamine" value={medicalResult.methamphetamine_result} status={medicalResult.methamphetamine_result} />
                        <ResultItem label="MDMA" value={medicalResult.mdma_result} status={medicalResult.mdma_result} />
                        <ResultItem label="Benzodiazepines" value={medicalResult.benzodiazepines_result} status={medicalResult.benzodiazepines_result} />
                        <ResultItem label="Barbiturates" value={medicalResult.barbiturates_result} status={medicalResult.barbiturates_result} />
                      </div>
                      {medicalResult.drug_notes && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Notes: {medicalResult.drug_notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Health Notes */}
                  {medicalResult.health_notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Health Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{medicalResult.health_notes}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Examiner Info */}
                  {medicalResult.tested_by && (
                    <Card>
                      <CardContent className="py-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Examined by</span>
                          <span className="font-medium">{medicalResult.tested_by}</span>
                        </div>
                        {medicalResult.test_date && (
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-muted-foreground">Test date</span>
                            <span className="font-medium">
                              {new Date(medicalResult.test_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {medicalResult.submitted_at && (
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-muted-foreground">Submitted on</span>
                            <span className="font-medium">
                              {new Date(medicalResult.submitted_at).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Medical Test Results</h3>
                    <p className="text-muted-foreground">
                      Your medical test results will appear here once the examination is completed.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TestResults;
