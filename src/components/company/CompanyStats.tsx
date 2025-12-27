import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Calendar
} from "lucide-react";
import api from "@/lib/api";

interface CompanyStatsProps {
  dataUserId: string;
}

const CompanyStats = ({ dataUserId }: CompanyStatsProps) => {
  const [stats, setStats] = useState({
    totalVerifications: 0,
    validCertificates: 0,
    invalidExpired: 0,
    todayVerifications: 0,
    thisMonthVerifications: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(`/verification-logs/company/${dataUserId}`);
        const logs = response.data;

        if (logs) {
          const typedLogs = logs as { result_status: string; created_at: string }[];
          const today = new Date().toDateString();
          const monthStart = new Date();
          monthStart.setDate(1);

          setStats({
            totalVerifications: typedLogs.length,
            validCertificates: typedLogs.filter(l => l.result_status === "valid").length,
            invalidExpired: typedLogs.filter(l => l.result_status !== "valid").length,
            todayVerifications: typedLogs.filter(l =>
              new Date(l.created_at).toDateString() === today
            ).length,
            thisMonthVerifications: typedLogs.filter(l =>
              new Date(l.created_at) >= monthStart
            ).length
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [dataUserId]);

  const statCards = [
    {
      label: "Total Verifications",
      value: stats.totalVerifications,
      icon: Search,
      color: "text-primary"
    },
    {
      label: "Valid Certificates",
      value: stats.validCertificates,
      icon: CheckCircle2,
      color: "text-success"
    },
    {
      label: "Invalid/Expired",
      value: stats.invalidExpired,
      icon: XCircle,
      color: "text-destructive"
    },
    {
      label: "Today",
      value: stats.todayVerifications,
      icon: Calendar,
      color: "text-primary"
    },
    {
      label: "This Month",
      value: stats.thisMonthVerifications,
      icon: TrendingUp,
      color: "text-primary"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CompanyStats;