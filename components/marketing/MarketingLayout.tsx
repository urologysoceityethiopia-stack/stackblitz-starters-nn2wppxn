import Link from "next/link";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Simple Header Navigation */}
      <header className="bg-white border-b border-slate-100 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-[#0C312F]">
            NutriMed <span className="text-teal-600">Ethiopia</span>
          </Link>
          <Link href="/login" className="text-sm font-medium text-teal-600 hover:text-teal-700 transition">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Page Content goes here */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Your Beautiful Footer Component */}
      <footer className="bg-[#0C312F] text-white py-12 border-t border-teal-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold text-teal-300 mb-3">NutriMed Ethiopia</h3>
              <p className="text-slate-300 text-sm">
                Physician-led digital health & medical nutrition clinic.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-3">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link href="/" className="hover:text-teal-300 transition">Home</Link></li>
                <li><Link href="/about" className="hover:text-teal-300 transition">About Us</Link></li>
                <li><Link href="/pricing" className="hover:text-teal-300 transition">Pricing</Link></li>
                <li><Link href="/contact" className="hover:text-teal-300 transition">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-3">
                Legal & Consent
              </h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link href="/contact" className="hover:text-teal-300 transition">Telehealth Consent</Link></li>
                <li><Link href="/contact" className="hover:text-teal-300 transition">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-3">
                Emergency
              </h4>
              <p className="text-xs text-red-300 bg-red-950/40 border border-red-800/40 p-3 rounded-lg leading-relaxed">
                For immediate medical emergencies, please dial 805 or visit the nearest hospital.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-teal-900/40 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} NutriMed Ethiopia. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
