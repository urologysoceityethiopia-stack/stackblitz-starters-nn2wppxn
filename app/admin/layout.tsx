"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { 
  LayoutDashboard, Users, Stethoscope, 
  FileText, LogOut, Loader2 
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login"); // Redirect to login if not authenticated
        return;
      }

      // Check user role in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().role === "admin") {
        setIsAuthorized(true);
      } else {
        // If they are a doctor or patient, kick them out of the admin area
        router.push("/dashboard"); 
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-black text-white">NutriMed</h2>
          <p className="text-xs text-teal-400 font-bold uppercase tracking-wider mt-1">Admin Portal</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-semibold">Dashboard</span>
          </Link>
          <Link href="/admin/patients" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
            <Users className="w-5 h-5" />
            <span className="font-semibold">Patient Directory</span>
          </Link>
          <Link href="/admin/doctors" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
            <Stethoscope className="w-5 h-5" />
            <span className="font-semibold">Doctor Management</span>
          </Link>
          <Link href="/admin/blogs" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
            <FileText className="w-5 h-5" />
            <span className="font-semibold">Content & Blogs</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 rounded-xl hover:bg-slate-800 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}