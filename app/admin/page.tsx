"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import RoleGuard from "@/components/auth/RoleGuard";
import Link from "next/link";
import { Users, Stethoscope, FileText, ArrowRight, Activity, LogOut, MessageSquare } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [patientCount, setPatientCount] = useState(0);
  const [doctorCount, setDoctorCount] = useState(0);
  const [blogCount, setBlogCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        let pCount = 0;
        let dCount = 0;
        
        usersSnap.forEach((doc) => {
          const data = doc.data();
          const role = (data.role || "").toLowerCase();
          const email = (data.email || "").toLowerCase();
          
          if (role === "doctor" || role === "physician" || email.includes("dr.") || (email.endsWith("@nutrimed.com") && email !== "admin@nutrimed.com")) {
            dCount++;
          } else if (role !== "admin") {
            pCount++;
          }
        });

        const blogsSnap = await getDocs(collection(db, "blogs"));
        
        // Fetch reviews count (will return 0 safely if the collection doesn't exist yet)
        const reviewsSnap = await getDocs(collection(db, "reviews"));
        
        setBlogCount(blogsSnap.size);
        setPatientCount(pCount);
        setDoctorCount(dCount);
        setReviewCount(reviewsSnap.size);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/sign-in");
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-50 flex font-sans">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center gap-2 mb-10">
              <span className="text-2xl font-extrabold text-[#218A83]">NutriMed</span>
              <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">Admin</span>
            </div>
            <nav className="space-y-2">
              <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-teal-50 text-teal-700 font-bold rounded-xl">
                <Activity className="w-5 h-5" /> Dashboard
              </Link>
              <Link href="/admin/patients" className="flex items-center gap-3 px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl">
                <Users className="w-5 h-5" /> Patient Directory
              </Link>
              <Link href="/admin/doctors" className="flex items-center gap-3 px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl">
                <Stethoscope className="w-5 h-5" /> Doctor Management
              </Link>
              <Link href="/admin/blogs" className="flex items-center gap-3 px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl">
                <FileText className="w-5 h-5" /> Content & Blogs
              </Link>
              <Link href="/admin/reviews" className="flex items-center gap-3 px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl">
                <MessageSquare className="w-5 h-5" /> Review Approvals
              </Link>
            </nav>
          </div>
          <div>
            <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl w-full transition">
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">System Overview</h1>
                <p className="text-slate-600 mt-1">Welcome back, Admin. Here is live data from your platform.</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-slate-500 uppercase">Total Patients</span>
                  <div className="p-3 bg-teal-50 text-teal-700 rounded-xl"><Users className="w-6 h-6" /></div>
                </div>
                <div className="text-4xl font-black text-slate-900">{loading ? "..." : patientCount}</div>
                <div className="text-xs text-slate-500 mt-2">Registered client accounts</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-slate-500 uppercase">Active Doctors</span>
                  <div className="p-3 bg-teal-50 text-teal-700 rounded-xl"><Stethoscope className="w-6 h-6" /></div>
                </div>
                <div className="text-4xl font-black text-slate-900">{loading ? "..." : doctorCount}</div>
                <div className="text-xs text-slate-500 mt-2">Verified clinical staff</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-slate-500 uppercase">Published Articles</span>
                  <div className="p-3 bg-teal-50 text-teal-700 rounded-xl"><FileText className="w-6 h-6" /></div>
                </div>
                <div className="text-4xl font-black text-slate-900">{loading ? "..." : blogCount}</div>
                <div className="text-xs text-slate-500 mt-2">Live blog posts</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-slate-500 uppercase">Reviews</span>
                  <div className="p-3 bg-teal-50 text-teal-700 rounded-xl"><MessageSquare className="w-6 h-6" /></div>
                </div>
                <div className="text-4xl font-black text-slate-900">{loading ? "..." : reviewCount}</div>
                <div className="text-xs text-slate-500 mt-2">Total user testimonials</div>
              </div>
            </div>

            {/* Quick Action Panels */}
            <h2 className="text-xl font-bold text-slate-900 mb-4">User & Content Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Patient Directory</h3>
                  <p className="text-slate-600 text-sm mb-6">Manage patient records, track health goals, and review metrics.</p>
                </div>
                <Link href="/admin/patients" className="inline-flex items-center gap-2 text-teal-700 font-bold hover:underline">
                  View Patient Portal <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Doctor Management</h3>
                  <p className="text-slate-600 text-sm mb-6">Review active physicians and clinical staff permissions.</p>
                </div>
                <Link href="/admin/doctors" className="inline-flex items-center gap-2 text-teal-700 font-bold hover:underline">
                  View Doctor Portal <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Review Approvals</h3>
                  <p className="text-slate-600 text-sm mb-6">Moderate patient testimonials before they appear on the site.</p>
                </div>
                <Link href="/admin/reviews" className="inline-flex items-center gap-2 text-teal-700 font-bold hover:underline">
                  Manage Reviews <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Write New Blog Post</h3>
                  <p className="text-slate-600 text-sm mb-6">Create and publish health articles for your audience.</p>
                </div>
                <Link href="/admin/blogs/new" className="inline-flex items-center gap-2 text-teal-700 font-bold hover:underline">
                  Create Article <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Manage Existing Posts</h3>
                  <p className="text-slate-600 text-sm mb-6">Edit, unpublish, or delete blogs from the platform.</p>
                </div>
                <Link href="/admin/blogs" className="inline-flex items-center gap-2 text-teal-700 font-bold hover:underline">
                  Manage Blogs <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}