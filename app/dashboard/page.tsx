"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ClientPortal() {
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  
  // File Upload State (Using free Base64)
  const [fileName, setFileName] = useState("");
  const [base64File, setBase64File] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      const user = auth.currentUser;

      if (!user) {
        router.push("/signin");
        return;
      }

      // 1. Fetch User Role
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) {
        router.push("/signin");
        return;
      }
      
      const data = userSnap.data();
      if (data.role !== "patient") {
        router.push("/doctor-portal");
        return;
      }
      setUserData(data);

      // 2. Fetch their latest Assessment
      const q = query(collection(db, "assessments"), where("userId", "==", user.uid));
      const assessmentSnap = await getDocs(q);
      
      if (!assessmentSnap.empty) {
        setAssessmentData(assessmentSnap.docs[0].data());
      }
    };

    fetchDashboardData();
  }, [router]);

  // Handle local file conversion to Base64 (Free, bypasses Firebase Storage completely)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // Firestore limit check
        setUploadMessage("File is too large. Please upload an image under 1MB.");
        return;
      }
      
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64File(reader.result as string);
        setUploadMessage("");
      };
      reader.readAsDataURL(file);
    }
  };

  // Save the Base64 data directly into Firestore
  const handleFileUpload = async () => {
    if (!base64File || !auth.currentUser) return;

    setUploading(true);
    setUploadMessage("");

    try {
      await addDoc(collection(db, "lab_results"), {
        userId: auth.currentUser.uid,
        fileName: fileName,
        fileData: base64File, // Stored securely as text in Firestore
        uploadedAt: serverTimestamp(),
        status: "Pending Review"
      });

      setUploadMessage("File uploaded successfully!");
      setFileName("");
      setBase64File(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadMessage("Failed to save file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {userData.name || userData.fullName || "Patient"}
          </h1>
          <p className="mt-2 text-gray-600">
            Your Personal Nutrition & Health Portal
          </p>
        </header>

        {/* Information Banner */}
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-8 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-indigo-700 font-medium">
                Next Steps: A physician will evaluate your submitted history and send you a list of required laboratory investigations. Once you complete them, please upload the results below.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Free Laboratory Results Uploads */}
          <div className="border rounded-xl shadow-sm bg-white p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Laboratory Results</h2>
              <p className="text-sm text-gray-600 mb-6">
                Upload your requested investigation reports (pictures or PDFs under 1MB) here for your care team.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
              <input 
                type="file" 
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-4"
              />
              
              <button 
                onClick={handleFileUpload}
                disabled={!base64File || uploading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {uploading ? "Uploading..." : "Upload Investigation"}
              </button>
              
              {uploadMessage && (
                <p className={`mt-3 text-sm font-medium ${uploadMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {uploadMessage}
                </p>
              )}
            </div>
          </div>

          {/* Assessment Data Display */}
          <div className="border rounded-xl shadow-sm bg-white p-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Your Assessment</h2>
            
            {assessmentData ? (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Primary Reason</h3>
                  <p className="text-sm text-gray-800 mt-1">{assessmentData.reasonForConsultation}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Medical History</h3>
                  <p className="text-sm text-gray-800 mt-1">{assessmentData.medicalHistory}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dietary Restrictions / Allergies</h3>
                  <p className="text-sm text-gray-800 mt-1">{assessmentData.dietaryRestrictions}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No assessment found. Please complete your intake form.</p>
            )}
          </div>

          {/* Meal Plan Placeholder */}
          <div className="border rounded-xl shadow-sm bg-white p-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Diet & Meal Plan</h2>
            <p className="text-sm text-gray-600">
              Your physician-assigned nutrition plan will appear here once your investigations are reviewed.
            </p>
          </div>

          {/* Payments Placeholder */}
          <div className="border rounded-xl shadow-sm bg-white p-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Payments & Packages</h2>
            <p className="text-sm text-gray-600">
              View your package status and payment history here.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}