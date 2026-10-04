"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create User Profile document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        fullName: fullName,
        role: "patient", // default role is patient
        createdAt: new Date().toISOString()
      });

      // 3. OPTION B INTAKE TRIGGER: Immediately create empty assessment document
      await addDoc(collection(db, "assessments"), {
        userId: user.uid,
        fullName: fullName,  // <-- THIS PERMANENTLY FIXES "UNNAMED PATIENT"
        email: email,        // <-- Added this so you can see emails in the portal too
        paymentStatus: "unpaid",
        finalAssessment: "", // doctor will edit this later
        receiptUrl: "",      // patient will upload this later
        createdAt: new Date().toISOString()
      });

      // Redirect to portal on success
      router.push("/client-portal");
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FCFB] flex items-center justify-center p-6 font-sans text-[#0C312F]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-[#218A83]/20 shadow-md space-y-6">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#0C312F]">Join NutriMed</h1>
          <p className="text-sm text-[#5C7977]">Create your account to start your clinical nutrition plan.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#218A83] uppercase tracking-wider mb-1.5">Full Name</label>
            <input 
              type="text" 
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jerusalem"
              className="w-full p-3 rounded-lg border border-[#218A83]/30 bg-[#F7FCFB] focus:outline-none focus:ring-2 focus:ring-[#218A83] text-[#0C312F] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#218A83] uppercase tracking-wider mb-1.5">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full p-3 rounded-lg border border-[#218A83]/30 bg-[#F7FCFB] focus:outline-none focus:ring-2 focus:ring-[#218A83] text-[#0C312F] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#218A83] uppercase tracking-wider mb-1.5">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 rounded-lg border border-[#218A83]/30 bg-[#F7FCFB] focus:outline-none focus:ring-2 focus:ring-[#218A83] text-[#0C312F] text-sm"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-[#FA7A18] text-white font-bold rounded-lg hover:bg-[#e06a12] disabled:bg-[#5C7977] disabled:opacity-50 transition shadow-md"
          >
            {loading ? "Creating Account..." : "Create Free Account"}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-[#5C7977]">
            Already have an account?{" "}
            <span 
              onClick={() => router.push("/signin")}
              className="text-[#218A83] font-bold cursor-pointer hover:underline"
            >
              Sign In
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}