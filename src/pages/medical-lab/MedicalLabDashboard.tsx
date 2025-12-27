import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileText, Clock, CheckCircle2, Stethoscope } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import MedicalTestSheet from "@/components/medical-lab/MedicalTestSheet";

interface Application {
  id: string;
  driver_id: string;
  drivers?: {
    first_name: string;
    last_name: string;
  } | null;
  medical_test_passed: boolean;
  medical_test_slot?: string;
  status: string;
}

const MedicalLabDashboard = () => {
  const { user } = useAuth();
  const [partnerData, setPartnerData] = useState<{ id: string; name: string } | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isTestOpen, setIsTestOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      const partnerRes = await api.get(`/partners/user/${user.id}`);
      const partner = partnerRes.data;

      if (partner && partner.partner_type === 'medical_lab') {
        setPartnerData(partner);

        const appsRes = await api.get(`/applications/medical-lab/${partner.id}`);
        setApplications(appsRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching medical lab data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
                          Scheduled: {app.medical_test_slot ? new Date(app.medical_test_slot).toLocaleDateString() : "Not scheduled"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Pending</Badge>
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
                    <div className="flex items-center gap-3">
                      <Badge variant="success">Completed</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setSelectedApp(app); setIsTestOpen(true); }}
                      >
                        View Report
                      </Button>
                    </div>
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
