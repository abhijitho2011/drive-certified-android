import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Star, FileText, UserMinus, Loader2, Award } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface EmployerEmployeesProps {
  employerId: string;
}

interface EmploymentRecord {
  id: string;
  driver_id: string;
  position: string | null;
  start_date: string;
  end_date: string | null;
  status: string;
  vehicle_class: string | null;
  driver: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  rating: {
    overall_rating: number | null;
  } | null;
}

const EmployerEmployees = ({ employerId }: EmployerEmployeesProps) => {
  const [employees, setEmployees] = useState<EmploymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Rate dialog
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmploymentRecord | null>(null);
  const [ratingForm, setRatingForm] = useState({
    punctuality: 5,
    safety: 5,
    behaviour: 5,
    vehicleHandling: 5,
    remarks: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Terminate dialog
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");

  // Certificate dialog
  const [isCertDialogOpen, setIsCertDialogOpen] = useState(false);
  const [certForm, setCertForm] = useState({
    vehicleClass: "",
    performanceSummary: "",
  });

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await api.get(`/employment-history?employer_id=${employerId}`);
      setEmployees(response.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [employerId]);

  const openRateDialog = (emp: EmploymentRecord) => {
    setSelectedEmployee(emp);
    setRatingForm({
      punctuality: 5,
      safety: 5,
      behaviour: 5,
      vehicleHandling: 5,
      remarks: "",
    });
    setIsRateDialogOpen(true);
  };

  const handleSubmitRating = async () => {
    if (!selectedEmployee) return;

    setSubmitting(true);
    try {
      await api.post("/performance-ratings", {
        employment_history_id: selectedEmployee.id,
        employer_id: employerId,
        driver_id: selectedEmployee.driver_id,
        punctuality_rating: ratingForm.punctuality,
        safety_rating: ratingForm.safety,
        behaviour_rating: ratingForm.behaviour,
        vehicle_handling_rating: ratingForm.vehicleHandling,
        remarks: ratingForm.remarks || null,
      });

      toast.success("Rating submitted successfully");
      setIsRateDialogOpen(false);
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  const openTerminateDialog = (emp: EmploymentRecord) => {
    setSelectedEmployee(emp);
    setTerminationReason("");
    setIsTerminateDialogOpen(true);
  };

  const handleTerminate = async () => {
    if (!selectedEmployee) return;

    setSubmitting(true);
    try {
      await api.patch(`/employment-history/${selectedEmployee.id}`, {
        status: "terminated",
        end_date: new Date().toISOString().split("T")[0],
        termination_reason: terminationReason || null,
      });

      toast.success("Employment terminated");
      setIsTerminateDialogOpen(false);
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to terminate employment");
    } finally {
      setSubmitting(false);
    }
  };

  const openCertDialog = (emp: EmploymentRecord) => {
    setSelectedEmployee(emp);
    setCertForm({
      vehicleClass: emp.vehicle_class || "",
      performanceSummary: "",
    });
    setIsCertDialogOpen(true);
  };

  const handleIssueCertificate = async () => {
    if (!selectedEmployee || !certForm.vehicleClass) {
      toast.error("Please fill required fields");
      return;
    }

    setSubmitting(true);
    try {
      const startDate = new Date(selectedEmployee.start_date);
      const endDate = selectedEmployee.end_date ? new Date(selectedEmployee.end_date) : new Date();
      const durationMonths = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

      const certNumber = `EXP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const verificationId = `VER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      await api.post("/experience-certificates", {
        employment_history_id: selectedEmployee.id,
        driver_id: selectedEmployee.driver_id,
        employer_id: employerId,
        certificate_number: certNumber,
        verification_id: verificationId,
        vehicle_class: certForm.vehicleClass,
        employment_duration_months: durationMonths,
        performance_summary: certForm.performanceSummary || null,
      });

      toast.success("Experience certificate issued");
      setIsCertDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to issue certificate");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [employerId]);

  const filteredEmployees = employees.filter((emp) => {
    if (filter === "active") return emp.status === "active";
    if (filter === "completed") return emp.status !== "active";
    return true;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Current & Past Employees
              </CardTitle>
              <CardDescription>
                Manage your hired drivers, rate performance, and issue certificates
              </CardDescription>
            </div>
            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : filteredEmployees.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No employees found. Hire drivers through job requests.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Vehicle Class</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">
                      {emp.driver.first_name} {emp.driver.last_name}
                    </TableCell>
                    <TableCell>{emp.position || "-"}</TableCell>
                    <TableCell>
                      {emp.vehicle_class && (
                        <Badge variant="outline">{emp.vehicle_class}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(emp.start_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={emp.status === "active" ? "approved" : "secondary"}>
                        {emp.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {emp.rating?.overall_rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          {emp.rating.overall_rating.toFixed(1)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not rated</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openRateDialog(emp)}>
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openCertDialog(emp)}>
                          <Award className="w-4 h-4" />
                        </Button>
                        {emp.status === "active" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => openTerminateDialog(emp)}
                          >
                            <UserMinus className="w-4 h-4" />
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

      {/* Rate Dialog */}
      <Dialog open={isRateDialogOpen} onOpenChange={setIsRateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Driver Performance</DialogTitle>
            <DialogDescription>
              Rate {selectedEmployee?.driver.first_name} {selectedEmployee?.driver.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {["punctuality", "safety", "behaviour", "vehicleHandling"].map((field) => (
              <div key={field} className="space-y-2">
                <Label className="capitalize">{field.replace(/([A-Z])/g, " $1")}</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <Button
                      key={val}
                      size="sm"
                      variant={(ratingForm as any)[field] === val ? "default" : "outline"}
                      onClick={() => setRatingForm({ ...ratingForm, [field]: val })}
                    >
                      {val}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea
                value={ratingForm.remarks}
                onChange={(e) => setRatingForm({ ...ratingForm, remarks: e.target.value })}
                placeholder="Additional comments..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitRating} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terminate Dialog */}
      <Dialog open={isTerminateDialogOpen} onOpenChange={setIsTerminateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Employment</DialogTitle>
            <DialogDescription>
              End employment for {selectedEmployee?.driver.first_name} {selectedEmployee?.driver.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value)}
                placeholder="Reason for termination..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTerminateDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleTerminate} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Terminate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certificate Dialog */}
      <Dialog open={isCertDialogOpen} onOpenChange={setIsCertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Experience Certificate</DialogTitle>
            <DialogDescription>
              Issue certificate for {selectedEmployee?.driver.first_name} {selectedEmployee?.driver.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vehicle Class *</Label>
              <Input
                value={certForm.vehicleClass}
                onChange={(e) => setCertForm({ ...certForm, vehicleClass: e.target.value })}
                placeholder="e.g., LMV, HMV"
              />
            </div>
            <div className="space-y-2">
              <Label>Performance Summary</Label>
              <Textarea
                value={certForm.performanceSummary}
                onChange={(e) => setCertForm({ ...certForm, performanceSummary: e.target.value })}
                placeholder="Brief summary of driver's performance..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCertDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleIssueCertificate} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Issue Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployerEmployees;
