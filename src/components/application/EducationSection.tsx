import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApplicationFormData } from "@/pages/driver/ApplicationForm";
import { GraduationCap } from "lucide-react";

interface Props {
  formData: ApplicationFormData;
  updateFormData: (data: Partial<ApplicationFormData>) => void;
}

const QUALIFICATIONS = [
  { value: "below_10th", label: "Below 10th Standard" },
  { value: "10th", label: "10th Standard (SSC/Matriculation)" },
  { value: "12th", label: "12th Standard (HSC/Intermediate)" },
  { value: "diploma", label: "Diploma" },
  { value: "graduate", label: "Graduate (Bachelor's Degree)" },
  { value: "post_graduate", label: "Post Graduate (Master's Degree)" },
  { value: "doctorate", label: "Doctorate (PhD)" },
  { value: "other", label: "Other" },
];

const EducationSection = ({ formData, updateFormData }: Props) => {
  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
        <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <p className="text-sm font-medium">Educational Qualification</p>
          <p className="text-sm text-muted-foreground">
            Please select your highest educational qualification. You will need to upload supporting documents in the next step.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="highestQualification">
            Highest Qualification <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.highestQualification}
            onValueChange={(value) => updateFormData({ highestQualification: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select your highest qualification" />
            </SelectTrigger>
            <SelectContent>
              {QUALIFICATIONS.map((qual) => (
                <SelectItem key={qual.value} value={qual.value}>
                  {qual.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default EducationSection;
