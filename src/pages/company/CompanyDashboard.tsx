import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  FileText, 
  Clock, 
  CheckCircle2,
  XCircle,
  Download,
  QrCode,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { useState } from "react";

const CompanyDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    { label: "Total Verifications", value: 1847, icon: Search },
    { label: "Valid Certificates", value: 1792, icon: CheckCircle2, color: "text-success" },
    { label: "Invalid/Expired", value: 55, icon: XCircle, color: "text-destructive" },
  ];

  const recentVerifications = [
    { id: 1, certificateNo: "MOT-2024-123456", driverName: "R***a K***r", status: "valid", date: "2024-01-15" },
    { id: 2, certificateNo: "MOT-2024-123457", driverName: "A***t S***h", status: "valid", date: "2024-01-14" },
    { id: 3, certificateNo: "MOT-2023-098765", driverName: "P***a S***a", status: "expired", date: "2024-01-14" },
    { id: 4, certificateNo: "MOT-2024-123458", driverName: "V***m P***l", status: "valid", date: "2024-01-13" },
    { id: 5, certificateNo: "MOT-INVALID-001", driverName: "-", status: "invalid", date: "2024-01-13" },
  ];

  const expiringAlerts = [
    { name: "R***l V***a", certificateNo: "MOT-2024-111222", expiresIn: "5 days" },
    { name: "S***h K***r", certificateNo: "MOT-2024-111223", expiresIn: "12 days" },
    { name: "M***a G***a", certificateNo: "MOT-2024-111224", expiresIn: "18 days" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge variant="success">Valid</Badge>;
      case "expired":
        return <Badge variant="warning">Expired</Badge>;
      default:
        return <Badge variant="destructive">Invalid</Badge>;
    }
  };

  return (
    <DashboardLayout role="company" userName="FleetMax Logistics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Company Verification Portal</h1>
            <p className="text-muted-foreground">Verify driver certifications and manage your fleet compliance.</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Quick Verify */}
        <Card className="border-primary/30">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-semibold mb-1">Quick Certificate Verification</h3>
                <p className="text-sm text-muted-foreground">Enter certificate number or scan QR code</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter certificate number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button>Verify</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${stat.color || "text-primary"}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Verifications */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Verifications</CardTitle>
                  <CardDescription>Your latest certificate verification history</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentVerifications.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium font-mono text-sm">{v.certificateNo}</p>
                      <p className="text-sm text-muted-foreground">{v.driverName} • {v.date}</p>
                    </div>
                    {getStatusBadge(v.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expiring Alerts */}
          <Card className="border-warning/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Expiring Soon
              </CardTitle>
              <CardDescription>Certificates requiring renewal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expiringAlerts.map((alert, index) => (
                  <div key={index} className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <p className="font-medium text-sm">{alert.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{alert.certificateNo}</p>
                    <Badge variant="warning" className="mt-2">
                      <Clock className="w-3 h-3 mr-1" />
                      Expires in {alert.expiresIn}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" size="sm">
                View All Expiring
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
