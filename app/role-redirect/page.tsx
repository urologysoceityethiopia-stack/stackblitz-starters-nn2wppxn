"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function RoleRedirect() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          let role = "";

          if (docSnap.exists() && docSnap.data().role) {
            role = docSnap.data().role.toLowerCase();
          }

          // SMART ROLE FALLBACK
          const userEmail = user.email?.toLowerCase().trim() || "";
          if (userEmail === "admin@nutrimed.com") {
            role = "admin";
          } else if (userEmail.endsWith("@nutrimed.com") || userEmail.includes("dr.")) {
            role = "doctor";
          }

          if (role === "admin") {
            router.push("/admin");
          } else if (role === "doctor" || role === "physician") {
            router.push("/doctor-portal");
          } else {
            router.push("/client-portal");
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          router.push("/client-portal");
        }
      } else {
        router.push("/sign-in");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Verifying credentials...</p>
      </div>
    </div>
  );
}