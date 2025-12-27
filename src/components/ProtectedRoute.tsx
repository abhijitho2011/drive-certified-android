import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

type UserRole = "admin" | "driver" | "driving_school" | "medical_lab" | "company_verifier";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: UserRole[];
    requireAuth?: boolean;
    redirectTo?: string;
}

export const ProtectedRoute = ({
    children,
    allowedRoles = [],
    requireAuth = true,
    redirectTo = "/login",
}: ProtectedRouteProps) => {
    const { isAuthenticated, loading, canAccess } = useAuth();
    const location = useLocation();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Check if authentication is required
    if (requireAuth && !isAuthenticated) {
        // Redirect to login, preserving the attempted location
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && !canAccess(allowedRoles)) {
        // Redirect to unauthorized page or home
        return <Navigate to="/unauthorized" replace />;
    }

    // User is authenticated and authorized
    return <>{children}</>;
};

// Convenience components for specific roles
export const AdminRoute = ({ children }: { children: ReactNode }) => (
    <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>
);

export const DriverRoute = ({ children }: { children: ReactNode }) => (
    <ProtectedRoute allowedRoles={["driver"]}>{children}</ProtectedRoute>
);

export const DrivingSchoolRoute = ({ children }: { children: ReactNode }) => (
    <ProtectedRoute allowedRoles={["driving_school"]}>{children}</ProtectedRoute>
);

export const MedicalLabRoute = ({ children }: { children: ReactNode }) => (
    <ProtectedRoute allowedRoles={["medical_lab"]}>{children}</ProtectedRoute>
);

export const CompanyVerifierRoute = ({ children }: { children: ReactNode }) => (
    <ProtectedRoute allowedRoles={["company_verifier"]}>{children}</ProtectedRoute>
);

// Multi-role route for partner portals
export const PartnerRoute = ({ children }: { children: ReactNode }) => (
    <ProtectedRoute
        allowedRoles={["driving_school", "medical_lab", "company_verifier"]}
    >
        {children}
    </ProtectedRoute>
);
