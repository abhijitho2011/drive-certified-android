import { useAuth } from "@/contexts/AuthContext";

export const Unauthorized = () => {
    const { user, userRole, logout } = useAuth();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                <div className="mb-6">
                    <svg
                        className="mx-auto h-16 w-16 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Access Denied
                </h1>

                <p className="text-gray-600 mb-6">
                    You don't have permission to access this page.
                </p>

                {user && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-gray-600 mb-1">
                            <span className="font-semibold">Email:</span> {user.email}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">Role:</span> {userRole || "No role assigned"}
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={() => window.history.back()}
                        className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Go Back
                    </button>

                    <button
                        onClick={() => {
                            logout();
                            window.location.href = "/login";
                        }}
                        className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Logout
                    </button>
                </div>

                <p className="mt-6 text-sm text-gray-500">
                    If you believe this is an error, please contact your administrator.
                </p>
            </div>
        </div>
    );
};
