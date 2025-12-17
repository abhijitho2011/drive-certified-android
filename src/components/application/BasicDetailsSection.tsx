import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ApplicationFormData } from "@/pages/driver/ApplicationForm";
import { useState } from "react";

interface Props {
  formData: ApplicationFormData;
  updateFormData: (data: Partial<ApplicationFormData>) => void;
}

const BasicDetailsSection = ({ formData, updateFormData }: Props) => {
  const [sameAddress, setSameAddress] = useState(false);

  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4));
    }
    return parts.join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name (as per Driving Licence) *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => updateFormData({ fullName: e.target.value })}
            placeholder="Enter your full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => updateFormData({ gender: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
          <Input
            id="aadhaarNumber"
            value={formData.aadhaarNumber}
            onChange={(e) => updateFormData({ aadhaarNumber: formatAadhaar(e.target.value) })}
            placeholder="XXXX XXXX XXXX"
            maxLength={14}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentAddress">Current Address *</Label>
        <Textarea
          id="currentAddress"
          value={formData.currentAddress}
          onChange={(e) => {
            updateFormData({ currentAddress: e.target.value });
            if (sameAddress) {
              updateFormData({ permanentAddress: e.target.value });
            }
          }}
          placeholder="Enter your current address"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="sameAddress"
          checked={sameAddress}
          onCheckedChange={(checked) => {
            setSameAddress(checked as boolean);
            if (checked) {
              updateFormData({ permanentAddress: formData.currentAddress });
            }
          }}
        />
        <Label htmlFor="sameAddress" className="text-sm font-normal cursor-pointer">
          Permanent address is same as current address
        </Label>
      </div>

      {!sameAddress && (
        <div className="space-y-2">
          <Label htmlFor="permanentAddress">Permanent Address</Label>
          <Textarea
            id="permanentAddress"
            value={formData.permanentAddress}
            onChange={(e) => updateFormData({ permanentAddress: e.target.value })}
            placeholder="Enter your permanent address (if different)"
            rows={3}
          />
        </div>
      )}
    </div>
  );
};

export default BasicDetailsSection;
