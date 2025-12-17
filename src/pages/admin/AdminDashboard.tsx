import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  Award, 
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp
} from "lucide-react";

const AdminDashboard = () => {
  const stats = [
    { label: "Total Applications", value: 1247, icon: FileText, change: "+12%", color: "text-primary" },
    { label: "Pending Review", value: 89, icon: Clock, change: "-5%", color: "text-warning" },
    { label: "Certificates Issued", value: 982, icon: Award, change: "+18%", color: "text-success" },
    { label: "Active Partners", value: 156, icon: Building2, change: "+3%", color: "text-info" },
  ];

  const recentApplications = [
    { id: 1, name: "Rahul Kumar", vehicleClass: "4 Wheeler", status: "admin_review", date: "2024-01-15" },
    { id: 2, name: "Amit Singh", vehicleClass: "Heavy Truck", status: "admin_review", date: "2024-01-14" },
    { id: 3, name: "Priya Sharma", vehicleClass: "2 Wheeler", status: "approved", date: "2024-01-14" },
    { id: 4, name: "Vikram Patel", vehicleClass: "LCV", status: "rejected", date: "2024-01-13" },
    { id: 5, name: "Neha Gupta", vehicleClass: "3 Wheeler", status: "admin_review", date: "2024-01-13" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="approved">Approved</Badge>;
      case "rejected":
        return <Badge variant="rejected">Rejected</Badge>;
      default:
        return <Badge variant="pending">Pending Review</Badge>;
    }
  };

  return (
    <DashboardLayout role="admin" userName="Super Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage applications, partners, and certificates.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Building2 className="w-4 h-4 mr-2" />
              Add Partner
            </Button>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Review Applications
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-success">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Latest driver certification requests</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {app.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{app.name}</p>
                        <p className="text-sm text-muted-foreground">{app.vehicleClass} • {app.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(app.status)}
                      {app.status === "admin_review" && (
                        <Button size="sm">Review</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Approval Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success mb-1">87%</div>
                <p className="text-sm text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <span className="text-2xl font-bold">45</span>
                </div>
                <p className="text-sm text-muted-foreground">Certificates expiring in 30 days</p>
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  Send Reminders
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Partner Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Driving Schools</span>
                  <span className="font-medium">78</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Medical Labs</span>
                  <span className="font-medium">52</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Companies</span>
                  <span className="font-medium">26</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
