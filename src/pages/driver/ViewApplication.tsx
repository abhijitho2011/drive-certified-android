import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  Car, 
  FileText, 
  CheckCircle2, 
  Clock,
  MapPin,
  GraduationCap
} from "lucide-react";
import ApplicationSelector from "@/components/driver/ApplicationSelector";

interface Application {
  id: string;
  certificate_number: string | null;
  status: string | null;
  created_at: string | null;
  certification_vehicle_class: string | null;
  certification_purpose: string | null;
  full_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  aadhaar_number: string | null;
  current_address: string | null;
  permanent_address: string | null;
  highest_qualification: string | null;
  education_verified: boolean | null;
  licence_number: string | null;
  issuing_rto: string | null;
  licence_issue_date: string | null;
  licence_expiry_date: string | null;
  licence_type: string | null;
  hazardous_endorsement: boolean | null;
  vehicle_classes: string[] | null;
  test_district: string | null;
  test_state: string | null;
  declaration_signed: boolean | null;
  driving_school_id: string | null;
  medical_lab_id: string | null;
  driving_test_slot: string | null;
  medical_test_slot: string | null;
  identity_verified: boolean | null;
  driving_test_passed: boolean | null;
  medical_test_passed: boolean | null;
  notes: string | null;
}

const ViewApplication = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [drivingSchool, setDrivingSchool] = useState<any>(null);
  const [medicalLab, setMedicalLab] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;

      try {
        const { data: driver } = await supabase
          .from("drivers")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!driver) {
          toast.error("Driver profile not found");
          navigate("/driver");
          return;
        }

        const { data: apps, error } = await supabase
          .from("applications")
          .select("*")
          .eq("driver_id", driver.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (!apps || apps.length === 0) {
          toast.info("No application found. Please start a new application.");
          navigate("/driver/apply");
          return;
        }

        setApplications(apps);
        
        // Auto-select if only one application
        if (apps.length === 1) {
          await selectApplication(apps[0]);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load applications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [user, navigate]);

  const selectApplication = async (app: Application) => {
    setSelectedApplication(app);

    // Fetch driving school and medical lab names
    if (app.driving_school_id) {
      const { data: school } = await supabase
        .from("partners")
        .select("name, address, contact_number")
        .eq("id", app.driving_school_id)
        .single();
      setDrivingSchool(school);
    } else {
      setDrivingSchool(null);
    }

    if (app.medical_lab_id) {
      const { data: lab } = await supabase
        .from("partners")
        .select("name, address, contact_number")
        .eq("id", app.medical_lab_id)
        .single();
      setMedicalLab(lab);
    } else {
      setMedicalLab(null);
    }
  };

  const handleSelectApplication = async (applicationId: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (app) {
      await selectApplication(app);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "in_review":
        return <Badge variant="default">In Review</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show application selector if multiple applications and none selected
  if (applications.length > 1 && !selectedApplication) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate("/driver")} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
            <p className="text-muted-foreground mt-2">Select an application to view details</p>
          </div>

          <ApplicationSelector
            applications={applications}
            onSelect={handleSelectApplication}
            title="Your Applications"
            description="Click on an application to view its details"
          />
        </div>
      </div>
    );
  }

  if (!selectedApplication) {
    return null;
  }

  const application = selectedApplication;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => {
              if (applications.length > 1) {
                setSelectedApplication(null);
              } else {
                navigate("/driver");
              }
            }} 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {applications.length > 1 ? "Back to Applications" : "Back to Dashboard"}
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Application</h1>
              <p className="text-muted-foreground mt-2">
                {application.certificate_number 
                  ? `Certificate: ${application.certificate_number}` 
                  : `Applied on ${new Date(application.created_at || "").toLocaleDateString()}`}
              </p>
            </div>
            {getStatusBadge(application.status || "pending")}
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Basic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{application.full_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{application.date_of_birth || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium capitalize">{application.gender || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aadhaar Number</p>
                <p className="font-medium">{application.aadhaar_number || "-"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Current Address</p>
                <p className="font-medium">{application.current_address || "-"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Permanent Address</p>
                <p className="font-medium">{application.permanent_address || "-"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Educational Qualification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Educational Qualification
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Highest Qualification</p>
                <p className="font-medium capitalize">{application.highest_qualification || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Education Verified</p>
                <p className="font-medium flex items-center gap-2">
                  {application.education_verified ? (
                    <><CheckCircle2 className="h-4 w-4 text-green-500" /> Verified</>
                  ) : (
                    <><Clock className="h-4 w-4 text-yellow-500" /> Pending</>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Licence Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                Licence Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Licence Number</p>
                <p className="font-medium">{application.licence_number || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issuing RTO</p>
                <p className="font-medium">{application.issuing_rto || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issue Date</p>
                <p className="font-medium">{application.licence_issue_date || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiry Date</p>
                <p className="font-medium">{application.licence_expiry_date || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Licence Type</p>
                <p className="font-medium capitalize">{application.licence_type || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hazardous Endorsement</p>
                <p className="font-medium">{application.hazardous_endorsement ? "Yes" : "No"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Authorised Vehicle Classes</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {application.vehicle_classes?.map((vc: string) => (
                    <Badge key={vc} variant="outline">{vc}</Badge>
                  )) || "-"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certification Request */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Certification Request
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Vehicle Classes for Certification</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {application.certification_vehicle_class?.split(',').map((vc: string) => (
                    <Badge key={vc} variant="secondary">{vc.trim()}</Badge>
                  )) || "-"}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Purpose of Certification</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {application.certification_purpose?.split(',').map((p: string) => (
                    <Badge key={p} variant="outline">{p.trim()}</Badge>
                  )) || "-"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Centers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Test Centers
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Test Location</p>
                <p className="font-medium">{application.test_district}, {application.test_state}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Declaration Signed</p>
                <p className="font-medium">{application.declaration_signed ? "Yes" : "No"}</p>
              </div>
              {drivingSchool && (
                <div className="md:col-span-2 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium text-primary mb-2">Driving School</p>
                  <p className="font-medium">{drivingSchool.name}</p>
                  <p className="text-sm text-muted-foreground">{drivingSchool.address}</p>
                  <p className="text-sm text-muted-foreground">{drivingSchool.contact_number}</p>
                  {application.driving_test_slot && (
                    <p className="text-sm mt-2">
                      <span className="text-muted-foreground">Scheduled: </span>
                      {new Date(application.driving_test_slot).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
              {medicalLab && (
                <div className="md:col-span-2 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium text-primary mb-2">Medical Lab</p>
                  <p className="font-medium">{medicalLab.name}</p>
                  <p className="text-sm text-muted-foreground">{medicalLab.address}</p>
                  <p className="text-sm text-muted-foreground">{medicalLab.contact_number}</p>
                  {application.medical_test_slot && (
                    <p className="text-sm mt-2">
                      <span className="text-muted-foreground">Scheduled: </span>
                      {new Date(application.medical_test_slot).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                    application.identity_verified ? "bg-green-500" : "bg-muted"
                  }`}>
                    {application.identity_verified ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm font-medium mt-2">Identity</p>
                  <p className="text-xs text-muted-foreground">
                    {application.identity_verified ? "Verified" : "Pending"}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                    application.education_verified ? "bg-green-500" : "bg-muted"
                  }`}>
                    {application.education_verified ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm font-medium mt-2">Education</p>
                  <p className="text-xs text-muted-foreground">
                    {application.education_verified ? "Verified" : "Pending"}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                    application.driving_test_passed ? "bg-green-500" : "bg-muted"
                  }`}>
                    {application.driving_test_passed ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm font-medium mt-2">Driving Test</p>
                  <p className="text-xs text-muted-foreground">
                    {application.driving_test_passed ? "Passed" : "Pending"}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                    application.medical_test_passed ? "bg-green-500" : "bg-muted"
                  }`}>
                    {application.medical_test_passed ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm font-medium mt-2">Medical Test</p>
                  <p className="text-xs text-muted-foreground">
                    {application.medical_test_passed ? "Passed" : "Pending"}
                  </p>
                </div>
              </div>

              {application.certificate_number && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Certificate Issued</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{application.certificate_number}</p>
                </div>
              )}

              {application.notes && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{application.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Button for Pending Applications */}
          {application.status === "pending" && (
            <div className="flex justify-center">
              <Button onClick={() => navigate("/driver/apply")} size="lg">
                Edit Application
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewApplication;
