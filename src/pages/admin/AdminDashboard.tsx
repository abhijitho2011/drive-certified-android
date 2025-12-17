import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  Building2,
  FileText,
  Settings,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Phone,
  MapPin,
  Stethoscope,
  GraduationCap,
  UserCheck,
  Briefcase,
  RefreshCw,
  Map,
  ChevronRight,
  Ban,
  Key,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ClientProfileSheet from "@/components/admin/ClientProfileSheet";
import ApplicationDetailSheet from "@/components/admin/ApplicationDetailSheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import QuestionManagement from "@/components/admin/QuestionManagement";

interface Driver {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  address: string;
  district: string;
  state: string;
  pin_code: string;
  phone: string;
  status: string;
  created_at: string;
}

interface Partner {
  id: string;
  partner_type: string;
  name: string;
  address: string;
  contact_number: string;
  email: string | null;
  gst: string | null;
  district: string;
  state: string;
  status: string;
  created_at: string;
}

interface DataUser {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string | null;
  address: string | null;
  district: string | null;
  state: string | null;
  status: string;
  created_at: string;
}

interface Application {
  id: string;
  driver_id: string;
  status: string;
  identity_verified: boolean;
  driving_test_passed: boolean;
  medical_test_passed: boolean;
  education_verified: boolean;
  admin_approved: boolean;
  certificate_number: string | null;
  skill_grade: string | null;
  created_at: string;
  full_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  aadhaar_number: string | null;
  current_address: string | null;
  permanent_address: string | null;
  licence_number: string | null;
  licence_type: string | null;
  vehicle_classes: string[] | null;
  certification_vehicle_class: string | null;
  certification_purpose: string | null;
  highest_qualification: string | null;
  documents: Record<string, string> | null;
  notes: string | null;
  drivers?: Driver;
}

interface State {
  id: string;
  name: string;
  code: string | null;
  status: string;
  created_at: string;
}

interface District {
  id: string;
  state_id: string;
  name: string;
  code: string | null;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("clients");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [dataUsers, setDataUsers] = useState<DataUser[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  // Sheet states
  const [isPartnerSheetOpen, setIsPartnerSheetOpen] = useState(false);
  const [isEditPartnerOpen, setIsEditPartnerOpen] = useState(false);
  const [isDataUserSheetOpen, setIsDataUserSheetOpen] = useState(false);
  
  const [isEditDriverOpen, setIsEditDriverOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStateSheetOpen, setIsStateSheetOpen] = useState(false);
  const [isDistrictSheetOpen, setIsDistrictSheetOpen] = useState(false);
  
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [selectedStateForDistrict, setSelectedStateForDistrict] = useState<State | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);

