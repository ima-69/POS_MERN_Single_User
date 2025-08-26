import { Navigate } from "react-router-dom";
import { useMeQuery } from "../features/auth/authApi";

export default function ProtectedRoute({ children }) {
  const { data, isLoading, isError } = useMeQuery();

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError) return <Navigate to="/login" replace />;
  return children;
}
