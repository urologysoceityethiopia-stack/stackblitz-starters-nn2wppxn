"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import RoleGuard from "@/components/auth/RoleGuard";
import { Stethoscope, Mail, Phone, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "users"), where("role", "in", ["doctor", "physician"]));
      const querySnapshot = await getDocs(q);
      const doctorList: Doctor[] = [];
      querySnapshot.forEach((docSnap) => {
        doctorList.push({ id: docSnap.id, ...docSnap.data() } as Doctor);
      });
      setDoctors(doctorList);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-50 p-8 font-sans">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-8">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-teal-700 font-semibold mb-2 hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900">Doctor Management</h1>
            <p className="text-slate-600 mt-1">View and manage clinical staff and medical assignments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-12 text-slate-500 font-medium">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-slate-500">No doctors found in system.</div>
            ) : (
              doctors.map(doc => (
                <div key={doc.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{doc.name || "Dr. Staff"}</h3>
                        <span className="text-xs bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full">Active Physician</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" /> {doc.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" /> {doc.phone || "No phone added"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                    <span>Location: {doc.location || "Addis Ababa"}</span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </RoleGuard>
  );
}