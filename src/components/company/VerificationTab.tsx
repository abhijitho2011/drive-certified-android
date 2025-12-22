import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileSpreadsheet } from "lucide-react";
import SingleVerification from "./SingleVerification";
import BulkVerification from "./BulkVerification";

interface VerificationTabProps {
  dataUserId: string;
  companyName: string;
  contactPerson: string;
  onSingleVerification: (result: any, query: string) => void;
  onBulkVerification: (results: any[]) => void;
}

const VerificationTab = ({
  dataUserId,
  companyName,
  contactPerson,
  onSingleVerification,
  onBulkVerification,
}: VerificationTabProps) => {
  const [mode, setMode] = useState("single");

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList>
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Single
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Bulk
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <SingleVerification
            dataUserId={dataUserId}
            companyName={companyName}
            onVerificationComplete={onSingleVerification}
          />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkVerification
            dataUserId={dataUserId}
            companyName={companyName}
            onBulkVerificationComplete={onBulkVerification}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VerificationTab;
