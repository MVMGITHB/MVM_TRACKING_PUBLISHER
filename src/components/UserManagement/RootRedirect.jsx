import { Navigate } from "react-router-dom";
import { useAuth } from "../helper/auth";

export default function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;

  // If logged in → dashboard
  if (user) return <Navigate to="/partner/statistics-dashboard" replace />;

  // If not logged in → login
  return <Navigate to="/login" replace />;
}
