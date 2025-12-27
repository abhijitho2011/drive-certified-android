import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Check,
  X,
  Inbox,
  Send,
  ArrowDownLeft,
  ArrowUpRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import api from "@/lib/api";

interface JobRequest {
  id: string;
  job_title: string;
  job_description: string | null;
  vehicle_class_required: string | null;
  location: string | null;
  salary_offered: number | null;
  work_type: string | null;
  status: string;
  created_at: string;
  type: "received" | "sent";
  employer: {
    company_name: string;
    industry_type: string | null;
  } | null;
}

const JobRequests = () => {
  const { user } = useAuth();
  const [driverData, setDriverData] = useState<{ first_name: string; last_name: string; id: string } | null>(null);
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const driverRes = await api.get(`/drivers/user/${user.id}`);
      const driver = driverRes.data;

      if (driver) {
        setDriverData(driver);

        try {
          const jobRequestsRes = await api.get(`/drivers/${driver.id}/job-requests`);
          const jobRequests = jobRequestsRes.data;

          // Map requests with type (sent = applied by driver, received = sent by employer)
          const mappedRequests = (jobRequests || []).map((r: { status: string } & Record<string, unknown>) => ({
            ...r,
            type: r.status === "applied" ? "sent" : "received"
          }));

          setRequests(mappedRequests as JobRequest[]);
        } catch (e) {
          console.error("Error fetching job requests", e);
        }
      }
    } catch (error) {
      console.error("Error fetching driver data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId: string, accept: boolean) => {
    try {
      const newStatus = accept ? "accepted" : "rejected";

      await api.patch(`/job-requests/${requestId}`, {
        status: newStatus,
        driver_response_at: new Date().toISOString()
      });

      toast.success(accept ? "Job request accepted!" : "Job request declined");
      fetchData();
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Failed to update request");
    }
  };

  const withdrawApplication = async (requestId: string) => {
    try {
      await api.delete(`/job-requests/${requestId}`);

      toast.success("Application withdrawn");
      fetchData();
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast.error("Failed to withdraw application");
    }
  };

  const userName = driverData
    ? `${driverData.first_name} ${driverData.last_name}`
    : "Driver";

  const receivedRequests = requests.filter(r => r.type === "received");
  const sentRequests = requests.filter(r => r.type === "sent");

  const filteredRequests = requests.filter(r => {
    if (activeTab === "received") return r.type === "received";
    if (activeTab === "sent") return r.type === "sent";
    if (activeTab === "pending") return r.status === "pending" || r.status === "applied";
    return true;
  });

  const getStatusBadge = (status: string, type: "received" | "sent") => {
    if (status === "applied") {
      return <Badge variant="secondary">Awaiting Response</Badge>;
    }
    switch (status) {
      case "pending": return <Badge variant="secondary">Pending</Badge>;
      case "accepted": return <Badge className="bg-green-500">Accepted</Badge>;
      case "hired": return <Badge className="bg-blue-500">Hired</Badge>;
      case "rejected": return <Badge variant="destructive">{type === "sent" ? "Not Selected" : "Declined"}</Badge>;
      case "withdrawn": return <Badge variant="outline">Withdrawn</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="driver" userName="Loading...">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="driver" userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Job Requests</h1>
          <p className="text-muted-foreground">View job offers and your applications</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-blue-500" />
                  <p className="text-3xl font-bold">{receivedRequests.length}</p>
                </div>
                <p className="text-sm text-muted-foreground">Received</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-purple-500" />
                  <p className="text-3xl font-bold">{sentRequests.length}</p>
                </div>
                <p className="text-sm text-muted-foreground">Applied</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">
                  {requests.filter(r => r.status === "accepted" || r.status === "hired").length}
                </p>
                <p className="text-sm text-muted-foreground">Accepted</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">
                  {requests.filter(r => r.status === "pending" || r.status === "applied").length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              All ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="received">
              <ArrowDownLeft className="w-3 h-3 mr-1" />
              Received ({receivedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              Applied ({sentRequests.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({requests.filter(r => r.status === "pending" || r.status === "applied").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredRequests.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Inbox className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Job Requests</h3>
                  <p className="text-muted-foreground text-center">
                    {activeTab === "received"
                      ? "You haven't received any job offers yet"
                      : activeTab === "sent"
                        ? "You haven't applied to any jobs yet"
                        : "No requests in this category"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            {request.type === "sent" ? (
                              <Send className="w-5 h-5 text-primary" />
                            ) : (
                              <Building2 className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{request.job_title}</CardTitle>
                              <Badge variant="outline" className="text-xs">
                                {request.type === "sent" ? (
                                  <><ArrowUpRight className="w-3 h-3 mr-1" />Applied</>
                                ) : (
                                  <><ArrowDownLeft className="w-3 h-3 mr-1" />Offer</>
                                )}
                              </Badge>
                            </div>
                            <CardDescription>
                              {request.employer?.company_name || "Unknown Company"}
                              {request.employer?.industry_type && ` • ${request.employer.industry_type}`}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(request.status, request.type)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {request.job_description && (
                        <p className="text-sm text-muted-foreground mb-4">{request.job_description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm mb-4">
                        {request.vehicle_class_required && (
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                            <span>{request.vehicle_class_required}</span>
                          </div>
                        )}
                        {request.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{request.location}</span>
                          </div>
                        )}
                        {request.salary_offered && (
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span>₹{request.salary_offered.toLocaleString()}/month</span>
                          </div>
                        )}
                        {request.work_type && (
                          <Badge variant="outline" className="capitalize">
                            {request.work_type.replace("_", " ")}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>
                            {request.type === "sent" ? "Applied" : "Received"} {format(new Date(request.created_at), "MMM d, yyyy")}
                          </span>
                        </div>

                        {request.type === "received" && request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResponse(request.id, false)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleResponse(request.id, true)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                          </div>
                        )}

                        {request.type === "sent" && request.status === "applied" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => withdrawApplication(request.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default JobRequests;