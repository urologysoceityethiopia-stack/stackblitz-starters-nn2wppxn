import Link from "next/link";
import { Scale, ArrowLeft, Mail } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Hero Banner */}
      <div className="bg-[#E8F5F3] border-b border-[#147D7A]/10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#147D7A] hover:text-[#073B3A] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#147D7A] text-white shadow-md">
              <Scale className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#147D7A]">Legal & Compliance</span>
          </div>
          <h1 className="text-4xl font-extrabold text-[#073B3A] tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-[#64748B]">
            NutriMed Ethiopia · Last updated: <span className="font-medium text-[#073B3A]">August 2, 2026</span>
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section 1 */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#147D7A]/10 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5F3] text-[#147D7A] flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h2 className="text-xl font-bold text-[#073B3A]">Agreement to Terms</h2>
          </div>
          <p className="text-[#64748B] leading-relaxed">
            By accessing or using NutriMed Ethiopia, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our services.
          </p>
        </div>

        {/* Section 2 - Medical Disclaimer Highlight Card */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border-2 border-[#F58A24]/30 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#F58A24]/10 text-[#F58A24] flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h2 className="text-xl font-bold text-[#073B3A]">Medical Disclaimer</h2>
          </div>
          <p className="text-[#64748B] leading-relaxed">
            The information provided on NutriMed Ethiopia is for educational and informational purposes only and does not substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition.
          </p>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#147D7A]/10 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5F3] text-[#147D7A] flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h2 className="text-xl font-bold text-[#073B3A]">Telehealth Services</h2>
          </div>
          <p className="text-[#64748B] leading-relaxed">
            Our platform facilitates doctor-led digital nutrition and lifestyle medicine. Remote consultations carry inherent limitations compared to in-person physical assessments.
          </p>
        </div>

        {/* Section 4 - Contact Card */}
        <div className="bg-[#073B3A] text-white rounded-3xl p-8 md:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[#F58A24] font-bold uppercase tracking-wider text-xs mb-1 block">Have questions?</span>
            <h3 className="text-2xl font-bold mb-2">Contact Our Support Team</h3>
            <p className="text-slate-300 text-sm max-w-md">
              Questions about our Terms of Service should be sent to our support desk.
            </p>
          </div>
          <a 
            href="mailto:jerusalemelias176@gmail.com"
            className="inline-flex items-center gap-2 bg-[#F58A24] hover:bg-[#df7d1e] text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg flex-shrink-0"
          >
            <Mail className="w-4 h-4" /> jerusalemelias176@gmail.com
          </a>
        </div>

      </main>
    </div>
  );
}