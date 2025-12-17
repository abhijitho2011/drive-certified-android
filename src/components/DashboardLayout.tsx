import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import motractLogo from "@/assets/motract-logo.jpg";
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  Award, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "driver" | "driving-school" | "medical-lab" | "admin" | "company";
  userName?: string;
}

const roleConfig = {
  driver: {
    title: "Driver Portal",
    navItems: [
      { label: "Dashboard", href: "/driver", icon: LayoutDashboard },
      { label: "My Application", href: "/driver/application", icon: FileText },
      { label: "Documents", href: "/driver/documents", icon: Upload },
      { label: "Certificates", href: "/driver/certificates", icon: Award },
    ],
  },
  "driving-school": {
    title: "Driving School Portal",
    navItems: [
      { label: "Dashboard", href: "/driving-school", icon: LayoutDashboard },
      { label: "Assigned Drivers", href: "/driving-school/drivers", icon: FileText },
      { label: "Evaluations", href: "/driving-school/evaluations", icon: Upload },
    ],
  },
  "medical-lab": {
    title: "Medical Lab Portal",
    navItems: [
      { label: "Dashboard", href: "/medical-lab", icon: LayoutDashboard },
      { label: "Assigned Drivers", href: "/medical-lab/drivers", icon: FileText },
      { label: "Medical Reports", href: "/medical-lab/reports", icon: Upload },
    ],
  },
  admin: {
    title: "Admin Panel",
    navItems: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Applications", href: "/admin/applications", icon: FileText },
      { label: "Partners", href: "/admin/partners", icon: Settings },
      { label: "Certificates", href: "/admin/certificates", icon: Award },
    ],
  },
  company: {
    title: "Company Verification",
    navItems: [
      { label: "Dashboard", href: "/company", icon: LayoutDashboard },
      { label: "Verifications", href: "/company/verifications", icon: FileText },
      { label: "Reports", href: "/company/reports", icon: Upload },
    ],
  },
};

const DashboardLayout = ({ children, role, userName = "User" }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const config = roleConfig[role];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-16 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-muted rounded-lg"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <img src={motractLogo} alt="MOTRACT" className="h-8 mx-auto rounded" />
        <button className="p-2 hover:bg-muted rounded-lg relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-40 w-64 bg-background border-r border-border transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border">
            <Link to="/" className="flex items-center gap-3">
              <img src={motractLogo} alt="MOTRACT" className="h-10 rounded-lg" />
            </Link>
            <p className="text-xs text-muted-foreground mt-2">{config.title}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {config.navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground capitalize">{role.replace("-", " ")}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between h-16 px-6 border-b border-border bg-background">
          <h1 className="text-lg font-semibold">{config.title}</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-muted rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium">{userName}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
