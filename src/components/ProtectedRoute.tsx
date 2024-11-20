// src/components/ProtectedRoute.tsx

"use client";

import React, { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!token && typeof window !== "undefined") {
      console.log(window);
      
      // router.push("/auth");
    }
    console.log(token);
    
  }, [token, router]);

  if (!token) {
    return null; // Alternatively, render a loading spinner or placeholder
  }

  return <>{children}</>;
};

export default ProtectedRoute;
