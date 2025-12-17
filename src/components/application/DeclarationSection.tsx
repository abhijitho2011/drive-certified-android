import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ApplicationFormData } from "@/pages/driver/ApplicationForm";
import { AlertCircle, Shield } from "lucide-react";

interface Props {
  formData: ApplicationFormData;
  updateFormData: (data: Partial<ApplicationFormData>) => void;
}

const DeclarationSection = ({ formData, updateFormData }: Props) => {
  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-6 rounded-lg border">
        <div className="flex items-start gap-4">
          <Shield className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal Declaration</h3>
            <p className="text-muted-foreground">
              Please read the following declaration carefully before signing:
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6 bg-card rounded-lg border">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
              1
            </span>
            <p className="text-foreground">
              I hereby declare that all information provided by me in this application is <strong>true and correct</strong> to the best of my knowledge and belief.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
              2
            </span>
            <p className="text-foreground">
              I understand that MOTRACT will conduct <strong>independent driving skill and medical fitness verification</strong> through authorised partners.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
              3
            </span>
            <p className="text-foreground">
              I agree that my verification results and certification status may be <strong>shared with employers or companies</strong> for verification purposes.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
              4
            </span>
            <p className="text-foreground">
              I understand that providing <strong>false or misleading information</strong> may result in rejection of my application and may have legal consequences.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Important Notice</p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              By signing this declaration, you confirm that you have read and understood all the terms above. 
              Your digital signature has the same legal validity as a physical signature.
            </p>
          </div>
        </div>
      </div>

      <div
        className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
          formData.declarationSigned
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onClick={() => updateFormData({ declarationSigned: !formData.declarationSigned })}
      >
        <div className="flex items-start gap-4">
          <Checkbox
            id="declaration"
            checked={formData.declarationSigned}
            onCheckedChange={(checked) => updateFormData({ declarationSigned: checked as boolean })}
            className="mt-1"
          />
          <div className="space-y-1">
            <Label htmlFor="declaration" className="text-base font-semibold cursor-pointer">
              I agree to the declaration *
            </Label>
            <p className="text-sm text-muted-foreground">
              By checking this box, I confirm that I have read, understood, and agree to the above declaration.
              This serves as my digital signature dated {new Date().toLocaleDateString('en-IN')}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeclarationSection;
