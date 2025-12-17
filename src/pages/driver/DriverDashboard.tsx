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

  useEffect(() => {
    const fetchDriverData = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("drivers")
        .select("first_name, last_name")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data) {
        setDriverData(data);
      }
    };

    fetchDriverData();
  }, [user]);

  const userName = driverData 
    ? `${driverData.first_name} ${driverData.last_name}` 
    : user?.user_metadata?.first_name 
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
      : "Driver";

  // Application status - will be fetched from applications table
  const progress = 20; // Just registered, no application yet

  const statusSteps = [
    { label: "Application Submitted", completed: false, current: true },
    { label: "Driving School Test", completed: false, current: false },
    { label: "Medical Test", completed: false, current: false },
    { label: "Admin Review", completed: false, current: false },
    { label: "Certificate Issued", completed: false, current: false },
  ];

  const requiredDocuments = [
    { label: "Driving License", uploaded: false },
    { label: "Aadhaar / ID", uploaded: false },
    { label: "Police Clearance Certificate", uploaded: false },
    { label: "Educational Qualification", uploaded: false },
  ];

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

  return (
    <DashboardLayout role="driver" userName={userName}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {driverData?.first_name || user?.user_metadata?.first_name || "Driver"}!</h1>
            <p className="text-muted-foreground">Track your certification progress and manage your documents.</p>
          </div>
          <Link to="/driver/application">
            <Button>
              View Application
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
              <Badge variant="secondary">Not Started</Badge>
            </div>
            <CardDescription>Your certification application is being processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{progress}%</span>
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

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="w-5 h-5" />
                Vehicle Class Applied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge>4 Wheeler</Badge>
                <Badge variant="outline">Light Commercial Vehicle</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {requiredDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{doc.label}</span>
                    {doc.uploaded ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Required */}
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Action Required</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Please visit the assigned driving school for your skill test.
                </p>
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-sm font-medium">ABC Driving School</p>
                  <p className="text-xs text-muted-foreground">123 Main Road, Delhi - 110001</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DriverDashboard;
