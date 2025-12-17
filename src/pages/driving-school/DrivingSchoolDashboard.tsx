import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ClipboardCheck, Clock, CheckCircle2, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DrivingTestSheet from "@/components/driving-school/DrivingTestSheet";

const DrivingSchoolDashboard = () => {
  const { user } = useAuth();
  const [partnerData, setPartnerData] = useState<{ id: string; name: string } | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isTestOpen, setIsTestOpen] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    
    const { data: partner } = await supabase
      .from("partners")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("partner_type", "driving_school")
      .maybeSingle();
    
    if (partner) {
      setPartnerData(partner);
      const { data: apps } = await supabase
        .from("applications")
        .select(`*, drivers:driver_id (first_name, last_name)`)
        .eq("driving_school_id", partner.id);
      setApplications(apps || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const pendingTests = applications.filter(app => !app.driving_test_passed);
  const completedTests = applications.filter(app => app.driving_test_passed);

  const stats = [
    { label: "Assigned Drivers", value: applications.length, icon: Users, color: "text-primary" },
    { label: "Tests Completed", value: completedTests.length, icon: ClipboardCheck, color: "text-success" },
    { label: "Pending Tests", value: pendingTests.length, icon: Clock, color: "text-warning" },
  ];

  return (
    <DashboardLayout role="driving-school" userName={partnerData?.name || "Driving School"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Driving School Dashboard</h1>
          <p className="text-muted-foreground">Conduct driver skill assessments and evaluations.</p>
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
                    <Badge variant="success">Passed</Badge>
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
