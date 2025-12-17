import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ApplicationFormData } from "@/pages/driver/ApplicationForm";

interface Props {
  formData: ApplicationFormData;
  updateFormData: (data: Partial<ApplicationFormData>) => void;
}

const VEHICLE_CLASSES = [
  { id: "MCWOG", label: "MCWOG (Motorcycle Without Gear)" },
  { id: "MCWG", label: "MCWG (Motorcycle With Gear)" },
  { id: "LMV-NT", label: "LMV-NT (Light Motor Vehicle - Non Transport)" },
  { id: "LMV-TR", label: "LMV-TR (Light Motor Vehicle - Transport)" },
  { id: "MGV", label: "MGV (Medium Goods Vehicle)" },
  { id: "MPV", label: "MPV (Medium Passenger Vehicle)" },
  { id: "HGV", label: "HGV (Heavy Goods Vehicle)" },
  { id: "HPV", label: "HPV (Heavy Passenger Vehicle)" },
  { id: "Trailer", label: "Trailer" },
  { id: "Tractor", label: "Tractor" },
  { id: "Tanker", label: "Tanker" },
  { id: "Hazardous", label: "Hazardous Goods" },
];

const LicenceDetailsSection = ({ formData, updateFormData }: Props) => {
  const toggleVehicleClass = (classId: string) => {
    const current = formData.vehicleClasses;
    const updated = current.includes(classId)
      ? current.filter((c) => c !== classId)
      : [...current, classId];
    updateFormData({ vehicleClasses: updated });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="licenceNumber">Driving Licence Number *</Label>
          <Input
            id="licenceNumber"
            value={formData.licenceNumber}
            onChange={(e) => updateFormData({ licenceNumber: e.target.value.toUpperCase() })}
            placeholder="e.g., KL01 20210012345"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="issuingRto">Issuing RTO *</Label>
          <Input
            id="issuingRto"
            value={formData.issuingRto}
            onChange={(e) => updateFormData({ issuingRto: e.target.value })}
            placeholder="e.g., Ernakulam RTO"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenceIssueDate">Date of Issue *</Label>
          <Input
            id="licenceIssueDate"
            type="date"
            value={formData.licenceIssueDate}
            onChange={(e) => updateFormData({ licenceIssueDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenceExpiryDate">Date of Expiry *</Label>
          <Input
            id="licenceExpiryDate"
            type="date"
            value={formData.licenceExpiryDate}
            onChange={(e) => updateFormData({ licenceExpiryDate: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Licence Type *</Label>
        <RadioGroup
          value={formData.licenceType}
          onValueChange={(value) => updateFormData({ licenceType: value })}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="non-transport" id="non-transport" />
            <Label htmlFor="non-transport" className="font-normal cursor-pointer">Non-Transport</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="transport" id="transport" />
            <Label htmlFor="transport" className="font-normal cursor-pointer">Transport</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Authorised Vehicle Classes (multi-select) *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {VEHICLE_CLASSES.map((vc) => (
            <div key={vc.id} className="flex items-center space-x-2">
              <Checkbox
                id={vc.id}
                checked={formData.vehicleClasses.includes(vc.id)}
                onCheckedChange={() => toggleVehicleClass(vc.id)}
              />
              <Label htmlFor={vc.id} className="text-sm font-normal cursor-pointer">
                {vc.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Hazardous Endorsement (if applicable)</Label>
        <RadioGroup
          value={formData.hazardousEndorsement ? "yes" : "no"}
          onValueChange={(value) => updateFormData({ hazardousEndorsement: value === "yes" })}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="hazardous-yes" />
            <Label htmlFor="hazardous-yes" className="font-normal cursor-pointer">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="hazardous-no" />
            <Label htmlFor="hazardous-no" className="font-normal cursor-pointer">No</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default LicenceDetailsSection;
