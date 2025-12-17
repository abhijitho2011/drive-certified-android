import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ClipboardCheck, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  GraduationCap
} from "lucide-react";

const DrivingSchoolDashboard = () => {
  const stats = [
    { label: "Assigned Drivers", value: 24, icon: Users, color: "text-primary" },
    { label: "Tests Completed", value: 18, icon: ClipboardCheck, color: "text-success" },
    { label: "Pending Tests", value: 6, icon: Clock, color: "text-warning" },
  ];

  const verificationChecklist = [
    { label: "Physical Presence Verified", key: "presence" },
    { label: "Original DL Verified", key: "dl" },
    { label: "Police Clearance Checked", key: "police" },
    { label: "Educational Qualification Verified", key: "education" },
  ];

  const pendingDrivers = [
    { id: 1, name: "Rahul Kumar", vehicleClass: "4 Wheeler", date: "2024-01-15", status: "pending", educationVerified: false },
    { id: 2, name: "Amit Singh", vehicleClass: "Heavy Truck", date: "2024-01-14", status: "pending", educationVerified: true },
    { id: 3, name: "Priya Sharma", vehicleClass: "2 Wheeler", date: "2024-01-14", status: "scheduled", educationVerified: true },
    { id: 4, name: "Vikram Patel", vehicleClass: "LCV", date: "2024-01-13", status: "pending", educationVerified: false },
  ];

  return (
    <DashboardLayout role="driving-school" userName="ABC Driving School">
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
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {driver.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <p className="text-sm text-muted-foreground">{driver.vehicleClass}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1" title={driver.educationVerified ? "Education Verified" : "Education Pending"}>
                      <GraduationCap className={`w-4 h-4 ${driver.educationVerified ? "text-success" : "text-warning"}`} />
                    </div>
                    <Badge variant={driver.status === "scheduled" ? "info" : "pending"}>
                      {driver.status === "scheduled" ? "Scheduled" : "Pending"}
                    </Badge>
                    <Button size="sm">Start Test</Button>
                  </div>
                </div>
              ))}
            </div>
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
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Pending Submissions</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    You have 3 completed tests that need to be submitted for review.
                  </p>
                  <Button size="sm" variant="warning">Submit Now</Button>
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
                    18 skill tests completed this month. Great progress!
                  </p>
                  <Button size="sm" variant="outline">View History</Button>
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
