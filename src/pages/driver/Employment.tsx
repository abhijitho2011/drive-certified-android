import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Briefcase,
  Eye,
  EyeOff,
  MapPin,
  DollarSign,
  Shield,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";

interface EmploymentStatus {
  id?: string;
  employment_status: string;
  availability: string;
  preferred_work_types: string[];
  preferred_locations: string[];
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  is_visible_to_employers: boolean;
}

const workTypes = [
  { value: "delivery", label: "Delivery Services" },
  { value: "taxi", label: "Taxi / Cab Services" },
  { value: "truck", label: "Truck / Logistics" },
  { value: "hazardous", label: "Hazardous Goods Transport" },
  { value: "bus", label: "Bus / Passenger Transport" },
];

const Employment = () => {
  const { user } = useAuth();
  const [driverData, setDriverData] = useState<{ first_name: string; last_name: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [status, setStatus] = useState<EmploymentStatus>({
    employment_status: "unemployed",
    availability: "full_time",
    preferred_work_types: [],
    preferred_locations: [],
    expected_salary_min: null,
    expected_salary_max: null,
    is_visible_to_employers: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const driverRes = await api.get(`/drivers/user/${user.id}`);
        const driver = driverRes.data;

        if (driver) {
          setDriverData(driver);

          // Check if driver has any active certificate
          try {
            const appsRes = await api.get(`/applications/driver/${driver.id}`);
            const apps = appsRes.data;
            const hasCert = apps && apps.some((app: { certificate_number: string | null }) => app.certificate_number);
            setHasCertificate(hasCert);
          } catch (e) {
            console.error("Error fetching applications", e);
          }

          // Get existing employment status
          try {
            const empStatusRes = await api.get(`/drivers/${driver.id}/employment-status`);
            const empStatus = empStatusRes.data;

            if (empStatus) {
              setStatus({
                id: empStatus.id,
                employment_status: empStatus.employment_status || "unemployed",
                availability: empStatus.availability || "full_time",
                preferred_work_types: empStatus.preferred_work_types || [],
                preferred_locations: empStatus.preferred_locations || [],
                expected_salary_min: empStatus.expected_salary_min,
                expected_salary_max: empStatus.expected_salary_max,
                is_visible_to_employers: empStatus.is_visible_to_employers || false,
              });
            }
          } catch (e) {
            // It's okay if no status exists yet
            console.log("No existing employment status found");
          }
        }
      } catch (error) {
        console.error("Error fetching driver data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleVisibilityToggle = async (checked: boolean) => {
    if (!driverData) return;

    setStatus(prev => ({ ...prev, is_visible_to_employers: checked }));

    // Log consent via API
    try {
      await api.post(`/drivers/${driverData.id}/visibility-consent`, {
        action: checked ? "opt_in" : "opt_out",
      });
    } catch (error) {
      console.error("Failed to log visibility consent", error);
    }
  };

  const handleSave = async () => {
    if (!driverData) return;

    setSaving(true);
    try {
      const data = {
        driver_id: driverData.id,
        employment_status: status.employment_status,
        availability: status.availability,
        preferred_work_types: status.preferred_work_types,
        preferred_locations: status.preferred_locations,
        expected_salary_min: status.expected_salary_min,
        expected_salary_max: status.expected_salary_max,
        is_visible_to_employers: status.is_visible_to_employers,
        visibility_updated_at: status.is_visible_to_employers ? new Date().toISOString() : null,
      };

      if (status.id) {
        await api.patch(`/drivers/${driverData.id}/employment-status/${status.id}`, data);
      } else {
        await api.post(`/drivers/${driverData.id}/employment-status`, data);
      }

      toast.success("Employment preferences saved successfully");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const toggleWorkType = (type: string) => {
    setStatus(prev => ({
      ...prev,
      preferred_work_types: prev.preferred_work_types.includes(type)
        ? prev.preferred_work_types.filter(t => t !== type)
        : [...prev.preferred_work_types, type],
    }));
  };

  const userName = driverData
    ? `${driverData.first_name} ${driverData.last_name}`
    : "Driver";

  if (loading) {
    return (
      <DashboardLayout role="driver" userName="Loading...">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="driver" userName={userName}>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">Employment Preferences</h1>
          <p className="text-muted-foreground">Manage your job availability and preferences</p>
        </div>

        {!hasCertificate && (
          <Card className="border-warning bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                <div>
                  <p className="font-medium">No Active Certificate</p>
                  <p className="text-sm text-muted-foreground">
                    Only certified drivers can be visible to employers. Complete your certification application first.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visibility Toggle */}
        <Card className={status.is_visible_to_employers ? "border-green-500/50" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {status.is_visible_to_employers ? (
                  <Eye className="w-5 h-5 text-green-500" />
                ) : (
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <CardTitle>Job Visibility</CardTitle>
                  <CardDescription>
                    {status.is_visible_to_employers
                      ? "Employers can find you in the Driver Exchange"
                      : "You are hidden from employer searches"}
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={status.is_visible_to_employers}
                onCheckedChange={handleVisibilityToggle}
                disabled={!hasCertificate}
              />
            </div>
          </CardHeader>
          {status.is_visible_to_employers && (
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Your contact details are never shared. Employers can only send job requests through the platform.</span>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Employment Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employment Status</Label>
                <Select
                  value={status.employment_status}
                  onValueChange={(v) => setStatus(prev => ({ ...prev, employment_status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employed">Employed</SelectItem>
                    <SelectItem value="self_employed">Self-Employed</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                    <SelectItem value="looking">Looking for Opportunities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select
                  value={status.availability}
                  onValueChange={(v) => setStatus(prev => ({ ...prev, availability: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full-Time</SelectItem>
                    <SelectItem value="part_time">Part-Time</SelectItem>
                    <SelectItem value="contract">Contract / Project-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Work Preferences</CardTitle>
            <CardDescription>Select the types of work you're interested in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              {workTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.value}
                    checked={status.preferred_work_types.includes(type.value)}
                    onCheckedChange={() => toggleWorkType(type.value)}
                  />
                  <label htmlFor={type.value} className="text-sm cursor-pointer">
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Salary Expectations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Salary Expectations
            </CardTitle>
            <CardDescription>Optional - helps employers match your expectations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum (Monthly)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 15000"
                  value={status.expected_salary_min || ""}
                  onChange={(e) => setStatus(prev => ({
                    ...prev,
                    expected_salary_min: e.target.value ? Number(e.target.value) : null
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Maximum (Monthly)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 25000"
                  value={status.expected_salary_max || ""}
                  onChange={(e) => setStatus(prev => ({
                    ...prev,
                    expected_salary_max: e.target.value ? Number(e.target.value) : null
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferred Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Preferred Locations
            </CardTitle>
            <CardDescription>Enter cities or areas where you'd like to work</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="e.g., Mumbai, Delhi, Pune (comma-separated)"
              value={status.preferred_locations.join(", ")}
              onChange={(e) => setStatus(prev => ({
                ...prev,
                preferred_locations: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
              }))}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Employment;