  // Client Profile and Application Detail states
  const [isClientProfileOpen, setIsClientProfileOpen] = useState(false);
  const [isApplicationDetailOpen, setIsApplicationDetailOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Form states
  const [partnerType, setPartnerType] = useState("");
  const [partnerForm, setPartnerForm] = useState({
    name: "",
    address: "",
    contactNumber: "",
    email: "",
    gst: "",
    district: "",
    state: "",
  });

  const [dataUserForm, setDataUserForm] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    state: "",
  });

  const [editDriverForm, setEditDriverForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    district: "",
    state: "",
    pinCode: "",
    phone: "",
  });

  const [stateForm, setStateForm] = useState({ name: "", code: "" });
  const [districtForm, setDistrictForm] = useState({ name: "", code: "" });

  const [editPartnerForm, setEditPartnerForm] = useState({
    name: "",
    address: "",
    contactNumber: "",
    email: "",
    gst: "",
    district: "",
    state: "",
  });

  // Password dialog state
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [driversRes, partnersRes, dataUsersRes, applicationsRes, statesRes, districtsRes] = await Promise.all([
        supabase.from("drivers").select("*").order("created_at", { ascending: false }),
        supabase.from("partners").select("*").order("created_at", { ascending: false }),
        supabase.from("data_users").select("*").order("created_at", { ascending: false }),
        supabase.from("applications").select("*, drivers(*)").order("created_at", { ascending: false }),
        supabase.from("states").select("*").order("name", { ascending: true }),
        supabase.from("districts").select("*").order("name", { ascending: true }),
      ]);

      if (driversRes.data) setDrivers(driversRes.data);
      if (partnersRes.data) setPartners(partnersRes.data);
      if (dataUsersRes.data) setDataUsers(dataUsersRes.data);
      if (applicationsRes.data) setApplications(applicationsRes.data as Application[]);
      if (statesRes.data) setStates(statesRes.data);
      if (districtsRes.data) setDistricts(districtsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPartner = async () => {
    if (!partnerType || !partnerForm.name || !partnerForm.address || !partnerForm.contactNumber || !partnerForm.district || !partnerForm.state) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      // Create partner record - admin will use "Set Password" to create auth credentials
      const { error } = await supabase.from("partners").insert({
        partner_type: partnerType,
        name: partnerForm.name,
        address: partnerForm.address,
        contact_number: partnerForm.contactNumber,
        email: partnerForm.email || null,
        gst: partnerForm.gst || null,
        district: partnerForm.district,
        state: partnerForm.state,
      });

      if (error) throw error;

      toast.success("Partner added successfully. Use 'Set Password' to create login credentials.");
      setIsPartnerSheetOpen(false);
      setPartnerForm({ name: "", address: "", contactNumber: "", email: "", gst: "", district: "", state: "" });
      setPartnerType("");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add partner");
    }
  };

  const handleEditPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setEditPartnerForm({
      name: partner.name,
      address: partner.address,
      contactNumber: partner.contact_number,
      email: partner.email || "",
      gst: partner.gst || "",
      district: partner.district,
      state: partner.state,
    });
    setIsEditPartnerOpen(true);
  };

  const handleSavePartnerEdit = async () => {
    if (!selectedPartner) return;

    if (!editPartnerForm.name || !editPartnerForm.address || !editPartnerForm.contactNumber || !editPartnerForm.district || !editPartnerForm.state) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from("partners")
        .update({
          name: editPartnerForm.name,
          address: editPartnerForm.address,
          contact_number: editPartnerForm.contactNumber,
          email: editPartnerForm.email || null,
          gst: editPartnerForm.gst || null,
          district: editPartnerForm.district,
          state: editPartnerForm.state,
        })
        .eq("id", selectedPartner.id);

      if (error) throw error;

      toast.success("Partner updated successfully");
      setIsEditPartnerOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update partner");
    }
  };

  const handleAddDataUser = async () => {
    if (!dataUserForm.companyName || !dataUserForm.contactPerson || !dataUserForm.phone) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const { error } = await supabase.from("data_users").insert({
        company_name: dataUserForm.companyName,
        contact_person: dataUserForm.contactPerson,
        phone: dataUserForm.phone,
        email: dataUserForm.email || null,
        address: dataUserForm.address || null,
        district: dataUserForm.district || null,
        state: dataUserForm.state || null,
      });

      if (error) throw error;

      toast.success("Data user added successfully");
      setIsDataUserSheetOpen(false);
      setDataUserForm({ companyName: "", contactPerson: "", phone: "", email: "", address: "", district: "", state: "" });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add data user");
    }
  };

  const handleViewDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsClientProfileOpen(true);
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setIsApplicationDetailOpen(true);
  };

  const handleBlacklistPartner = async (partner: Partner) => {
    const newStatus = partner.status === "blacklisted" ? "active" : "blacklisted";
    
    try {
      const { error } = await supabase
        .from("partners")
        .update({ status: newStatus })
        .eq("id", partner.id);

      if (error) throw error;

      toast.success(
        newStatus === "blacklisted" 
          ? "Partner blacklisted successfully" 
          : "Partner restored successfully"
      );
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update partner status");
    }
  };

  const handleSetPassword = (partner: Partner) => {
    setSelectedPartner(partner);
    setPasswordForm({ email: partner.email || "", password: "", confirmPassword: "" });
    setIsPasswordDialogOpen(true);
  };

  const handleSavePassword = async () => {
    if (!selectedPartner) return;
    
    if (!passwordForm.email || !passwordForm.password) {
      toast.error("Email and password are required");
      return;
    }
    
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (passwordForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Not authenticated");
        return;
      }

      const response = await supabase.functions.invoke("set-partner-password", {
        body: {
          partnerId: selectedPartner.id,
          email: passwordForm.email,
          password: passwordForm.password,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to set password");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success(response.data?.message || "Password set successfully");
      setIsPasswordDialogOpen(false);
      setPasswordForm({ email: "", password: "", confirmPassword: "" });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to set password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setEditDriverForm({
      firstName: driver.first_name,
      lastName: driver.last_name,
      address: driver.address,
      district: driver.district,
      state: driver.state,
      pinCode: driver.pin_code,
      phone: driver.phone,
    });
    setIsEditDriverOpen(true);
  };

  const handleSaveDriverEdit = async () => {
    if (!selectedDriver) return;

    try {
      const { error } = await supabase
        .from("drivers")
        .update({
          first_name: editDriverForm.firstName,
          last_name: editDriverForm.lastName,
          address: editDriverForm.address,
          district: editDriverForm.district,
          state: editDriverForm.state,
          pin_code: editDriverForm.pinCode,
          phone: editDriverForm.phone,
        })
        .eq("id", selectedDriver.id);

      if (error) throw error;

      toast.success("Driver updated successfully");
      setIsEditDriverOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update driver");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      let error;
      switch (deleteTarget.type) {
        case "driver":
          ({ error } = await supabase.from("drivers").delete().eq("id", deleteTarget.id));
          break;
        case "partner":
          ({ error } = await supabase.from("partners").delete().eq("id", deleteTarget.id));
          break;
        case "data_user":
          ({ error } = await supabase.from("data_users").delete().eq("id", deleteTarget.id));
          break;
        case "state":
          ({ error } = await supabase.from("states").delete().eq("id", deleteTarget.id));
          break;
        case "district":
          ({ error } = await supabase.from("districts").delete().eq("id", deleteTarget.id));
          break;
      }

      if (error) throw error;

      toast.success(`${deleteTarget.name} deleted successfully`);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const openDeleteDialog = (type: string, id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setIsDeleteDialogOpen(true);
  };

  // State management
  const handleAddState = async () => {
    if (!stateForm.name) {
      toast.error("Please enter state name");
      return;
    }

    try {
      const { error } = await supabase.from("states").insert({
        name: stateForm.name,
        code: stateForm.code || null,
      });

      if (error) throw error;

      toast.success("State added successfully");
      setIsStateSheetOpen(false);
      setStateForm({ name: "", code: "" });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add state");
    }
  };

  const handleAddDistrict = async () => {
    if (!districtForm.name || !selectedStateForDistrict) {
      toast.error("Please enter district name");
      return;
    }

    try {
      const { error } = await supabase.from("districts").insert({
        state_id: selectedStateForDistrict.id,
        name: districtForm.name,
        code: districtForm.code || null,
      });

      if (error) throw error;

      toast.success("District added successfully");
      setIsDistrictSheetOpen(false);
      setDistrictForm({ name: "", code: "" });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add district");
    }
  };

  const getDistrictsForState = (stateId: string) => {
    return districts.filter(d => d.state_id === stateId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="approved">Approved</Badge>;
      case "rejected":
        return <Badge variant="rejected">Rejected</Badge>;
      case "in_review":
        return <Badge variant="pending">In Review</Badge>;
      default:
        return <Badge variant="pending">Pending</Badge>;
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage clients, partners, and applications.</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Clients</span>
            </TabsTrigger>
            <TabsTrigger value="partners" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Partners</span>
            </TabsTrigger>
            <TabsTrigger value="data-users" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Data Users</span>
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Applications</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registered Drivers (Clients)</CardTitle>
                <CardDescription>All drivers who registered through the app appear here automatically.</CardDescription>
              </CardHeader>
              <CardContent>
                {drivers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No drivers registered yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.map((driver) => (
                        <TableRow key={driver.id}>
                          <TableCell className="font-medium">
                            {driver.first_name} {driver.last_name}
                          </TableCell>
                          <TableCell>{driver.phone}</TableCell>
                          <TableCell>{driver.district}</TableCell>
                          <TableCell>{driver.state}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                driver.status === "active" 
                                  ? "approved" 
                                  : driver.status === "blacklisted" 
                                  ? "rejected" 
                                  : "pending"
                              }
                            >
                              {driver.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => handleViewDriver(driver)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleEditDriver(driver)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="text-destructive"
                                onClick={() => openDeleteDialog("driver", driver.id, `${driver.first_name} ${driver.last_name}`)}
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

          {/* Partners Tab */}
          <TabsContent value="partners" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setIsPartnerSheetOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Partners</CardTitle>
                <CardDescription>Driving Schools and Medical Labs</CardDescription>
              </CardHeader>
              <CardContent>
                {partners.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No partners added yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partners.map((partner) => (
                        <TableRow key={partner.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {partner.partner_type === "driving_school" ? (
                                <GraduationCap className="w-4 h-4 text-primary" />
                              ) : partner.partner_type === "verification_agent" ? (
                                <UserCheck className="w-4 h-4 text-primary" />
                              ) : (
                                <Stethoscope className="w-4 h-4 text-primary" />
                              )}
                              {partner.partner_type === "driving_school" 
                                ? "Driving School" 
                                : partner.partner_type === "verification_agent"
                                ? "Verification Agent"
                                : "Medical Lab"}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{partner.name}</TableCell>
                          <TableCell>{partner.contact_number}</TableCell>
                          <TableCell>{partner.district}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                partner.status === "active" 
                                  ? "approved" 
                                  : partner.status === "blacklisted" 
                                  ? "rejected" 
                                  : "pending"
                              }
                            >
                              {partner.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => handleEditPartner(partner)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="text-blue-600"
                                onClick={() => handleSetPassword(partner)}
                                title="Set Password"
                              >
                                <Key className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className={partner.status === "blacklisted" ? "text-green-600" : "text-orange-500"}
                                onClick={() => handleBlacklistPartner(partner)}
                                title={partner.status === "blacklisted" ? "Restore Partner" : "Blacklist Partner"}
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="text-destructive"
                                onClick={() => openDeleteDialog("partner", partner.id, partner.name)}
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

          {/* Data Users Tab */}
          <TabsContent value="data-users" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setIsDataUserSheetOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Data User
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Data Users</CardTitle>
                <CardDescription>Company Verifiers who can access driver certificates</CardDescription>
              </CardHeader>
              <CardContent>
                {dataUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No data users added yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.company_name}</TableCell>
                          <TableCell>{user.contact_person}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>{user.email || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={user.status === "active" ? "approved" : "pending"}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-destructive"
                              onClick={() => openDeleteDialog("data_user", user.id, user.company_name)}
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

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Driver Applications</CardTitle>
                <CardDescription>Certification requests from drivers</CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No applications yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Driver</TableHead>
                        <TableHead>Vehicle Class</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verifications</TableHead>
                        <TableHead>Certificate</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">
                            {app.drivers ? `${app.drivers.first_name} ${app.drivers.last_name}` : app.full_name || "Unknown"}
                          </TableCell>
                          <TableCell>{app.certification_vehicle_class || "-"}</TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              <Badge 
                                variant={app.identity_verified ? "approved" : "pending"} 
                                className="text-xs"
                              >
                                ID
                              </Badge>
                              <Badge 
                                variant={app.driving_test_passed ? "approved" : "pending"} 
                                className="text-xs"
                              >
                                Drive
                              </Badge>
                              <Badge 
                                variant={app.medical_test_passed ? "approved" : "pending"} 
                                className="text-xs"
                              >
                                Med
                              </Badge>
                              <Badge 
                                variant={app.education_verified ? "approved" : "pending"} 
                                className="text-xs"
                              >
                                Edu
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{app.certificate_number || "-"}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleViewApplication(app)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            {/* System Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Admin settings and overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Admin Phone Number</h3>
                    <p className="text-muted-foreground">+91 9895077492</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Statistics</h3>
                    <p className="text-sm text-muted-foreground">
                      Clients: {drivers.length} | Partners: {partners.length} | Data Users: {dataUsers.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* States & Districts Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Map className="w-5 h-5" />
                      States & Districts
                    </CardTitle>
                    <CardDescription>Manage states and their districts</CardDescription>
                  </div>
                  <Button onClick={() => setIsStateSheetOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add State
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {states.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No states added yet. Add a state to get started.</p>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {states.map((state) => (
                      <AccordionItem key={state.id} value={state.id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="font-medium">{state.name}</span>
                              {state.code && (
                                <Badge variant="outline" className="ml-2">{state.code}</Badge>
                              )}
                            </div>
                            <Badge variant="secondary">
                              {getDistrictsForState(state.id).length} districts
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-6 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Districts in {state.name}</span>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedStateForDistrict(state);
                                    setIsDistrictSheetOpen(true);
                                  }}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add District
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => openDeleteDialog("state", state.id, state.name)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            {getDistrictsForState(state.id).length === 0 ? (
                              <p className="text-sm text-muted-foreground py-2">No districts added yet.</p>
                            ) : (
                              <div className="grid gap-2">
                                {getDistrictsForState(state.id).map((district) => (
                                  <div
                                    key={district.id}
                                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                                  >
                                    <div className="flex items-center gap-2">
                                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                      <span>{district.name}</span>
                                      {district.code && (
                                        <Badge variant="outline" className="text-xs">{district.code}</Badge>
                                      )}
                                    </div>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 text-destructive"
                                      onClick={() => openDeleteDialog("district", district.id, district.name)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>

            {/* Traffic Law Questions Card */}
            <QuestionManagement />
          </TabsContent>
        </Tabs>

        {/* Add Partner Sheet */}
        <Sheet open={isPartnerSheetOpen} onOpenChange={setIsPartnerSheetOpen}>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add New Partner</SheetTitle>
              <SheetDescription>Register a Driving School or Medical Lab</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Partner Type *</Label>
                <Select value={partnerType} onValueChange={setPartnerType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driving_school">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Driving School
                      </div>
                    </SelectItem>
                    <SelectItem value="medical_lab">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        Medical Lab
                      </div>
                    </SelectItem>
                    <SelectItem value="verification_agent">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Verification Agent
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="Enter name"
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Address *</Label>
                <Input
                  placeholder="Enter address"
                  value={partnerForm.address}
                  onChange={(e) => setPartnerForm({ ...partnerForm, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Number *</Label>
                <Input
                  placeholder="Enter contact number"
                  value={partnerForm.contactNumber}
                  onChange={(e) => setPartnerForm({ ...partnerForm, contactNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Enter email (optional)"
                  value={partnerForm.email}
                  onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>GST Number</Label>
                <Input
                  placeholder="Enter GST (optional)"
                  value={partnerForm.gst}
                  onChange={(e) => setPartnerForm({ ...partnerForm, gst: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Select 
                  value={partnerForm.state} 
                  onValueChange={(value) => setPartnerForm({ ...partnerForm, state: value, district: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50 max-h-60">
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.name}>{state.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>District *</Label>
                <Select 
                  value={partnerForm.district} 
                  onValueChange={(value) => setPartnerForm({ ...partnerForm, district: value })}
                  disabled={!partnerForm.state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={partnerForm.state ? "Select district" : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50 max-h-60">
                    {districts
                      .filter((d) => {
                        const selectedState = states.find((s) => s.name === partnerForm.state);
                        return selectedState && d.state_id === selectedState.id;
                      })
                      .map((district) => (
                        <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => setIsPartnerSheetOpen(false)}>Cancel</Button>
              <Button onClick={handleAddPartner}>Add Partner</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Edit Partner Sheet */}
        <Sheet open={isEditPartnerOpen} onOpenChange={setIsEditPartnerOpen}>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Partner</SheetTitle>
              <SheetDescription>
                {selectedPartner?.partner_type === "driving_school" 
                  ? "Driving School" 
                  : selectedPartner?.partner_type === "verification_agent"
                  ? "Verification Agent"
                  : "Medical Lab"}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="Enter name"
                  value={editPartnerForm.name}
                  onChange={(e) => setEditPartnerForm({ ...editPartnerForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Address *</Label>
                <Input
                  placeholder="Enter address"
                  value={editPartnerForm.address}
                  onChange={(e) => setEditPartnerForm({ ...editPartnerForm, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Number *</Label>
                <Input
                  placeholder="Enter contact number"
                  value={editPartnerForm.contactNumber}
                  onChange={(e) => setEditPartnerForm({ ...editPartnerForm, contactNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Enter email (optional)"
                  value={editPartnerForm.email}
                  onChange={(e) => setEditPartnerForm({ ...editPartnerForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>GST Number</Label>
                <Input
                  placeholder="Enter GST (optional)"
                  value={editPartnerForm.gst}
                  onChange={(e) => setEditPartnerForm({ ...editPartnerForm, gst: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Select 
                  value={editPartnerForm.state} 
                  onValueChange={(value) => setEditPartnerForm({ ...editPartnerForm, state: value, district: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50 max-h-60">
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.name}>{state.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>District *</Label>
                <Select 
                  value={editPartnerForm.district} 
                  onValueChange={(value) => setEditPartnerForm({ ...editPartnerForm, district: value })}
                  disabled={!editPartnerForm.state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={editPartnerForm.state ? "Select district" : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50 max-h-60">
                    {districts
                      .filter((d) => {
                        const selectedState = states.find((s) => s.name === editPartnerForm.state);
                        return selectedState && d.state_id === selectedState.id;
                      })
                      .map((district) => (
                        <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => setIsEditPartnerOpen(false)}>Cancel</Button>
              <Button onClick={handleSavePartnerEdit}>Save Changes</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Add Data User Sheet */}
        <Sheet open={isDataUserSheetOpen} onOpenChange={setIsDataUserSheetOpen}>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add Data User</SheetTitle>
              <SheetDescription>Add a company verifier</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input
                  placeholder="Enter company name"
                  value={dataUserForm.companyName}
                  onChange={(e) => setDataUserForm({ ...dataUserForm, companyName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Person *</Label>
                <Input
                  placeholder="Enter contact person name"
                  value={dataUserForm.contactPerson}
                  onChange={(e) => setDataUserForm({ ...dataUserForm, contactPerson: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  placeholder="Enter phone number"
                  value={dataUserForm.phone}
                  onChange={(e) => setDataUserForm({ ...dataUserForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Enter email (optional)"
                  value={dataUserForm.email}
                  onChange={(e) => setDataUserForm({ ...dataUserForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  placeholder="Enter address (optional)"
                  value={dataUserForm.address}
                  onChange={(e) => setDataUserForm({ ...dataUserForm, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Select 
                  value={dataUserForm.state} 
                  onValueChange={(value) => setDataUserForm({ ...dataUserForm, state: value, district: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50 max-h-60">
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.name}>{state.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>District</Label>
                <Select 
                  value={dataUserForm.district} 
                  onValueChange={(value) => setDataUserForm({ ...dataUserForm, district: value })}
                  disabled={!dataUserForm.state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dataUserForm.state ? "Select district" : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50 max-h-60">
                    {districts
                      .filter((d) => {
                        const selectedState = states.find((s) => s.name === dataUserForm.state);
                        return selectedState && d.state_id === selectedState.id;
                      })
                      .map((district) => (
                        <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => setIsDataUserSheetOpen(false)}>Cancel</Button>
              <Button onClick={handleAddDataUser}>Add Data User</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Client Profile Sheet */}
        <ClientProfileSheet
          open={isClientProfileOpen}
          onOpenChange={setIsClientProfileOpen}
          driver={selectedDriver}
          onViewApplication={handleViewApplication}
          onRefresh={fetchData}
        />

        {/* Application Detail Sheet */}
        <ApplicationDetailSheet
          open={isApplicationDetailOpen}
          onOpenChange={setIsApplicationDetailOpen}
          application={selectedApplication}
          onRefresh={fetchData}
        />

        {/* Edit Driver Sheet */}
        <Sheet open={isEditDriverOpen} onOpenChange={setIsEditDriverOpen}>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Driver</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={editDriverForm.firstName}
                    onChange={(e) => setEditDriverForm({ ...editDriverForm, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={editDriverForm.lastName}
                    onChange={(e) => setEditDriverForm({ ...editDriverForm, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={editDriverForm.address}
                  onChange={(e) => setEditDriverForm({ ...editDriverForm, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Select 
                  value={editDriverForm.state} 
                  onValueChange={(value) => setEditDriverForm({ ...editDriverForm, state: value, district: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50 max-h-60">
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.name}>{state.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>District</Label>
                <Select 
                  value={editDriverForm.district} 
                  onValueChange={(value) => setEditDriverForm({ ...editDriverForm, district: value })}
                  disabled={!editDriverForm.state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={editDriverForm.state ? "Select district" : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50 max-h-60">
                    {districts
                      .filter((d) => {
                        const selectedState = states.find((s) => s.name === editDriverForm.state);
                        return selectedState && d.state_id === selectedState.id;
                      })
                      .map((district) => (
                        <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>PIN Code</Label>
                <Input
                  value={editDriverForm.pinCode}
                  onChange={(e) => setEditDriverForm({ ...editDriverForm, pinCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editDriverForm.phone}
                  onChange={(e) => setEditDriverForm({ ...editDriverForm, phone: e.target.value })}
                />
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => setIsEditDriverOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveDriverEdit}>Save Changes</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Add State Sheet */}
        <Sheet open={isStateSheetOpen} onOpenChange={setIsStateSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New State</SheetTitle>
              <SheetDescription>Add a state to the system</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>State Name *</Label>
                <Input
                  placeholder="Enter state name"
                  value={stateForm.name}
                  onChange={(e) => setStateForm({ ...stateForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>State Code</Label>
                <Input
                  placeholder="e.g., KL, TN, MH (optional)"
                  value={stateForm.code}
                  onChange={(e) => setStateForm({ ...stateForm, code: e.target.value })}
                />
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => setIsStateSheetOpen(false)}>Cancel</Button>
              <Button onClick={handleAddState}>Add State</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Add District Sheet */}
        <Sheet open={isDistrictSheetOpen} onOpenChange={setIsDistrictSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add District</SheetTitle>
              <SheetDescription>
                Add a district to {selectedStateForDistrict?.name}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>District Name *</Label>
                <Input
                  placeholder="Enter district name"
                  value={districtForm.name}
                  onChange={(e) => setDistrictForm({ ...districtForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>District Code</Label>
                <Input
                  placeholder="Optional code"
                  value={districtForm.code}
                  onChange={(e) => setDistrictForm({ ...districtForm, code: e.target.value })}
                />
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => setIsDistrictSheetOpen(false)}>Cancel</Button>
              <Button onClick={handleAddDistrict}>Add District</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Password Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Partner Password</DialogTitle>
              <DialogDescription>
                Set login credentials for {selectedPartner?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={passwordForm.email}
                  onChange={(e) => setPasswordForm({ ...passwordForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input
                  type="password"
                  placeholder="Enter password (min 6 characters)"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password *</Label>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSavePassword} disabled={passwordLoading}>
                {passwordLoading ? "Setting..." : "Set Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
