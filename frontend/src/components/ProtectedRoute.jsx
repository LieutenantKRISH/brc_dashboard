import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { auth } = useAuth();

  console.log("ProtectedRoute - Auth:", auth, "Role required:", role);

  if (!auth) {
    console.log("No auth, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Check if user role matches required role
  const userRole = auth?.user?.role || auth?.role;
  
  if (role && userRole !== role) {
    console.log("Role mismatch, redirecting");
    // Redirect based on user's actual role
    return <Navigate to={userRole === "admin" ? "/admin" : "/dashboard"} replace />;
  }
  
  console.log("Access granted, rendering children");
  return children;
}
