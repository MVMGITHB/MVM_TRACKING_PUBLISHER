// components/UserManagement/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../helper/auth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children; // ✅ allow children to render normally
}
