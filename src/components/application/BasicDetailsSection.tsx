import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ApplicationFormData } from "@/pages/driver/ApplicationForm";
import { useState, useEffect } from "react";
import api from "@/lib/api";

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

const BasicDetailsSection = ({ formData, updateFormData }: Props) => {
  const [sameAddress, setSameAddress] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [currentDistricts, setCurrentDistricts] = useState<District[]>([]);
  const [permanentDistricts, setPermanentDistricts] = useState<District[]>([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await api.get("/states");
        setStates(response.data);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    const fetchCurrentDistricts = async () => {
      if (!formData.currentState) {
        setCurrentDistricts([]);
        return;
      }
      try {
        const response = await api.get(`/districts?stateId=${formData.currentState}`);
        setCurrentDistricts(response.data);
      } catch (error) {
        console.error("Error fetching current districts:", error);
      }
    };
    fetchCurrentDistricts();
  }, [formData.currentState]);

  useEffect(() => {
    const fetchPermanentDistricts = async () => {
      if (!formData.permanentState) {
        setPermanentDistricts([]);
        return;
      }
      try {
        const response = await api.get(`/districts?stateId=${formData.permanentState}`);
        setPermanentDistricts(response.data);
      } catch (error) {
        console.error("Error fetching permanent districts:", error);
      }
    };
    fetchPermanentDistricts();
  }, [formData.permanentState]);

  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4));
    }
    return parts.join(' ');
  };

  const handleSameAddressChange = (checked: boolean) => {
    setSameAddress(checked);
    if (checked) {
      updateFormData({
        permanentAddress: formData.currentAddress,
        permanentState: formData.currentState,
        permanentDistrict: formData.currentDistrict,
        permanentPinCode: formData.currentPinCode,
      });
    }
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

      {/* Current Address Section */}
      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <h3 className="font-semibold text-foreground">Current Address</h3>

        <div className="space-y-2">
          <Label htmlFor="currentAddress">Street Address *</Label>
          <Textarea
            id="currentAddress"
            value={formData.currentAddress}
            onChange={(e) => {
              updateFormData({ currentAddress: e.target.value });
              if (sameAddress) {
                updateFormData({ permanentAddress: e.target.value });
              }
            }}
            placeholder="Enter your street address"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>State *</Label>
            <Select
              value={formData.currentState}
              onValueChange={(value) => {
                updateFormData({ currentState: value, currentDistrict: "" });
                if (sameAddress) {
                  updateFormData({ permanentState: value, permanentDistrict: "" });
                }
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
            <Label>District *</Label>
            <Select
              value={formData.currentDistrict}
              onValueChange={(value) => {
                updateFormData({ currentDistrict: value });
                if (sameAddress) {
                  updateFormData({ permanentDistrict: value });
                }
              }}
              disabled={!formData.currentState}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                {currentDistricts.map((district) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentPinCode">PIN Code *</Label>
            <Input
              id="currentPinCode"
              value={formData.currentPinCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                updateFormData({ currentPinCode: value });
                if (sameAddress) {
                  updateFormData({ permanentPinCode: value });
                }
              }}
              placeholder="6-digit PIN"
              maxLength={6}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="sameAddress"
          checked={sameAddress}
          onCheckedChange={(checked) => handleSameAddressChange(checked as boolean)}
        />
        <Label htmlFor="sameAddress" className="text-sm font-normal cursor-pointer">
          Permanent address is same as current address
        </Label>
      </div>

      {/* Permanent Address Section */}
      {!sameAddress && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h3 className="font-semibold text-foreground">Permanent Address</h3>

          <div className="space-y-2">
            <Label htmlFor="permanentAddress">Street Address</Label>
            <Textarea
              id="permanentAddress"
              value={formData.permanentAddress}
              onChange={(e) => updateFormData({ permanentAddress: e.target.value })}
              placeholder="Enter your permanent street address"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>State</Label>
              <Select
                value={formData.permanentState}
                onValueChange={(value) => updateFormData({ permanentState: value, permanentDistrict: "" })}
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
              <Label>District</Label>
              <Select
                value={formData.permanentDistrict}
                onValueChange={(value) => updateFormData({ permanentDistrict: value })}
                disabled={!formData.permanentState}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {permanentDistricts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="permanentPinCode">PIN Code</Label>
              <Input
                id="permanentPinCode"
                value={formData.permanentPinCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  updateFormData({ permanentPinCode: value });
                }}
                placeholder="6-digit PIN"
                maxLength={6}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicDetailsSection;
