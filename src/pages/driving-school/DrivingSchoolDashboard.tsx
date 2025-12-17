import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ClipboardCheck, 
  Clock, 
  CheckCircle2,
  FileText,
  ArrowRight,
  GraduationCap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const DrivingSchoolDashboard = () => {
  const { user } = useAuth();
  const [partnerData, setPartnerData] = useState<{ name: string } | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      // Fetch partner data
      const { data: partner } = await supabase
        .from("partners")
        .select("id, name")
        .eq("user_id", user.id)
        .eq("partner_type", "driving_school")
        .maybeSingle();
      
      if (partner) {
        setPartnerData(partner);
        
        // Fetch assigned applications
        const { data: apps } = await supabase
          .from("applications")
          .select(`
            *,
            drivers:driver_id (first_name, last_name)
          `)
          .eq("driving_school_id", partner.id);
        
        setApplications(apps || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const pendingTests = applications.filter(app => !app.driving_test_passed);
  const completedTests = applications.filter(app => app.driving_test_passed);

  const stats = [
    { label: "Assigned Drivers", value: applications.length, icon: Users, color: "text-primary" },
    { label: "Tests Completed", value: completedTests.length, icon: ClipboardCheck, color: "text-success" },
    { label: "Pending Tests", value: pendingTests.length, icon: Clock, color: "text-warning" },
  ];

  const verificationChecklist = [
    { label: "Physical Presence Verified", key: "presence" },
    { label: "Original DL Verified", key: "dl" },
    { label: "Police Clearance Checked", key: "police" },
    { label: "Educational Qualification Verified", key: "education" },
  ];

  return (
    <DashboardLayout role="driving-school" userName={partnerData?.name || "Driving School"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Driving School Dashboard</h1>
            <p className="text-muted-foreground">Manage driver evaluations and skill assessments.</p>
          </div>
        </div>

        {/* Stats */}
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

        {/* Pending Tests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pending Skill Tests</CardTitle>
                <CardDescription>Drivers awaiting evaluation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pendingTests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending skill tests</p>
                <p className="text-sm">Drivers will appear here when assigned to you</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTests.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {app.drivers?.first_name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {app.drivers?.first_name} {app.drivers?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Status: {app.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1" title={app.education_verified ? "Education Verified" : "Education Pending"}>
                        <GraduationCap className={`w-4 h-4 ${app.education_verified ? "text-success" : "text-warning"}`} />
                      </div>
                      <Badge variant={app.identity_verified ? "success" : "secondary"}>
                        {app.identity_verified ? "ID Verified" : "Pending"}
                      </Badge>
                      <Button size="sm">Start Test</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Checklist Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              Verification Checklist
            </CardTitle>
            <CardDescription>Items to verify for each driver before skill test</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {verificationChecklist.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Pending Submissions</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {completedTests.length > 0 
                      ? `You have ${completedTests.length} completed tests.`
                      : "No tests completed yet."}
                  </p>
                  <Button size="sm" variant="outline">View History</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Recently Completed</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {completedTests.length} skill tests completed.
                  </p>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DrivingSchoolDashboard;
