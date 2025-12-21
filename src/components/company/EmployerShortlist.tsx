import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bookmark, Trash2, Send, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EmployerShortlistProps {
  employerId: string;
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

const EmployerShortlist = ({ employerId }: EmployerShortlistProps) => {
  const [shortlist, setShortlist] = useState<ShortlistedDriver[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Get certificates and ratings for each driver
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
      toast.error("Failed to load shortlist");
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchShortlist();
  }, [employerId]);

  const getMaskedName = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}***${lastName.charAt(0)}`;
  };

  return (
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
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : shortlist.length === 0 ? (
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
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => removeFromShortlist(item.id)}
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
  );
};

export default EmployerShortlist;
