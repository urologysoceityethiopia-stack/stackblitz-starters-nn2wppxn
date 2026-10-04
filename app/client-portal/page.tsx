"use client";

import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const LAB_CATEGORIES = {
  "Vitals & Basic Metrics": ["bloodPressureCheck", "heartRateCheck"],
  "Hematology (Blood)": ["cbc"],
  "Diabetes & Blood Sugar": ["fbg", "hba1c"],
  "Lipid Panel (Cholesterol)": ["hdl", "ldl", "totalCholesterol", "triglycerides"],
  "Renal (Kidney) Panel": ["bun", "creatinine", "uricAcid"],
  "Electrolytes": ["chloride", "potassium", "sodium"],
  "Liver Function": ["alp", "alt", "ast", "bilirubin"],
  "Thyroid Panel": ["t3", "t4", "tsh"],
  "Imaging Studies": ["abdominalUltrasound", "abdominopelvicUltrasound"]
};

export default function ClientPortal() {
  const router = useRouter();
  const prescriptionRef = useRef<HTMLDivElement>(null);
  
  const [data, setData] = useState<any>({ assessment: null, profile: null });
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [patientAnswers, setPatientAnswers] = useState("");
  const [savingAnswers, setSavingAnswers] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/signin");
        return;
      }

      try {
        const profileRef = doc(db, "profiles", user.uid);
        const profileSnap = await getDoc(profileRef);
        const profileData = profileSnap.exists() ? profileSnap.data() : null;

        const assessmentQ = query(
          collection(db, "assessments"), 
          where("userId", "==", user.uid)
        );
        const assessmentSnap = await getDocs(assessmentQ);
        
        if (!assessmentSnap.empty) {
          const sortedDocs = assessmentSnap.docs.sort((a, b) => {
            const dateA = new Date(a.data().updatedAt || a.data().createdAt || 0).getTime();
            const dateB = new Date(b.data().updatedAt || b.data().createdAt || 0).getTime();
            return dateA - dateB;
          });

          const lastDoc = sortedDocs[sortedDocs.length - 1];
          const assessmentData = lastDoc.data();
          
          setData({ 
            assessment: assessmentData, 
            profile: profileData 
          });
          setAssessmentId(lastDoc.id);
          setPatientAnswers(assessmentData.patientAnswers || "");
        } else {
          setData((prev: any) => ({ ...prev, profile: profileData }));
        }
      } catch (err) {
        console.error("Data fetch error:", err);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSaveAnswers = async () => {
    if (!assessmentId) return;
    setSavingAnswers(true);
    try {
      const assessmentRef = doc(db, "assessments", assessmentId);
      await updateDoc(assessmentRef, { patientAnswers });
      setMessage("Answers submitted to your physician successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save answers. Please try again.");
    } finally {
      setSavingAnswers(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5000000) { 
      setMessage("File is too large. Please upload an image or PDF under 5MB.");
      return;
    }

    setUploading(true);
    setMessage(""); 
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData, 
      });

      const resultData = await response.json().catch(() => ({ error: "Failed to parse server response." }));

      if (!response.ok) {
        console.error("Server error details:", resultData);
        setMessage(`Upload failed: ${resultData.error || "Check your API route configuration."}`);
        setUploading(false);
        return;
      }

      if (response.ok && resultData.url) {
        const secureUrl = resultData.url;

        if (assessmentId) {
          const assessmentRef = doc(db, "assessments", assessmentId);
          await updateDoc(assessmentRef, {
            files: arrayUnion(secureUrl)
          });

          setData((prev: any) => ({
            ...prev,
            assessment: {
              ...prev.assessment,
              files: [...(prev.assessment?.files || []), secureUrl]
            }
          }));

          setMessage("Investigation report successfully uploaded and linked to your record!");
        }
      } else {
        setMessage(`Upload failed: ${resultData.error || "Unknown error"}`); 
      }
    } catch (err: any) {
      console.error(err);
      setMessage(`Network connection error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // --- DOWNLOAD HANDLERS ---
  const downloadAsImage = async () => {
    if (!prescriptionRef.current) return;
    const canvas = await html2canvas(prescriptionRef.current, { scale: 2 });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `Nutrimed_Lab_Prescription_${assessmentId?.substring(0, 6)}.png`;
    link.click();
  };

  const downloadAsPDF = async () => {
    if (!prescriptionRef.current) return;
    const canvas = await html2canvas(prescriptionRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
    pdf.save(`Nutrimed_Lab_Prescription_${assessmentId?.substring(0, 6)}.pdf`);
  };

  // --- HELPER FORMATTERS ---
  const getFieldValue = (fieldName: string) => {
    return data.profile?.[fieldName] || data.assessment?.[fieldName] || "None provided";
  };

  const formatCamelCase = (str: string) => {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
  };

  const formatFirebaseDate = (timestamp: any) => {
    if (!timestamp) return "Pending";
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleDateString();
    const parsedDate = new Date(timestamp);
    return isNaN(parsedDate.getTime()) ? "Current Cycle" : parsedDate.toLocaleDateString();
  };

  const groupedLabs = Object.entries(LAB_CATEGORIES).map(([categoryName, labKeys]) => {
    const orderedLabs = labKeys.filter(key => data.assessment?.labOrders?.[key] === true);
    return { categoryName, orderedLabs };
  }).filter(group => group.orderedLabs.length > 0);

  const totalLabsOrdered = groupedLabs.reduce((sum, group) => sum + group.orderedLabs.length, 0);
  const additionalLabsText = data.assessment?.additionalLabs || data.assessment?.otherLabs || data.assessment?.customLabs || "";
  const shouldShowPrescription = totalLabsOrdered > 0 || additionalLabsText.length > 0;

  return (
    <div className="min-h-screen bg-[#F7FCFB] p-8 font-sans text-[#0C312F]">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#0C312F]">Clinical Review Portal</h1>
          <button 
            onClick={() => router.push("/plan")}
            className="px-5 py-2.5 bg-[#218A83] text-white rounded-lg font-medium shadow-sm hover:bg-[#1a6e69] transition text-sm"
          >
            View Final Plan & Billing ➔
          </button>
        </div>

        {/* SECTION 1: INITIAL ASSESSMENT HISTORY */}
        <div className="bg-white p-8 rounded-xl border border-[#218A83]/20 shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-6 text-[#218A83] flex items-center gap-2">
            📋 Submitted Intake History
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <span className="font-bold uppercase text-xs text-[#64748B]">Reason for Consultation</span>
              <p className="mt-1 bg-[#F8FAFC] p-3 rounded border border-slate-100">
                {getFieldValue('reasonForConsultation')}
              </p>
            </div>
            
            <div>
              <span className="font-bold uppercase text-xs text-[#64748B]">Medical History & Diagnoses</span>
              <p className="mt-1 bg-[#F8FAFC] p-3 rounded border border-slate-100">
                {getFieldValue('medicalHistory')}
              </p>
            </div>

            <div>
              <span className="font-bold uppercase text-xs text-[#64748B]">Current Medications & Supplements</span>
              <p className="mt-1 bg-[#F8FAFC] p-3 rounded border border-slate-100">
                {getFieldValue('medications')}
              </p>
            </div>

            <div>
              <span className="font-bold uppercase text-xs text-[#64748B]">Patient Nutrition History</span>
              <p className="mt-1 bg-[#F8FAFC] p-3 rounded border border-slate-100">
                {getFieldValue('dietaryHistory')}
              </p>
            </div>
            
            <div>
              <span className="font-bold uppercase text-xs text-[#64748B]">Health & Medical Background</span>
              <p className="mt-1 bg-[#F8FAFC] p-3 rounded border border-slate-100">
                {getFieldValue('dietaryRestrictions')}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: LIVE PHYSICIAN EVALUATION LOOP */}
        <div className="bg-white p-8 rounded-xl border border-[#218A83]/20 shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-4 text-[#0C312F]">🩺 Physician Review & Lab Orders</h2>
          
          <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
            After examining your clinical intake history, your assigned physician will analyze your case, ask follow-up evaluation questions if necessary, and issue digital investigation orders for required lab workups below.
          </p>

          <div className="bg-[#EAF6F5] p-5 rounded-lg border border-[#218A83]/30 mb-6">
            <h3 className="font-bold text-[#0C312F] mb-2 flex items-center gap-2">
              ⚕️ Doctor's Evaluation
            </h3>
            {data.assessment?.evaluationAndLabs ? (
              <p className="text-sm text-[#0C312F] whitespace-pre-wrap">
                {data.assessment.evaluationAndLabs}
              </p>
            ) : (
              <p className="text-sm text-[#5C7977] italic">
                Your physician is currently reviewing your file. Orders will appear here shortly.
              </p>
            )}
          </div>

          {data.assessment?.doctorQuestions ? (
            <div className="p-6 bg-[#218A83]/5 rounded-xl border border-[#218A83]/20 mb-6">
              <h3 className="font-bold text-[#0C312F] mb-2 flex items-center gap-1.5">
                💬 Additional Questions from Your Doctor
              </h3>
              <p className="text-sm text-[#334155] italic mb-4 bg-white p-3 rounded border border-[#218A83]/10">
                "{data.assessment.doctorQuestions}"
              </p>
              <textarea
                value={patientAnswers}
                onChange={(e) => setPatientAnswers(e.target.value)}
                placeholder="Type your response here (unlimited character capacity)..."
                rows={5}
                className="w-full p-4 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-[#218A83] focus:ring-1 focus:ring-[#218A83] transition"
              />
              <button
                onClick={handleSaveAnswers}
                disabled={savingAnswers}
                className="mt-3 px-4 py-2 bg-[#218A83] text-white text-sm font-semibold rounded-md hover:bg-[#1a6e69] disabled:bg-slate-300 transition"
              >
                {savingAnswers ? "Saving response..." : "Submit Response to Doctor"}
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 text-slate-500 rounded-lg text-sm italic mb-6 border border-dashed text-center">
              No additional follow-up questions from your physician at this time.
            </div>
          )}

          {shouldShowPrescription ? (
            <div className="my-8">
              <div className="flex justify-end gap-3 mb-3">
                <button 
                  onClick={downloadAsImage} 
                  className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 py-1.5 px-3 rounded font-medium transition flex items-center gap-1"
                >
                  ⬇️ Save as Image
                </button>
                <button 
                  onClick={downloadAsPDF} 
                  className="text-xs bg-[#218A83] hover:bg-[#1a6e69] text-white py-1.5 px-3 rounded font-medium transition flex items-center gap-1"
                >
                  📄 Download PDF
                </button>
              </div>

              <div 
                ref={prescriptionRef} 
                className="border-2 border-slate-300 rounded-xl bg-white shadow-sm overflow-hidden max-w-2xl mx-auto"
              >
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-start font-mono text-xs text-[#64748B]">
                  <div>
                    <p className="font-bold text-[#0C312F] text-base tracking-wide">NUTRIMED MEDICAL CLINIC</p>
                    <p className="mt-1">Digital Diagnostic Order</p>
                    <div className="mt-3 space-y-0.5 text-slate-800">
                      <p>Patient: <span className="font-bold">{data.assessment?.prescriptionPatientName || data.profile?.fullName || "Patient"}</span></p>
                      <p>Age: <span className="font-bold">{data.assessment?.prescriptionPatientAge || "N/A"}</span></p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p>Date: <span className="text-[#0C312F] font-medium">{data.assessment?.prescriptionDate || formatFirebaseDate(data.assessment?.updatedAt || data.assessment?.createdAt)}</span></p>
                    <p>Physician: <span className="text-[#0C312F] font-medium">{data.assessment?.doctorName || "Assigned Medical Officer"}</span></p>
                    <p>Doc ID: <span className="text-[#0C312F] font-medium">#{assessmentId?.substring(0, 8).toUpperCase()}</span></p>
                  </div>
                </div>
                
                <div className="p-8 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
                  <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-[#218A83] border-b border-slate-200 pb-2">
                    Required Lab Investigations
                  </h4>
                  
                  <div className="space-y-4">
                    {groupedLabs.map((group, idx) => (
                      <div key={idx} className="bg-white/90 p-4 rounded-lg border border-slate-200 shadow-sm">
                        <h5 className="text-xs font-bold text-[#218A83] uppercase tracking-wide mb-2">
                          {group.categoryName}
                        </h5>
                        <ul className="grid grid-cols-2 gap-2">
                          {group.orderedLabs.map((labKey) => (
                            <li key={labKey} className="text-sm font-medium text-slate-800 flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-[#FA7A18]" />
                              {formatCamelCase(labKey)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {additionalLabsText && (
                      <div className="bg-white/90 p-4 rounded-lg border border-[#FA7A18]/30 shadow-sm mt-4">
                        <h5 className="text-xs font-bold text-[#FA7A18] uppercase tracking-wide mb-2">
                          Additional Investigations
                        </h5>
                        <p className="text-sm font-medium text-slate-800 whitespace-pre-wrap">
                          {additionalLabsText}
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="mt-8 text-[11px] text-[#64748B] italic border-t border-slate-200 pt-4">
                    * Please complete these physical diagnostics at any convenient local health facility or laboratory diagnostic center, then upload the documents securely using the module below.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* SECTION 3: SECURE INVESTIGATION FILE UPLOAD LAYER */}
        <div className="bg-[#FA7A18]/5 p-8 rounded-xl border border-[#FA7A18]/30">
          <h2 className="text-xl font-bold mb-2 text-[#FA7A18] flex items-center gap-2">
            📤 Secure Workup Report Upload
          </h2>
          <p className="text-xs text-[#64748B] mb-4">
            Upload PDF results, high-resolution scans, or clear images of your processed clinical test results here.
          </p>

          <input 
            type="file" 
            onChange={handleFileUpload} 
            className="block w-full text-sm text-[#64748B] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#FA7A18]/10 file:text-[#FA7A18] hover:file:bg-[#FA7A18]/20 cursor-pointer transition" 
          />

          {uploading && <p className="mt-3 text-sm font-bold text-[#218A83] animate-pulse">Encrypting & uploading safely...</p>}
          {message && (
            <p className={`mt-3 text-sm font-bold ${message.includes("failed") || message.includes("large") || message.includes("Error") ? "text-red-500" : "text-[#218A83]"}`}>
              {message}
            </p>
          )}

          {data.assessment?.files && data.assessment.files.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[#FA7A18]/20">
              <h4 className="text-xs font-bold uppercase text-[#64748B] mb-3">Uploaded Records Sync Cache:</h4>
              <div className="flex flex-wrap gap-2">
                {data.assessment.files.map((url: string, idx: number) => (
                  <a 
                    key={idx} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-medium px-4 py-2 bg-white border border-[#218A83]/30 rounded text-[#218A83] hover:bg-[#218A83] hover:text-white transition shadow-sm"
                  >
                    📄 Report Document {idx + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}