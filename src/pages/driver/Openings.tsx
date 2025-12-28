import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Clock, IndianRupee, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface JobPosting {
  id: string;
  title: string;
  description: string | null;
  vehicle_class_required: string[] | null;
  skill_grade_required: string[] | null;
  availability_required: string | null;
  work_type: string | null;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  created_at: string;
  employer_id: string;
  employer: {
    company_name: string;
    district: string | null;
    state: string | null;
  };
  applied?: boolean;
}

const Openings = () => {
  const { user } = useAuth();
  const [openings, setOpenings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [driverData, setDriverData] = useState<any>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Get driver data
      const { data: driver } = await supabase
        .from("drivers")
        .select("id, first_name, last_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!driver) {
        setLoading(false);
        return;
      }

      setDriverData(driver);

      // Get driver's certificates
      const { data: certs } = await supabase
        .from("applications")
        .select("vehicle_classes, skill_grade")
        .eq("driver_id", driver.id)
        .eq("status", "approved")
        .eq("admin_approved", true)
        .not("certificate_number", "is", null);

      // Get existing applications from driver
      const { data: existingApps } = await supabase
        .from("job_requests")
        .select("job_title, employer_id")
        .eq("driver_id", driver.id);

      const appliedSet = new Set(
        (existingApps || []).map((a) => `${a.employer_id}-${a.job_title}`)
      );
      setAppliedJobs(appliedSet);

      // Get all active job postings
      const { data: postings, error } = await supabase
        .from("job_postings")
        .select(`
          *,
          data_users!inner(
            company_name,
            district,
            state
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching openings:", error);
        setLoading(false);
        return;
      }

      // Filter postings based on driver's qualifications
      const driverVehicleClasses = [...new Set((certs || []).flatMap((c: any) => c.vehicle_classes || []))];
      const driverSkillGrades = (certs || []).map((c: any) => c.skill_grade).filter(Boolean);

      const matchingPostings = (postings || []).filter((posting: any) => {
        // Check vehicle class requirement
        if (posting.vehicle_class_required?.length > 0) {
          const hasMatchingClass = posting.vehicle_class_required.some((vc: string) => 
            driverVehicleClasses.includes(vc)
          );
          if (!hasMatchingClass) return false;
        }

        // Check skill grade requirement
        if (posting.skill_grade_required?.length > 0) {
          const hasMatchingGrade = posting.skill_grade_required.some((g: string) => 
            driverSkillGrades.includes(g)
          );
          if (!hasMatchingGrade) return false;
        }

        return true;
      });

      setOpenings(matchingPostings.map((p: any) => ({
        ...p,
        employer: p.data_users,
        applied: appliedSet.has(`${p.employer_id}-${p.title}`)
      })));
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const applyToJob = async (posting: JobPosting) => {
    if (!driverData) return;

    setApplying(posting.id);

    try {
      // Create a job request from driver side
      const { error } = await supabase
        .from("job_requests")
        .insert({
          driver_id: driverData.id,
          employer_id: posting.employer_id,
          job_title: posting.title,
          job_description: posting.description,
          vehicle_class_required: posting.vehicle_class_required?.[0] || null,
          location: posting.location,
          salary_offered: posting.salary_min,
          work_type: posting.work_type,
          status: "applied" // Driver applied, employer needs to respond
        });

      if (error) throw error;

      toast.success("Application submitted successfully!");
      
      // Update local state
      setAppliedJobs(prev => new Set([...prev, `${posting.employer_id}-${posting.title}`]));
      setOpenings(prev => prev.map(p => 
        p.id === posting.id ? { ...p, applied: true } : p
      ));
    } catch (error: any) {
      console.error("Error applying:", error);
      toast.error("Failed to submit application");
    } finally {
      setApplying(null);
    }
  };

  const userName = driverData
    ? `${driverData.first_name} ${driverData.last_name}`
    : "Driver";

  return (
    <DashboardLayout role="driver" userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Job Openings</h1>
          <p className="text-muted-foreground">
            Browse job opportunities that match your certifications
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : openings.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No job openings matching your qualifications at the moment.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Make sure your profile is visible to employers and check back later.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {openings.map((posting) => (
              <Card key={posting.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{posting.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {posting.employer.company_name}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(posting.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {posting.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{posting.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {posting.vehicle_class_required?.map((vc) => (
                      <Badge key={vc} variant="secondary">{vc}</Badge>
                    ))}
                    {posting.skill_grade_required?.map((g) => (
                      <Badge key={g} variant="outline">Grade {g}</Badge>
                    ))}
                    {posting.work_type && (
                      <Badge variant="outline">{posting.work_type}</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {posting.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {posting.location}
                      </div>
                    )}
                    {(posting.salary_min || posting.salary_max) && (
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        {posting.salary_min?.toLocaleString() || 0} - {posting.salary_max?.toLocaleString() || "∞"}
                      </div>
                    )}
                  </div>

                  {posting.applied ? (
                    <Button className="w-full" variant="secondary" disabled>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Applied
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => applyToJob(posting)}
                      disabled={applying === posting.id}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {applying === posting.id ? "Applying..." : "Apply Now"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Openings;