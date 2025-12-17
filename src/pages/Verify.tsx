import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import motractLogo from "@/assets/motract-logo.jpg";
import { ArrowLeft, Search, QrCode, CheckCircle2, XCircle, Shield, Calendar, Car, User } from "lucide-react";

type VerificationResult = {
  valid: boolean;
  certificateNumber: string;
  driverName: string;
  vehicleClass: string;
  issueDate: string;
  expiryDate: string;
  grade: string;
  authority: string;
} | null;

const Verify = () => {
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<VerificationResult>(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearched(true);

    // Simulate verification - will be replaced with actual API call
    setTimeout(() => {
      // Demo: return valid result for specific certificate numbers
      if (searchValue.toUpperCase().includes("MOT") || searchValue === "123456") {
        setResult({
          valid: true,
          certificateNumber: "MOT-2024-123456",
          driverName: "R***a K***r",
          vehicleClass: "4 Wheeler",
          issueDate: "2024-01-15",
          expiryDate: "2026-01-15",
          grade: "A",
          authority: "MOTRACT Certification Authority",
        });
      } else if (searchValue.length > 3) {
        setResult({
          valid: false,
          certificateNumber: searchValue,
          driverName: "-",
          vehicleClass: "-",
          issueDate: "-",
          expiryDate: "-",
          grade: "-",
          authority: "-",
        });
      } else {
        setResult(null);
      }
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={motractLogo} alt="MOTRACT" className="h-10 rounded-lg" />
          </Link>
          <Link to="/login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Certificate Verification</h1>
            <p className="text-muted-foreground">
              Verify the authenticity of a driver's certification by entering the certificate number or scanning the QR code.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleVerify} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter certificate number (e.g., MOT-2024-123456)"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={isSearching || !searchValue}>
                  {isSearching ? "Verifying..." : "Verify"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {searched && result && (
            <Card className={`animate-scale-in ${result.valid ? "border-success" : "border-destructive"}`}>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  {result.valid ? (
                    <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-destructive" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {result.valid ? "Valid Certificate" : "Invalid Certificate"}
                      <Badge variant={result.valid ? "success" : "destructive"}>
                        {result.valid ? "VERIFIED" : "NOT FOUND"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Certificate: {result.certificateNumber}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {result.valid && (
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Driver Name</div>
                        <div className="font-medium">{result.driverName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Car className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Vehicle Class</div>
                        <div className="font-medium">{result.vehicleClass}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Issue Date</div>
                        <div className="font-medium">{result.issueDate}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Expiry Date</div>
                        <div className="font-medium">{result.expiryDate}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Grade</div>
                        <div className="font-medium">Grade {result.grade}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Certified By</div>
                        <div className="font-medium text-sm">{result.authority}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {searched && !result && searchValue.length <= 3 && (
            <Card className="animate-scale-in">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Please enter a valid certificate number to verify.</p>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>For companies:</strong> Need bulk verification or API access?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in to your company account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
