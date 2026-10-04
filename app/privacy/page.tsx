import Link from "next/link";
import { ShieldCheck, ArrowLeft, Mail } from "lucide-react";

export default function PrivacyPage() {
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
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#147D7A]">Legal & Compliance</span>
          </div>
          <h1 className="text-4xl font-extrabold text-[#073B3A] tracking-tight mb-3">
            Privacy Policy
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
            <h2 className="text-xl font-bold text-[#073B3A]">Introduction</h2>
          </div>
          <p className="text-[#64748B] leading-relaxed">
            Welcome to NutriMed Ethiopia. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and use our digital nutrition and lifestyle medicine services.
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#147D7A]/10 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5F3] text-[#147D7A] flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h2 className="text-xl font-bold text-[#073B3A]">Data We Collect</h2>
          </div>
          <p className="text-[#64748B] leading-relaxed mb-4">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
              <h3 className="font-bold text-[#073B3A] text-sm mb-1">Identity Data</h3>
              <p className="text-xs text-[#64748B]">Includes first name, last name, or username.</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
              <h3 className="font-bold text-[#073B3A] text-sm mb-1">Contact Data</h3>
              <p className="text-xs text-[#64748B]">Includes email address, phone numbers, and location.</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
              <h3 className="font-bold text-[#073B3A] text-sm mb-1">Medical Data</h3>
              <p className="text-xs text-[#64748B]">Nutrition goals, health history, and lifestyle info.</p>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#147D7A]/10 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5F3] text-[#147D7A] flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h2 className="text-xl font-bold text-[#073B3A]">How We Use Your Data</h2>
          </div>
          <p className="text-[#64748B] leading-relaxed">
            We will only use your personal data when the law allows us to. Most commonly, we use your data to provide doctor-led nutrition plans, manage your client portal account, and communicate service updates securely.
          </p>
        </div>

        {/* Section 4 - Contact Card */}
        <div className="bg-[#073B3A] text-white rounded-3xl p-8 md:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[#F58A24] font-bold uppercase tracking-wider text-xs mb-1 block">Have questions?</span>
            <h3 className="text-2xl font-bold mb-2">Contact Our Compliance Team</h3>
            <p className="text-slate-300 text-sm max-w-md">
              If you have any questions about this privacy policy or how we handle your medical records, reach out to us directly.
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