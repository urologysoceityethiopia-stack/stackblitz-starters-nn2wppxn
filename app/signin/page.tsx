"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";
import Header from "@/components/marketing/Header";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const getFriendlyAuthError = (errorCode: string) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect email or password. Please try again.";
      case "auth/too-many-requests":
        return "Access temporarily blocked due to multiple failed attempts. Please try again later.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      default:
        return "An error occurred during sign in. Please check your details and try again.";
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Authenticate user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      // 2. Fetch document from the "users" collection
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let role = "";

      // Try to get role from Firestore first
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        if (data.role) {
          role = data.role.toLowerCase().trim();
        }
      }

      // 3. SMART ROLE FALLBACK / OVERRIDE
      // This catches old accounts stuck in "profiles" and ensures 
      // staff are always routed correctly based on their email.
      if (cleanEmail === "admin@nutrimed.com") {
        role = "admin";
      } else if (cleanEmail.endsWith("@nutrimed.com") || cleanEmail.includes("dr.")) {
        role = "doctor";
      }

      console.log("Authenticated User UID:", user.uid);
      console.log("Final Computed Role:", role);

      // 4. Role-Based Redirection
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "doctor" || role === "physician") {
        router.push("/doctor-portal");
      } else {
        router.push("/client-portal");
      }

    } catch (err: any) {
      console.error("Sign-in error:", err.code || err.message);
      setErrorMsg(getFriendlyAuthError(err.code));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FCFB] flex flex-col font-sans">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-teal-900/10 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#0C312F]">Welcome Back</h1>
            <p className="text-sm text-slate-500 mt-1">
              Sign in to access your NutriMed Ethiopia dashboard
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#218A83] text-white font-medium rounded-lg hover:bg-[#1a6e69] transition shadow-sm disabled:opacity-50 text-sm"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
            Don't have an account yet?{" "}
            <Link href="/create-account" className="text-orange-500 font-semibold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}