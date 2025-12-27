import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";

type UserRole = "admin" | "driver" | "driving_school" | "medical_lab" | "company_verifier";

interface User {
  id: string;
  email: string;
  roles?: UserRole[];
  driver?: any;
  partner?: any;
  dataUser?: any;
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  roles: UserRole[];
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  canAccess: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token refresh interval (5 minutes)
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await api.get("/auth/profile");
      if (response.data) {
        setUser(response.data);

        // Extract roles from user data
        const userRoles = response.data.roles || [];
        setRoles(userRoles);

        // Set primary role (first role or based on priority)
        if (userRoles.length > 0) {
          setUserRole(userRoles[0]);
        }

        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Token is invalid, logout
      logout();
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      const savedUser = localStorage.getItem("user");

      if (token) {
        // Set API authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Try to restore user from localStorage first
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setRoles(parsedUser.roles || []);
            setUserRole(parsedUser.roles?.[0] || null);
            setIsAuthenticated(true);
          } catch (e) {
            console.error("Failed to parse saved user:", e);
          }
        }

        // Validate token with server
        try {
          await refreshToken();
        } catch (error) {
          console.error("Auth initialization failed:", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, [refreshToken]);

  // Set up token refresh interval
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshToken();
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken]);

  // Auto-logout on token expiry
  useEffect(() => {
    const handleUnauthorized = (error: any) => {
      if (error.response?.status === 401) {
        logout();
      }
    };

    // Add response interceptor
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        handleUnauthorized(error);
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    // Set API authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setUser(userData);
    setIsAuthenticated(true);

    // Extract and set roles
    const userRoles = userData.roles || [];
    setRoles(userRoles);
    setUserRole(userRoles[0] || null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common['Authorization'];

    setUser(null);
    setUserRole(null);
    setRoles([]);
    setIsAuthenticated(false);
  }, []);

  // Role checking helpers
  const hasRole = useCallback((role: UserRole): boolean => {
    return roles.includes(role);
  }, [roles]);

  const hasAnyRole = useCallback((checkRoles: UserRole[]): boolean => {
    return checkRoles.some(role => roles.includes(role));
  }, [roles]);

  const canAccess = useCallback((allowedRoles: UserRole[]): boolean => {
    if (allowedRoles.length === 0) return true;
    return hasAnyRole(allowedRoles);
  }, [hasAnyRole]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        roles,
        loading,
        isAuthenticated,
        login,
        logout,
        refreshToken,
        hasRole,
        hasAnyRole,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
