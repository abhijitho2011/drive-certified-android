import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Star, MapPin, BookmarkPlus, Send, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DriverSearchProps {
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

const VEHICLE_CLASSES = ["LMV", "MCWG", "HMV", "HPMV", "HGMV", "HTV", "Trans"];
const WORK_TYPES = ["delivery", "taxi", "truck", "hazardous"];
const AVAILABILITY_OPTIONS = ["full_time", "part_time", "contract"];

const DriverSearch = ({ employerId, hasRecruitmentAccess }: DriverSearchProps) => {
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
  const [submitting, setSubmitting] = useState(false);

  const searchDrivers = async () => {
    if (!hasRecruitmentAccess) {
      toast.error("You don't have recruitment access. Please contact admin.");
      return;
    }

    setLoading(true);
    try {
      // Query visible drivers with their employment status and certificates
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

      // Get certificates for these drivers
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

      // Get average ratings
      const { data: ratings } = await supabase
        .from("performance_ratings")
        .select("driver_id, overall_rating")
        .in("driver_id", driverIds);

      // Combine data
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

        // Apply filters
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
    } catch (error: any) {
      toast.error(error.message || "Failed to send job request");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (hasRecruitmentAccess) {
      searchDrivers();
    }
  }, [hasRecruitmentAccess]);

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
          {/* Filters */}
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

          {/* Results */}
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
                placeholder="Job responsibilities, requirements..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vehicle Class</Label>
                <Select value={jobForm.vehicleClassRequired} onValueChange={(v) => setJobForm({ ...jobForm, vehicleClassRequired: v })}>
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
                <Select value={jobForm.workType} onValueChange={(v) => setJobForm({ ...jobForm, workType: v })}>
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
                  placeholder="Work location"
                />
              </div>
              <div className="space-y-2">
                <Label>Salary Offered (₹)</Label>
                <Input
                  type="number"
                  value={jobForm.salaryOffered}
                  onChange={(e) => setJobForm({ ...jobForm, salaryOffered: e.target.value })}
                  placeholder="Monthly salary"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJobDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendJobRequest} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverSearch;
