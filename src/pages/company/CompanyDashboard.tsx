import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  FileSpreadsheet,
  FileText,
  Bell,
  Users
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SingleVerification from "@/components/company/SingleVerification";
import BulkVerification from "@/components/company/BulkVerification";
import AuditLogs from "@/components/company/AuditLogs";
import CompanyStats from "@/components/company/CompanyStats";

interface DataUser {
  id: string;
  company_name: string;
  contact_person: string;
}

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [companyData, setCompanyData] = useState<DataUser | null>(null);
  const [activeTab, setActiveTab] = useState("verify");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      const { data: company } = await supabase
        .from("data_users")
        .select("id, company_name, contact_person")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (company) {
        setCompanyData(company);
      }
    };

    fetchData();
  }, [user]);

  const logVerification = async (
    searchType: "single" | "bulk",
    searchQuery: string,
    resultStatus: string,
    applicationId?: string,
    certificateNumber?: string,
    driverName?: string,
    resultDetails?: object
  ) => {
    if (!companyData) return;

    await supabase.from("verification_logs" as any).insert({
      data_user_id: companyData.id,
      verified_by_name: companyData.contact_person,
      search_type: searchType,
      search_query: searchQuery,
      application_id: applicationId,
      certificate_number: certificateNumber,
      driver_name: driverName,
      result_status: resultStatus,
      result_details: resultDetails || {}
    } as any);
  };

  const handleSingleVerification = async (result: any, query: string) => {
    await logVerification(
      "single",
      query,
      result.found ? (result.valid ? "valid" : (result.certificateStatus === "expired" ? "expired" : "invalid")) : "not_found",
      result.applicationId,
      result.certificateNo,
      result.driverName,
      result
    );
  };

  const handleBulkVerification = async (results: any[]) => {
    if (!companyData) return;

    // Log each result
    const logs = results.map(r => ({
      data_user_id: companyData.id,
      verified_by_name: companyData.contact_person,
      search_type: "bulk",
      search_query: r.query,
      certificate_number: r.certificateNo || null,
      driver_name: r.driverName || null,
      result_status: r.status,
      result_details: r
    }));

    // Insert in batches
    const batchSize = 50;
    for (let i = 0; i < logs.length; i += batchSize) {
      await supabase.from("verification_logs" as any).insert(logs.slice(i, i + batchSize) as any);
    }
  };

  if (!companyData) {
    return (
      <DashboardLayout role="company" userName="Loading...">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading company data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="company" userName={companyData.company_name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Enterprise Verification Portal</h1>
            <p className="text-muted-foreground">
              Verify driver certifications and manage fleet compliance
            </p>
          </div>
        </div>

        {/* Stats */}
        <CompanyStats dataUserId={companyData.id} />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="verify" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Single Verify</span>
              <span className="sm:hidden">Verify</span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Bulk Verify</span>
              <span className="sm:hidden">Bulk</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Audit Logs</span>
              <span className="sm:hidden">Logs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verify">
            <SingleVerification 
              dataUserId={companyData.id}
              companyName={companyData.company_name}
              onVerificationComplete={handleSingleVerification}
            />
          </TabsContent>

          <TabsContent value="bulk">
            <BulkVerification 
              dataUserId={companyData.id}
              companyName={companyData.company_name}
              onBulkVerificationComplete={handleBulkVerification}
            />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogs dataUserId={companyData.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;