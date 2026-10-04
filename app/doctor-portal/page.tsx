"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, doc, updateDoc, addDoc, where, getDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function DoctorPortal() {
  const router = useRouter();
  
  // --- AUTHENTICATION STATES ---
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // --- PORTAL STATES ---
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);

  // States for the currently selected patient
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientData, setSelectedPatientData] = useState<any>(null);
  
  // Form States: Initial Evaluation & Care
  const [evaluationAndLabs, setEvaluationAndLabs] = useState("");
  const [assessmentText, setAssessmentText] = useState("");
  const [mealPlanText, setMealPlanText] = useState("");

  // Prescription Header Fields
  const [prescriptionPatientName, setPrescriptionPatientName] = useState("");
  const [prescriptionPatientAge, setPrescriptionPatientAge] = useState("");
  const [prescriptionDate, setPrescriptionDate] = useState("");
  const [doctorName, setDoctorName] = useState("");

  // Form States: Comprehensive E-Prescription & Investigation Checklist
  const defaultLabs = {
    vitalsCategory: false,
    bloodPressureCheck: false,
    heartRateCheck: false,
    diabetesCategory: false,
    fbg: false, 
    hba1c: false,
    lipidCategory: false,
    totalCholesterol: false, 
    ldl: false, 
    hdl: false, 
    triglycerides: false,
    renalCategory: false,
    creatinine: false, 
    bun: false, 
    goutCategory: false,
    uricAcid: false,
    electrolyteCategory: false,
    sodium: false, 
    potassium: false, 
    chloride: false,
    liverCategory: false,
    alt: false, 
    ast: false, 
    alp: false, 
    bilirubin: false,
    cbcCategory: false,
    cbc: false,
    thyroidCategory: false,
    tsh: false, 
    t3: false, 
    t4: false,
    imagingCategory: false,
    abdominalUltrasound: false,
    abdominopelvicUltrasound: false
  };

  const [labOrders, setLabOrders] = useState(defaultLabs);
  const [additionalLabs, setAdditionalLabs] = useState("");
  
  // Form States: Follow-up Care
  const [followUpAssessment, setFollowUpAssessment] = useState("");
  const [followUpPlan, setFollowUpPlan] = useState("");
  
  // 6-Month Package States
  const [followUpMonths, setFollowUpMonths] = useState({
    month1: "", month2: "", month3: "", month4: "", month5: "", month6: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- AUTHENTICATION LISTENER ---
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchAssessments();
      } else {
        setUser(null);
        setLoading(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoginError("Invalid email or password. Please check your credentials.");
    }
  };

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth);
  };

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      let patientList: any[] = [];

      const assessmentsSnap = await getDocs(collection(db, "assessments"));
      
      if (!assessmentsSnap.empty) {
        const dataPromises = assessmentsSnap.docs.map(async (assessmentDoc) => {
          try {
            const assessmentData = assessmentDoc.data() as Record<string, any>;
            let patientProfile: Record<string, any> = {};
            
            if (assessmentData.userId) {
              try {
                let profileRef = doc(db, "patients", assessmentData.userId);
                let profileSnap = await getDoc(profileRef);
                
                if (!profileSnap.exists()) {
                   profileRef = doc(db, "users", assessmentData.userId);
                   profileSnap = await getDoc(profileRef);
                }

                if (profileSnap.exists()) {
                  patientProfile = profileSnap.data() as Record<string, any>;
                }
              } catch (e) {
                console.warn("Could not fetch user profile for ID:", assessmentData.userId, e);
              }
            }
            
            const shortId = (assessmentData.userId || assessmentDoc.id).substring(0, 4).toUpperCase();
            const generatedNmId = `NM-${shortId}`;

            const fullName = 
              patientProfile?.fullName || patientProfile?.name || patientProfile?.firstName ||
              assessmentData?.fullName || assessmentData?.name || assessmentData?.firstName || "Unnamed Patient";

            return { 
              id: assessmentDoc.id, 
              nmId: generatedNmId,
              fullName: fullName,
              email: patientProfile?.email || assessmentData?.email || "N/A",
              phone: patientProfile?.phone || assessmentData?.phone || "N/A",
              ...assessmentData,
              profile: patientProfile
            };
          } catch (err) {
            console.error("Error processing assessment doc:", assessmentDoc.id, err);
            return null;
          }
        });

        const results = await Promise.all(dataPromises);
        patientList = results.filter(Boolean);
      } 
      
      if (patientList.length === 0) {
        const patientsSnap = await getDocs(collection(db, "patients"));
        
        if (!patientsSnap.empty) {
          patientList = patientsSnap.docs.map((pDoc) => {
            const pData = pDoc.data() as Record<string, any>;
            const shortId = pDoc.id.substring(0, 4).toUpperCase();
            const fullName = pData?.fullName || pData?.name || pData?.firstName || "Unnamed Patient";

            return {
              id: pDoc.id,
              userId: pDoc.id,
              nmId: `NM-${shortId}`,
              fullName: fullName,
              email: pData?.email || "N/A",
              phone: pData?.phone || "N/A",
              ...pData,
              profile: pData
            };
          });
        }
      }

      patientList.sort((a: any, b: any) => {
        if (a.paymentStatus === "reviewing" && b.paymentStatus !== "reviewing") return -1;
        return 0;
      });
      
      setAssessments(patientList);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setFetchError(err.message || "Failed to load patient data from Firestore.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient: any) => {
    setSelectedPatientId(patient.id);
    setSelectedPatientData(patient);

    setAssessmentText(patient.finalAssessment || "");
    setEvaluationAndLabs(patient.evaluationAndLabs || ""); 
    
    setLabOrders(patient.labOrders || defaultLabs);
    setAdditionalLabs(patient.additionalLabs || "");
    
    setPrescriptionPatientName(patient.prescriptionPatientName || patient.fullName || "");
    setPrescriptionPatientAge(patient.prescriptionPatientAge || patient.age || patient.profile?.age || "");
    setPrescriptionDate(patient.prescriptionDate || new Date().toISOString().split('T')[0]);
    setDoctorName(patient.doctorName || user?.email?.split('@')[0] || "");

    setMealPlanText("");
    setFollowUpAssessment("");
    setFollowUpPlan("");
    setFollowUpMonths({ month1: "", month2: "", month3: "", month4: "", month5: "", month6: "" });

    // Fetch meal plans asynchronously
    (async () => {
      try {
        const mealPlanQ = query(collection(db, "meal_plans"), where("userId", "==", patient.userId || patient.id));
        const mealPlanSnap = await getDocs(mealPlanQ);
        
        if (!mealPlanSnap.empty) {
          const planData = mealPlanSnap.docs[0].data();
          setMealPlanText(planData.details || "");
          setFollowUpAssessment(planData.followUpAssessment || "");
          setFollowUpPlan(planData.followUpPlan || "");
          if (planData.followUpMonths) {
            setFollowUpMonths(planData.followUpMonths);
          }
        }
      } catch (error) {
        console.error("Error fetching patient details:", error);
      }
    })();
  };

  const handleLabChange = (key: keyof typeof defaultLabs) => {
    setLabOrders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCategoryToggle = (categoryKey: keyof typeof defaultLabs, itemKeys: (keyof typeof defaultLabs)[]) => {
    setLabOrders(prev => {
      const newCategoryState = !prev[categoryKey];
      const updated = { ...prev, [categoryKey]: newCategoryState };
      itemKeys.forEach(k => {
        updated[k] = newCategoryState;
      });
      return updated;
    });
  };

  const handleApprovePayment = async (patientId: string) => {
    try {
      try {
        const assessmentRef = doc(db, "assessments", patientId);
        await updateDoc(assessmentRef, { paymentStatus: "approved" });
      } catch {
        const patientRef = doc(db, "patients", patientId);
        await updateDoc(patientRef, { paymentStatus: "approved" });
      }
      alert("Payment Approved! The patient's plan is now unlocked.");
      fetchAssessments(); 
    } catch (error) {
      console.error("Error approving payment", error);
      alert("Failed to approve payment.");
    }
  };

  const handleSubmitCarePlan = async (assessmentId: string, userId: string) => {
    setIsSubmitting(true);
    try {
      const coreDataToUpdate = {
        finalAssessment: assessmentText,
        evaluationAndLabs: evaluationAndLabs,
        labOrders,
        additionalLabs,
        prescriptionPatientName,
        prescriptionPatientAge,
        prescriptionDate,
        doctorName
      };

      try {
        const assessmentRef = doc(db, "assessments", assessmentId);
        await updateDoc(assessmentRef, coreDataToUpdate);
      } catch {
        const patientRef = doc(db, "patients", assessmentId);
        await updateDoc(patientRef, coreDataToUpdate);
      }

      const targetUserId = userId || assessmentId;
      const mealPlanQ = query(collection(db, "meal_plans"), where("userId", "==", targetUserId));
      const mealPlanSnap = await getDocs(mealPlanQ);

      const mealPlanDataToSave = {
        userId: targetUserId,
        details: mealPlanText,
        followUpAssessment: followUpAssessment,
        followUpPlan: followUpPlan,
        followUpMonths: followUpMonths,
        updatedAt: new Date().toISOString()
      };

      if (!mealPlanSnap.empty) {
        const planId = mealPlanSnap.docs[0].id;
        await updateDoc(doc(db, "meal_plans", planId), mealPlanDataToSave);
      } else {
        await addDoc(collection(db, "meal_plans"), {
          ...mealPlanDataToSave,
          createdAt: new Date().toISOString()
        });
      }

      alert("All Patient Data & Care Plans saved successfully!");
      fetchAssessments(); 
    } catch (error) {
      console.error("Error submitting care plan", error);
      alert("Failed to save patient data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAssessments = assessments.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (p.fullName && p.fullName.toLowerCase().includes(searchLower)) ||
      (p.nmId && p.nmId.toLowerCase().includes(searchLower))
    );
  });

  if (authLoading || (user && loading)) return <div className="min-h-screen flex items-center justify-center text-[#218A83] font-bold bg-[#F7FCFB] text-xl">Loading Portal...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FCFB] font-sans">
        <div className="bg-white p-10 rounded-2xl shadow-lg border border-[#218A83]/20 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#0C312F] mb-2">Physician Login</h1>
            <p className="text-[#5C7977]">Secure portal for authorized personnel</p>
          </div>
          {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold mb-6 text-center">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#218A83] mb-2">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded-lg border border-[#218A83]/30 bg-[#F7FCFB] text-[#0C312F] outline-none focus:ring-2 focus:ring-[#218A83]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#218A83] mb-2">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded-lg border border-[#218A83]/30 bg-[#F7FCFB] text-[#0C312F] outline-none focus:ring-2 focus:ring-[#218A83]" />
            </div>
            <button type="submit" className="w-full py-3 mt-4 bg-[#218A83] text-white font-bold rounded-lg hover:bg-[#0C312F] transition shadow-md">Access Portal</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FCFB] p-8 font-sans text-[#0C312F]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-[#218A83]/20 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0C312F]">Physician Portal</h1>
            <p className="text-[#5C7977] text-sm mt-1">Welcome, Dr. {user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchAssessments} className="text-xs bg-white text-[#218A83] px-3 py-2 rounded-lg font-bold border border-[#218A83]/30 hover:bg-[#EAF6F5]">
              🔄 Refresh List
            </button>
            <span className="bg-[#EAF6F5] text-[#218A83] px-4 py-2 rounded-lg font-bold text-sm border border-[#218A83]/20">
              {assessments.length} Active Patients
            </span>
            <button onClick={handleSignOut} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-100 transition border border-red-100">Sign Out</button>
          </div>
        </div>

        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
            ⚠️ Firestore Error: {fetchError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Patient Queue */}
          <div className="lg:col-span-1 space-y-4 flex flex-col h-[75vh]">
            <h2 className="text-xl font-bold text-[#218A83]">Patient Queue</h2>
            
            <input 
              type="text" 
              placeholder="Search Name or NM-ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-lg border border-[#218A83]/30 bg-white focus:outline-none focus:ring-2 focus:ring-[#218A83] text-[#0C312F] shadow-sm mb-2"
            />

            <div className="overflow-y-auto pr-2 space-y-3 flex-grow">
              {filteredAssessments.map((patient) => (
                <div 
                  key={patient.id} 
                  onClick={() => handleSelectPatient(patient)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selectedPatientId === patient.id ? "bg-[#218A83] text-white border-[#218A83] shadow-md" : "bg-white border-[#218A83]/20 hover:bg-[#EAF6F5] text-[#0C312F]"
                  }`}
                >
                  <div className="font-bold text-lg mb-1 truncate">{patient.fullName}</div>
                  <div className={`text-xs mb-3 font-mono ${selectedPatientId === patient.id ? "text-white/80" : "text-[#218A83]"}`}>
                    ID: {patient.nmId}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    {patient.paymentStatus === "reviewing" && <span className="bg-[#FA7A18] text-white px-2 py-1 rounded">Needs Payment Review</span>}
                    {patient.paymentStatus === "approved" && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Payment Approved</span>}
                    {!patient.finalAssessment && <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Needs Care Plan</span>}
                  </div>
                </div>
              ))}
              {filteredAssessments.length === 0 && <p className="text-sm text-[#5C7977]">No patients found.</p>}
            </div>
          </div>

          {/* RIGHT COLUMN: Dashboard */}
          <div className="lg:col-span-2">
            {selectedPatientId ? (
              <div className="bg-white p-8 rounded-xl border border-[#218A83]/20 shadow-sm h-[75vh] overflow-y-auto flex flex-col">
                <div className="flex-grow space-y-10">
                  {(() => {
                    const patient = assessments.find(a => a.id === selectedPatientId);
                    if (!patient) return null;
                    
                    const labUrl = patient.files?.[0] || patient.investigationUrl || patient.profile?.investigationUrl;

                    return (
                      <>
                        {/* 1. IDENTIFICATION WITH FULL INPUT HISTORY */}
                        <div className="bg-[#0C312F] text-white p-6 rounded-xl shadow-md">
                          <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold">{patient.fullName}'s Medical File</h2>
                            <span className="bg-white/20 px-3 py-1 rounded text-sm font-mono">{patient.nmId}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-white/80 mb-6 pb-6 border-b border-white/20">
                            <p><strong>Email:</strong> {patient.email}</p>
                            <p><strong>Phone:</strong> {patient.phone}</p>
                          </div>
                          
                          <h3 className="text-lg font-bold mb-3 text-white">Full Patient Intake History</h3>
                          <div className="grid grid-cols-1 gap-y-4 text-sm bg-white/10 p-4 rounded-lg">
                            {Object.entries(patient).map(([key, value]) => {
                              const hiddenKeys = ['id', 'nmId', 'userId', 'profile', 'paymentStatus', 'evaluationAndLabs', 'finalAssessment', 'fullName', 'email', 'phone', 'investigationUrl', 'receiptUrl', 'files', 'labOrders', 'additionalLabs'];
                              if (hiddenKeys.includes(key) || typeof value === 'object' || !value) return null;
                              
                              const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                              
                              return (
                                <div key={key}>
                                  <span className="text-[#A2E3DF] font-bold block mb-1">{formattedKey}:</span>
                                  <span className="text-white break-words">{String(value)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2. CLINICAL EVALUATION */}
                        <section>
                          <h2 className="text-xl font-bold text-[#0C312F] mb-4 border-b border-[#218A83]/10 pb-2">
                            ⚕️ Clinical Evaluation
                          </h2>
                          <div>
                            <textarea 
                              value={evaluationAndLabs}
                              onChange={(e) => setEvaluationAndLabs(e.target.value)}
                              placeholder="Doctor's General Clinical Evaluation..."
                              className="w-full p-4 rounded-lg border border-[#218A83]/30 bg-[#F7FCFB] outline-none focus:ring-2 focus:ring-[#218A83] text-[#0C312F] min-h-[120px]"
                            />
                          </div>
                        </section>

                        {/* 3. E-PRESCRIPTION & INVESTIGATION CHECKLIST */}
                        <section>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 border-b border-[#218A83]/10 pb-2 gap-3">
                            <h2 className="text-xl font-bold text-[#0C312F]">
                              📋 E-Prescription & Investigation Checklist
                            </h2>
                            {labUrl && (
                              <a href={labUrl} target="_blank" rel="noreferrer" className="text-xs bg-[#218A83] text-white px-4 py-2 rounded-lg hover:bg-[#0C312F] transition shadow-sm font-semibold flex items-center gap-1.5 shrink-0">
                                🔬 View Patient's Submitted Lab File
                              </a>
                            )}
                          </div>
                          
                          {/* Prescription Header Input Details */}
                          <div className="bg-[#EAF6F5] p-5 rounded-xl border border-[#218A83]/30 mb-6">
                            <h3 className="font-bold text-[#0C312F] text-sm mb-3">Prescription Header Details (Displayed on Patient View)</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-[#218A83] mb-1">Patient Full Name</label>
                                <input 
                                  type="text" 
                                  value={prescriptionPatientName} 
                                  onChange={(e) => setPrescriptionPatientName(e.target.value)} 
                                  className="w-full p-2.5 text-sm bg-white rounded border border-[#218A83]/30"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-[#218A83] mb-1">Patient Age</label>
                                <input 
                                  type="text" 
                                  value={prescriptionPatientAge} 
                                  onChange={(e) => setPrescriptionPatientAge(e.target.value)} 
                                  className="w-full p-2.5 text-sm bg-white rounded border border-[#218A83]/30"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-[#218A83] mb-1">Date</label>
                                <input 
                                  type="date" 
                                  value={prescriptionDate} 
                                  onChange={(e) => setPrescriptionDate(e.target.value)} 
                                  className="w-full p-2.5 text-sm bg-white rounded border border-[#218A83]/30"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-[#218A83] mb-1">Physician Name</label>
                                <input 
                                  type="text" 
                                  value={doctorName} 
                                  onChange={(e) => setDoctorName(e.target.value)} 
                                  placeholder="Dr. Name"
                                  className="w-full p-2.5 text-sm bg-white rounded border border-[#218A83]/30"
                                />
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-[#5C7977] mb-6">Select items below to include them in the patient's e-prescription summary.</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            
                            {/* Vitals Checklist Section */}
                            <div className="bg-[#EAF6F5] p-4 rounded-lg border border-[#218A83]/20">
                              <label className="flex items-center gap-2 font-bold text-[#0C312F] mb-3 text-sm uppercase cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={labOrders.vitalsCategory} 
                                  onChange={() => handleCategoryToggle('vitalsCategory', ['bloodPressureCheck', 'heartRateCheck'])} 
                                  className="accent-[#218A83] w-4 h-4" 
                                />
                                🫀 Patient Vitals
                              </label>
                              <div className="space-y-2 pl-6">
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer">
                                  <input type="checkbox" checked={labOrders.bloodPressureCheck} onChange={() => handleLabChange('bloodPressureCheck')} className="accent-[#218A83]" />
                                  Blood Pressure
                                </label>
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer">
                                  <input type="checkbox" checked={labOrders.heartRateCheck} onChange={() => handleLabChange('heartRateCheck')} className="accent-[#218A83]" />
                                  Heart Rate
                                </label>
                              </div>
                            </div>

                            {/* Diabetes Monitoring */}
                            <div className="bg-[#EAF6F5] p-4 rounded-lg border border-[#218A83]/20">
                              <label className="flex items-center gap-2 font-bold text-[#0C312F] mb-3 text-sm uppercase cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={labOrders.diabetesCategory} 
                                  onChange={() => handleCategoryToggle('diabetesCategory', ['fbg', 'hba1c'])} 
                                  className="accent-[#218A83] w-4 h-4" 
                                />
                                Diabetes Monitoring
                              </label>
                              <div className="space-y-2 pl-6">
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer">
                                  <input type="checkbox" checked={labOrders.fbg} onChange={() => handleLabChange('fbg')} className="accent-[#218A83]" />
                                  Fasting Blood Glucose (FBG)
                                </label>
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer">
                                  <input type="checkbox" checked={labOrders.hba1c} onChange={() => handleLabChange('hba1c')} className="accent-[#218A83]" />
                                  HbA1c
                                </label>
                              </div>
                            </div>

                            {/* Lipid Profile */}
                            <div className="bg-[#EAF6F5] p-4 rounded-lg border border-[#218A83]/20">
                              <label className="flex items-center gap-2 font-bold text-[#0C312F] mb-3 text-sm uppercase cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={labOrders.lipidCategory} 
                                  onChange={() => handleCategoryToggle('lipidCategory', ['totalCholesterol', 'ldl', 'hdl', 'triglycerides'])} 
                                  className="accent-[#218A83] w-4 h-4" 
                                />
                                Lipid Profile
                              </label>
                              <div className="space-y-2 pl-6">
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.totalCholesterol} onChange={() => handleLabChange('totalCholesterol')} className="accent-[#218A83]" /> Total Cholesterol</label>
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.ldl} onChange={() => handleLabChange('ldl')} className="accent-[#218A83]" /> LDL Cholesterol</label>
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.hdl} onChange={() => handleLabChange('hdl')} className="accent-[#218A83]" /> HDL Cholesterol</label>
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.triglycerides} onChange={() => handleLabChange('triglycerides')} className="accent-[#218A83]" /> Triglycerides</label>
                              </div>
                            </div>

                            {/* Renal Function */}
                            <div className="bg-[#EAF6F5] p-4 rounded-lg border border-[#218A83]/20">
                              <label className="flex items-center gap-2 font-bold text-[#0C312F] mb-3 text-sm uppercase cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={labOrders.renalCategory} 
                                  onChange={() => handleCategoryToggle('renalCategory', ['creatinine', 'bun'])} 
                                  className="accent-[#218A83] w-4 h-4" 
                                />
                                Renal Function
                              </label>
                              <div className="space-y-2 pl-6">
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.creatinine} onChange={() => handleLabChange('creatinine')} className="accent-[#218A83]" /> Serum Creatinine</label>
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.bun} onChange={() => handleLabChange('bun')} className="accent-[#218A83]" /> Blood Urea Nitrogen (BUN)</label>
                              </div>
                            </div>
                            
                            {/* Gout Evaluation */}
                            <div className="bg-[#EAF6F5] p-4 rounded-lg border border-[#218A83]/20">
                              <label className="flex items-center gap-2 font-bold text-[#0C312F] mb-3 text-sm uppercase cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={labOrders.goutCategory} 
                                  onChange={() => handleCategoryToggle('goutCategory', ['uricAcid'])} 
                                  className="accent-[#218A83] w-4 h-4" 
                                />
                                Gout Evaluation
                              </label>
                              <div className="space-y-2 pl-6">
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.uricAcid} onChange={() => handleLabChange('uricAcid')} className="accent-[#218A83]" /> Uric Acid</label>
                              </div>
                            </div>

                            {/* Electrolytes */}
                            <div className="bg-[#EAF6F5] p-4 rounded-lg border border-[#218A83]/20">
                              <label className="flex items-center gap-2 font-bold text-[#0C312F] mb-3 text-sm uppercase cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={labOrders.electrolyteCategory} 
                                  onChange={() => handleCategoryToggle('electrolyteCategory', ['sodium', 'potassium', 'chloride'])} 
                                  className="accent-[#218A83] w-4 h-4" 
                                />
                                Electrolytes
                              </label>
                              <div className="space-y-2 pl-6">
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.sodium} onChange={() => handleLabChange('sodium')} className="accent-[#218A83]" /> Sodium</label>
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.potassium} onChange={() => handleLabChange('potassium')} className="accent-[#218A83]" /> Potassium</label>
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.chloride} onChange={() => handleLabChange('chloride')} className="accent-[#218A83]" /> Chloride</label>
                              </div>
                            </div>

                            {/* Liver Function */}
                            <div className="bg-[#EAF6F5] p-4 rounded-lg border border-[#218A83]/20">
                              <label className="flex items-center gap-2 font-bold text-[#0C312F] mb-3 text-sm uppercase cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={labOrders.liverCategory} 
                                  onChange={() => handleCategoryToggle('liverCategory', ['alt', 'ast', 'alp', 'bilirubin'])} 
                                  className="accent-[#218A83] w-4 h-4" 
                                />
                                Liver Function
                              </label>
                              <div className="space-y-2 pl-6">
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.alt} onChange={() => handleLabChange('alt')} className="accent-[#218A83]" /> ALT</label>
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.ast} onChange={() => handleLabChange('ast')} className="accent-[#218A83]" /> AST</label>
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.alp} onChange={() => handleLabChange('alp')} className="accent-[#218A83]" /> ALP</label>
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.bilirubin} onChange={() => handleLabChange('bilirubin')} className="accent-[#218A83]" /> Total Bilirubin</label>
                              </div>
                            </div>

                            {/* Thyroid & CBC */}
                            <div className="bg-[#EAF6F5] p-4 rounded-lg border border-[#218A83]/20 flex flex-col gap-4">
                              <div>
                                <label className="flex items-center gap-2 font-bold text-[#0C312F] mb-3 text-sm uppercase cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={labOrders.cbcCategory} 
                                    onChange={() => handleCategoryToggle('cbcCategory', ['cbc'])} 
                                    className="accent-[#218A83] w-4 h-4" 
                                  />
                                  Complete Blood Count
                                </label>
                                <div className="pl-6">
                                  <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.cbc} onChange={() => handleLabChange('cbc')} className="accent-[#218A83]" /> CBC</label>
                                </div>
                              </div>
                              <div>
                                <label className="flex items-center gap-2 font-bold text-[#0C312F] mb-3 text-sm uppercase cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={labOrders.thyroidCategory} 
                                    onChange={() => handleCategoryToggle('thyroidCategory', ['tsh', 't3', 't4'])} 
                                    className="accent-[#218A83] w-4 h-4" 
                                  />
                                  Thyroid Function
                                </label>
                                <div className="space-y-2 pl-6">
                                  <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.tsh} onChange={() => handleLabChange('tsh')} className="accent-[#218A83]" /> TSH</label>
                                  <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.t3} onChange={() => handleLabChange('t3')} className="accent-[#218A83]" /> T3</label>
                                  <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer"><input type="checkbox" checked={labOrders.t4} onChange={() => handleLabChange('t4')} className="accent-[#218A83]" /> T4</label>
                                </div>
                              </div>
                            </div>

                            {/* Imaging Section */}
                            <div className="bg-[#EAF6F5] p-4 rounded-lg border border-[#218A83]/20">
                              <label className="flex items-center gap-2 font-bold text-[#0C312F] mb-3 text-sm uppercase cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={labOrders.imagingCategory} 
                                  onChange={() => handleCategoryToggle('imagingCategory', ['abdominalUltrasound', 'abdominopelvicUltrasound'])} 
                                  className="accent-[#218A83] w-4 h-4" 
                                />
                                Imaging
                              </label>
                              <div className="space-y-2 pl-6">
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer">
                                  <input type="checkbox" checked={labOrders.abdominalUltrasound} onChange={() => handleLabChange('abdominalUltrasound')} className="accent-[#218A83]" />
                                  Abdominal Ultrasound
                                </label>
                                <label className="flex items-center gap-2 text-sm text-[#0C312F] cursor-pointer">
                                  <input type="checkbox" checked={labOrders.abdominopelvicUltrasound} onChange={() => handleLabChange('abdominopelvicUltrasound')} className="accent-[#218A83]" />
                                  Abdominopelvic Ultrasound
                                </label>
                              </div>
                            </div>
                            
                          </div>

                          {/* Additional Labs */}
                          <div>
                            <label className="block text-sm font-bold text-[#218A83] mb-2">Additional Lab Investigations</label>
                            <textarea 
                              value={additionalLabs}
                              onChange={(e) => setAdditionalLabs(e.target.value)}
                              placeholder="Enter any additional lab requests..."
                              className="w-full p-4 rounded-lg border border-[#218A83]/30 bg-[#F7FCFB] outline-none focus:ring-2 focus:ring-[#218A83] text-[#0C312F] min-h-[100px]"
                            />
                          </div>
                        </section>

                        {/* 4. FINAL ASSESSMENT & DIAGNOSIS */}
                        <section>
                          <h2 className="text-xl font-bold text-[#0C312F] mb-4 border-b border-[#218A83]/10 pb-2">
                            📝 Final Diagnosis & Assessment
                          </h2>
                          <textarea 
                            value={assessmentText}
                            onChange={(e) => setAssessmentText(e.target.value)}
                            placeholder="Provide the final diagnosis and overall assessment..."
                            className="w-full p-4 rounded-lg border border-[#218A83]/30 bg-[#F7FCFB] outline-none focus:ring-2 focus:ring-[#218A83] text-[#0C312F] min-h-[120px]"
                          />
                        </section>

                        {/* 5. NUTRITIONAL & MEAL PLAN */}
                        <section>
                          <h2 className="text-xl font-bold text-[#0C312F] mb-4 border-b border-[#218A83]/10 pb-2">
                            🥗 Nutritional & Meal Plan
                          </h2>
                          <textarea 
                            value={mealPlanText}
                            onChange={(e) => setMealPlanText(e.target.value)}
                            placeholder="Enter dietary recommendations and structured meal plan..."
                            className="w-full p-4 rounded-lg border border-[#218A83]/30 bg-[#F7FCFB] outline-none focus:ring-2 focus:ring-[#218A83] text-[#0C312F] min-h-[120px]"
                          />
                        </section>

                        {/* 6. FOLLOW-UP CARE & 6-MONTH TRACKING */}
                        <section>
                          <h2 className="text-xl font-bold text-[#0C312F] mb-4 border-b border-[#218A83]/10 pb-2">
                            📅 Follow-up Care & 6-Month Package
                          </h2>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                              <label className="block text-sm font-bold text-[#218A83] mb-2">Follow-up Assessment</label>
                              <textarea 
                                value={followUpAssessment}
                                onChange={(e) => setFollowUpAssessment(e.target.value)}
                                placeholder="Notes for next follow-up..."
                                className="w-full p-4 rounded-lg border border-[#218A83]/30 bg-[#F7FCFB] outline-none focus:ring-2 focus:ring-[#218A83] text-[#0C312F] min-h-[120px]"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-[#218A83] mb-2">Follow-up Plan</label>
                              <textarea 
                                value={followUpPlan}
                                onChange={(e) => setFollowUpPlan(e.target.value)}
                                placeholder="Action items for the patient..."
                                className="w-full p-4 rounded-lg border border-[#218A83]/30 bg-[#F7FCFB] outline-none focus:ring-2 focus:ring-[#218A83] text-[#0C312F] min-h-[120px]"
                              />
                            </div>
                          </div>

                          <h3 className="font-bold text-[#0C312F] mb-3 text-sm uppercase">6-Month Progress Tracking</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((month) => (
                              <div key={`month${month}`}>
                                <label className="block text-xs font-bold text-[#218A83] mb-1">Month {month}</label>
                                <textarea 
                                  value={followUpMonths[`month${month}` as keyof typeof followUpMonths]}
                                  onChange={(e) => setFollowUpMonths(prev => ({ ...prev, [`month${month}`]: e.target.value }))}
                                  placeholder={`Progress for Month ${month}...`}
                                  className="w-full p-3 rounded-lg border border-[#218A83]/30 bg-[#F7FCFB] outline-none focus:ring-2 focus:ring-[#218A83] text-[#0C312F] min-h-[80px] text-sm"
                                />
                              </div>
                            ))}
                          </div>
                        </section>
                      </>
                    );
                  })()}
                </div>

                {/* ACTION FOOTER */}
                <div className="mt-8 pt-6 border-t border-[#218A83]/20 flex flex-wrap gap-4 items-center justify-end shrink-0">
                  {(() => {
                    const patient = assessments.find(a => a.id === selectedPatientId);
                    if (patient?.paymentStatus === "reviewing") {
                      return (
                        <button 
                          onClick={() => handleApprovePayment(patient.id)}
                          className="bg-[#FA7A18] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#E06912] transition shadow-md"
                        >
                          ✅ Approve Payment & Unlock
                        </button>
                      );
                    }
                    return null;
                  })()}

                  <button 
                    onClick={() => {
                      const patient = assessments.find(a => a.id === selectedPatientId);
                      if (patient) {
                        handleSubmitCarePlan(patient.id, patient.userId);
                      }
                    }}
                    disabled={isSubmitting}
                    className={`px-8 py-3 rounded-lg font-bold text-white transition shadow-md ${
                      isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#218A83] hover:bg-[#0C312F]"
                    }`}
                  >
                    {isSubmitting ? "Saving Data..." : "💾 Save Patient Data & Care Plan"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-10 rounded-xl border border-[#218A83]/20 shadow-sm h-[75vh] flex flex-col items-center justify-center text-center">
                <div className="text-6xl mb-4 opacity-50">👨‍⚕️</div>
                <h3 className="text-2xl font-bold text-[#0C312F] mb-2">No Patient Selected</h3>
                <p className="text-[#5C7977]">Select a patient from the queue to view their medical file and create a care plan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}