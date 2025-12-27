import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  FileText,
  CheckCircle,
  XCircle,
  ExternalLink,
  Calendar,
  Car,
  GraduationCap,
  Stethoscope,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Application {
  id: string;
  driver_id: string;
  status: string;
  identity_verified: boolean;
  driving_test_passed: boolean;
  medical_test_passed: boolean;
  education_verified: boolean;
  admin_approved: boolean;
  certificate_number: string | null;
  certificate_expiry_date: string | null;
  certificate_status: string | null;
  renewal_type: string | null;
  skill_grade: string | null;
  created_at: string;
  full_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  aadhaar_number: string | null;
  current_address: string | null;
  permanent_address: string | null;
  licence_number: string | null;
  licence_type: string | null;
  licence_expiry_date: string | null;
  vehicle_classes: string[] | null;
  certification_vehicle_class: string | null;
  certification_purpose: string | null;
  highest_qualification: string | null;
  documents: Record<string, string> | null;
  notes: string | null;
  drivers?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

interface ApplicationDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  onRefresh: () => void;
}

const ApplicationDetailSheet = ({
  open,
  onOpenChange,
  application,
  onRefresh,
}: ApplicationDetailSheetProps) => {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRejectApplication = async () => {
    if (!application) return;

    setLoading(true);
    try {
      await api.post(`/admin/applications/${application.id}/reject`, {
        reason: rejectReason || "Application rejected by admin",
      });

      toast.success("Application rejected successfully");
      setIsRejectDialogOpen(false);
      setRejectReason("");
      onRefresh();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject application");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async () => {
    if (!application) return;

    // Check if all verifications are complete
    if (
      !application.identity_verified ||
      !application.driving_test_passed ||
      !application.medical_test_passed ||
      !application.education_verified
    ) {
      toast.error("Cannot approve: All verifications must be complete");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/admin/applications/${application.id}/approve`);

      toast.success("Application approved! Certificate issued.");
      onRefresh();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve application");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="approved">Approved</Badge>;
      case "rejected":
        return <Badge variant="rejected">Rejected</Badge>;
      case "in_review":
        return <Badge variant="pending">In Review</Badge>;
      default:
        return <Badge variant="pending">Pending</Badge>;
    }
  };

  const openDocument = async (docPath: string) => {
    try {
      // The backend should return a signed URL or redirect to the file
      const response = await api.get(`/applications/documents/${encodeURIComponent(docPath)}`);

      if (response.data?.url) {
        window.open(response.data.url, "_blank");
      } else {
        toast.error("Failed to get document URL");
      }
    } catch (error) {
      console.error("Error opening document:", error);
      toast.error("Failed to open document");
    }
  };

  if (!application) return null;

  const documents = application.documents || {};
  const documentLabels: Record<string, string> = {
    licenceFront: "Driving Licence (Front)",
    licenceBack: "Driving Licence (Back)",
    aadhaarId: "Aadhaar/ID Proof",
    policeClearance: "Police Clearance Certificate",
    photograph: "Passport Photo",
    educationCertificate: "Educational Certificate",
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl p-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle className="flex items-center justify-between">
              <span>Application Details</span>
              {getStatusBadge(application.status)}
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-200px)] px-6">
            <div className="space-y-6 py-4">
              {/* Applicant Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Applicant Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Full Name</p>
                      <p className="font-medium">{application.full_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">
                        {application.date_of_birth
                          ? new Date(application.date_of_birth).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gender</p>
                      <p className="font-medium">{application.gender || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Aadhaar Number</p>
                      <p className="font-medium">{application.aadhaar_number || "N/A"}</p>
                    </div>
                  </div>
                  {application.current_address && (
                    <div>
                      <p className="text-muted-foreground">Current Address</p>
                      <p className="font-medium">{application.current_address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Licence Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Licence Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Licence Number</p>
                      <p className="font-medium">{application.licence_number || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Licence Type</p>
                      <p className="font-medium">{application.licence_type || "N/A"}</p>
                    </div>
                  </div>
                  {application.vehicle_classes && application.vehicle_classes.length > 0 && (
                    <div>
                      <p className="text-muted-foreground">Vehicle Classes</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {application.vehicle_classes.map((vc) => (
                          <Badge key={vc} variant="outline">
                            {vc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Certification Request */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Certification Request
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Vehicle Class</p>
                      <p className="font-medium">
                        {application.certification_vehicle_class || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Purpose</p>
                      <p className="font-medium">
                        {application.certification_purpose || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Highest Qualification</p>
                      <p className="font-medium">
                        {application.highest_qualification || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Verification Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      {application.identity_verified ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span>Identity Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {application.driving_test_passed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span>Driving Test</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {application.medical_test_passed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span>Medical Test</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {application.education_verified ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span>Education Verified</span>
                    </div>
                  </div>
                  {application.skill_grade && (
                    <div className="mt-4">
                      <p className="text-muted-foreground text-sm">Skill Grade</p>
                      <Badge variant="secondary" className="mt-1">
                        {application.skill_grade}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Uploaded Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(documents).length === 0 ? (
                    <p className="text-muted-foreground text-sm">No documents uploaded</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(documents).map(([key, path]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-2 rounded-lg border"
                        >
                          <span className="text-sm">
                            {documentLabels[key] || key}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDocument(path as string)}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              {application.notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{application.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Certificate Info */}
              {application.certificate_number && (
                <Card className={`border-green-200 ${application.certificate_status === 'expired' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200' : 'bg-green-50 dark:bg-green-950/20'}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`w-8 h-8 ${application.certificate_status === 'expired' ? 'text-amber-500' : 'text-green-500'}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Certificate Issued</p>
                          <Badge variant={application.certificate_status === 'expired' ? 'destructive' : 'secondary'}>
                            {application.certificate_status === 'expired' ? 'Expired' : 'Active'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Certificate Number: {application.certificate_number}
                        </p>
                        {application.certificate_expiry_date && (
                          <p className="text-sm text-muted-foreground">
                            Expires: {new Date(application.certificate_expiry_date).toLocaleDateString()}
                            {application.renewal_type && (
                              <span className="ml-2 text-amber-600">
                                (Renewal needed: {application.renewal_type === 'medical' ? 'Medical Test' : 'Driving Test'})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>

          {application.status !== "approved" && application.status !== "rejected" && (
            <SheetFooter className="p-6 pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => setIsRejectDialogOpen(true)}
                disabled={loading}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button onClick={handleApproveApplication} disabled={loading}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve & Issue Certificate
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      {/* Reject Confirmation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this application? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason for Rejection (Optional)</Label>
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectApplication}
              disabled={loading}
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApplicationDetailSheet;
