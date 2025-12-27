import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ClipboardCheck, Clock, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import DrivingTestSheet from "@/components/driving-school/DrivingTestSheet";

interface Application {
  id: string;
  driver_id: string;
  drivers?: {
    first_name: string;
    last_name: string;
  } | null;
  status: string;
  driving_test_passed: boolean;
  skill_grade?: string | null;
  licence_number?: string;
  identity_verified?: boolean;
}

const DrivingSchoolDashboard = () => {
  const { user } = useAuth();
  const [partnerData, setPartnerData] = useState<{ id: string; name: string } | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [retesting, setRetesting] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      const partnerRes = await api.get(`/partners/user/${user.id}`);
      const partner = partnerRes.data;

      if (partner && partner.partner_type === 'driving_school') {
        setPartnerData(partner);

        const appsRes = await api.get(`/applications/driving-school/${partner.id}`);
        setApplications(appsRes.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching driving school data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Pending: not yet tested (no result or status is pending)
  const pendingTests = applications.filter(app =>
    !app.driving_test_passed && app.status !== 'driving_test_failed'
  );
  // Failed: tested but failed
  const failedTests = applications.filter(app =>
    app.status === 'driving_test_failed' || (!app.driving_test_passed && app.skill_grade === 'Fail')
  );
  // Passed: completed and passed
  const completedTests = applications.filter(app => app.driving_test_passed);

  const stats = [
    { label: "Assigned Drivers", value: applications.length, icon: Users, color: "text-primary" },
    { label: "Tests Completed", value: completedTests.length, icon: ClipboardCheck, color: "text-success" },
    { label: "Pending Tests", value: pendingTests.length, icon: Clock, color: "text-warning" },
    { label: "Failed Tests", value: failedTests.length, icon: XCircle, color: "text-destructive" },
  ];

  const handleRetest = async (app: Application) => {
    setRetesting(app.id);
    try {
      await api.post(`/driving-test/reset/${app.id}`);
      toast.success("Ready for retest. Click 'Start Test' to begin.");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset test");
    } finally {
      setRetesting(null);
    }
  };

  return (
    <DashboardLayout role="driving-school" userName={partnerData?.name || "Driving School"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Driving School Dashboard</h1>
          <p className="text-muted-foreground">Conduct driver skill assessments and evaluations.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
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
            <CardTitle>Pending Skill Tests</CardTitle>
            <CardDescription>Drivers awaiting evaluation</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingTests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending skill tests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTests.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {app.drivers?.first_name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{app.drivers?.first_name} {app.drivers?.last_name}</p>
                        <p className="text-sm text-muted-foreground">Licence: {app.licence_number || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={app.identity_verified ? "success" : "secondary"}>
                        {app.identity_verified ? "ID Verified" : "Pending"}
                      </Badge>
                      <Button size="sm" onClick={() => { setSelectedApp(app); setIsTestOpen(true); }}>
                        Start Test
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Failed Tests Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Failed Tests
            </CardTitle>
            <CardDescription>Drivers who did not pass - eligible for retest</CardDescription>
          </CardHeader>
          <CardContent>
            {failedTests.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No failed tests</p>
            ) : (
              <div className="space-y-3">
                {failedTests.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium">{app.drivers?.first_name} {app.drivers?.last_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Grade: {app.skill_grade || "Fail"} | Licence: {app.licence_number || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">Failed</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetest(app)}
                        disabled={retesting === app.id}
                      >
                        <RotateCcw className={`w-4 h-4 mr-2 ${retesting === app.id ? 'animate-spin' : ''}`} />
                        {retesting === app.id ? 'Resetting...' : 'Retest'}
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
            <CardTitle>Completed Tests</CardTitle>
            <CardDescription>Recently evaluated drivers</CardDescription>
          </CardHeader>
          <CardContent>
            {completedTests.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No completed tests yet</p>
            ) : (
              <div className="space-y-3">
                {completedTests.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <div>
                        <p className="font-medium">{app.drivers?.first_name} {app.drivers?.last_name}</p>
                        <p className="text-sm text-muted-foreground">Grade: {app.skill_grade || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="success">Passed</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setSelectedApp(app); setIsTestOpen(true); }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DrivingTestSheet
        open={isTestOpen}
        onOpenChange={setIsTestOpen}
        application={selectedApp}
        partnerId={partnerData?.id || ""}
        onComplete={fetchData}
      />
    </DashboardLayout>
  );
};

export default DrivingSchoolDashboard;
