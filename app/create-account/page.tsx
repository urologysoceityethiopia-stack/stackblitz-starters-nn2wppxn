"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { 
  User, Activity, Heart, Apple, Scale, ChevronRight, ChevronLeft, 
  Stethoscope, CheckCircle2 
} from "lucide-react";

export default function CreateAccountIntake() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "", 
    email: "", 
    phone: "", 
    password: "", 
    confirmPassword: "",
    gender: "", 
    age: "", 
    location: "",
    primaryProgram: "",
    additionalPrograms: [] as string[],
    height: "", 
    weight: "",
    conditions: [] as string[],
    dietaryPreference: "",
    allergies: [] as string[]
  });

  const calculateBMI = () => {
    if (!formData.height || !formData.weight) return "0.0";
    const heightInMeters = Number(formData.height) / 100;
    if (heightInMeters <= 0) return "0.0"; // Prevents division by zero
    const bmi = Number(formData.weight) / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMIStatus = (bmiStr: string) => {
    const bmi = parseFloat(bmiStr);
    if (bmi === 0) return "";
    if (bmi < 18.5) return "Underweight";
    if (bmi >= 18.5 && bmi < 24.9) return "Healthy Weight";
    if (bmi >= 25 && bmi < 29.9) return "Overweight";
    return "Obesity";
  };

  const handleArrayToggle = (field: "additionalPrograms" | "conditions" | "allergies", value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter((item: string) => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      const user = userCredential.user;

      // SMART ROLE DETECTION
      const userEmail = formData.email.trim().toLowerCase();
      let assignedRole = "patient";
      
      if (userEmail === "admin@nutrimed.com") {
        assignedRole = "admin";
      } else if (userEmail.endsWith("@nutrimed.com") || userEmail.includes("dr.")) {
        assignedRole = "doctor";
      }

      // SAVING TO "users" COLLECTION (Matches Firestore database and SignInPage)
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: userEmail,
        phone: formData.phone,
        role: assignedRole,
        gender: formData.gender,
        age: Number(formData.age),
        location: formData.location,
        primaryProgram: formData.primaryProgram,
        additionalPrograms: formData.additionalPrograms,
        height: Number(formData.height),
        weight: Number(formData.weight),
        bmi: Number(calculateBMI()),
        conditions: formData.conditions,
        dietaryPreference: formData.dietaryPreference,
        allergies: formData.allergies,
        createdAt: serverTimestamp(),
      });

      // ROLE-BASED AUTOMATIC REDIRECTION
      if (assignedRole === "admin") {
        router.push("/admin");
      } else if (assignedRole === "doctor") {
        router.push("/doctor-portal");
      } else {
        router.push("/packages");
      }

    } catch (err: any) {
      setError(err.message || "An error occurred during account creation.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Progress Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">Patient Onboarding</h2>
          <p className="mt-2 text-slate-600">
            Step {step} of 3 • {
              step === 1 ? "Basic Information" : step === 2 ? "Health Goals" : "Clinical Baseline"
            }
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-2 w-16 rounded-full ${step >= i ? 'bg-teal-600' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">{error}</div>}

          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Location / City</label>
                  <input type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Age</label>
                  <input type="number" required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                    <option value="">Select gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                  <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                  <input type="password" required value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Health Goals */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Which area is your primary focus? (Select one)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "Weight Loss", icon: Scale },
                    { title: "Diabetes Management", icon: Activity },
                    { title: "Hypertension Care", icon: Heart },
                    { title: "PCOS / Fertility", icon: User },
                    { title: "Fatty Liver Disease", icon: Stethoscope },
                    { title: "General Wellness", icon: Apple }
                  ].map(prog => (
                    <div 
                      key={prog.title}
                      onClick={() => setFormData({...formData, primaryProgram: prog.title})}
                      className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-4 transition-all ${
                        formData.primaryProgram === prog.title 
                        ? 'border-teal-600 bg-teal-50' 
                        : 'border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${formData.primaryProgram === prog.title ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <prog.icon className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-slate-700">{prog.title}</span>
                      {formData.primaryProgram === prog.title && <CheckCircle2 className="w-5 h-5 ml-auto text-teal-600" />}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Would you like support with additional areas? (Select multiple)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {["Weight Gain", "Cholesterol Management", "Pregnancy Nutrition", "Healthy Eating", "Muscle Gain", "Preventive Health"].map(prog => (
                    <label key={prog} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                        checked={formData.additionalPrograms.includes(prog)}
                        onChange={() => handleArrayToggle("additionalPrograms", prog)}
                      />
                      <span className="text-sm font-medium text-slate-700">{prog}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Baseline Vitals */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Current Measurements</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 items-end">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Height (cm)</label>
                    <input type="number" required value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Weight (kg)</label>
                    <input type="number" required value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div className="bg-white p-3 border border-slate-200 rounded-xl text-center">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Calculated BMI</div>
                    <div className="text-2xl font-black text-teal-700">{calculateBMI()}</div>
                    <div className="text-xs text-slate-600 font-medium">{getBMIStatus(calculateBMI())}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Do you currently have any diagnosed conditions?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {["Diabetes", "Hypertension", "PCOS", "Thyroid disease", "Fatty liver disease", "High cholesterol", "Kidney disease", "None"].map(cond => (
                    <label key={cond} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input type="checkbox" className="w-5 h-5 text-teal-600 rounded" checked={formData.conditions.includes(cond)} onChange={() => handleArrayToggle("conditions", cond)} />
                      <span className="text-sm font-medium text-slate-700">{cond}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Dietary Preference</h3>
                  <select value={formData.dietaryPreference} onChange={e => setFormData({...formData, dietaryPreference: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl bg-white">
                    <option value="">Select diet...</option>
                    <option value="Ethiopian traditional diet">Ethiopian traditional diet</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Mixed diet">Mixed diet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Food Allergies</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {["None", "Milk/dairy", "Eggs", "Gluten", "Nuts"].map(allergy => (
                      <label key={allergy} className="flex items-center gap-2 p-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-teal-600 rounded" checked={formData.allergies.includes(allergy)} onChange={() => handleArrayToggle("allergies", allergy)} />
                        <span className="text-sm text-slate-700">{allergy}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-10 flex justify-between pt-6 border-t border-slate-100">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
            ) : <div></div>}
            
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-8 py-3 bg-teal-700 text-white font-bold rounded-xl hover:bg-teal-800 transition-colors shadow-md shadow-teal-900/20">
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-md shadow-orange-900/20 disabled:opacity-50">
                {isLoading ? "Creating Profile..." : "Complete Registration"} <CheckCircle2 className="w-5 h-5" />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}