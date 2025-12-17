import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle2,
  XCircle,
  User,
  FileText,
  Car,
  Wrench,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";

interface Application {
  id: string;
  driver_id: string;
  drivers?: {
    first_name: string;
    last_name: string;
  };
  full_name?: string;
  licence_number?: string;
  certification_vehicle_class?: string;
}

interface DrivingTestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  partnerId: string;
  onComplete: () => void;
}

interface TrafficQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

interface TestResults {
  // Identity
  identity_photo_match: boolean;
  licence_verified: boolean;
  police_clearance_verified: boolean;
  identity_status: string;
  
  // Traffic Test
  traffic_test_answers: Record<string, string>;
  traffic_test_score: number;
  
  // Practical Driving (60 points)
  vehicle_control_score: number;
  parallel_parking_score: number;
  hill_driving_score: number;
  emergency_handling_score: number;
  defensive_driving_score: number;
  practical_notes: string;
  
  // Vehicle Inspection (20 points)
  brake_system_score: number;
  engine_fluids_score: number;
  tyres_score: number;
  lights_safety_score: number;
  diagnosis_score: number;
  inspection_notes: string;
  
  tested_by: string;
}

const DrivingTestSheet = ({ open, onOpenChange, application, partnerId, onComplete }: DrivingTestSheetProps) => {
  const [activeTab, setActiveTab] = useState("identity");
  const [questions, setQuestions] = useState<TrafficQuestion[]>([]);
  const [existingResults, setExistingResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [results, setResults] = useState<TestResults>({
    identity_photo_match: false,
    licence_verified: false,
    police_clearance_verified: false,
    identity_status: "pending",
    traffic_test_answers: {},
    traffic_test_score: 0,
    vehicle_control_score: 0,
    parallel_parking_score: 0,
    hill_driving_score: 0,
    emergency_handling_score: 0,
    defensive_driving_score: 0,
    practical_notes: "",
    brake_system_score: 0,
    engine_fluids_score: 0,
    tyres_score: 0,
    lights_safety_score: 0,
    diagnosis_score: 0,
    inspection_notes: "",
    tested_by: "",
  });

  useEffect(() => {
    if (open && application) {
      fetchQuestions();
      fetchExistingResults();
    }
  }, [open, application]);

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from("traffic_law_questions")
      .select("*")
      .eq("status", "active")
      .limit(25);
    
    if (data) setQuestions(data);
  };

  const fetchExistingResults = async () => {
    if (!application) return;
    
    const { data } = await supabase
      .from("driving_test_results")
      .select("*")
      .eq("application_id", application.id)
      .maybeSingle();
    
    if (data) {
      setExistingResults(data);
      // Populate form with existing data if not submitted
      if (!data.submitted_at) {
        setResults({
          identity_photo_match: data.identity_photo_match || false,
          licence_verified: data.licence_verified || false,
          police_clearance_verified: data.police_clearance_verified || false,
          identity_status: data.identity_status || "pending",
          traffic_test_answers: (data.traffic_test_answers as Record<string, string>) || {},
          traffic_test_score: data.traffic_test_score || 0,
          vehicle_control_score: data.vehicle_control_score || 0,
          parallel_parking_score: data.parallel_parking_score || 0,
          hill_driving_score: data.hill_driving_score || 0,
          emergency_handling_score: data.emergency_handling_score || 0,
          defensive_driving_score: data.defensive_driving_score || 0,
          practical_notes: data.practical_notes || "",
          brake_system_score: data.brake_system_score || 0,
          engine_fluids_score: data.engine_fluids_score || 0,
          tyres_score: data.tyres_score || 0,
          lights_safety_score: data.lights_safety_score || 0,
          diagnosis_score: data.diagnosis_score || 0,
          inspection_notes: data.inspection_notes || "",
          tested_by: data.tested_by || "",
        });
      }
    }
  };

  const calculateTrafficScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (results.traffic_test_answers[q.id] === q.correct_answer) {
        score++;
      }
    });
    return Math.round((score / Math.max(questions.length, 1)) * 20);
  };

  const practicalTotal = 
    results.vehicle_control_score + 
    results.parallel_parking_score + 
    results.hill_driving_score + 
    results.emergency_handling_score + 
    results.defensive_driving_score;

  const inspectionTotal = 
    results.brake_system_score + 
    results.engine_fluids_score + 
    results.tyres_score + 
    results.lights_safety_score + 
    results.diagnosis_score;

  const trafficScore = calculateTrafficScore();
  const totalScore = trafficScore + practicalTotal + inspectionTotal;

  const getSkillGrade = (score: number) => {
    if (score >= 85) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    return "Fail";
  };

  const isIdentityVerified = results.identity_photo_match && results.licence_verified && results.police_clearance_verified;
  const isTrafficPassed = trafficScore >= 12;
  const isPracticalPassed = practicalTotal >= 40;
  const isInspectionPassed = inspectionTotal >= 12;
  const isOverallPassed = isIdentityVerified && isTrafficPassed && isPracticalPassed && isInspectionPassed && totalScore >= 60;

  const handleSave = async (submit = false) => {
    if (!application || !results.tested_by) {
      toast.error("Please enter examiner name");
      return;
    }

    if (submit && !isIdentityVerified) {
      toast.error("Identity verification must pass before submitting");
      return;
    }

    setSubmitting(true);
    try {
      const testData = {
        application_id: application.id,
        driving_school_id: partnerId,
        identity_photo_match: results.identity_photo_match,
        licence_verified: results.licence_verified,
        police_clearance_verified: results.police_clearance_verified,
        identity_verified: isIdentityVerified,
        identity_status: isIdentityVerified ? "verified" : "failed",
        traffic_test_score: trafficScore,
        traffic_test_answers: results.traffic_test_answers,
        traffic_test_passed: isTrafficPassed,
        vehicle_control_score: results.vehicle_control_score,
        parallel_parking_score: results.parallel_parking_score,
        hill_driving_score: results.hill_driving_score,
        emergency_handling_score: results.emergency_handling_score,
        defensive_driving_score: results.defensive_driving_score,
        practical_test_passed: isPracticalPassed,
        practical_notes: results.practical_notes,
        brake_system_score: results.brake_system_score,
        engine_fluids_score: results.engine_fluids_score,
        tyres_score: results.tyres_score,
        lights_safety_score: results.lights_safety_score,
        diagnosis_score: results.diagnosis_score,
        inspection_test_passed: isInspectionPassed,
        inspection_notes: results.inspection_notes,
        total_score: totalScore,
        skill_grade: getSkillGrade(totalScore),
        overall_passed: isOverallPassed,
        tested_by: results.tested_by,
        ...(submit && { submitted_at: new Date().toISOString() }),
      };

      if (existingResults) {
        const { error } = await supabase
          .from("driving_test_results")
          .update(testData)
          .eq("id", existingResults.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("driving_test_results")
          .insert(testData);
        if (error) throw error;
      }

      // Update application status
      if (submit) {
        await supabase
          .from("applications")
          .update({
            identity_verified: isIdentityVerified,
            driving_test_passed: isOverallPassed,
            skill_grade: getSkillGrade(totalScore),
            status: isOverallPassed ? "driving_test_completed" : "driving_test_failed",
          })
          .eq("id", application.id);
      }

      toast.success(submit ? "Test results submitted" : "Progress saved");
      if (submit) {
        onComplete();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save results");
    } finally {
      setSubmitting(false);
    }
  };

  if (!application) return null;

  const isSubmitted = existingResults?.submitted_at;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Driver Skill Assessment
          </SheetTitle>
          <SheetDescription>
            {application.drivers?.first_name} {application.drivers?.last_name} - {application.licence_number}
          </SheetDescription>
        </SheetHeader>

        {isSubmitted && (
          <div className="my-4 p-4 bg-warning/10 border border-warning rounded-lg">
            <p className="text-sm text-warning font-medium">
              ⚠️ This test has been submitted and cannot be edited.
            </p>
          </div>
        )}

        {/* Score Summary */}
        <Card className="my-4">
          <CardContent className="pt-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Traffic Law</p>
                <p className={`text-xl font-bold ${isTrafficPassed ? "text-success" : "text-destructive"}`}>
                  {trafficScore}/20
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Practical</p>
                <p className={`text-xl font-bold ${isPracticalPassed ? "text-success" : "text-destructive"}`}>
                  {practicalTotal}/60
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Inspection</p>
                <p className={`text-xl font-bold ${isInspectionPassed ? "text-success" : "text-destructive"}`}>
                  {inspectionTotal}/20
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className={`text-xl font-bold ${isOverallPassed ? "text-success" : "text-destructive"}`}>
                  {totalScore}/100
                </p>
                <Badge variant={isOverallPassed ? "success" : "destructive"}>
                  Grade: {getSkillGrade(totalScore)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="identity" className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Identity</span>
            </TabsTrigger>
            <TabsTrigger value="traffic" className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Traffic</span>
            </TabsTrigger>
            <TabsTrigger value="practical" className="flex items-center gap-1">
              <Car className="w-4 h-4" />
              <span className="hidden sm:inline">Practical</span>
            </TabsTrigger>
            <TabsTrigger value="inspection" className="flex items-center gap-1">
              <Wrench className="w-4 h-4" />
              <span className="hidden sm:inline">Inspection</span>
            </TabsTrigger>
          </TabsList>

          {/* Identity Verification */}
          <TabsContent value="identity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Identity & Document Verification</CardTitle>
                <CardDescription>Gate pass - All checks must pass to proceed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="photo_match"
                    checked={results.identity_photo_match}
                    onCheckedChange={(checked) => 
                      setResults({ ...results, identity_photo_match: checked as boolean })}
                    disabled={isSubmitted}
                  />
                  <Label htmlFor="photo_match" className="flex-1">
                    Physical identity matches DL photo
                  </Label>
                  {results.identity_photo_match ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="licence_verified"
                    checked={results.licence_verified}
                    onCheckedChange={(checked) => 
                      setResults({ ...results, licence_verified: checked as boolean })}
                    disabled={isSubmitted}
                  />
                  <Label htmlFor="licence_verified" className="flex-1">
                    Original Driving Licence verified
                  </Label>
                  {results.licence_verified ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="police_clearance"
                    checked={results.police_clearance_verified}
                    onCheckedChange={(checked) => 
                      setResults({ ...results, police_clearance_verified: checked as boolean })}
                    disabled={isSubmitted}
                  />
                  <Label htmlFor="police_clearance" className="flex-1">
                    Police clearance certificate verified
                  </Label>
                  {results.police_clearance_verified ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className={`p-4 rounded-lg ${isIdentityVerified ? "bg-success/10" : "bg-destructive/10"}`}>
                    <p className={`font-medium ${isIdentityVerified ? "text-success" : "text-destructive"}`}>
                      Identity Status: {isIdentityVerified ? "VERIFIED ✓" : "INCOMPLETE"}
                    </p>
                    {!isIdentityVerified && (
                      <p className="text-sm text-muted-foreground mt-1">
                        All identity checks must pass before proceeding with tests.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Traffic Law Test */}
          <TabsContent value="traffic">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Computerized Traffic Law Test</CardTitle>
                <CardDescription>25 MCQs - Minimum 12/20 points to pass</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {questions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No questions available</p>
                      <p className="text-sm">Admin needs to add traffic law questions</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {questions.map((q, idx) => (
                        <div key={q.id} className="p-4 bg-muted/50 rounded-lg">
                          <p className="font-medium mb-3">
                            {idx + 1}. {q.question}
                          </p>
                          <RadioGroup
                            value={results.traffic_test_answers[q.id] || ""}
                            onValueChange={(value) =>
                              setResults({
                                ...results,
                                traffic_test_answers: {
                                  ...results.traffic_test_answers,
                                  [q.id]: value,
                                },
                              })
                            }
                            disabled={isSubmitted}
                          >
                            <div className="space-y-2">
                              {["A", "B", "C", "D"].map((opt) => (
                                <div key={opt} className="flex items-center space-x-2">
                                  <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                                  <Label htmlFor={`${q.id}-${opt}`}>
                                    {opt}. {q[`option_${opt.toLowerCase()}` as keyof TrafficQuestion]}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Practical Driving Test */}
          <TabsContent value="practical">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Practical Driving Skill Test</CardTitle>
                <CardDescription>Total 60 points - Minimum 40 to pass</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vehicle Control */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Vehicle Control & Handling (0-20)</Label>
                    <span className="font-bold">{results.vehicle_control_score}/20</span>
                  </div>
                  <Slider
                    value={[results.vehicle_control_score]}
                    onValueChange={([value]) => setResults({ ...results, vehicle_control_score: value })}
                    max={20}
                    step={1}
                    disabled={isSubmitted}
                  />
                  <p className="text-xs text-muted-foreground">
                    Start/stop, steering, gear shifting, engine stalling
                  </p>
                </div>

                {/* Parallel Parking */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Parallel Parking - MANDATORY (0-10)</Label>
                    <span className="font-bold">{results.parallel_parking_score}/10</span>
                  </div>
                  <Slider
                    value={[results.parallel_parking_score]}
                    onValueChange={([value]) => setResults({ ...results, parallel_parking_score: value })}
                    max={10}
                    step={1}
                    disabled={isSubmitted}
                  />
                  <p className="text-xs text-muted-foreground">
                    Mirror usage, no curb hit, steering technique, within boundary
                  </p>
                </div>

                {/* Hill Driving */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Hill Driving & Clutch Control - MANDATORY (0-10)</Label>
                    <span className="font-bold">{results.hill_driving_score}/10</span>
                  </div>
                  <Slider
                    value={[results.hill_driving_score]}
                    onValueChange={([value]) => setResults({ ...results, hill_driving_score: value })}
                    max={10}
                    step={1}
                    disabled={isSubmitted}
                  />
                  <p className="text-xs text-muted-foreground">
                    Clutch balance, no rollback, controlled acceleration
                  </p>
                </div>

                {/* Emergency Handling */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Emergency Handling (0-10)</Label>
                    <span className="font-bold">{results.emergency_handling_score}/10</span>
                  </div>
                  <Slider
                    value={[results.emergency_handling_score]}
                    onValueChange={([value]) => setResults({ ...results, emergency_handling_score: value })}
                    max={10}
                    step={1}
                    disabled={isSubmitted}
                  />
                  <p className="text-xs text-muted-foreground">
                    Emergency braking, obstacle avoidance, reaction time
                  </p>
                </div>

                {/* Defensive Driving */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Defensive Driving Behaviour (0-10)</Label>
                    <span className="font-bold">{results.defensive_driving_score}/10</span>
                  </div>
                  <Slider
                    value={[results.defensive_driving_score]}
                    onValueChange={([value]) => setResults({ ...results, defensive_driving_score: value })}
                    max={10}
                    step={1}
                    disabled={isSubmitted}
                  />
                  <p className="text-xs text-muted-foreground">
                    Safe distance, indicator usage, blind spot awareness, speed discipline
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional observations..."
                    value={results.practical_notes}
                    onChange={(e) => setResults({ ...results, practical_notes: e.target.value })}
                    disabled={isSubmitted}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicle Inspection */}
          <TabsContent value="inspection">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vehicle Inspection & Diagnostic Test</CardTitle>
                <CardDescription>Total 20 points - Minimum 12 to pass</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Brake System */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Brake System Knowledge (0-4)</Label>
                    <span className="font-bold">{results.brake_system_score}/4</span>
                  </div>
                  <Slider
                    value={[results.brake_system_score]}
                    onValueChange={([value]) => setResults({ ...results, brake_system_score: value })}
                    max={4}
                    step={1}
                    disabled={isSubmitted}
                  />
                  <p className="text-xs text-muted-foreground">
                    Brake pad condition, brake response awareness
                  </p>
                </div>

                {/* Engine Fluids */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Engine Fluids Knowledge (0-4)</Label>
                    <span className="font-bold">{results.engine_fluids_score}/4</span>
                  </div>
                  <Slider
                    value={[results.engine_fluids_score]}
                    onValueChange={([value]) => setResults({ ...results, engine_fluids_score: value })}
                    max={4}
                    step={1}
                    disabled={isSubmitted}
                  />
                  <p className="text-xs text-muted-foreground">
                    Engine oil level, coolant check, oil leakage awareness
                  </p>
                </div>

                {/* Tyres */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Tyre Inspection Knowledge (0-4)</Label>
                    <span className="font-bold">{results.tyres_score}/4</span>
                  </div>
                  <Slider
                    value={[results.tyres_score]}
                    onValueChange={([value]) => setResults({ ...results, tyres_score: value })}
                    max={4}
                    step={1}
                    disabled={isSubmitted}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tyre wear pattern, sidewall damage, visual air pressure assessment
                  </p>
                </div>

                {/* Lights & Safety */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Lights & Safety Knowledge (0-4)</Label>
                    <span className="font-bold">{results.lights_safety_score}/4</span>
                  </div>
                  <Slider
                    value={[results.lights_safety_score]}
                    onValueChange={([value]) => setResults({ ...results, lights_safety_score: value })}
                    max={4}
                    step={1}
                    disabled={isSubmitted}
                  />
                  <p className="text-xs text-muted-foreground">
                    Headlights, brake lights, indicators, horn
                  </p>
                </div>

                {/* Diagnosis */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Basic Diagnosis Questions (0-4)</Label>
                    <span className="font-bold">{results.diagnosis_score}/4</span>
                  </div>
                  <Slider
                    value={[results.diagnosis_score]}
                    onValueChange={([value]) => setResults({ ...results, diagnosis_score: value })}
                    max={4}
                    step={1}
                    disabled={isSubmitted}
                  />
                  <p className="text-xs text-muted-foreground">
                    Spongy brake response, engine overheating, tyre vibration
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional observations..."
                    value={results.inspection_notes}
                    onChange={(e) => setResults({ ...results, inspection_notes: e.target.value })}
                    disabled={isSubmitted}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Examiner & Actions */}
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Examiner Name *</Label>
            <Input
              placeholder="Enter examiner name"
              value={results.tested_by}
              onChange={(e) => setResults({ ...results, tested_by: e.target.value })}
              disabled={isSubmitted}
            />
          </div>

          {!isSubmitted && (
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => handleSave(false)} disabled={submitting}>
                Save Progress
              </Button>
              <Button className="flex-1" onClick={() => handleSave(true)} disabled={submitting}>
                Submit Results
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DrivingTestSheet;
