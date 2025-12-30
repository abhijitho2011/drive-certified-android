import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationFormData } from "@/pages/driver/ApplicationForm";
import { Loader2, MapPin, Building2, Stethoscope, Phone, MapPinned, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  formData: ApplicationFormData;
  updateFormData: (data: Partial<ApplicationFormData>) => void;
}

interface State {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
  state_id: string;
}

interface Partner {
  id: string;
  name: string;
  address: string;
  contact_number: string;
  partner_type: string;
}

const TestCenterSection = ({ formData, updateFormData }: Props) => {
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [drivingSchools, setDrivingSchools] = useState<Partner[]>([]);
  const [medicalLabs, setMedicalLabs] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStates = async () => {
      const { data, error } = await supabase
        .from("states")
        .select("id, name")
        .eq("status", "active")
        .order("name");

      if (!error && data) {
        setStates(data);
      }
      setLoading(false);
    };

    fetchStates();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!formData.testState) {
        setDistricts([]);
        return;
      }

      const { data, error } = await supabase
        .from("districts")
        .select("id, name, state_id")
        .eq("state_id", formData.testState)
        .eq("status", "active")
        .order("name");

      if (!error && data) {
        setDistricts(data);
      }
    };

    fetchDistricts();
  }, [formData.testState]);

  useEffect(() => {
    const fetchPartners = async () => {
      if (!formData.testDistrict) {
        setDrivingSchools([]);
        setMedicalLabs([]);
        return;
      }

      // Get district name for matching
      const district = districts.find(d => d.id === formData.testDistrict);
      const state = states.find(s => s.id === formData.testState);

      if (!district || !state) return;

      const { data, error } = await supabase
        .from("partners")
        .select("id, name, address, contact_number, partner_type")
        .eq("state", state.name)
        .eq("district", district.name)
        .eq("status", "active");

      if (!error && data) {
        setDrivingSchools(data.filter(p => p.partner_type === "driving_school"));
        setMedicalLabs(data.filter(p => p.partner_type === "medical_lab"));
      } else if (error) {
        console.error("Error fetching partners:", error);
      }
    };

    fetchPartners();
  }, [formData.testDistrict, districts, states]);

  const getSelectedPartner = (partnerId: string, partnerList: Partner[]) => {
    return partnerList.find(p => p.id === partnerId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedDrivingSchool = getSelectedPartner(formData.drivingSchoolId, drivingSchools);
  const selectedMedicalLab = getSelectedPartner(formData.medicalLabId, medicalLabs);

  return (
    <div className="space-y-8">
      {/* Location Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <MapPin className="h-5 w-5 text-primary" />
          <span>Select Test Location</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="testState">State *</Label>
            <Select
              value={formData.testState}
              onValueChange={(value) => {
                updateFormData({
                  testState: value,
                  testDistrict: "",
                  drivingSchoolId: "",
                  medicalLabId: "",
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.id} value={state.id}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="testDistrict">District *</Label>
            <Select
              value={formData.testDistrict}
              onValueChange={(value) => {
                updateFormData({
                  testDistrict: value,
                  drivingSchoolId: "",
                  medicalLabId: "",
                });
              }}
              disabled={!formData.testState}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.testState ? "Select district" : "Select state first"} />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Driving School Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Building2 className="h-5 w-5 text-primary" />
          <span>Select Driving Test Center</span>
        </div>

        {!formData.testDistrict ? (
          <p className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
            Please select a state and district first to see available driving schools.
          </p>
        ) : drivingSchools.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
            No driving schools available in the selected location. Please try a different district.
          </p>
        ) : (
          <div className="space-y-3">
            {drivingSchools.map((school) => (
              <div
                key={school.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.drivingSchoolId === school.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => updateFormData({ drivingSchoolId: school.id })}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.drivingSchoolId === school.id ? "border-primary" : "border-muted-foreground"
                  }`}>
                    {formData.drivingSchoolId === school.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{school.name}</p>
                  </div>
                </div>
              </div>
            ))}

            {selectedDrivingSchool && (
              <Card className="mt-4 border-primary/30 bg-primary/5">
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm font-medium text-primary">Contact Details - The center will call you to schedule your test</p>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPinned className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{selectedDrivingSchool.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${selectedDrivingSchool.contact_number}`} className="text-primary hover:underline">
                      {selectedDrivingSchool.contact_number}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Medical Lab Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Stethoscope className="h-5 w-5 text-primary" />
          <span>Select Medical Test Center</span>
        </div>

        {!formData.testDistrict ? (
          <p className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
            Please select a state and district first to see available medical labs.
          </p>
        ) : medicalLabs.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
            No medical labs available in the selected location. Please try a different district.
          </p>
        ) : (
          <div className="space-y-3">
            {medicalLabs.map((lab) => (
              <div
                key={lab.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.medicalLabId === lab.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => updateFormData({ medicalLabId: lab.id })}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.medicalLabId === lab.id ? "border-primary" : "border-muted-foreground"
                  }`}>
                    {formData.medicalLabId === lab.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{lab.name}</p>
                  </div>
                </div>
              </div>
            ))}

            {selectedMedicalLab && (
              <Card className="mt-4 border-primary/30 bg-primary/5">
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm font-medium text-primary">Contact Details - The center will call you to schedule your test</p>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPinned className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{selectedMedicalLab.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${selectedMedicalLab.contact_number}`} className="text-primary hover:underline">
                      {selectedMedicalLab.contact_number}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Education Verification Info */}
      <Alert className="border-info/30 bg-info/5">
        <Info className="h-4 w-4 text-info" />
        <AlertDescription className="text-sm">
          <strong>Education Verification:</strong> A verification agent will be automatically assigned to verify your educational documents. You will be notified once the verification is complete.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TestCenterSection;
