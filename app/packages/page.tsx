"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/marketing/Header';
import { db, auth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { 
  Stethoscope, 
  Activity, 
  Utensils, 
  ShieldCheck, 
  Smartphone, 
  TrendingUp, 
  CheckCircle2 
} from 'lucide-react';

export default function PackagesSelectionPage() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const coreServices = [
    {
      icon: Stethoscope,
      title: "Comprehensive Physician Assessment",
      desc: "Complete physician review of medical history, nutrition status, lifestyle habits, medications, anthropometric measurements, and laboratory investigations."
    },
    {
      icon: Activity,
      title: "Personalized Nutrition Care",
      desc: "Individualized physician-developed nutrition strategy tailored to the patient's health condition and goals."
    },
    {
      icon: Utensils,
      title: "Monthly Personalized Meal Plans",
      desc: "Customized Ethiopian meal plans based on medical condition, food preferences, culture, and budget."
    },
    {
      icon: ShieldCheck,
      title: "Secure Patient Portal",
      desc: "Patients can securely access Meal Plans, Laboratory Results, Progress Tracking, Physician Recommendations, Appointments, and Downloadable Documents."
    },
    {
      icon: Smartphone,
      title: "Telemedicine Support",
      desc: "Direct communication with NutriMed physicians through Phone, Email, and Telegram during the active subscription."
    },
    {
      icon: TrendingUp,
      title: "Progress Monitoring",
      desc: "Continuous physician monitoring of Weight, BMI, Waist Circumference, Blood Pressure, Blood Glucose, Clinical Progress, and Nutrition Goals."
    }
  ];

  const packages = [
    {
      id: "essential",
      name: "Essential Care",
      duration: "1 Month",
      price: "10,000",
      desc: "Ideal for individuals seeking an initial physician assessment and a structured one-month personalized nutrition program.",
      features: [
        "Comprehensive physician assessment",
        "Detailed review of medical history",
        "Lifestyle and nutrition evaluation",
        "Laboratory investigation interpretation",
        "Individualized nutrition diagnosis",
        "Personalized nutrition care strategy",
        "One physician-designed monthly meal plan",
        "Secure patient portal access",
        "Telemedicine support via Phone, Email, and Telegram",
        "End-of-month physician progress review"
      ]
    },
    {
      id: "comprehensive",
      name: "Comprehensive Care",
      duration: "3 Months",
      price: "15,000",
      desc: "Designed for patients requiring continuous physician-guided nutritional care and lifestyle modification.",
      features: [
        { text: "Everything in the Essential Care package PLUS:", highlight: true },
        "Three personalized monthly meal plans",
        "Three physician follow-up assessments",
        "Continuous meal plan adjustments",
        "Ongoing progress monitoring",
        "Weight and body measurement tracking",
        "Continuous telemedicine support",
        "Lifestyle coaching"
      ]
    },
    {
      id: "intensive",
      name: "Intensive Lifestyle Transformation",
      duration: "6 Months",
      price: "30,000",
      desc: "Recommended for long-term weight management and chronic disease care requiring sustained physician supervision.",
      features: [
        { text: "Everything in the Comprehensive Care package PLUS:", highlight: true },
        "Six personalized monthly meal plans",
        "Six physician follow-up reviews",
        "Long-term nutrition management",
        "Continuous laboratory result review (when applicable)",
        "Advanced progress tracking",
        "Long-term lifestyle coaching",
        "Final comprehensive physician review"
      ]
    },
    {
      id: "extended",
      name: "Extended Follow-up",
      duration: "4 Months",
      price: "20,000",
      desc: "Available only after completion of an active NutriMed Ethiopia package for patients who wish to continue physician supervision.",
      features: [
        "Four updated monthly meal plans",
        "Four physician follow-up consultations",
        "Continued laboratory review",
        "Long-term maintenance planning",
        "Telemedicine support",
        "Progress monitoring",
        "Continued secure portal access"
      ]
    }
  ];

  const handleSelectPackage = async (pkg: any) => {
    try {
      setLoadingId(pkg.id);
      const user = auth.currentUser;
      
      if (!user) {
        router.push("/signin");
        return;
      }

      // Save selected package to Firebase
      await setDoc(
        doc(db, "users", user.uid),
        {
          selectedPackage: {
            id: pkg.id,
            name: pkg.name,
            duration: pkg.duration,
            price: pkg.price
          }
        },
        { merge: true }
      );

      // Redirect to the next step after successful save
      router.push("/assessment");
      
    } catch (err: any) {
      alert("Error saving package: " + err.message);
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-[#1F7A6B]/20">
      <Header />

      <main className="flex-grow pb-24 overflow-hidden">
        
        {/* HERO SECTION */}
        <div className="bg-white border-b border-slate-200 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
              Choose Your Program
            </h1>
            <p className="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed">
              Select the care plan that best fits your goals. Your selection will be added to your patient profile.
            </p>
          </div>
        </div>

        {/* EVERY PACKAGE INCLUDES (CORE SERVICES) */}
        <section className="py-12 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-extrabold text-[#1F7A6B]">Every Package Includes</h2>
              <div className="w-16 h-1 bg-[#F97316] mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreServices.map((service, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-[#1F7A6B]/10 flex items-center justify-center">
                      <service.icon className="w-5 h-5 text-[#1F7A6B]" strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-slate-900 mb-1 leading-snug">{service.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{service.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING CARDS */}
        <section className="py-8">
          <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
              {packages.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative group overflow-hidden"
                >
                  {/* Package Header */}
                  <div className="mb-6 border-b border-slate-100 pb-6">
                    <span className="inline-flex items-center justify-center border border-[#F97316]/30 bg-[#F97316]/10 text-[#F97316] font-bold text-xs tracking-wider uppercase px-3 py-1.5 rounded-full mb-4">
                      {pkg.duration}
                    </span>
                    <h3 className="text-2xl font-extrabold text-slate-900 leading-tight mb-4 break-words">
                      {pkg.name}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed min-h-[80px]">
                      {pkg.desc}
                    </p>
                    <div className="mt-6 flex items-baseline gap-2 flex-wrap">
                      <span className="text-4xl font-black tracking-tight text-[#1F7A6B]">
                        {pkg.price}
                      </span>
                      <span className="text-sm font-bold text-slate-500">Birr</span>
                    </div>
                  </div>

                  {/* Feature List */}
                  <div className="flex-grow mb-8">
                    <h4 className="text-sm font-bold text-slate-900 mb-4">Includes:</h4>
                    <ul className="space-y-4">
                      {pkg.features.map((feature, i) => {
                        const isHighlight = typeof feature === 'object' && feature.highlight;
                        const text = typeof feature === 'object' ? feature.text : feature;

                        return (
                          <li key={i} className={`flex items-start text-sm ${isHighlight ? 'font-bold text-[#1F7A6B] mt-6' : 'text-slate-600'}`}>
                            {!isHighlight && (
                              <CheckCircle2 className="w-5 h-5 text-[#1F7A6B] mr-3 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            )}
                            <span className={isHighlight ? "uppercase tracking-wide text-xs" : "leading-relaxed"}>
                              {text}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <button 
                    onClick={() => handleSelectPackage(pkg)}
                    disabled={loadingId !== null}
                    className="w-full block text-center py-4 rounded-xl text-sm font-bold transition-all bg-[#1F7A6B] text-white shadow-md shadow-[#1F7A6B]/20 hover:bg-[#155b50] hover:shadow-lg mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingId === pkg.id ? "Saving to profile..." : "Select This Plan"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}