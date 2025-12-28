import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Award,
  Car
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Application {
  id: string;
  certification_vehicle_class: string | null;
  status: string | null;
  certificate_number: string | null;
  certificate_status: string | null;
  skill_grade: string | null;
  created_at: string | null;
  driving_test_passed: boolean | null;
  medical_test_passed: boolean | null;
  admin_approved: boolean | null;
}

const MyApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [driverData, setDriverData] = useState<{ first_name: string; last_name: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);

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
        
        const { data: apps } = await supabase
          .from("applications")
          .select("id, certification_vehicle_class, status, certificate_number, certificate_status, skill_grade, created_at, driving_test_passed, medical_test_passed, admin_approved")
          .eq("driver_id", driver.id)
          .order("created_at", { ascending: false });
        
        setApplications(apps || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const userName = driverData 
    ? `${driverData.first_name} ${driverData.last_name}` 
    : "Driver";

  const getStatusBadge = (app: Application) => {
    if (app.certificate_number && app.certificate_status === 'active') {
      return <Badge className="bg-green-500">Certified</Badge>;
    }
    if (app.status === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (app.status === 'approved') {
      return <Badge className="bg-blue-500">Approved</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const getProgressIndicator = (app: Application) => {
    const steps = [
      { done: true, label: "Submitted" },
      { done: app.driving_test_passed, label: "Driving Test" },
      { done: app.medical_test_passed, label: "Medical Test" },
      { done: app.admin_approved, label: "Admin Approved" },
      { done: !!app.certificate_number, label: "Certified" },
    ];
    const completed = steps.filter(s => s.done).length;
    return { steps, completed, total: steps.length };
  };

  // Get certified vehicle classes to exclude from new applications
  const certifiedClasses = applications
    .filter(app => app.certificate_number && app.certificate_status === 'active')
    .map(app => app.certification_vehicle_class)
    .filter(Boolean);

  const pendingClasses = applications
    .filter(app => !app.certificate_number && app.status !== 'rejected')
    .map(app => app.certification_vehicle_class)
    .filter(Boolean);

  const canApplyForNew = true; // Always allow, we'll filter classes in the form

  if (loading) {
    return (
      <DashboardLayout role="driver" userName="Loading...">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="driver" userName={userName}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Applications</h1>
            <p className="text-muted-foreground">View and manage all your certification applications</p>
          </div>
          {canApplyForNew && (
            <Button onClick={() => navigate("/driver/apply/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Apply for New Class
            </Button>
          )}
        </div>

        {applications.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start your journey to become a certified driver
              </p>
              <Button onClick={() => navigate("/driver/apply")}>
                Start First Application
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => {
              const progress = getProgressIndicator(app);
              return (
                <Card key={app.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          {app.certificate_number ? (
                            <Award className="w-5 h-5 text-primary" />
                          ) : (
                            <Car className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {app.certification_vehicle_class || "Vehicle Class Not Set"}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Applied: {app.created_at ? new Date(app.created_at).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(app)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      {progress.steps.map((step, idx) => (
                        <div key={idx} className="flex items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              step.done
                                ? "bg-green-500 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          {idx < progress.steps.length - 1 && (
                            <div className={`w-8 h-0.5 ${step.done ? "bg-green-500" : "bg-muted"}`} />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm">
                        {app.skill_grade && (
                          <span className="text-muted-foreground">
                            Grade: <span className="font-medium text-foreground">{app.skill_grade}</span>
                          </span>
                        )}
                        {app.certificate_number && (
                          <span className="text-muted-foreground">
                            Cert: <span className="font-medium text-foreground">{app.certificate_number}</span>
                          </span>
                        )}
                      </div>
                      <Link to={`/driver/application/${app.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary Cards */}
        {applications.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {applications.filter(a => a.certificate_number).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Active Certificates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {applications.filter(a => a.status === 'pending').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending Applications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Car className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{applications.length}</p>
                    <p className="text-sm text-muted-foreground">Total Applications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyApplications;
