import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Download, 
  Search,
  FileText,
  Calendar,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";

interface AuditLog {
  id: string;
  verified_by_name: string;
  verified_by_role: string | null;
  search_type: string;
  search_query: string;
  certificate_number: string | null;
  driver_name: string | null;
  result_status: string;
  created_at: string;
}

interface AuditLogsProps {
  dataUserId: string;
}

const AuditLogs = ({ dataUserId }: AuditLogsProps) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [dataUserId]);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("verification_logs" as any)
      .select("*")
      .eq("data_user_id", dataUserId)
      .order("created_at", { ascending: false })
      .limit(500);

    if (data) {
      setLogs(data as unknown as AuditLog[]);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => {
    if (searchQuery && !log.search_query.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !log.certificate_number?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !log.driver_name?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStatus !== "all" && log.result_status !== filterStatus) {
      return false;
    }
    if (filterType !== "all" && log.search_type !== filterType) {
      return false;
    }
    if (dateFrom && new Date(log.created_at) < new Date(dateFrom)) {
      return false;
    }
    if (dateTo && new Date(log.created_at) > new Date(dateTo + "T23:59:59")) {
      return false;
    }
    return true;
  });

  const exportExcel = () => {
    const exportData = filteredLogs.map(log => ({
      "Date & Time": new Date(log.created_at).toLocaleString(),
      "Verified By": log.verified_by_name,
      "Role": log.verified_by_role || "-",
      "Type": log.search_type,
      "Search Query": log.search_query,
      "Certificate Number": log.certificate_number || "-",
      "Driver Name": log.driver_name || "-",
      "Result": log.result_status
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");
    XLSX.writeFile(wb, `audit_logs_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-success text-success-foreground">Valid</Badge>;
      case "expired":
        return <Badge variant="outline" className="border-warning text-warning">Expired</Badge>;
      case "invalid":
        return <Badge variant="destructive">Invalid</Badge>;
      case "not_found":
        return <Badge variant="secondary">Not Found</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = {
    total: filteredLogs.length,
    today: filteredLogs.filter(l => 
      new Date(l.created_at).toDateString() === new Date().toDateString()
    ).length,
    thisWeek: filteredLogs.filter(l => {
      const logDate = new Date(l.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    }).length,
    thisMonth: filteredLogs.filter(l => {
      const logDate = new Date(l.created_at);
      const monthStart = new Date();
      monthStart.setDate(1);
      return logDate >= monthStart;
    }).length
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Lookups</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-2xl font-bold">{stats.today}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold">{stats.thisWeek}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold">{stats.thisMonth}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Audit & Compliance Logs
          </CardTitle>
          <CardDescription>
            Complete history of all verification lookups for compliance reporting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by certificate, driver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="invalid">Invalid</SelectItem>
                <SelectItem value="not_found">Not Found</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="bulk">Bulk</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[160px]"
              placeholder="From date"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[160px]"
              placeholder="To date"
            />
            <Button variant="outline" onClick={exportExcel}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Verified By</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Search Query</TableHead>
                  <TableHead>Certificate</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading logs...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No verification logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.verified_by_name}</p>
                          {log.verified_by_role && (
                            <p className="text-xs text-muted-foreground capitalize">
                              {log.verified_by_role.replace("_", " ")}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.search_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.search_query.length > 20 
                          ? log.search_query.substring(0, 20) + "..." 
                          : log.search_query}
                      </TableCell>
                      <TableCell className="font-mono">
                        {log.certificate_number || "-"}
                      </TableCell>
                      <TableCell>{log.driver_name || "-"}</TableCell>
                      <TableCell>{getStatusBadge(log.result_status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;