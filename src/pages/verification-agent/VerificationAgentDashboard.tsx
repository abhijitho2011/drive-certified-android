import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Users, ClipboardCheck, Clock, CheckCircle2, XCircle, GraduationCap, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Application {
  id: string;
  full_name: string | null;
  highest_qualification: string | null;
  documents: any;
  education_verified: boolean;
  drivers?: { first_name: string; last_name: string } | null;
}

const VerificationAgentDashboard = () => {
  const { user } = useAuth();
  const [partnerData, setPartnerData] = useState<{ id: string; name: string } | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    
    const { data: partner } = await supabase
      .from("partners")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("partner_type", "verification_agent")
      .maybeSingle();
    
    if (partner) {
      setPartnerData(partner);
      const { data: apps } = await supabase
        .from("applications")
        .select(`*, drivers:driver_id (first_name, last_name)`)
        .eq("verification_agent_id", partner.id);
      setApplications(apps || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const pendingVerifications = applications.filter(app => !app.education_verified);
  const completedVerifications = applications.filter(app => app.education_verified);

  const stats = [
    { label: "Assigned Applications", value: applications.length, icon: Users, color: "text-primary" },
    { label: "Verified", value: completedVerifications.length, icon: CheckCircle2, color: "text-success" },
    { label: "Pending", value: pendingVerifications.length, icon: Clock, color: "text-warning" },
  ];

  const handleViewDetails = async (app: Application) => {
    setSelectedApp(app);
    setIsSheetOpen(true);
    
    // Get signed URL for education document
    if (app.documents?.education_certificate) {
      const { data } = await supabase.storage
        .from("application-documents")
        .createSignedUrl(app.documents.education_certificate, 3600);
      setDocumentUrl(data?.signedUrl || null);
    } else {
      setDocumentUrl(null);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    setProcessing(true);
    
    try {
      const { error } = await supabase
        .from("applications")
        .update({ education_verified: true })
        .eq("id", selectedApp.id);

      if (error) throw error;

      toast.success("Education verified successfully");
      setIsSheetOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to verify education");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setProcessing(true);
    
    try {
      const { error } = await supabase
        .from("applications")
        .update({ 
          education_verified: false,
          notes: `Education rejected: ${rejectionReason}`
        })
        .eq("id", selectedApp.id);

      if (error) throw error;

      toast.success("Education verification rejected");
      setIsRejectDialogOpen(false);
      setIsSheetOpen(false);
      setRejectionReason("");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject verification");
    } finally {
      setProcessing(false);
    }
  };

  const getQualificationLabel = (value: string | null) => {
    const qualifications: Record<string, string> = {
      "below_10th": "Below 10th",
      "10th": "10th Pass",
      "12th": "12th Pass",
      "diploma": "Diploma",
      "graduate": "Graduate",
      "post_graduate": "Post Graduate",
    };
    return value ? qualifications[value] || value : "Not specified";
  };

  return (
    <DashboardLayout role="verification-agent" userName={partnerData?.name || "Verification Agent"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Education Verification Portal</h1>
          <p className="text-muted-foreground">Verify driver educational qualifications</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Pending Verifications
            </CardTitle>
            <CardDescription>Education certificates awaiting verification</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingVerifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending verifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingVerifications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {app.drivers?.first_name} {app.drivers?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qualification: {getQualificationLabel(app.highest_qualification)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Pending</Badge>
                      <Button size="sm" onClick={() => handleViewDetails(app)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Verify
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Verified
            </CardTitle>
            <CardDescription>Completed education verifications</CardDescription>
          </CardHeader>
          <CardContent>
            {completedVerifications.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No verified applications yet</p>
            ) : (
              <div className="space-y-3">
                {completedVerifications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <div>
                        <p className="font-medium">
                          {app.drivers?.first_name} {app.drivers?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getQualificationLabel(app.highest_qualification)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">Verified</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Verification Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Education Verification</SheetTitle>
            <SheetDescription>
              Verify the education certificate for {selectedApp?.drivers?.first_name} {selectedApp?.drivers?.last_name}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Applicant Name</p>
              <p className="text-muted-foreground">
                {selectedApp?.drivers?.first_name} {selectedApp?.drivers?.last_name}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Declared Qualification</p>
              <p className="text-muted-foreground">
                {getQualificationLabel(selectedApp?.highest_qualification || null)}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Education Certificate</p>
              {documentUrl ? (
                <div className="space-y-2">
                  <img 
                    src={documentUrl} 
                    alt="Education Certificate" 
                    className="w-full rounded-lg border"
                  />
                  <Button variant="outline" size="sm" asChild>
                    <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                      Open in New Tab
                    </a>
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground italic">No certificate uploaded</p>
              )}
            </div>
          </div>

          <SheetFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="destructive" 
              onClick={() => setIsRejectDialogOpen(true)}
              disabled={processing}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={processing}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {processing ? "Processing..." : "Approve"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this education verification
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing ? "Processing..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default VerificationAgentDashboard;
