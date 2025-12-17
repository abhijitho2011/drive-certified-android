import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Upload, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Car
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const DriverDashboard = () => {
  const { user } = useAuth();
  const [driverData, setDriverData] = useState<{ first_name: string; last_name: string } | null>(null);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      // Fetch driver data
      const { data: driver } = await supabase
        .from("drivers")
        .select("id, first_name, last_name")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (driver) {
        setDriverData(driver);
        
        // Fetch application if driver exists
        const { data: app } = await supabase
          .from("applications")
          .select("*")
          .eq("driver_id", driver.id)
          .maybeSingle();
        
        setApplication(app);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const userName = driverData 
    ? `${driverData.first_name} ${driverData.last_name}` 
    : user?.user_metadata?.first_name 
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
      : "Driver";

  // Calculate progress based on application status
  const getProgressAndSteps = () => {
    if (!application) {
      return {
        progress: 0,
        steps: [
          { label: "Application Submitted", completed: false, current: true },
          { label: "Driving School Test", completed: false, current: false },
          { label: "Medical Test", completed: false, current: false },
          { label: "Admin Review", completed: false, current: false },
          { label: "Certificate Issued", completed: false, current: false },
        ]
      };
    }

    const steps = [
      { label: "Application Submitted", completed: true, current: false },
      { label: "Driving School Test", completed: application.driving_test_passed || false, current: !application.driving_test_passed },
      { label: "Medical Test", completed: application.medical_test_passed || false, current: application.driving_test_passed && !application.medical_test_passed },
      { label: "Admin Review", completed: application.admin_approved || false, current: application.medical_test_passed && !application.admin_approved },
      { label: "Certificate Issued", completed: !!application.certificate_number, current: application.admin_approved && !application.certificate_number },
    ];

    const completedSteps = steps.filter(s => s.completed).length;
    const progress = (completedSteps / steps.length) * 100;

    return { progress, steps };
  };

  const { progress, steps: statusSteps } = getProgressAndSteps();

  const quickActions = [
    { 
      icon: FileText, 
      label: "View Application", 
      href: "/driver/application",
      description: "Check your application details"
    },
    { 
      icon: Upload, 
      label: "Upload Documents", 
      href: "/driver/documents",
      description: "Add required documents"
    },
    { 
      icon: Award, 
      label: "My Certificates", 
      href: "/driver/certificates",
      description: "View issued certificates"
    },
  ];

  const getStatusBadge = () => {
    if (!application) return <Badge variant="secondary">Not Started</Badge>;
    if (application.certificate_number) return <Badge variant="success">Completed</Badge>;
    if (application.status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="default">In Progress</Badge>;
  };

  return (
    <DashboardLayout role="driver" userName={userName}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {driverData?.first_name || user?.user_metadata?.first_name || "Driver"}!</h1>
            <p className="text-muted-foreground">Track your certification progress and manage your documents.</p>
          </div>
          <Link to={application ? "/driver/application" : "/driver/apply"}>
            <Button>
              {application ? "View Application" : "Start Application"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Application Status Card */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Application Status
              </CardTitle>
              {getStatusBadge()}
            </div>
            <CardDescription>
              {application ? "Your certification application is being processed" : "Start your certification application to begin"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex flex-col md:flex-row gap-2 md:gap-0">
              {statusSteps.map((step, index) => (
                <div key={index} className="flex-1 flex items-center">
                  <div className="flex items-center gap-2 md:flex-col md:items-center md:text-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.completed
                          ? "bg-success text-success-foreground"
                          : step.current
                          ? "bg-primary text-primary-foreground animate-pulse"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs ${step.current ? "font-medium" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className="hidden md:block flex-shrink-0 w-full h-0.5 bg-border mx-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <action.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-1">{action.label}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info Cards - Only show if application exists */}
        {application && (
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Application Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium capitalize">{application.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Identity Verified</span>
                    {application.identity_verified ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Education Verified</span>
                    {application.education_verified ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Driving Test</span>
                    {application.driving_test_passed ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medical Test</span>
                    {application.medical_test_passed ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Admin Approved</span>
                    {application.admin_approved ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Application Message */}
        {!application && !loading && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Get Started</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    You haven't started your certification application yet. Begin your journey to become a certified driver.
                  </p>
                  <Link to="/driver/apply">
                    <Button size="sm">Start Application</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DriverDashboard;
