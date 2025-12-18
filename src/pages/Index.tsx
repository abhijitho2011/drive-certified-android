import motractLogo from "@/assets/motract-logo.jpg";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Users, Building2, FileCheck, Stethoscope, Car, CheckCircle2, ArrowRight, QrCode, Award, Clock, Lock } from "lucide-react";
const Index = () => {
  const features = [{
    icon: FileCheck,
    title: "Skill Verification",
    description: "Comprehensive driving skill assessments with standardized testing protocols"
  }, {
    icon: Stethoscope,
    title: "Medical Fitness",
    description: "Complete health screening including vision, drug, and fitness tests"
  }, {
    icon: Shield,
    title: "Secure Certificates",
    description: "Tamper-proof digital certificates with QR code verification"
  }, {
    icon: Clock,
    title: "Real-time Tracking",
    description: "Track application status from submission to certification"
  }];
  const roles = [{
    icon: Car,
    title: "Drivers",
    description: "Apply for certification, upload documents, and access your digital certificate wallet",
    color: "bg-primary"
  }, {
    icon: Building2,
    title: "Driving Schools",
    description: "Conduct skill tests, verify identity, and submit comprehensive evaluations",
    color: "bg-secondary"
  }, {
    icon: Stethoscope,
    title: "Medical Labs",
    description: "Perform health screenings, drug tests, and submit medical fitness reports",
    color: "bg-info"
  }, {
    icon: Users,
    title: "Companies",
    description: "Verify driver certifications instantly via certificate number or QR code",
    color: "bg-success"
  }];
  const stats = [{
    value: "50K+",
    label: "Certified Drivers"
  }, {
    value: "500+",
    label: "Partner Schools"
  }, {
    value: "200+",
    label: "Medical Labs"
  }, {
    value: "99.9%",
    label: "Verification Accuracy"
  }];
  return <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#roles" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">For You</a>
            <a href="#verify" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Verify</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/verify">
              <Button variant="outline" size="sm">
                <QrCode className="w-4 h-4 mr-1" />
                Verify
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Trusted by 500+ logistics companies</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-slide-up text-balance leading-tight">
              Professional Driver Certification Made{" "}
              <span className="relative">
                Simple
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 4 150 4 198 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto animate-slide-up" style={{
            animationDelay: "0.1s"
          }}>
              MOTRACT streamlines driver verification, medical fitness validation, and certificate issuance for enterprises across logistics, ride-hailing, and delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{
            animationDelay: "0.2s"
          }}>
              <Link to="/register">
                <Button variant="hero" size="xl">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/verify">
                <Button variant="hero-outline" size="xl">
                  <QrCode className="w-5 h-5" />
                  Verify Certificate
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Verification Ecosystem</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              End-to-end driver certification with standardized processes for skill testing, medical fitness, and secure certificate management.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => <div key={index} className="group p-6 rounded-xl border border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Everyone</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Role-specific dashboards designed for drivers, driving schools, medical labs, and verification companies.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, index) => <div key={index} className="p-6 rounded-xl bg-card border border-border hover:shadow-xl transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-xl ${role.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <role.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{role.title}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Verification CTA */}
      <section id="verify" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-secondary rounded-2xl p-8 md:p-12 text-center text-secondary-foreground">
            <QrCode className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Verify a Certificate</h2>
            <p className="text-secondary-foreground/80 mb-8 max-w-xl mx-auto">
              Instantly verify any driver's certification status using their certificate number or QR code. No login required.
            </p>
            <Link to="/verify">
              <Button variant="default" size="xl">
                Start Verification
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Compliance Ready</h3>
                <p className="text-sm text-muted-foreground">Meets all regulatory requirements for driver certification and verification.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-info" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Enterprise Security</h3>
                <p className="text-sm text-muted-foreground">Role-based access control with complete audit trails for all actions.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Trusted by Industry</h3>
                <p className="text-sm text-muted-foreground">Used by leading logistics, ride-hailing, and delivery companies.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={motractLogo} alt="MOTRACT" className="h-8 rounded" />
              <span className="text-sm text-muted-foreground">© 2024 MOTRACT. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;