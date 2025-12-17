import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VerificationResult {
  found: boolean;
  valid: boolean;
  certificateNo?: string;
  driverName?: string;
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
}

interface SingleVerificationProps {
  dataUserId: string;
  companyName: string;
  onVerificationComplete: (result: VerificationResult, query: string) => void;
}

const SingleVerification = ({ dataUserId, companyName, onVerificationComplete }: SingleVerificationProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"certificate" | "driver_id">("certificate");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setResult(null);
    
    let query = supabase
      .from("applications")
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
        renewal_type,
        medical_test_passed,
        driving_test_passed,
        drivers:driver_id (id, first_name, last_name),
        medical_test_results (fitness_status, drug_screening_passed)
      `);

    if (searchType === "certificate") {
      query = query.eq("certificate_number", searchQuery.trim().toUpperCase());
    } else {
      query = query.eq("driver_id", searchQuery.trim());
    }

    const { data: app } = await query.maybeSingle();
    
    let verificationResult: VerificationResult;
    
    if (app && app.certificate_number) {
      const isExpired = app.certificate_expiry_date && new Date(app.certificate_expiry_date) < new Date();
      const isExpiringSoon = app.certificate_expiry_date && 
        new Date(app.certificate_expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
        !isExpired;
      
      const medicalResults = Array.isArray(app.medical_test_results) ? app.medical_test_results[0] : app.medical_test_results;
      const fitnessStatus = medicalResults?.fitness_status || "Unknown";
      const isConditionalFit = fitnessStatus === "conditionally_fit";
      
      // Determine recommendation
      let recommendation: "eligible" | "eligible_conditions" | "not_eligible" = "eligible";
      if (isExpired || app.certificate_status === "expired" || app.certificate_status === "revoked") {
        recommendation = "not_eligible";
      } else if (isExpiringSoon || isConditionalFit) {
        recommendation = "eligible_conditions";
      }

      verificationResult = {
        found: true,
        valid: app.admin_approved && app.status === "approved" && !isExpired && app.certificate_status === "active",
        certificateNo: app.certificate_number,
        driverName: `${app.drivers?.first_name} ${app.drivers?.last_name}`,
        status: app.status,
        vehicleClass: app.certification_vehicle_class || (app.vehicle_classes as string[])?.join(", ") || "N/A",
        skillGrade: app.skill_grade || "N/A",
        medicalFitness: fitnessStatus,
        expiryDate: app.certificate_expiry_date,
        certificateStatus: app.certificate_status,
        renewalType: app.renewal_type,
        isExpiringSoon,
        isConditionalFit,
        recommendation,
        applicationId: app.id
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
                <p className="text-sm text-muted-foreground">Search by certificate number or driver ID</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={searchType === "certificate" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchType("certificate")}
              >
                Certificate Number
              </Button>
              <Button 
                variant={searchType === "driver_id" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchType("driver_id")}
              >
                Driver ID
              </Button>
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={searchType === "certificate" ? "Enter certificate number (e.g., MOTRACT-001)" : "Enter driver ID (UUID)"}
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

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Driver Name</p>
                        <p className="font-medium">{result.driverName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Car className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Vehicle Class Eligibility</p>
                        <p className="font-medium">{result.vehicleClass}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Skill Grade</p>
                        <p className="font-medium">{result.skillGrade}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Activity className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Medical Fitness</p>
                        <p className="font-medium capitalize">{result.medicalFitness?.replace("_", " ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Expiry Date</p>
                        <p className="font-medium">
                          {result.expiryDate 
                            ? new Date(result.expiryDate).toLocaleDateString() 
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Renewal Type</p>
                        <p className="font-medium capitalize">{result.renewalType || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-destructive" />
                  <div>
                    <p className="font-semibold text-lg">Certificate Not Found</p>
                    <p className="text-muted-foreground">
                      No certificate found with {searchType === "certificate" ? "number" : "driver ID"}: {searchQuery}
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