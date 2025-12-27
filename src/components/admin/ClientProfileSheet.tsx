import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Phone, MapPin, FileText, Award, Eye, Ban } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Driver {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  address: string;
  district: string;
  state: string;
  pin_code: string;
  phone: string;
  status: string;
  created_at: string;
}

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
  skill_grade: string | null;
  created_at: string;
  full_name: string | null;
  certification_vehicle_class: string | null;
  certification_purpose: string | null;
  documents: Record<string, string> | null;
}

interface ClientProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver | null;
  onViewApplication: (application: Application) => void;
  onRefresh: () => void;
}

const ClientProfileSheet = ({
  open,
  onOpenChange,
  driver,
  onViewApplication,
  onRefresh,
}: ClientProfileSheetProps) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (driver && open) {
      fetchDriverApplications();
    }
  }, [driver, open]);

  const fetchDriverApplications = async () => {
    if (!driver) return;
    setLoading(true);
    try {
      const response = await api.get(`/admin/drivers/${driver.id}/applications`);
      setApplications(response.data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlacklistDriver = async () => {
    if (!driver) return;

    const newStatus = driver.status === "blacklisted" ? "active" : "blacklisted";

    try {
      await api.patch(`/admin/drivers/${driver.id}/status`, { status: newStatus });

      toast.success(
        newStatus === "blacklisted"
          ? "Driver blacklisted successfully"
          : "Driver restored successfully"
      );
      onRefresh();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update driver status");
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

  if (!driver) return null;

  const approvedApplications = applications.filter(
    (app) => app.status === "approved" && app.certificate_number
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Client Profile</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Driver Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {driver.first_name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {driver.first_name} {driver.last_name}
              </h3>
              <Badge
                variant={
                  driver.status === "active"
                    ? "approved"
                    : driver.status === "blacklisted"
                      ? "rejected"
                      : "pending"
                }
              >
                {driver.status}
              </Badge>
            </div>
            <Button
              variant={driver.status === "blacklisted" ? "outline" : "destructive"}
              size="sm"
              onClick={handleBlacklistDriver}
            >
              <Ban className="w-4 h-4 mr-2" />
              {driver.status === "blacklisted" ? "Restore" : "Blacklist"}
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{driver.phone}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p>{driver.address}</p>
                <p className="text-sm text-muted-foreground">
                  {driver.district}, {driver.state} - {driver.pin_code}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs for Applications and Certificates */}
          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="applications" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Applications ({applications.length})
              </TabsTrigger>
              <TabsTrigger value="certificates" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Certificates ({approvedApplications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="applications" className="space-y-4 mt-4">
              {loading ? (
                <p className="text-center text-muted-foreground py-4">Loading...</p>
              ) : applications.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No applications found.
                </p>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <Card key={app.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {app.certification_vehicle_class || "N/A"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(app.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(app.status)}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onViewApplication(app)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Identity:</span>
                            <Badge
                              variant={app.identity_verified ? "approved" : "pending"}
                              className="text-xs"
                            >
                              {app.identity_verified ? "Verified" : "Pending"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Driving:</span>
                            <Badge
                              variant={app.driving_test_passed ? "approved" : "pending"}
                              className="text-xs"
                            >
                              {app.driving_test_passed ? "Passed" : "Pending"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Medical:</span>
                            <Badge
                              variant={app.medical_test_passed ? "approved" : "pending"}
                              className="text-xs"
                            >
                              {app.medical_test_passed ? "Passed" : "Pending"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Education:</span>
                            <Badge
                              variant={app.education_verified ? "approved" : "pending"}
                              className="text-xs"
                            >
                              {app.education_verified ? "Verified" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                        {app.skill_grade && (
                          <p className="mt-2 text-sm">
                            <span className="text-muted-foreground">Skill Grade:</span>{" "}
                            <Badge variant="secondary">{app.skill_grade}</Badge>
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="certificates" className="space-y-4 mt-4">
              {approvedApplications.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No certificates issued yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {approvedApplications.map((app) => (
                    <Card key={app.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Award className="w-5 h-5 text-primary" />
                              <p className="font-medium">
                                Certificate #{app.certificate_number}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Vehicle Class: {app.certification_vehicle_class}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Skill Grade: {app.skill_grade || "N/A"}
                            </p>
                          </div>
                          <Badge variant="approved">Certified</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ClientProfileSheet;
