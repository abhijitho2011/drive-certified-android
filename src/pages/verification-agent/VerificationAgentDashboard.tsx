import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Users, ClipboardCheck, Clock, CheckCircle2, XCircle, GraduationCap, Eye, 
  Phone, MapPin, Calendar, User, FileText, Upload, RefreshCw 
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Application {
  id: string;
  full_name: string | null;
  highest_qualification: string | null;
  documents: any;
  education_verified: boolean;
  date_of_birth: string | null;
  gender: string | null;
  aadhaar_number: string | null;
  current_address: string | null;
  permanent_address: string | null;
  licence_number: string | null;
  licence_type: string | null;
  vehicle_classes: string[] | null;
  notes: string | null;
  drivers?: { 
    first_name: string; 
    last_name: string; 
    phone: string;
    address: string;
    district: string;
    state: string;
    pin_code: string;
  } | null;
}

interface DocumentUrls {
  photograph?: string;
  aadhaarId?: string;
  licenceFront?: string;
  licenceBack?: string;
  policeClearance?: string;
  educationCertificate?: string;
}

const VerificationAgentDashboard = () => {
  const { user } = useAuth();
  const [partnerData, setPartnerData] = useState<{ id: string; name: string } | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isReuploadDialogOpen, setIsReuploadDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reuploadReason, setReuploadReason] = useState("");
  const [documentUrls, setDocumentUrls] = useState<DocumentUrls>({});
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
      const { data: apps, error } = await supabase
        .from("applications")
        .select(`*, drivers:driver_id (first_name, last_name, phone, address, district, state, pin_code)`)
        .not("highest_qualification", "is", null);
      
      if (error) console.error("Error fetching applications:", error);
      setApplications(apps || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const pendingVerifications = applications.filter(app => !app.education_verified);
  const completedVerifications = applications.filter(app => app.education_verified);

  const stats = [
    { label: "Total Applications", value: applications.length, icon: Users, color: "text-primary" },
    { label: "Verified", value: completedVerifications.length, icon: CheckCircle2, color: "text-success" },
    { label: "Pending", value: pendingVerifications.length, icon: Clock, color: "text-warning" },
  ];

  const loadDocumentUrls = async (documents: any) => {
    if (!documents) {
      setDocumentUrls({});
      return;
    }

    const urls: DocumentUrls = {};
    const docKeys = [
      "photograph",
      "aadhaarId",
      "licenceFront",
      "licenceBack",
      "policeClearance",
      "educationCertificate",
    ];

    const errors: string[] = [];

    for (const key of docKeys) {
      const path = documents?.[key];
      if (!path) continue;

      const { data, error } = await supabase.storage
        .from("application-documents")
        .createSignedUrl(path, 3600);

      if (error) {
        console.error(`Failed to load ${key} signed URL`, { key, path, error });
        errors.push(key);
        continue;
      }

      if (data?.signedUrl) {
        urls[key as keyof DocumentUrls] = data.signedUrl;
      }
    }

    if (errors.length) {
      toast.error(`Unable to load: ${errors.join(", ")}. Check document access policies.`);
    }

    setDocumentUrls(urls);
  };

  const handleViewDetails = async (app: Application) => {
    setSelectedApp(app);
    setIsSheetOpen(true);
    await loadDocumentUrls(app.documents);
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
      const existingNotes = selectedApp.notes || "";
      const newNote = `[Education Rejected - ${new Date().toLocaleDateString()}]: ${rejectionReason}`;
      
      const { error } = await supabase
        .from("applications")
        .update({ 
          education_verified: false,
          notes: existingNotes ? `${existingNotes}\n${newNote}` : newNote
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

  const handleRequestReupload = async () => {
    if (!selectedApp || !reuploadReason.trim()) {
      toast.error("Please provide a reason for re-upload request");
      return;
    }
    setProcessing(true);
    
    try {
      const existingNotes = selectedApp.notes || "";
      const newNote = `[Re-upload Requested - ${new Date().toLocaleDateString()}]: ${reuploadReason}`;
      
      const { error } = await supabase
        .from("applications")
        .update({ 
          notes: existingNotes ? `${existingNotes}\n${newNote}` : newNote
        })
        .eq("id", selectedApp.id);

      if (error) throw error;

      toast.success("Re-upload request sent to applicant");
      setIsReuploadDialogOpen(false);
      setReuploadReason("");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to send re-upload request");
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not provided";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const DocumentImage = ({ url, label }: { url?: string; label: string }) => (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {url ? (
        <div className="space-y-2">
          <img src={url} alt={label} className="w-full rounded-lg border max-h-48 object-contain bg-muted" />
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">Open Full Size</a>
          </Button>
        </div>
      ) : (
        <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
          Not uploaded
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout role="verification-agent" userName={partnerData?.name || "Verification Agent"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Education Verification Portal</h1>
          <p className="text-muted-foreground">Verify driver educational qualifications and documents</p>
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
            <CardDescription>Applications awaiting education verification</CardDescription>
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
                          {app.full_name || `${app.drivers?.first_name} ${app.drivers?.last_name}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getQualificationLabel(app.highest_qualification)} • {app.drivers?.phone || "No phone"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Pending</Badge>
                      <Button size="sm" onClick={() => handleViewDetails(app)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
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
                          {app.full_name || `${app.drivers?.first_name} ${app.drivers?.last_name}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getQualificationLabel(app.highest_qualification)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success">Verified</Badge>
                      <Button size="sm" variant="ghost" onClick={() => handleViewDetails(app)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed View Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Application Details</SheetTitle>
            <SheetDescription>
              Complete applicant information for verification
            </SheetDescription>
          </SheetHeader>
          
          <Tabs defaultValue="personal" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="licence">Licence</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-4">
              {/* Photo */}
              {documentUrls.photograph && (
                <div className="flex justify-center">
                  <img 
                    src={documentUrls.photograph} 
                    alt="Applicant Photo" 
                    className="w-32 h-32 rounded-lg object-cover border-2"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" /> Full Name
                  </p>
                  <p className="font-medium">{selectedApp?.full_name || `${selectedApp?.drivers?.first_name} ${selectedApp?.drivers?.last_name}`}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </p>
                  <p className="font-medium">{selectedApp?.drivers?.phone || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Date of Birth
                  </p>
                  <p className="font-medium">{formatDate(selectedApp?.date_of_birth || null)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{selectedApp?.gender || "Not specified"}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-muted-foreground">Aadhaar Number</p>
                  <p className="font-medium">{selectedApp?.aadhaar_number || "Not provided"}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" /> Highest Qualification
                  </p>
                  <Badge variant="outline" className="text-sm">
                    {getQualificationLabel(selectedApp?.highest_qualification || null)}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Addresses
                </p>
                <div className="space-y-2">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Current Address</p>
                    <p className="text-sm">{selectedApp?.current_address || "Not provided"}</p>
                    {selectedApp?.drivers && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedApp.drivers.district}, {selectedApp.drivers.state} - {selectedApp.drivers.pin_code}
                      </p>
                    )}
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Permanent Address</p>
                    <p className="text-sm">{selectedApp?.permanent_address || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {selectedApp?.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Notes</p>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{selectedApp.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <DocumentImage url={documentUrls.photograph} label="Passport Photo" />
                <DocumentImage url={documentUrls.aadhaarId} label="Aadhaar Card" />
                <DocumentImage url={documentUrls.educationCertificate} label="Education Certificate" />
                <DocumentImage url={documentUrls.policeClearance} label="Police Clearance" />
              </div>

              <div className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsReuploadDialogOpen(true)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Request Document Re-upload
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="licence" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Licence Number</p>
                  <p className="font-medium">{selectedApp?.licence_number || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Licence Type</p>
                  <p className="font-medium capitalize">{selectedApp?.licence_type || "Not specified"}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-muted-foreground">Vehicle Classes</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedApp?.vehicle_classes?.length ? (
                      selectedApp.vehicle_classes.map((vc, i) => (
                        <Badge key={i} variant="secondary">{vc}</Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Not specified</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <DocumentImage url={documentUrls.licenceFront} label="Licence Front" />
                <DocumentImage url={documentUrls.licenceBack} label="Licence Back" />
              </div>
            </TabsContent>
          </Tabs>

          <SheetFooter className="flex-col sm:flex-row gap-2 mt-6 pt-4 border-t">
            {!selectedApp?.education_verified && (
              <>
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
                  {processing ? "Processing..." : "Approve Education"}
                </Button>
              </>
            )}
            {selectedApp?.education_verified && (
              <Badge variant="success" className="text-base py-2 px-4">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Education Verified
              </Badge>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Education Verification</DialogTitle>
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

      {/* Re-upload Request Dialog */}
      <Dialog open={isReuploadDialogOpen} onOpenChange={setIsReuploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Document Re-upload</DialogTitle>
            <DialogDescription>
              Specify which documents need to be re-uploaded and why
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="e.g., Education certificate is blurry, please upload a clear image..."
              value={reuploadReason}
              onChange={(e) => setReuploadReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReuploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestReupload} disabled={processing}>
              <Upload className="w-4 h-4 mr-2" />
              {processing ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default VerificationAgentDashboard;
