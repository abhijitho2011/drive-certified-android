import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Vehicle Class Applying for MOTRACT Certification *
        </Label>
        <p className="text-sm text-muted-foreground">
          Select one vehicle class for which you want to be certified
        </p>
        <RadioGroup
          value={formData.certificationVehicleClass}
          onValueChange={(value) => updateFormData({ certificationVehicleClass: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {CERTIFICATION_VEHICLE_CLASSES.map((vc) => (
            <div
              key={vc.id}
              className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                formData.certificationVehicleClass === vc.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => updateFormData({ certificationVehicleClass: vc.id })}
            >
              <RadioGroupItem value={vc.id} id={`cert-${vc.id}`} />
              <Label htmlFor={`cert-${vc.id}`} className="font-normal cursor-pointer flex-1">
                {vc.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">Purpose of Certification *</Label>
        <p className="text-sm text-muted-foreground">
          Why are you applying for this certification?
        </p>
        <RadioGroup
          value={formData.certificationPurpose}
          onValueChange={(value) => updateFormData({ certificationPurpose: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {CERTIFICATION_PURPOSES.map((purpose) => (
            <div
              key={purpose.id}
              className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                formData.certificationPurpose === purpose.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => updateFormData({ certificationPurpose: purpose.id })}
            >
              <RadioGroupItem value={purpose.id} id={`purpose-${purpose.id}`} />
              <Label htmlFor={`purpose-${purpose.id}`} className="font-normal cursor-pointer flex-1">
                {purpose.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};

export default VerificationRequestSection;
