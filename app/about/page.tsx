"use client";

import Link from "next/link";
import Header from "@/components/marketing/Header";
import { Stethoscope, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      {/* Hero Section */}
      <div className="bg-[#E8F5F3] border-b border-[#147D7A]/10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#147D7A] bg-white px-3 py-1 rounded-full border border-[#147D7A]/20 inline-block mb-4 shadow-sm">
            About Our Platform
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#073B3A] tracking-tight mb-6">
            Transforming Health Through <span className="text-[#147D7A]">Lifestyle Medicine</span>
          </h1>
          <p className="text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            NutriMed Ethiopia is a premier doctor led digital platform dedicated to evidence based nutrition, metabolic health, and sustainable lifestyle changes.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Mission Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#147D7A]/10 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#147D7A] text-white">
              <Stethoscope className="h-5 w-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-[#073B3A]">Our Mission & Vision</h2>
          </div>
          <p className="text-[#64748B] leading-relaxed mb-6">
            We believe that true healing begins at the physiological baseline. Founded to bridge the gap between clinical medicine and everyday nutrition, NutriMed Ethiopia provides personalized, physician supervised care tailored to individuals in Ethiopia and abroad.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#147D7A] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-[#073B3A] text-sm mb-1">Evidence Based Care</h3>
                <p className="text-xs text-[#64748B]">Prioritizing science over fad diets and short-term fixes.</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#147D7A] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-[#073B3A] text-sm mb-1">Patient Centered Focus</h3>
                <p className="text-xs text-[#64748B]">Customized protocols designed around your unique biology.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leadership Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#147D7A]/10 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 border-4 border-[#E8F5F3] shadow-md relative">
            <img 
              src="/photo_2026-08-02_18-46-00.jpg" 
              alt="Dr. Jerry" 
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div>
            <span className="text-[#147D7A] font-bold uppercase tracking-wider text-xs mb-1 block">Clinical Director</span>
            <h3 className="text-2xl font-extrabold text-[#073B3A] mb-3">Dr. Jerry, M.D & Nutritional Specialist</h3>
            <p className="text-[#64748B] text-sm leading-relaxed mb-6">
              Leading a doctor led platform dedicated to nutrition and lifestyle medicine. With a compassionate, patient centered approach, Dr. Jerry ensures every client receives professional, evidence backed guidance to rebuild their physiological baseline safely and sustainably.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-[#073B3A] bg-[#E8F5F3] px-3 py-1.5 rounded-lg">Clinical Director</span>
              <span className="text-xs font-semibold text-[#073B3A] bg-[#E8F5F3] px-3 py-1.5 rounded-lg">Physician Led Care</span>
            </div>
          </div>
        </div>

        {/* Core Values / Approach */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#147D7A]/10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#147D7A] text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-[#073B3A]">The NutriMed Standard</h2>
          </div>
          <div className="space-y-4 text-[#64748B]">
            <p className="leading-relaxed">
              We combine modern telemedicine technology with rigorous clinical oversight. Whether you are managing metabolic health, weight goals, or nutritional wellness, our structured programs provide continuous support, expert check-ins, and measurable results.
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-[#073B3A] text-white rounded-3xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[#F58A24] font-bold uppercase tracking-wider text-xs mb-1 block">Ready to start?</span>
            <h3 className="text-2xl font-bold mb-2">Begin Your Health Journey Today</h3>
            <p className="text-slate-300 text-sm max-w-md">
              Book a consultation with Dr. Jerry and take the first step towards sustainable wellness.
            </p>
          </div>
          <Link 
            href="/create-account"
            className="inline-flex items-center gap-2 bg-[#F58A24] hover:bg-[#df7d1e] text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg flex-shrink-0"
          >
            Book Consultation <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>
    </div>
  );
}