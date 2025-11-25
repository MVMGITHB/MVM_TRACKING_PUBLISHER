// components/UserManagement/ProtectedRoute.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../helper/auth";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  const navigate = useNavigate()

  useEffect(() => {
  if (user) {
    navigate("/partner/statistics-dashboard");
  }
}, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-gray-600">Loading...</p>
      </div>
    ); // ✅ wait until auth check is done
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
