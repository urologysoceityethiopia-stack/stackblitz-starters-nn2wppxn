"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase"; 
import { collection, query, where, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function PlanPage() {
  const router = useRouter();
  const [assessment, setAssessment] = useState<any>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // States for file upload
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [paymentChecked, setPaymentChecked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      auth.onAuthStateChanged(async (user) => {
        if (!user) {
          router.push("/signin");
          return;
        }

        try {
          // Fetch Assessment
          const assessmentQ = query(collection(db, "assessments"), where("userId", "==", user.uid));
          const assessmentSnap = await getDocs(assessmentQ);
          
          if (!assessmentSnap.empty) {
            const lastDoc = assessmentSnap.docs[assessmentSnap.docs.length - 1];
            setAssessment({ ...lastDoc.data(), id: lastDoc.id });
          } else {
            // Set dummy state so the upload UI still shows even if doctor hasn't reviewed yet
            setAssessment({ paymentStatus: "unpaid" });
          }

          // Fetch Meal Plan
          const planQ = query(collection(db, "meal_plans"), where("userId", "==", user.uid));
          const planSnap = await getDocs(planQ);
          if (!planSnap.empty) {
            setMealPlan(planSnap.docs[0].data());
          }
        } catch (err) {
          console.error("Error fetching plan data:", err);
        } finally {
          setLoading(false);
        }
      });
    };
    fetchData();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleSubmitPayment = async () => {
    if (!receiptFile || !paymentChecked) return;
    
    setIsUploading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // 1. Prepare FormData for Cloudinary
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "l7fcd6zd";
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "nutrimed_preset";

      const formData = new FormData();
      formData.append("file", receiptFile);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload to Cloudinary");
      }

      const data = await response.json();
      const receiptUrl = data.secure_url; 

      // 2. Save or update Firestore document
      if (assessment && assessment.id) {
        // Update existing assessment
        const assessmentRef = doc(db, "assessments", assessment.id);
        await updateDoc(assessmentRef, { 
          paymentStatus: "reviewing",
          receiptUrl: receiptUrl 
        });
        setAssessment((prev: any) => ({ ...prev, paymentStatus: "reviewing", receiptUrl }));
      } else {
        // Create new assessment document if one doesn't exist yet
        const newAssessmentRef = doc(collection(db, "assessments"));
        await setDoc(newAssessmentRef, {
          userId: user.uid,
          paymentStatus: "reviewing",
          receiptUrl: receiptUrl,
          createdAt: new Date().toISOString()
        });
        setAssessment({ id: newAssessmentRef.id, userId: user.uid, paymentStatus: "reviewing", receiptUrl });
      }
      
      setReceiptFile(null); 
      alert("Receipt uploaded successfully!");
      
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload receipt. Make sure your upload preset is configured in Cloudinary.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#218A83] font-bold bg-[#F7FCFB]">
        Loading Care Plan...
      </div>
    );
  }

  const isAssessmentReady = !!assessment?.finalAssessment;
  const isPaymentReviewing = assessment?.paymentStatus === "reviewing";
  const isPaymentApproved = assessment?.paymentStatus === "approved";

  return (
    <div className="min-h-screen bg-[#F7FCFB] p-8 font-sans text-[#0C312F]">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#0C312F]">Your Care Plan</h1>
          <button 
            onClick={() => router.push("/client-portal")}
            className="text-sm font-medium text-[#5C7977] hover:text-[#218A83] transition"
          >
            ← Back to Portal
          </button>
        </div>

        {/* 1. DOCTOR'S ASSESSMENT */}
        <div className="bg-white p-8 rounded-xl border border-[#218A83]/20 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-[#218A83]">Physician Assessment</h2>
          {isAssessmentReady ? (
            <div className="text-[#0C312F] bg-[#EAF6F5] p-5 rounded-lg border border-[#218A83]/20 leading-relaxed text-sm">
              {assessment.finalAssessment}
            </div>
          ) : (
            <div className="text-[#5C7977] bg-[#F7FCFB] p-6 rounded-lg text-center text-sm border border-dashed border-[#218A83]/30">
              Your physician is currently reviewing your uploaded investigations and intake history. Your final assessment will appear here once complete.
            </div>
          )}
        </div>

        {/* 2. PAYMENT & RECEIPT UPLOAD */}
        {!isPaymentApproved && (
          <div className="bg-white p-8 rounded-xl border-2 border-[#218A83]/20 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#FA7A18]"></div>
            <h2 className="text-xl font-bold mb-4 text-[#0C312F]">Complete Payment to Unlock Plan</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 text-sm">
              <div className="p-4 bg-[#EAF6F5] rounded-lg border border-[#218A83]/10 text-[#0C312F]">
                <strong className="text-[#218A83] block mb-1">CBE Bank</strong> 
                1000xxxxxxx<br/>
                <span className="text-xs text-[#5C7977]">NutriMed Clinic</span>
              </div>
              <div className="p-4 bg-[#EAF6F5] rounded-lg border border-[#218A83]/10 text-[#0C312F]">
                <strong className="text-[#218A83] block mb-1">Awash Bank</strong> 
                013xxxxxxx<br/>
                <span className="text-xs text-[#5C7977]">NutriMed Clinic</span>
              </div>
              <div className="p-4 bg-[#EAF6F5] rounded-lg border border-[#218A83]/10 text-[#0C312F]">
                <strong className="text-[#218A83] block mb-1">Telebirr</strong> 
                09xx-xx-xx-xx<br/>
                <span className="text-xs text-[#5C7977]">NutriMed Clinic</span>
              </div>
            </div>

            {isPaymentReviewing ? (
              <div className="p-4 bg-[#218A83]/10 text-[#218A83] rounded-lg text-center font-bold border border-[#218A83]/30">
                ✅ Receipt submitted successfully. Awaiting clinic approval.
              </div>
            ) : (
              <div className="space-y-5 border-t border-[#218A83]/10 pt-6">
                
                {/* File Input */}
                <div className="border-2 border-dashed border-[#218A83]/40 p-8 rounded-xl text-center bg-[#F7FCFB] hover:bg-[#EAF6F5] transition duration-200">
                  <input 
                    type="file" 
                    accept="*/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-[#5C7977] file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#218A83] file:text-white hover:file:bg-[#0C312F] cursor-pointer transition"
                  />
                  {receiptFile ? (
                    <p className="mt-3 text-sm text-[#218A83] font-bold">
                      📎 Selected: {receiptFile.name}
                    </p>
                  ) : (
                    <p className="mt-3 text-xs text-[#5C7977]">Upload screenshot or PDF of your transfer receipt</p>
                  )}
                </div>

                {/* Confirmation Checkbox */}
                <label className="flex items-center gap-3 cursor-pointer text-[#0C312F] p-2 hover:bg-[#F7FCFB] rounded transition">
                  <input 
                    type="checkbox" 
                    checked={paymentChecked}
                    onChange={(e) => setPaymentChecked(e.target.checked)}
                    className="w-5 h-5 rounded border-[#218A83] text-[#FA7A18] focus:ring-[#FA7A18] cursor-pointer"
                  />
                  <span className="text-sm font-semibold">I confirm that I have transferred the payment and uploaded the receipt.</span>
                </label>

                {/* Submit Button */}
                <button 
                  onClick={handleSubmitPayment}
                  disabled={!receiptFile || !paymentChecked || isUploading}
                  className="w-full py-3.5 bg-[#FA7A18] text-white font-bold rounded-lg hover:bg-[#e06a12] disabled:bg-[#5C7977] disabled:opacity-50 transition shadow-md"
                >
                  {isUploading ? "Uploading Receipt..." : "Submit Receipt & Notify Clinic"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. MEAL PLAN */}
        <div className="bg-white p-8 rounded-xl border border-[#218A83]/20 shadow-sm relative overflow-hidden">
          {!isPaymentApproved && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-center p-6">
              <span className="text-4xl mb-3">🔒</span>
              <h3 className="text-lg font-bold text-[#0C312F] mb-1">Plan Locked</h3>
              <p className="text-sm text-[#5C7977] max-w-sm">
                Complete your payment and submit your receipt above to unlock your customized meal plan.
              </p>
            </div>
          )}

          <div className={!isPaymentApproved ? "opacity-30 blur-sm pointer-events-none select-none" : ""}>
            <h2 className="text-xl font-bold mb-4 text-[#218A83]">🍎 Your Customized Nutrition Plan</h2>
            <div className="bg-[#EAF6F5] p-6 rounded-lg text-[#0C312F] min-h-[150px] border border-[#218A83]/20 text-sm leading-relaxed">
              {mealPlan?.details || "Your detailed meal plan breakdown goes here. It will become readable once payment is approved."}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}