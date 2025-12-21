import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Send, X, CheckCircle, Clock, XCircle, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EmployerJobRequestsProps {
  employerId: string;
}

interface JobRequest {
  id: string;
  driver_id: string;
  job_title: string;
  job_description: string | null;
  vehicle_class_required: string | null;
  location: string | null;
  salary_offered: number | null;
  work_type: string | null;
  status: string;
  created_at: string;
  driver_response_at: string | null;
  driver: {
    first_name: string;
    last_name: string;
  };
}

const EmployerJobRequests = ({ employerId }: EmployerJobRequestsProps) => {
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("job_requests")
        .select(`
          *,
          drivers!inner(
            first_name,
            last_name
          )
        `)
        .eq("employer_id", employerId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRequests(data?.map((r: any) => ({
        ...r,
        driver: r.drivers
      })) || []);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load job requests");
    } finally {
      setLoading(false);
    }
  };

  const withdrawRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from("job_requests")
        .update({ status: "withdrawn" })
        .eq("id", id);

      if (error) throw error;

      toast.success("Job request withdrawn");
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message || "Failed to withdraw request");
    }
  };

  const markAsHired = async (request: JobRequest) => {
    try {
      // Update job request status
      const { error: reqError } = await supabase
        .from("job_requests")
        .update({ status: "hired" })
        .eq("id", request.id);

      if (reqError) throw reqError;

      // Create employment history record
      const { error: empError } = await supabase
        .from("employment_history")
        .insert({
          driver_id: request.driver_id,
          employer_id: employerId,
          position: request.job_title,
          start_date: new Date().toISOString().split("T")[0],
          vehicle_class: request.vehicle_class_required,
          status: "active",
        });

      if (empError) throw empError;

      toast.success("Driver hired successfully! Employment record created.");
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message || "Failed to complete hiring");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [employerId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="pending"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "accepted":
        return <Badge variant="approved"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case "rejected":
        return <Badge variant="rejected"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "withdrawn":
        return <Badge variant="secondary"><X className="w-3 h-3 mr-1" />Withdrawn</Badge>;
      case "hired":
        return <Badge variant="approved"><UserCheck className="w-3 h-3 mr-1" />Hired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMaskedName = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}***${lastName.charAt(0)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Sent Job Requests
        </CardTitle>
        <CardDescription>
          Track the status of job offers sent to drivers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No job requests sent yet. Search for drivers and send job offers.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Vehicle Class</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent On</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">
                    {getMaskedName(req.driver.first_name, req.driver.last_name)}
                  </TableCell>
                  <TableCell>{req.job_title}</TableCell>
                  <TableCell>
                    {req.vehicle_class_required && (
                      <Badge variant="outline">{req.vehicle_class_required}</Badge>
                    )}
                  </TableCell>
                  <TableCell>{req.location || "-"}</TableCell>
                  <TableCell>
                    {req.salary_offered ? `₹${req.salary_offered.toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(req.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {req.status === "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => withdrawRequest(req.id)}
                        >
                          Withdraw
                        </Button>
                      )}
                      {req.status === "accepted" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => markAsHired(req)}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Mark Hired
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployerJobRequests;
