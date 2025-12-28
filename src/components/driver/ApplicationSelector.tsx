import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronRight, Calendar, Clock } from "lucide-react";

interface Application {
  id: string;
  certificate_number: string | null;
  status: string | null;
  created_at: string | null;
  certification_vehicle_class: string | null;
  certification_purpose: string | null;
}

interface ApplicationSelectorProps {
  applications: Application[];
  onSelect: (applicationId: string) => void;
  title: string;
  description: string;
}

const ApplicationSelector = ({ applications, onSelect, title, description }: ApplicationSelectorProps) => {
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "in_review":
        return <Badge variant="default">In Review</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <div className="grid gap-3">
        {applications.map((app, index) => (
          <Card 
            key={app.id} 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelect(app.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Application #{index + 1}
                      </span>
                      {app.certificate_number && (
                        <Badge variant="outline" className="text-xs">
                          {app.certificate_number}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(app.created_at)}
                      </span>
                      {app.certification_vehicle_class && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {app.certification_vehicle_class}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(app.status)}
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ApplicationSelector;
