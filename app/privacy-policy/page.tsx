export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto bg-white">
      <div className="bg-[#F8FAFC] p-8 md:p-12 rounded-3xl border border-[#147D7A]/10 shadow-sm">
        <span className="text-[#147D7A] font-bold uppercase tracking-wider text-xs mb-2 block">Legal & Compliance</span>
        <h1 className="text-3xl font-extrabold text-[#073B3A] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#64748B] mb-8">Last updated: August 2, 2026</p>
        
        <div className="space-y-6 text-[#073B3A]/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-[#073B3A] mb-2">1. Introduction</h2>
            <p>Welcome to NutriMed Ethiopia. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and use our digital nutrition and lifestyle medicine services.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-[#073B3A] mb-2">2. Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-[#64748B]">
              <li><strong className="text-[#073B3A]">Identity Data:</strong> includes first name, last name, or username.</li>
              <li><strong className="text-[#073B3A]">Contact Data:</strong> includes email address, telephone numbers, and location.</li>
              <li><strong className="text-[#073B3A]">Medical & Health Data:</strong> information regarding your nutrition goals, health history, and lifestyle provided during consultations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#073B3A] mb-2">3. How We Use Your Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we use your data to provide doctor-led nutrition plans, manage your client portal account, and communicate service updates.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#073B3A] mb-2">4. Contact Us</h2>
            <p>If you have any questions about this privacy policy, please contact us at: <strong className="text-[#147D7A]">jerusalemelias176@gmail.com</strong></p>
          </section>
        </div>
      </div>
    </main>
  );
}