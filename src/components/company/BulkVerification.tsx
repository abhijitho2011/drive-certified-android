import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Upload, 
  Download, 
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface BulkResult {
  query: string;
  status: "valid" | "invalid" | "expired" | "not_found";
  certificateNo?: string;
  driverName?: string;
  vehicleClass?: string;
  expiryDate?: string;
  recommendation?: string;
}

interface BulkVerificationProps {
  dataUserId: string;
  companyName: string;
  onBulkVerificationComplete: (results: BulkResult[]) => void;
}

const BulkVerification = ({ dataUserId, companyName, onBulkVerificationComplete }: BulkVerificationProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BulkResult[]>([]);
  const [fileName, setFileName] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);
    setProgress(0);
    setResults([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Skip header row and extract queries
      const queries = rows.slice(1)
        .map(row => row[0]?.toString().trim())
        .filter(q => q && q.length > 0);

      if (queries.length === 0) {
        toast.error("No valid entries found in the file");
        setUploading(false);
        return;
      }

      if (queries.length > 500) {
        toast.error("Maximum 500 entries allowed per upload");
        setUploading(false);
        return;
      }

      const bulkResults: BulkResult[] = [];
      const batchSize = 10;

      for (let i = 0; i < queries.length; i += batchSize) {
        const batch = queries.slice(i, i + batchSize);
        
        const { data: apps } = await supabase
          .from("applications")
          .select(`
            id,
            certificate_number,
            status,
            admin_approved,
            skill_grade,
            certification_vehicle_class,
            vehicle_classes,
            certificate_status,
            certificate_expiry_date,
            drivers:driver_id (id, first_name, last_name)
          `)
          .in("certificate_number", batch.map(q => q.toUpperCase()));

        for (const query of batch) {
          const app = apps?.find(a => 
            a.certificate_number?.toUpperCase() === query.toUpperCase()
          );

          if (app && app.certificate_number) {
            const isExpired = app.certificate_expiry_date && new Date(app.certificate_expiry_date) < new Date();
            const isValid = app.admin_approved && app.status === "approved" && !isExpired && app.certificate_status === "active";

            let status: "valid" | "invalid" | "expired" | "not_found" = "valid";
            if (!app.admin_approved || app.status !== "approved") {
              status = "invalid";
            } else if (isExpired || app.certificate_status === "expired") {
              status = "expired";
            }

            let recommendation = "Eligible";
            if (status === "expired") recommendation = "Not Eligible (Expired)";
            else if (status === "invalid") recommendation = "Not Eligible";

            bulkResults.push({
              query,
              status,
              certificateNo: app.certificate_number,
              driverName: `${app.drivers?.first_name} ${app.drivers?.last_name}`,
              vehicleClass: app.certification_vehicle_class || (app.vehicle_classes as string[])?.join(", "),
              expiryDate: app.certificate_expiry_date,
              recommendation
            });
          } else {
            bulkResults.push({
              query,
              status: "not_found",
              recommendation: "Not Eligible (Not Found)"
            });
          }
        }

        setProgress(Math.round(((i + batch.length) / queries.length) * 100));
      }

      setResults(bulkResults);
      onBulkVerificationComplete(bulkResults);
      toast.success(`Verified ${bulkResults.length} certificates`);
    } catch (error) {
      console.error("Bulk verification error:", error);
      toast.error("Failed to process file. Please check the format.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const downloadTemplate = () => {
    const template = [
      ["Certificate Number"],
      ["MOTRACT-001"],
      ["MOTRACT-002"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "bulk_verification_template.xlsx");
  };

  const downloadResults = () => {
    if (results.length === 0) return;

    const exportData = results.map(r => ({
      "Search Query": r.query,
      "Status": r.status.toUpperCase(),
      "Certificate Number": r.certificateNo || "",
      "Driver Name": r.driverName || "",
      "Vehicle Class": r.vehicleClass || "",
      "Expiry Date": r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : "",
      "Recommendation": r.recommendation || ""
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Verification Results");
    XLSX.writeFile(wb, `verification_report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "expired":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-success text-success-foreground">Valid</Badge>;
      case "expired":
        return <Badge variant="outline" className="border-warning text-warning">Expired</Badge>;
      case "invalid":
        return <Badge variant="destructive">Invalid</Badge>;
      default:
        return <Badge variant="secondary">Not Found</Badge>;
    }
  };

  const stats = {
    total: results.length,
    valid: results.filter(r => r.status === "valid").length,
    expired: results.filter(r => r.status === "expired").length,
    invalid: results.filter(r => r.status === "invalid" || r.status === "not_found").length
  };

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Bulk Certificate Verification
          </CardTitle>
          <CardDescription>
            Upload an Excel or CSV file with certificate numbers to verify multiple drivers at once.
            Maximum 500 entries per upload.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </>
              )}
            </Button>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
            {results.length > 0 && (
              <Button variant="outline" onClick={downloadResults}>
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing {fileName}...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Total Verified</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Valid</p>
                <p className="text-2xl font-bold text-success">{stats.valid}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-warning">{stats.expired}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Invalid/Not Found</p>
                <p className="text-2xl font-bold text-destructive">{stats.invalid}</p>
              </CardContent>
            </Card>
          </div>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Results</CardTitle>
              <CardDescription>
                {results.length} certificates verified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Certificate</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Vehicle Class</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{getStatusBadge(result.status)}</TableCell>
                        <TableCell className="font-mono">
                          {result.certificateNo || result.query}
                        </TableCell>
                        <TableCell>{result.driverName || "-"}</TableCell>
                        <TableCell>{result.vehicleClass || "-"}</TableCell>
                        <TableCell>
                          {result.expiryDate 
                            ? new Date(result.expiryDate).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {result.recommendation}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BulkVerification;