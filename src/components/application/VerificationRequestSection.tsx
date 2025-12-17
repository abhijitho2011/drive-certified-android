import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ApplicationFormData } from "@/pages/driver/ApplicationForm";

interface Props {
  formData: ApplicationFormData;
  updateFormData: (data: Partial<ApplicationFormData>) => void;
}

const CERTIFICATION_VEHICLE_CLASSES = [
  { id: "2-wheeler", label: "2 Wheeler" },
  { id: "3-wheeler", label: "3 Wheeler" },
  { id: "4-wheeler", label: "4 Wheeler" },
  { id: "lcv", label: "Light Commercial Vehicle" },
  { id: "heavy-truck", label: "Heavy Truck" },
  { id: "bus", label: "Bus" },
  { id: "tractor", label: "Tractor" },
  { id: "tanker", label: "Tanker" },
  { id: "hazardous", label: "Hazardous Goods Carrier" },
];

const CERTIFICATION_PURPOSES = [
  { id: "employment", label: "Employment verification" },
  { id: "onboarding", label: "Company onboarding" },
  { id: "insurance", label: "Insurance requirement" },
  { id: "self-assessment", label: "Self-assessment" },
  { id: "re-certification", label: "Re-certification" },
];

const VerificationRequestSection = ({ formData, updateFormData }: Props) => {
  const toggleVehicleClass = (id: string) => {
    const current = formData.certificationVehicleClasses || [];
    const updated = current.includes(id)
      ? current.filter(v => v !== id)
      : [...current, id];
    updateFormData({ certificationVehicleClasses: updated });
  };

  const togglePurpose = (id: string) => {
    const current = formData.certificationPurposes || [];
    const updated = current.includes(id)
      ? current.filter(p => p !== id)
      : [...current, id];
    updateFormData({ certificationPurposes: updated });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Vehicle Class Applying for MOTRACT Certification *
        </Label>
        <p className="text-sm text-muted-foreground">
          Select vehicle class(es) for which you want to be certified
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CERTIFICATION_VEHICLE_CLASSES.map((vc) => (
            <div
              key={vc.id}
              className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                formData.certificationVehicleClasses?.includes(vc.id)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => toggleVehicleClass(vc.id)}
            >
              <Checkbox
                checked={formData.certificationVehicleClasses?.includes(vc.id)}
                onCheckedChange={() => toggleVehicleClass(vc.id)}
                id={`cert-${vc.id}`}
              />
              <Label htmlFor={`cert-${vc.id}`} className="font-normal cursor-pointer flex-1">
                {vc.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">Purpose of Certification *</Label>
        <p className="text-sm text-muted-foreground">
          Why are you applying for this certification? (Select all that apply)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CERTIFICATION_PURPOSES.map((purpose) => (
            <div
              key={purpose.id}
              className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                formData.certificationPurposes?.includes(purpose.id)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => togglePurpose(purpose.id)}
            >
              <Checkbox
                checked={formData.certificationPurposes?.includes(purpose.id)}
                onCheckedChange={() => togglePurpose(purpose.id)}
                id={`purpose-${purpose.id}`}
              />
              <Label htmlFor={`purpose-${purpose.id}`} className="font-normal cursor-pointer flex-1">
                {purpose.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VerificationRequestSection;
