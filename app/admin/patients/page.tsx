"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import RoleGuard from "@/components/auth/RoleGuard";
import { Users, Trash2, Search, Activity, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  bmi: number;
  primaryProgram: string;
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "users"), where("role", "==", "patient"));
      const querySnapshot = await getDocs(q);
      const patientList: Patient[] = [];
      querySnapshot.forEach((docSnap) => {
        patientList.push({ id: docSnap.id, ...docSnap.data() } as Patient);
      });
      setPatients(patientList);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this patient profile?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        setPatients(patients.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting patient:", error);
      }
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-50 p-8 font-sans">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-teal-700 font-semibold mb-2 hover:underline">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
              <h1 className="text-3xl font-extrabold text-slate-900">Patient Directory</h1>
              <p className="text-slate-600 mt-1">Manage registered patients and review their health goals.</p>
            </div>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search patient name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-80 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Table Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 font-medium">Loading patients...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No patients found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Patient Name</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Age / Gender</th>
                      <th className="p-4">Primary Program</th>
                      <th className="p-4">BMI</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredPatients.map(patient => (
                      <tr key={patient.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-bold text-slate-900">{patient.name || "N/A"}</td>
                        <td className="p-4 text-slate-600">
                          <div>{patient.email}</div>
                          <div className="text-xs text-slate-400">{patient.phone || "No phone"}</div>
                        </td>
                        <td className="p-4 text-slate-600">{patient.age || "-"} yrs ({patient.gender || "-"})</td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-teal-50 text-teal-700 font-medium rounded-full text-xs">
                            {patient.primaryProgram || "General Wellness"}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-700">{patient.bmi || "N/A"}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleDelete(patient.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Delete Patient"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </RoleGuard>
  );
}