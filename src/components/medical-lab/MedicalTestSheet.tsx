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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Heart,
  Droplets,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Application {
  id: string;
  driver_id: string;
  drivers?: {
    first_name: string;
    last_name: string;
  };
  full_name?: string;
  driving_test_passed?: boolean;
}

interface MedicalTestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  partnerId: string;
  onComplete: () => void;
}

interface TestResults {
  // Health Screening
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  blood_pressure_status: string;
  bmi: number | null;
  bmi_status: string;
  heart_rate: number | null;
  heart_rate_status: string;
  vision_left: string;
  vision_right: string;
  vision_status: string;
  color_blindness: boolean;
  hearing_status: string;
  health_notes: string;
  
  // Alcohol Screening
  alcohol_test_method: string;
  alcohol_result: string;
  alcohol_level: number | null;
  
  // Drug Screening
  drug_test_date: string;
  cannabis_result: string;
  opioids_result: string;
  cocaine_result: string;
  amphetamines_result: string;
  methamphetamine_result: string;
  mdma_result: string;
  benzodiazepines_result: string;
  barbiturates_result: string;
  drug_notes: string;
  
  // Overall
  fitness_status: string;
  fitness_validity_months: number;
  tested_by: string;
}

const MedicalTestSheet = ({ open, onOpenChange, application, partnerId, onComplete }: MedicalTestSheetProps) => {
  const [activeTab, setActiveTab] = useState("health");
  const [existingResults, setExistingResults] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [results, setResults] = useState<TestResults>({
    blood_pressure_systolic: null,
    blood_pressure_diastolic: null,
    blood_pressure_status: "",
    bmi: null,
    bmi_status: "",
    heart_rate: null,
    heart_rate_status: "",
    vision_left: "",
    vision_right: "",
    vision_status: "",
    color_blindness: false,
    hearing_status: "",
    health_notes: "",
    alcohol_test_method: "",
    alcohol_result: "",
    alcohol_level: null,
    drug_test_date: new Date().toISOString().split("T")[0],
    cannabis_result: "pending",
    opioids_result: "pending",
    cocaine_result: "pending",
    amphetamines_result: "pending",
    methamphetamine_result: "pending",
    mdma_result: "pending",
    benzodiazepines_result: "pending",
    barbiturates_result: "pending",
    drug_notes: "",
    fitness_status: "pending",
    fitness_validity_months: 12,
    tested_by: "",
  });

  useEffect(() => {
    if (open && application) {
      fetchExistingResults();
    }
  }, [open, application]);

  const fetchExistingResults = async () => {
    if (!application) return;
    
    const { data } = await supabase
      .from("medical_test_results")
      .select("*")
      .eq("application_id", application.id)
      .maybeSingle();
    
    if (data) {
      setExistingResults(data);
      // Always populate state so completed/submitted tests are readable.
      // Inputs will be disabled when `submitted_at` is set.
      setResults({
        blood_pressure_systolic: data.blood_pressure_systolic,
        blood_pressure_diastolic: data.blood_pressure_diastolic,
        blood_pressure_status: data.blood_pressure_status || "",
        bmi: data.bmi,
        bmi_status: data.bmi_status || "",
        heart_rate: data.heart_rate,
        heart_rate_status: data.heart_rate_status || "",
        vision_left: data.vision_left || "",
        vision_right: data.vision_right || "",
        vision_status: data.vision_status || "",
        color_blindness: data.color_blindness || false,
        hearing_status: data.hearing_status || "",
        health_notes: data.health_notes || "",
        alcohol_test_method: data.alcohol_test_method || "",
        alcohol_result: data.alcohol_result || "",
        alcohol_level: data.alcohol_level,
        drug_test_date: data.drug_test_date || new Date().toISOString().split("T")[0],
        cannabis_result: data.cannabis_result || "pending",
        opioids_result: data.opioids_result || "pending",
        cocaine_result: data.cocaine_result || "pending",
        amphetamines_result: data.amphetamines_result || "pending",
        methamphetamine_result: data.methamphetamine_result || "pending",
        mdma_result: data.mdma_result || "pending",
        benzodiazepines_result: data.benzodiazepines_result || "pending",
        barbiturates_result: data.barbiturates_result || "pending",
        drug_notes: data.drug_notes || "",
        fitness_status: data.fitness_status || "pending",
        fitness_validity_months: data.fitness_validity_months || 12,
        tested_by: data.tested_by || "",
      });
    }
  };

  const isHealthPassed = 
    results.blood_pressure_status && 
    results.blood_pressure_status !== "critical" &&
    results.vision_status && 
    results.vision_status !== "failed" &&
    results.hearing_status && 
    results.hearing_status !== "severe_loss";

  const isAlcoholClean = results.alcohol_result === "negative";
  
  const isDrugClean = 
    results.cannabis_result === "negative" &&
    results.opioids_result === "negative" &&
    results.cocaine_result === "negative" &&
    results.amphetamines_result === "negative" &&
    results.methamphetamine_result === "negative" &&
    results.mdma_result === "negative" &&
    results.benzodiazepines_result === "negative" &&
    results.barbiturates_result === "negative";

  const hasDrugPositive = 
    results.cannabis_result === "positive" ||
    results.opioids_result === "positive" ||
    results.cocaine_result === "positive" ||
    results.amphetamines_result === "positive" ||
    results.methamphetamine_result === "positive" ||
    results.mdma_result === "positive" ||
    results.benzodiazepines_result === "positive" ||
    results.barbiturates_result === "positive";

  const handleSave = async (submit = false) => {
    if (!application || !results.tested_by) {
      toast.error("Please enter examiner name");
      return;
    }

    setSubmitting(true);
    try {
      const healthPassed = isHealthPassed;
      const drugPassed = isDrugClean;
      
      let fitnessStatus = results.fitness_status;
      if (submit) {
        if (!healthPassed || hasDrugPositive || results.alcohol_result === "positive") {
          fitnessStatus = "unfit";
        } else if (healthPassed && drugPassed && isAlcoholClean) {
          fitnessStatus = "fit";
        } else {
          fitnessStatus = "conditionally_fit";
        }
      }

      const testData = {
        application_id: application.id,
        medical_lab_id: partnerId,
        blood_pressure_systolic: results.blood_pressure_systolic,
        blood_pressure_diastolic: results.blood_pressure_diastolic,
        blood_pressure_status: results.blood_pressure_status || null,
        bmi: results.bmi,
        bmi_status: results.bmi_status || null,
        heart_rate: results.heart_rate,
        heart_rate_status: results.heart_rate_status || null,
        vision_left: results.vision_left || null,
        vision_right: results.vision_right || null,
        vision_status: results.vision_status || null,
        color_blindness: results.color_blindness,
        hearing_status: results.hearing_status || null,
        health_screening_passed: healthPassed,
        health_notes: results.health_notes || null,
        alcohol_test_method: results.alcohol_test_method || null,
        alcohol_result: results.alcohol_result || null,
        alcohol_level: results.alcohol_level,
        drug_test_date: results.drug_test_date || null,
        cannabis_result: results.cannabis_result,
        opioids_result: results.opioids_result,
        cocaine_result: results.cocaine_result,
        amphetamines_result: results.amphetamines_result,
        methamphetamine_result: results.methamphetamine_result,
        mdma_result: results.mdma_result,
        benzodiazepines_result: results.benzodiazepines_result,
        barbiturates_result: results.barbiturates_result,
        drug_screening_passed: drugPassed,
        drug_notes: results.drug_notes || null,
        fitness_status: fitnessStatus,
        fitness_validity_months: results.fitness_validity_months,
        tested_by: results.tested_by,
        ...(submit && { submitted_at: new Date().toISOString() }),
      };

      if (existingResults) {
        const { error } = await supabase
          .from("medical_test_results")
          .update(testData)
          .eq("id", existingResults.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("medical_test_results")
          .insert(testData);
        if (error) throw error;
      }

      // Update application status
      if (submit) {
        await supabase
          .from("applications")
          .update({
            medical_test_passed: fitnessStatus === "fit" || fitnessStatus === "conditionally_fit",
            status: fitnessStatus === "fit" || fitnessStatus === "conditionally_fit" 
              ? "medical_test_completed" 
              : "medical_test_failed",
          })
          .eq("id", application.id);
      }

      toast.success(submit ? "Medical report submitted" : "Progress saved");
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

  const DrugResultSelect = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <span className="text-sm font-medium">{label}</span>
      <Select value={value} onValueChange={onChange} disabled={isSubmitted}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="negative">Negative</SelectItem>
          <SelectItem value="positive">Positive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Medical Fitness Examination
          </SheetTitle>
          <SheetDescription>
            {application.drivers?.first_name} {application.drivers?.last_name}
          </SheetDescription>
        </SheetHeader>

        {isSubmitted && (
          <div className="my-4 p-4 bg-warning/10 border border-warning rounded-lg">
            <p className="text-sm text-warning font-medium">
              ⚠️ This report has been submitted and cannot be edited.
            </p>
          </div>
        )}

        {!application.driving_test_passed && (
          <div className="my-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Driver has not passed driving test yet. Medical exam can be conducted but certification requires driving test completion.
            </p>
          </div>
        )}

        {/* Status Summary */}
        <Card className="my-4">
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Health Screening</p>
                <Badge variant={isHealthPassed ? "success" : results.blood_pressure_status ? "destructive" : "secondary"}>
                  {isHealthPassed ? "Pass" : results.blood_pressure_status ? "Fail" : "Pending"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Alcohol</p>
                <Badge variant={isAlcoholClean ? "success" : results.alcohol_result === "positive" ? "destructive" : "secondary"}>
                  {isAlcoholClean ? "Negative" : results.alcohol_result === "positive" ? "Positive" : "Pending"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Drug Screening</p>
                <Badge variant={isDrugClean ? "success" : hasDrugPositive ? "destructive" : "secondary"}>
                  {isDrugClean ? "Clean" : hasDrugPositive ? "Detected" : "Pending"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="health" className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Health</span>
            </TabsTrigger>
            <TabsTrigger value="alcohol" className="flex items-center gap-1">
              <Droplets className="w-4 h-4" />
              <span className="hidden sm:inline">Alcohol</span>
            </TabsTrigger>
            <TabsTrigger value="drugs" className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Drugs</span>
            </TabsTrigger>
          </TabsList>

          {/* Health Screening */}
          <TabsContent value="health" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">General Health Screening</CardTitle>
                <CardDescription>Pass/Fail - All parameters must be within acceptable range</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Blood Pressure */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Systolic (mmHg)</Label>
                    <Input
                      type="number"
                      placeholder="120"
                      value={results.blood_pressure_systolic || ""}
                      onChange={(e) => setResults({ ...results, blood_pressure_systolic: e.target.value ? Number(e.target.value) : null })}
                      disabled={isSubmitted}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Diastolic (mmHg)</Label>
                    <Input
                      type="number"
                      placeholder="80"
                      value={results.blood_pressure_diastolic || ""}
                      onChange={(e) => setResults({ ...results, blood_pressure_diastolic: e.target.value ? Number(e.target.value) : null })}
                      disabled={isSubmitted}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>BP Status</Label>
                    <Select value={results.blood_pressure_status} onValueChange={(v) => setResults({ ...results, blood_pressure_status: v })} disabled={isSubmitted}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="elevated">Elevated</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* BMI & Heart Rate */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>BMI</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="22.5"
                      value={results.bmi || ""}
                      onChange={(e) => setResults({ ...results, bmi: e.target.value ? Number(e.target.value) : null })}
                      disabled={isSubmitted}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>BMI Status</Label>
                    <Select value={results.bmi_status} onValueChange={(v) => setResults({ ...results, bmi_status: v })} disabled={isSubmitted}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="underweight">Underweight</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="overweight">Overweight</SelectItem>
                        <SelectItem value="obese">Obese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Heart Rate (bpm)</Label>
                    <Input
                      type="number"
                      placeholder="72"
                      value={results.heart_rate || ""}
                      onChange={(e) => setResults({ ...results, heart_rate: e.target.value ? Number(e.target.value) : null })}
                      disabled={isSubmitted}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>HR Status</Label>
                    <Select value={results.heart_rate_status} onValueChange={(v) => setResults({ ...results, heart_rate_status: v })} disabled={isSubmitted}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="abnormal">Abnormal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Vision */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Vision Left Eye</Label>
                    <Input
                      placeholder="6/6"
                      value={results.vision_left}
                      onChange={(e) => setResults({ ...results, vision_left: e.target.value })}
                      disabled={isSubmitted}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vision Right Eye</Label>
                    <Input
                      placeholder="6/6"
                      value={results.vision_right}
                      onChange={(e) => setResults({ ...results, vision_right: e.target.value })}
                      disabled={isSubmitted}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vision Status</Label>
                    <Select value={results.vision_status} onValueChange={(v) => setResults({ ...results, vision_status: v })} disabled={isSubmitted}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="corrected">Corrected (glasses)</SelectItem>
                        <SelectItem value="impaired">Impaired</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Hearing & Color Blindness */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hearing Status</Label>
                    <Select value={results.hearing_status} onValueChange={(v) => setResults({ ...results, hearing_status: v })} disabled={isSubmitted}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="mild_loss">Mild Loss</SelectItem>
                        <SelectItem value="moderate_loss">Moderate Loss</SelectItem>
                        <SelectItem value="severe_loss">Severe Loss</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Color Blindness</Label>
                    <Select 
                      value={results.color_blindness ? "yes" : "no"} 
                      onValueChange={(v) => setResults({ ...results, color_blindness: v === "yes" })} 
                      disabled={isSubmitted}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Health Notes</Label>
                  <Textarea
                    placeholder="Additional observations..."
                    value={results.health_notes}
                    onChange={(e) => setResults({ ...results, health_notes: e.target.value })}
                    disabled={isSubmitted}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alcohol Screening */}
          <TabsContent value="alcohol">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alcohol Screening</CardTitle>
                <CardDescription>Breath analyzer or blood test</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Test Method</Label>
                    <Select value={results.alcohol_test_method} onValueChange={(v) => setResults({ ...results, alcohol_test_method: v })} disabled={isSubmitted}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="breath">Breath Analyzer</SelectItem>
                        <SelectItem value="blood">Blood Test</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Result</Label>
                    <Select value={results.alcohol_result} onValueChange={(v) => setResults({ ...results, alcohol_result: v })} disabled={isSubmitted}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="negative">Negative</SelectItem>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="chronic_use">Chronic Use Suspected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Alcohol Level (%)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={results.alcohol_level || ""}
                      onChange={(e) => setResults({ ...results, alcohol_level: e.target.value ? Number(e.target.value) : null })}
                      disabled={isSubmitted}
                    />
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isAlcoholClean ? "bg-success/10" : results.alcohol_result === "positive" ? "bg-destructive/10" : "bg-muted/50"}`}>
                  <div className="flex items-center gap-2">
                    {isAlcoholClean ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : results.alcohol_result === "positive" ? (
                      <XCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="font-medium">
                      {isAlcoholClean ? "Alcohol Screening: NEGATIVE" : 
                       results.alcohol_result === "positive" ? "Alcohol Screening: POSITIVE - Certification Denied" :
                       "Alcohol Screening: Pending"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drug Screening */}
          <TabsContent value="drugs">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Drug Screening (30-Day Detection)</CardTitle>
                <CardDescription>Mandatory panel test - All must be negative</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Test Date</Label>
                  <Input
                    type="date"
                    value={results.drug_test_date}
                    onChange={(e) => setResults({ ...results, drug_test_date: e.target.value })}
                    disabled={isSubmitted}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <DrugResultSelect 
                    label="Cannabis (THC)" 
                    value={results.cannabis_result} 
                    onChange={(v) => setResults({ ...results, cannabis_result: v })} 
                  />
                  <DrugResultSelect 
                    label="Opioids" 
                    value={results.opioids_result} 
                    onChange={(v) => setResults({ ...results, opioids_result: v })} 
                  />
                  <DrugResultSelect 
                    label="Cocaine" 
                    value={results.cocaine_result} 
                    onChange={(v) => setResults({ ...results, cocaine_result: v })} 
                  />
                  <DrugResultSelect 
                    label="Amphetamines" 
                    value={results.amphetamines_result} 
                    onChange={(v) => setResults({ ...results, amphetamines_result: v })} 
                  />
                  <DrugResultSelect 
                    label="Methamphetamine" 
                    value={results.methamphetamine_result} 
                    onChange={(v) => setResults({ ...results, methamphetamine_result: v })} 
                  />
                  <DrugResultSelect 
                    label="MDMA / Ecstasy" 
                    value={results.mdma_result} 
                    onChange={(v) => setResults({ ...results, mdma_result: v })} 
                  />
                  <DrugResultSelect 
                    label="Benzodiazepines" 
                    value={results.benzodiazepines_result} 
                    onChange={(v) => setResults({ ...results, benzodiazepines_result: v })} 
                  />
                  <DrugResultSelect 
                    label="Barbiturates" 
                    value={results.barbiturates_result} 
                    onChange={(v) => setResults({ ...results, barbiturates_result: v })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Drug Test Notes (Confidential)</Label>
                  <Textarea
                    placeholder="Additional observations - kept confidential..."
                    value={results.drug_notes}
                    onChange={(e) => setResults({ ...results, drug_notes: e.target.value })}
                    disabled={isSubmitted}
                  />
                </div>

                <div className={`p-4 rounded-lg ${isDrugClean ? "bg-success/10" : hasDrugPositive ? "bg-destructive/10" : "bg-muted/50"}`}>
                  <div className="flex items-center gap-2">
                    {isDrugClean ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : hasDrugPositive ? (
                      <XCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="font-medium">
                      {isDrugClean ? "Drug Screening: CLEAN" : 
                       hasDrugPositive ? "Drug Screening: DETECTED - Certification Denied" :
                       "Drug Screening: Tests Pending"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Final Status & Actions */}
        <div className="mt-6 space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <Label>Medical Fitness Status</Label>
                <Select value={results.fitness_status} onValueChange={(v) => setResults({ ...results, fitness_status: v })} disabled={isSubmitted}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="fit">Fit</SelectItem>
                    <SelectItem value="conditionally_fit">Conditionally Fit</SelectItem>
                    <SelectItem value="unfit">Unfit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

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
                Submit Report
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MedicalTestSheet;
