"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/marketing/Header";
import { Mail, Phone, ShieldCheck, ArrowRight } from "lucide-react";

export default function ContactPage() {
  const router = useRouter();
  const [consentAccepted, setConsentAccepted] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      
      {/* Contact Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-[#147D7A]/10 shadow-sm">
          <span className="text-[#147D7A] font-bold uppercase tracking-wider text-xs mb-2 block">Get in Touch</span>
          <h1 className="text-4xl font-extrabold text-[#073B3A] mb-4">Contact Us</h1>
          <p className="text-[#64748B] mb-8 leading-relaxed">
            Reach out to NutriMed Ethiopia for support, inquiries, or assistance with your digital nutrition program.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F5F3] text-[#147D7A]">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-[#64748B] font-medium">Phone & WhatsApp</p>
                <a href="tel:+251901047276" className="text-[#073B3A] font-bold hover:text-[#147D7A] transition-colors">
                  +251 901047276
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8F5F3] text-[#147D7A]">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-[#64748B] font-medium">Email Address</p>
                <a href="mailto:jerusalemelias176@gmail.com" className="text-[#073B3A] font-bold hover:text-[#147D7A] transition-colors">
                  jerusalemelias176@gmail.com
                </a>
              </div>
            </div>
            
            <div className="p-5 bg-red-50 border border-red-200 rounded-2xl mt-6">
              <p className="text-red-700 text-sm leading-relaxed">
                <strong className="font-bold">Emergency Notice:</strong> For immediate medical emergencies, please visit the nearest hospital. Telehealth services are not designed for acute emergencies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Telehealth Protocol Section */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-[#147D7A]/10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#147D7A] text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-[#073B3A]">Telehealth Protocol</h2>
          </div>

          <div className="text-sm text-[#64748B] space-y-6 leading-relaxed">
            <div>
              <h3 className="font-bold text-base text-[#073B3A] mb-1">Nature of Telehealth Services</h3>
              <p>NutriMed Ethiopia provides secure, physician-led virtual consultations, dietetics, and medical nutrition therapy remote monitoring.</p>
            </div>
            
            <div>
              <h3 className="font-bold text-base text-[#073B3A] mb-1">Benefits</h3>
              <p>Access to specialist healthcare from home, continuous remote monitoring, and secure follow-ups without the need for physical travel.</p>
            </div>
            
            <div>
              <h3 className="font-bold text-base text-[#073B3A] mb-1">Risks & Limitations</h3>
              <p>Telehealth limitations include the inability to conduct physical examinations. In some cases, your physician may require you to visit a local clinic for physical evaluation or laboratory tests.</p>
            </div>
            
            <div>
              <h3 className="font-bold text-base text-[#073B3A] mb-1">Privacy & Confidentiality</h3>
              <p>All data is encrypted. Your health records are stored securely in compliance with standard medical data protection regulations and are only accessible by your assigned clinical team.</p>
            </div>
            
            <hr className="my-6 border-slate-100" />
            
            <div className="p-6 bg-[#E8F5F3] rounded-2xl border border-[#147D7A]/10">
              <p className="font-bold text-[#073B3A] mb-1">Patient Declaration:</p>
              <p className="text-xs text-[#073B3A]/80 mb-4">I confirm that I have read and understood this Telehealth Protocol and voluntarily agree to receive telehealth nutrition services.</p>

              {!consentAccepted ? (
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => setConsentAccepted(true)} 
                    className="px-6 py-3 bg-[#147D7A] text-white rounded-xl hover:bg-[#0f625f] font-bold text-sm transition-all shadow-md"
                  >
                    Accept and Continue
                  </button>
                  <button 
                    onClick={() => router.push('/')} 
                    className="px-6 py-3 bg-white text-[#64748B] border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-sm transition-all"
                  >
                    Decline & Exit
                  </button>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-white rounded-xl border border-[#147D7A]/20">
                  <h4 className="font-bold text-[#073B3A] mb-1">Protocol Accepted Successfully</h4>
                  <p className="text-xs text-[#64748B] mb-4">
                    If you have any further questions, you can contact us at <strong className="text-[#073B3A]">+251 901047276</strong>. Otherwise, proceed to register your account.
                  </p>
                  <button 
                    onClick={() => router.push('/create-account')} 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#F58A24] hover:bg-[#df7d1e] text-white rounded-xl font-bold text-sm transition-all shadow-md"
                  >
                    Continue to Registration <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}