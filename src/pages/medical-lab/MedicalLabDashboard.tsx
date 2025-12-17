import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileText, Clock, CheckCircle2, Stethoscope } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import MedicalTestSheet from "@/components/medical-lab/MedicalTestSheet";

const MedicalLabDashboard = () => {
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
      .eq("partner_type", "medical_lab")
      .maybeSingle();
    
    if (partner) {
      setPartnerData(partner);
      const { data: apps } = await supabase
        .from("applications")
        .select(`*, drivers:driver_id (first_name, last_name)`)
        .eq("medical_lab_id", partner.id);
      setApplications(apps || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const pendingTests = applications.filter(app => !app.medical_test_passed);
  const completedTests = applications.filter(app => app.medical_test_passed);

  const stats = [
    { label: "Assigned Drivers", value: applications.length, icon: Users, color: "text-primary" },
    { label: "Reports Submitted", value: completedTests.length, icon: FileText, color: "text-success" },
    { label: "Pending Tests", value: pendingTests.length, icon: Clock, color: "text-warning" },
  ];

  return (
    <DashboardLayout role="medical-lab" userName={partnerData?.name || "Medical Lab"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Medical Lab Dashboard</h1>
          <p className="text-muted-foreground">Conduct health screenings and substance tests.</p>
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
              <Stethoscope className="w-5 h-5" />
              Pending Medical Examinations
            </CardTitle>
            <CardDescription>Drivers awaiting health screening</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingTests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending medical examinations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTests.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-info">
                          {app.drivers?.first_name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{app.drivers?.first_name} {app.drivers?.last_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Driving Test: {app.driving_test_passed ? "Passed" : "Pending"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={app.driving_test_passed ? "success" : "secondary"}>
                        {app.driving_test_passed ? "Ready" : "Awaiting Driving Test"}
                      </Badge>
                      <Button size="sm" onClick={() => { setSelectedApp(app); setIsTestOpen(true); }}>
                        Start Exam
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
            <CardTitle>Completed Reports</CardTitle>
            <CardDescription>Recently examined drivers</CardDescription>
          </CardHeader>
          <CardContent>
            {completedTests.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No completed reports yet</p>
            ) : (
              <div className="space-y-3">
                {completedTests.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <p className="font-medium">{app.drivers?.first_name} {app.drivers?.last_name}</p>
                    </div>
                    <Badge variant="success">Fit</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <MedicalTestSheet
        open={isTestOpen}
        onOpenChange={setIsTestOpen}
        application={selectedApp}
        partnerId={partnerData?.id || ""}
        onComplete={fetchData}
      />
    </DashboardLayout>
  );
};

export default MedicalLabDashboard;
