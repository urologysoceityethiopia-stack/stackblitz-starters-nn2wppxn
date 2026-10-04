import Link from "next/link";
import { Cookie, ArrowLeft, Mail } from "lucide-react";

export default function CookiesPage() {
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
              <Cookie className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#147D7A]">Legal & Compliance</span>
          </div>
          <h1 className="text-4xl font-extrabold text-[#073B3A] tracking-tight mb-3">
            Cookie Policy
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
            <h2 className="text-xl font-bold text-[#073B3A]">What Are Cookies</h2>
          </div>
          <p className="text-[#64748B] leading-relaxed">
            Cookies are small pieces of text stored on your web browser by a website you visit. A cookie file allows the service or a third-party to recognize you and make your next visit easier and more secure.
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#147D7A]/10 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5F3] text-[#147D7A] flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h2 className="text-xl font-bold text-[#073B3A]">How NutriMed Ethiopia Uses Cookies</h2>
          </div>
          <p className="text-[#64748B] leading-relaxed mb-4">
            When you use and access our service, we may place cookie files in your browser for the following purposes:
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
              <h3 className="font-bold text-[#073B3A] text-sm mb-1">Essential Cookies</h3>
              <p className="text-xs text-[#64748B]">To enable essential platform functions such as user authentication for client and doctor portals.</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
              <h3 className="font-bold text-[#073B3A] text-sm mb-1">Preference Cookies</h3>
              <p className="text-xs text-[#64748B]">To remember your personal preferences, settings, and browsing layout choices.</p>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#147D7A]/10 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5F3] text-[#147D7A] flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h2 className="text-xl font-bold text-[#073B3A]">Managing Cookies</h2>
          </div>
          <p className="text-[#64748B] leading-relaxed">
            If you would like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Note that disabling essential cookies may affect portal functionality.
          </p>
        </div>

        {/* Section 4 - Contact Card */}
        <div className="bg-[#073B3A] text-white rounded-3xl p-8 md:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[#F58A24] font-bold uppercase tracking-wider text-xs mb-1 block">Have questions?</span>
            <h3 className="text-2xl font-bold mb-2">Reach Out to Us</h3>
            <p className="text-slate-300 text-sm max-w-md">
              If you have any questions regarding our cookie practices, please email us.
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