import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Calendar,
  Award,
  Star,
  Download,
  Briefcase,
  Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface EmploymentRecord {
  id: string;
  position: string | null;
  vehicle_class: string | null;
  start_date: string;
  end_date: string | null;
  status: string;
  employer: {
    company_name: string;
    industry_type: string | null;
  } | null;
}

interface PerformanceRating {
  id: string;
  punctuality_rating: number | null;
  safety_rating: number | null;
  behaviour_rating: number | null;
  vehicle_handling_rating: number | null;
  overall_rating: number | null;
  remarks: string | null;
  created_at: string;
  employer: {
    company_name: string;
  } | null;
}

interface ExperienceCert {
  id: string;
  certificate_number: string;
  vehicle_class: string;
  employment_duration_months: number | null;
  performance_summary: string | null;
  issue_date: string;
  employer: {
    company_name: string;
  } | null;
}

const Experience = () => {
  const { user } = useAuth();
  const [driverData, setDriverData] = useState<{ first_name: string; last_name: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<EmploymentRecord[]>([]);
  const [ratings, setRatings] = useState<PerformanceRating[]>([]);
  const [certificates, setCertificates] = useState<ExperienceCert[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      const { data: driver } = await supabase
        .from("drivers")
        .select("id, first_name, last_name")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (driver) {
        setDriverData(driver);

        // Fetch employment history
        const { data: empHistory } = await supabase
          .from("employment_history")
          .select(`
            id, position, vehicle_class, start_date, end_date, status,
            employer:data_users!employment_history_employer_id_fkey(company_name, industry_type)
          `)
          .eq("driver_id", driver.id)
          .order("start_date", { ascending: false });

        setHistory(empHistory as EmploymentRecord[] || []);

        // Fetch performance ratings
        const { data: perfRatings } = await supabase
          .from("performance_ratings")
          .select(`
            id, punctuality_rating, safety_rating, behaviour_rating, 
            vehicle_handling_rating, overall_rating, remarks, created_at,
            employer:data_users!performance_ratings_employer_id_fkey(company_name)
          `)
          .eq("driver_id", driver.id)
          .order("created_at", { ascending: false });

        setRatings(perfRatings as PerformanceRating[] || []);

        // Fetch experience certificates
        const { data: expCerts } = await supabase
          .from("experience_certificates")
          .select(`
            id, certificate_number, vehicle_class, employment_duration_months,
            performance_summary, issue_date,
            employer:data_users!experience_certificates_employer_id_fkey(company_name)
          `)
          .eq("driver_id", driver.id)
          .order("issue_date", { ascending: false });

        setCertificates(expCerts as ExperienceCert[] || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const userName = driverData 
    ? `${driverData.first_name} ${driverData.last_name}` 
    : "Driver";

  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / ratings.length
    : 0;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-4 h-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
          />
        ))}
      </div>
    );
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
          <h1 className="text-2xl font-bold">Employment History</h1>
          <p className="text-muted-foreground">Your work experience and performance records</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{history.length}</p>
                  <p className="text-sm text-muted-foreground">Employers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Avg. Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{certificates.length}</p>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {history.filter(h => h.status === "active").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="history">
          <TabsList>
            <TabsTrigger value="history">Employment History</TabsTrigger>
            <TabsTrigger value="ratings">Performance Ratings</TabsTrigger>
            <TabsTrigger value="certificates">Experience Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-4 space-y-4">
            {history.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Employment History</h3>
                  <p className="text-muted-foreground text-center">
                    Your employment records will appear here when employers hire you through MOTRACT
                  </p>
                </CardContent>
              </Card>
            ) : (
              history.map((record) => (
                <Card key={record.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{record.position || "Driver"}</CardTitle>
                          <CardDescription>{record.employer?.company_name || "Unknown"}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={record.status === "active" ? "default" : "secondary"}>
                        {record.status === "active" ? "Current" : "Completed"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {format(new Date(record.start_date), "MMM yyyy")} - 
                          {record.end_date ? format(new Date(record.end_date), " MMM yyyy") : " Present"}
                        </span>
                      </div>
                      {record.vehicle_class && (
                        <Badge variant="outline">{record.vehicle_class}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="ratings" className="mt-4 space-y-4">
            {ratings.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Star className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Ratings Yet</h3>
                  <p className="text-muted-foreground text-center">
                    Performance ratings from employers will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              ratings.map((rating) => (
                <Card key={rating.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{rating.employer?.company_name || "Unknown"}</CardTitle>
                      <div className="flex items-center gap-2">
                        {renderStars(rating.overall_rating || 0)}
                        <span className="font-bold">{(rating.overall_rating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <CardDescription>
                      Rated on {format(new Date(rating.created_at), "MMM d, yyyy")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Punctuality</p>
                        {renderStars(rating.punctuality_rating || 0)}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Safety</p>
                        {renderStars(rating.safety_rating || 0)}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Behaviour</p>
                        {renderStars(rating.behaviour_rating || 0)}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Vehicle Handling</p>
                        {renderStars(rating.vehicle_handling_rating || 0)}
                      </div>
                    </div>
                    {rating.remarks && (
                      <p className="text-sm text-muted-foreground italic">"{rating.remarks}"</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="certificates" className="mt-4 space-y-4">
            {certificates.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Award className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Experience Certificates</h3>
                  <p className="text-muted-foreground text-center">
                    Experience certificates issued by employers will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              certificates.map((cert) => (
                <Card key={cert.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Award className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Experience Certificate</CardTitle>
                          <CardDescription>
                            {cert.employer?.company_name || "Unknown"} • {cert.certificate_number}
                          </CardDescription>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Issued: {format(new Date(cert.issue_date), "MMM d, yyyy")}</span>
                      </div>
                      {cert.employment_duration_months && (
                        <span className="text-muted-foreground">
                          Duration: {cert.employment_duration_months} months
                        </span>
                      )}
                      <Badge variant="outline">{cert.vehicle_class}</Badge>
                    </div>
                    {cert.performance_summary && (
                      <p className="text-sm text-muted-foreground mt-3">{cert.performance_summary}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Experience;
