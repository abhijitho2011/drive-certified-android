import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Bookmark,
  Send,
  Plus,
  Briefcase,
  Trash2,
  Star,
  MapPin,
  BookmarkPlus,
  Filter,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  X,
  UserCheck,
  Edit,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RecruitTabProps {
  employerId: string;
  hasRecruitmentAccess: boolean;
}

interface DiscoverableDriver {
  driver_id: string;
  masked_name: string;
  skill_grade: string | null;
  vehicle_classes: string[];
  certificate_expiry: string | null;
  availability: string | null;
  preferred_work_types: string[];
  preferred_locations: string[];
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  average_rating: number | null;
  district: string;
  state: string;
}

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
  is_active: boolean;
  created_at: string;
}

interface ShortlistedDriver {
  id: string;
  driver_id: string;
  notes: string | null;
  created_at: string;
  driver: {
    first_name: string;
    last_name: string;
    district: string;
    state: string;
  };
  vehicle_classes: string[];
  skill_grade: string | null;
  average_rating: number | null;
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

const VEHICLE_CLASSES = ["LMV", "MCWG", "HMV", "HPMV", "HGMV", "HTV", "Trans"];
const WORK_TYPES = ["delivery", "taxi", "truck", "hazardous"];
const AVAILABILITY_OPTIONS = ["full_time", "part_time", "contract"];

const RecruitTab = ({ employerId, hasRecruitmentAccess }: RecruitTabProps) => {
  const [activeTab, setActiveTab] = useState("search");
  
  // Search state
  const [drivers, setDrivers] = useState<DiscoverableDriver[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    vehicleClass: "",
    skillGrade: "",
    availability: "",
    location: "",
    workType: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Job postings state
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [postForm, setPostForm] = useState({
    title: "",
    description: "",
    vehicleClasses: [] as string[],
    skillGrades: [] as string[],
    availability: "",
    workType: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Shortlist state
  const [shortlist, setShortlist] = useState<ShortlistedDriver[]>([]);

  // Requests state
  const [requests, setRequests] = useState<JobRequest[]>([]);

  // Job request dialog
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DiscoverableDriver | null>(null);
  const [jobForm, setJobForm] = useState({
    jobTitle: "",
    jobDescription: "",
    vehicleClassRequired: "",
    location: "",
    salaryOffered: "",
    workType: "",
  });

  // Search drivers
  const searchDrivers = async () => {
    if (!hasRecruitmentAccess) {
      toast.error("You don't have recruitment access. Please contact admin.");
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from("driver_employment_status")
        .select(`
          driver_id,
          availability,
          preferred_work_types,
          preferred_locations,
          expected_salary_min,
          expected_salary_max,
          drivers!inner(
            id,
            first_name,
            last_name,
            district,
            state
          )
        `)
        .eq("is_visible_to_employers", true);

      if (filters.availability) {
        query = query.eq("availability", filters.availability);
      }

      const { data: employmentData, error } = await query;
      if (error) throw error;

      const driverIds = employmentData?.map((d: any) => d.driver_id) || [];
      
      if (driverIds.length === 0) {
        setDrivers([]);
        return;
      }

      const { data: certificates } = await supabase
        .from("applications")
        .select("driver_id, certification_vehicle_class, skill_grade, certificate_expiry_date, vehicle_classes")
        .in("driver_id", driverIds)
        .eq("status", "approved")
        .eq("admin_approved", true)
        .not("certificate_number", "is", null);

      const { data: ratings } = await supabase
        .from("performance_ratings")
        .select("driver_id, overall_rating")
        .in("driver_id", driverIds);

      const driversMap = new Map<string, DiscoverableDriver>();

      employmentData?.forEach((emp: any) => {
        const driver = emp.drivers;
        const driverCerts = certificates?.filter((c: any) => c.driver_id === emp.driver_id) || [];
        const driverRatings = ratings?.filter((r: any) => r.driver_id === emp.driver_id) || [];
        
        const avgRating = driverRatings.length > 0
          ? driverRatings.reduce((sum: number, r: any) => sum + (r.overall_rating || 0), 0) / driverRatings.length
          : null;

        const vehicleClasses = [...new Set(driverCerts.flatMap((c: any) => c.vehicle_classes || []))];
        const skillGrades = driverCerts.map((c: any) => c.skill_grade).filter(Boolean);
        const latestExpiry = driverCerts
          .map((c: any) => c.certificate_expiry_date)
          .filter(Boolean)
          .sort()
          .reverse()[0];

        if (filters.vehicleClass && !vehicleClasses.includes(filters.vehicleClass)) return;
        if (filters.skillGrade && !skillGrades.includes(filters.skillGrade)) return;
        if (filters.location && 
            !driver.district.toLowerCase().includes(filters.location.toLowerCase()) &&
            !driver.state.toLowerCase().includes(filters.location.toLowerCase()) &&
            !(emp.preferred_locations || []).some((l: string) => l.toLowerCase().includes(filters.location.toLowerCase()))
        ) return;
        if (filters.workType && !(emp.preferred_work_types || []).includes(filters.workType)) return;

        driversMap.set(emp.driver_id, {
          driver_id: emp.driver_id,
          masked_name: `${driver.first_name.charAt(0)}***${driver.last_name.charAt(0)}`,
          skill_grade: skillGrades[0] || null,
          vehicle_classes: vehicleClasses,
          certificate_expiry: latestExpiry,
          availability: emp.availability,
          preferred_work_types: emp.preferred_work_types || [],
          preferred_locations: emp.preferred_locations || [],
          expected_salary_min: emp.expected_salary_min,
          expected_salary_max: emp.expected_salary_max,
          average_rating: avgRating,
          district: driver.district,
          state: driver.state,
        });
      });

      setDrivers(Array.from(driversMap.values()));
    } catch (error: any) {
      console.error("Search error:", error);
      toast.error("Failed to search drivers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch job postings
  const fetchJobPostings = async () => {
    try {
      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .eq("employer_id", employerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobPostings(data || []);
    } catch (error: any) {
      console.error("Error fetching job postings:", error);
    }
  };

  // Fetch shortlist
  const fetchShortlist = async () => {
    try {
      const { data, error } = await supabase
        .from("driver_shortlist")
        .select(`
          id,
          driver_id,
          notes,
          created_at,
          drivers!inner(
            first_name,
            last_name,
            district,
            state
          )
        `)
        .eq("employer_id", employerId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const driverIds = data?.map((d: any) => d.driver_id) || [];
      
      const [certsRes, ratingsRes] = await Promise.all([
        supabase
          .from("applications")
          .select("driver_id, skill_grade, vehicle_classes")
          .in("driver_id", driverIds)
          .eq("status", "approved")
          .eq("admin_approved", true),
        supabase
          .from("performance_ratings")
          .select("driver_id, overall_rating")
          .in("driver_id", driverIds),
      ]);

      const shortlistWithDetails = data?.map((item: any) => {
        const certs = certsRes.data?.filter((c: any) => c.driver_id === item.driver_id) || [];
        const ratings = ratingsRes.data?.filter((r: any) => r.driver_id === item.driver_id) || [];
        
        const vehicleClasses = [...new Set(certs.flatMap((c: any) => c.vehicle_classes || []))];
        const skillGrade = certs.find((c: any) => c.skill_grade)?.skill_grade || null;
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum: number, r: any) => sum + (r.overall_rating || 0), 0) / ratings.length
          : null;

        return {
          id: item.id,
          driver_id: item.driver_id,
          notes: item.notes,
          created_at: item.created_at,
          driver: item.drivers,
          vehicle_classes: vehicleClasses,
          skill_grade: skillGrade,
          average_rating: avgRating,
        };
      }) || [];

      setShortlist(shortlistWithDetails);
    } catch (error: any) {
      console.error("Error fetching shortlist:", error);
    }
  };

  // Fetch requests
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
    }
  };

  useEffect(() => {
    if (hasRecruitmentAccess) {
      searchDrivers();
      fetchJobPostings();
      fetchShortlist();
      fetchRequests();
    }
  }, [hasRecruitmentAccess, employerId]);

  // Actions
  const handleShortlist = async (driver: DiscoverableDriver) => {
    try {
      const { error } = await supabase
        .from("driver_shortlist")
        .insert({
          employer_id: employerId,
          driver_id: driver.driver_id,
        });

      if (error) {
        if (error.code === "23505") {
          toast.info("Driver already in shortlist");
        } else {
          throw error;
        }
      } else {
        toast.success("Driver added to shortlist");
        fetchShortlist();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to shortlist driver");
    }
  };

  const openJobDialog = (driver: DiscoverableDriver) => {
    setSelectedDriver(driver);
    setJobForm({
      jobTitle: "",
      jobDescription: "",
      vehicleClassRequired: driver.vehicle_classes[0] || "",
      location: "",
      salaryOffered: "",
      workType: driver.preferred_work_types[0] || "",
    });
    setIsJobDialogOpen(true);
  };

  const handleSendJobRequest = async () => {
    if (!selectedDriver || !jobForm.jobTitle) {
      toast.error("Please enter job title");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("job_requests")
        .insert({
          employer_id: employerId,
          driver_id: selectedDriver.driver_id,
          job_title: jobForm.jobTitle,
          job_description: jobForm.jobDescription || null,
          vehicle_class_required: jobForm.vehicleClassRequired || null,
          location: jobForm.location || null,
          salary_offered: jobForm.salaryOffered ? parseFloat(jobForm.salaryOffered) : null,
          work_type: jobForm.workType || null,
        });

      if (error) throw error;

      toast.success("Job request sent to driver");
      setIsJobDialogOpen(false);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message || "Failed to send job request");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostJob = async () => {
    if (!postForm.title) {
      toast.error("Please enter job title");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("job_postings")
        .insert({
          employer_id: employerId,
          title: postForm.title,
          description: postForm.description || null,
          vehicle_class_required: postForm.vehicleClasses.length > 0 ? postForm.vehicleClasses : null,
          skill_grade_required: postForm.skillGrades.length > 0 ? postForm.skillGrades : null,
          availability_required: postForm.availability || null,
          work_type: postForm.workType || null,
          location: postForm.location || null,
          salary_min: postForm.salaryMin ? parseFloat(postForm.salaryMin) : null,
          salary_max: postForm.salaryMax ? parseFloat(postForm.salaryMax) : null,
        });

      if (error) throw error;

      toast.success("Job opening posted successfully");
      setIsPostDialogOpen(false);
      setPostForm({
        title: "",
        description: "",
        vehicleClasses: [],
        skillGrades: [],
        availability: "",
        workType: "",
        location: "",
        salaryMin: "",
        salaryMax: "",
      });
      fetchJobPostings();
    } catch (error: any) {
      toast.error(error.message || "Failed to post job");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleJobActive = async (posting: JobPosting) => {
    try {
      const { error } = await supabase
        .from("job_postings")
        .update({ is_active: !posting.is_active })
        .eq("id", posting.id);

      if (error) throw error;
      toast.success(posting.is_active ? "Job posting deactivated" : "Job posting activated");
      fetchJobPostings();
    } catch (error: any) {
      toast.error("Failed to update job posting");
    }
  };

  const deleteJobPosting = async (id: string) => {
    try {
      const { error } = await supabase
        .from("job_postings")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Job posting deleted");
      fetchJobPostings();
    } catch (error: any) {
      toast.error("Failed to delete job posting");
    }
  };

  const removeFromShortlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from("driver_shortlist")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Driver removed from shortlist");
      fetchShortlist();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove driver");
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
      const { error: reqError } = await supabase
        .from("job_requests")
        .update({ status: "hired" })
        .eq("id", request.id);

      if (reqError) throw reqError;

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

      toast.success("Driver hired successfully!");
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message || "Failed to complete hiring");
    }
  };

  const getMaskedName = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}***${lastName.charAt(0)}`;
  };

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

  if (!hasRecruitmentAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Driver Recruitment</CardTitle>
          <CardDescription>Search and recruit certified drivers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              You don't have recruitment access yet. Please contact the administrator to enable this feature.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="postings" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Job Postings
          </TabsTrigger>
          <TabsTrigger value="shortlist" className="flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            Shortlist ({shortlist.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Requests ({requests.length})
          </TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Certified Drivers
              </CardTitle>
              <CardDescription>
                Find and recruit MOTRACT-certified drivers who are looking for opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button onClick={searchDrivers} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                  Search
                </Button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <Label>Vehicle Class</Label>
                    <Select value={filters.vehicleClass} onValueChange={(v) => setFilters({ ...filters, vehicleClass: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        {VEHICLE_CLASSES.map((vc) => (
                          <SelectItem key={vc} value={vc}>{vc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Skill Grade</Label>
                    <Select value={filters.skillGrade} onValueChange={(v) => setFilters({ ...filters, skillGrade: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="A">Grade A</SelectItem>
                        <SelectItem value="B">Grade B</SelectItem>
                        <SelectItem value="C">Grade C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Availability</Label>
                    <Select value={filters.availability} onValueChange={(v) => setFilters({ ...filters, availability: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        {AVAILABILITY_OPTIONS.map((a) => (
                          <SelectItem key={a} value={a}>{a.replace("_", " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Work Type</Label>
                    <Select value={filters.workType} onValueChange={(v) => setFilters({ ...filters, workType: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        {WORK_TYPES.map((wt) => (
                          <SelectItem key={wt} value={wt}>{wt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="District or state"
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {drivers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {loading ? "Searching..." : "No drivers found matching your criteria"}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>Vehicle Classes</TableHead>
                      <TableHead>Skill Grade</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map((driver) => (
                      <TableRow key={driver.driver_id}>
                        <TableCell className="font-medium">{driver.masked_name}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {driver.vehicle_classes.map((vc) => (
                              <Badge key={vc} variant="outline" className="text-xs">{vc}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {driver.skill_grade && (
                            <Badge variant={driver.skill_grade === "A" ? "approved" : "secondary"}>
                              Grade {driver.skill_grade}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3" />
                            {driver.district}, {driver.state}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {driver.availability?.replace("_", " ") || "Not specified"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {driver.average_rating ? (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              {driver.average_rating.toFixed(1)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No ratings</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleShortlist(driver)}>
                              <BookmarkPlus className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openJobDialog(driver)}>
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Postings Tab */}
        <TabsContent value="postings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Job Postings
                  </CardTitle>
                  <CardDescription>
                    Post job openings with requirements - only matching drivers can see them
                  </CardDescription>
                </div>
                <Button onClick={() => setIsPostDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Opening
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {jobPostings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No job postings yet. Create your first job opening.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Vehicle Classes</TableHead>
                      <TableHead>Skill Grades</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Salary Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobPostings.map((posting) => (
                      <TableRow key={posting.id}>
                        <TableCell className="font-medium">{posting.title}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {(posting.vehicle_class_required || []).map((vc) => (
                              <Badge key={vc} variant="outline" className="text-xs">{vc}</Badge>
                            ))}
                            {!(posting.vehicle_class_required?.length) && <span className="text-muted-foreground text-sm">Any</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {(posting.skill_grade_required || []).map((g) => (
                              <Badge key={g} variant="secondary" className="text-xs">Grade {g}</Badge>
                            ))}
                            {!(posting.skill_grade_required?.length) && <span className="text-muted-foreground text-sm">Any</span>}
                          </div>
                        </TableCell>
                        <TableCell>{posting.location || "-"}</TableCell>
                        <TableCell>
                          {posting.salary_min || posting.salary_max ? (
                            `₹${posting.salary_min?.toLocaleString() || 0} - ₹${posting.salary_max?.toLocaleString() || "∞"}`
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={posting.is_active ? "approved" : "secondary"}>
                            {posting.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => toggleJobActive(posting)}
                            >
                              {posting.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => deleteJobPosting(posting.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shortlist Tab */}
        <TabsContent value="shortlist">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="w-5 h-5" />
                Shortlisted Drivers
              </CardTitle>
              <CardDescription>
                Drivers you've saved for potential hiring
              </CardDescription>
            </CardHeader>
            <CardContent>
              {shortlist.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No drivers shortlisted yet. Search and add drivers to your shortlist.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>Vehicle Classes</TableHead>
                      <TableHead>Skill Grade</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Added On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shortlist.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {getMaskedName(item.driver.first_name, item.driver.last_name)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {item.vehicle_classes.map((vc) => (
                              <Badge key={vc} variant="outline" className="text-xs">{vc}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.skill_grade && (
                            <Badge variant={item.skill_grade === "A" ? "approved" : "secondary"}>
                              Grade {item.skill_grade}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3" />
                            {item.driver.district}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.average_rating ? (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              {item.average_rating.toFixed(1)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => removeFromShortlist(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests">
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
              {requests.length === 0 ? (
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
                                Hire
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
        </TabsContent>
      </Tabs>

      {/* Send Job Request Dialog */}
      <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Job Request</DialogTitle>
            <DialogDescription>
              Send a job offer to {selectedDriver?.masked_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input
                value={jobForm.jobTitle}
                onChange={(e) => setJobForm({ ...jobForm, jobTitle: e.target.value })}
                placeholder="e.g., Delivery Driver, Fleet Driver"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={jobForm.jobDescription}
                onChange={(e) => setJobForm({ ...jobForm, jobDescription: e.target.value })}
                placeholder="Job details..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vehicle Class</Label>
                <Select
                  value={jobForm.vehicleClassRequired}
                  onValueChange={(v) => setJobForm({ ...jobForm, vehicleClassRequired: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_CLASSES.map((vc) => (
                      <SelectItem key={vc} value={vc}>{vc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Work Type</Label>
                <Select
                  value={jobForm.workType}
                  onValueChange={(v) => setJobForm({ ...jobForm, workType: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_TYPES.map((wt) => (
                      <SelectItem key={wt} value={wt}>{wt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  placeholder="City/District"
                />
              </div>
              <div className="space-y-2">
                <Label>Salary (₹/month)</Label>
                <Input
                  type="number"
                  value={jobForm.salaryOffered}
                  onChange={(e) => setJobForm({ ...jobForm, salaryOffered: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJobDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendJobRequest} disabled={submitting}>
              {submitting ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Job Opening Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post Job Opening</DialogTitle>
            <DialogDescription>
              Create a job posting with requirements - only drivers meeting these criteria will see it
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                placeholder="e.g., Delivery Driver, Fleet Driver"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={postForm.description}
                onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                placeholder="Job details, responsibilities, benefits..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Required Vehicle Classes</Label>
                <div className="flex flex-wrap gap-2">
                  {VEHICLE_CLASSES.map((vc) => (
                    <Badge
                      key={vc}
                      variant={postForm.vehicleClasses.includes(vc) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const classes = postForm.vehicleClasses.includes(vc)
                          ? postForm.vehicleClasses.filter((c) => c !== vc)
                          : [...postForm.vehicleClasses, vc];
                        setPostForm({ ...postForm, vehicleClasses: classes });
                      }}
                    >
                      {vc}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Required Skill Grades</Label>
                <div className="flex flex-wrap gap-2">
                  {["A", "B", "C"].map((g) => (
                    <Badge
                      key={g}
                      variant={postForm.skillGrades.includes(g) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const grades = postForm.skillGrades.includes(g)
                          ? postForm.skillGrades.filter((gr) => gr !== g)
                          : [...postForm.skillGrades, g];
                        setPostForm({ ...postForm, skillGrades: grades });
                      }}
                    >
                      Grade {g}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Availability Required</Label>
                <Select
                  value={postForm.availability}
                  onValueChange={(v) => setPostForm({ ...postForm, availability: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {AVAILABILITY_OPTIONS.map((a) => (
                      <SelectItem key={a} value={a}>{a.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Work Type</Label>
                <Select
                  value={postForm.workType}
                  onValueChange={(v) => setPostForm({ ...postForm, workType: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {WORK_TYPES.map((wt) => (
                      <SelectItem key={wt} value={wt}>{wt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={postForm.location}
                onChange={(e) => setPostForm({ ...postForm, location: e.target.value })}
                placeholder="City/District"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Salary (₹/month)</Label>
                <Input
                  type="number"
                  value={postForm.salaryMin}
                  onChange={(e) => setPostForm({ ...postForm, salaryMin: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Maximum Salary (₹/month)</Label>
                <Input
                  type="number"
                  value={postForm.salaryMax}
                  onChange={(e) => setPostForm({ ...postForm, salaryMax: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPostDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePostJob} disabled={submitting}>
              {submitting ? "Posting..." : "Post Opening"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecruitTab;
