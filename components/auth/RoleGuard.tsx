"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("No user found. Redirecting to sign-in...");
        window.location.href = "/sign-in"; 
        return;
      }

      try {
        console.log("User authenticated:", user.uid);
        
        // FIX 1: Look in the "users" collection, not "profiles"
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        let role = ""; 
        
        if (docSnap.exists() && docSnap.data().role) {
          role = docSnap.data().role.toLowerCase();
          console.log("Profile found! User role is:", role);
        }

        // FIX 2: Apply Smart Email Detection Fallback
        const userEmail = user.email?.toLowerCase().trim() || "";
        if (userEmail === "admin@nutrimed.com") {
          role = "admin";
        } else if (userEmail.endsWith("@nutrimed.com") || userEmail.includes("dr.")) {
          role = "doctor";
        }

        // Default to patient if still undefined
        if (!role) {
          role = "patient";
        }

        if (allowedRoles.includes(role)) {
          console.log("Access GRANTED to this route.");
          setAuthorized(true);
          setLoading(false);
        } else {
          console.log("Access DENIED. Redirecting to the correct portal...");
          
          let destination = "/client-portal";
          if (role === "admin") destination = "/admin";
          else if (role === "doctor" || role === "physician") destination = "/doctor-portal";
          
          // Prevent infinite loops using standard JS path checking
          if (window.location.pathname !== destination) {
            window.location.href = destination;
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        window.location.href = "/sign-in";
      }
    });

    return () => unsubscribe();
  }, [allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FCFB] text-[#218A83] font-medium text-sm">
        Verifying secure session...
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}