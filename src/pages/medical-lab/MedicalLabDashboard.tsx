import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle2,
  Stethoscope,
  AlertCircle,
  ArrowRight
} from "lucide-react";

const MedicalLabDashboard = () => {
  const stats = [
    { label: "Assigned Drivers", value: 32, icon: Users, color: "text-primary" },
    { label: "Reports Submitted", value: 28, icon: FileText, color: "text-success" },
    { label: "Pending Tests", value: 4, icon: Clock, color: "text-warning" },
  ];

  const pendingDrivers = [
    { id: 1, name: "Suresh Verma", vehicleClass: "Heavy Truck", date: "2024-01-15", status: "pending" },
    { id: 2, name: "Deepak Gupta", vehicleClass: "Tanker", date: "2024-01-14", status: "in_progress" },
    { id: 3, name: "Meena Kumari", vehicleClass: "4 Wheeler", date: "2024-01-14", status: "pending" },
    { id: 4, name: "Rajan Mishra", vehicleClass: "LCV", date: "2024-01-13", status: "pending" },
  ];

  return (
    <DashboardLayout role="medical-lab" userName="HealthFirst Diagnostics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Medical Lab Dashboard</h1>
            <p className="text-muted-foreground">Conduct health screenings and submit medical reports.</p>
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

        {/* Pending Medical Tests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Pending Medical Examinations
                </CardTitle>
                <CardDescription>Drivers awaiting health screening</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-info">
                        {driver.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <p className="text-sm text-muted-foreground">{driver.vehicleClass}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={driver.status === "in_progress" ? "info" : "pending"}>
                      {driver.status === "in_progress" ? "In Progress" : "Pending"}
                    </Badge>
                    <Button size="sm">
                      {driver.status === "in_progress" ? "Continue" : "Start Exam"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Components */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Test Components</CardTitle>
            <CardDescription>Required tests for driver fitness certification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: "Vision Test", desc: "Visual acuity & color blindness" },
                { name: "Hearing Test", desc: "Audiometric assessment" },
                { name: "Blood Pressure", desc: "BP measurement & history" },
                { name: "BMI Check", desc: "Height & weight measurement" },
                { name: "Alcohol Screening", desc: "Blood alcohol level test" },
                { name: "Drug Screening", desc: "Narcotics panel test" },
              ].map((test, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="font-medium text-sm">{test.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">{test.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MedicalLabDashboard;
