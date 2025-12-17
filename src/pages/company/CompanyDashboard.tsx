import { useEffect, useState } from "react";
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
  Users
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [companyData, setCompanyData] = useState<{ company_name: string } | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      // Fetch company data
      const { data: company } = await supabase
        .from("data_users")
        .select("company_name")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (company) {
        setCompanyData(company);
      }
    };

    fetchData();
  }, [user]);

  const handleVerify = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setVerificationResult(null);
    
    // Search for certificate
    const { data: app } = await supabase
      .from("applications")
      .select(`
        certificate_number,
        status,
        admin_approved,
        drivers:driver_id (first_name, last_name)
      `)
      .eq("certificate_number", searchQuery.trim())
      .maybeSingle();
    
    if (app) {
      setVerificationResult({
        found: true,
        valid: app.admin_approved && app.status === "approved",
        certificateNo: app.certificate_number,
        driverName: `${app.drivers?.first_name?.charAt(0)}***${app.drivers?.first_name?.slice(-1)} ${app.drivers?.last_name?.charAt(0)}***`,
        status: app.status
      });
    } else {
      setVerificationResult({
        found: false,
        valid: false
      });
    }
    
    setSearching(false);
  };

  const stats = [
    { label: "Total Verifications", value: 0, icon: Search },
    { label: "Valid Certificates", value: 0, icon: CheckCircle2, color: "text-success" },
    { label: "Invalid/Expired", value: 0, icon: XCircle, color: "text-destructive" },
  ];

  return (
    <DashboardLayout role="company" userName={companyData?.company_name || "Company"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Company Verification Portal</h1>
            <p className="text-muted-foreground">Verify driver certifications and manage your fleet compliance.</p>
          </div>
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
                <p className="text-sm text-muted-foreground">Enter certificate number to verify</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter certificate number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleVerify} disabled={searching}>
                  {searching ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </div>
            
            {/* Verification Result */}
            {verificationResult && (
              <div className={`mt-4 p-4 rounded-lg ${verificationResult.found ? (verificationResult.valid ? "bg-success/10 border border-success/30" : "bg-warning/10 border border-warning/30") : "bg-destructive/10 border border-destructive/30"}`}>
                {verificationResult.found ? (
                  <div className="flex items-center gap-3">
                    {verificationResult.valid ? (
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-warning" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {verificationResult.valid ? "Valid Certificate" : "Certificate Not Active"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {verificationResult.certificateNo} • {verificationResult.driverName}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <XCircle className="w-6 h-6 text-destructive" />
                    <div>
                      <p className="font-semibold">Certificate Not Found</p>
                      <p className="text-sm text-muted-foreground">
                        No certificate found with number: {searchQuery}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
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

        {/* Recent Verifications - Empty State */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Verifications</CardTitle>
                <CardDescription>Your latest certificate verification history</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No verification history</p>
              <p className="text-sm">Start verifying certificates to see history here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
