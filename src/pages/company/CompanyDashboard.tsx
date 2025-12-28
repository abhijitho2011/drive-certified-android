import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Briefcase, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import VerificationTab from "@/components/company/VerificationTab";
import RecruitTab from "@/components/company/RecruitTab";
import EmployerEmployees from "@/components/company/EmployerEmployees";
import AuditLogs from "@/components/company/AuditLogs";
import CompanyStats from "@/components/company/CompanyStats";

interface DataUser {
  id: string;
  company_name: string;
  contact_person: string;
  recruitment_access: boolean;
}

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [companyData, setCompanyData] = useState<DataUser | null>(null);
  const [activeTab, setActiveTab] = useState("verification");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      const { data: company } = await supabase
        .from("data_users")
        .select("id, company_name, contact_person, recruitment_access")
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Enterprise Portal</h1>
            <p className="text-muted-foreground">
              Verify driver certifications, recruit certified drivers, and manage your fleet
            </p>
          </div>
        </div>

        <CompanyStats dataUserId={companyData.id} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Verification</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Employees</span>
            </TabsTrigger>
            <TabsTrigger value="recruit" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Recruit</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Logs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verification">
            <VerificationTab
              dataUserId={companyData.id}
              companyName={companyData.company_name}
              contactPerson={companyData.contact_person}
              onSingleVerification={handleSingleVerification}
              onBulkVerification={handleBulkVerification}
            />
          </TabsContent>

          <TabsContent value="employees">
            <EmployerEmployees employerId={companyData.id} />
          </TabsContent>

          <TabsContent value="recruit">
            <RecruitTab
              employerId={companyData.id}
              hasRecruitmentAccess={companyData.recruitment_access || false}
            />
          </TabsContent>

          <TabsContent value="logs">
            <AuditLogs dataUserId={companyData.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
