import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import motractLogo from "@/assets/motract-logo.jpg";
import { ArrowLeft, Phone, User, MapPin, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    district: "",
    state: "",
    pinCode: "",
    phone: "",
  });

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits.slice(0, 10);
  };

  const formatPinCode = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits.slice(0, 6);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { firstName, lastName, address, district, state, pinCode, phone } = formData;
    
    if (!firstName || !lastName || !address || !district || !state || !pinCode || phone.length !== 10) {
      toast.error("Please fill all required fields");
      return;
    }

    if (pinCode.length !== 6) {
      toast.error("Please enter a valid 6-digit PIN code");
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${phone}`,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) throw error;
      
      toast.success("OTP sent to your mobile number");
      setStep("otp");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+91${formData.phone}`,
        token: otp,
        type: "sms",
      });

      if (error) throw error;

      if (data.user) {
        // Insert driver role
        await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: "driver",
        });

        // Insert driver details
        await supabase.from("drivers").insert({
          user_id: data.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          address: formData.address,
          district: formData.district,
          state: formData.state,
          pin_code: formData.pinCode,
          phone: formData.phone,
        });

        toast.success("Registration successful! Redirecting to dashboard...");
        navigate("/driver");
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <Card className="border-2">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              <img src={motractLogo} alt="MOTRACT" className="h-14 rounded-lg" />
            </div>
            <CardTitle className="text-2xl">Driver Registration</CardTitle>
            <CardDescription>
              {step === "details" 
                ? "Create your driver account" 
                : "Enter the OTP sent to your mobile"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "details" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="address"
                      placeholder="Enter your full address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      placeholder="District"
                      value={formData.district}
                      onChange={(e) => handleChange("district", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pinCode">PIN Code *</Label>
                  <Input
                    id="pinCode"
                    placeholder="6-digit PIN code"
                    value={formData.pinCode}
                    onChange={(e) => handleChange("pinCode", formatPinCode(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <div className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      +91
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="10-digit number"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", formatPhone(e.target.value))}
                      className="pl-20"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Sending OTP..." : "Register & Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label>Enter OTP</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    OTP sent to +91 {formData.phone}
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  <Shield className="w-4 h-4 mr-2" />
                  {isLoading ? "Verifying..." : "Verify & Complete Registration"}
                </Button>

                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    setStep("details");
                    setOtp("");
                  }}
                >
                  Back to Details
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already registered? </span>
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                Only drivers can register online. Other accounts are created by admin.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
