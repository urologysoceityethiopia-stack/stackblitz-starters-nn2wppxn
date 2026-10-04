"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle2, ChevronDown, Stethoscope, 
  UserCircle, Activity, ShieldCheck, ArrowRight, Star, PenLine, Loader2
} from 'lucide-react';
import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";

// --- ADDED FIREBASE IMPORTS ---
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase"; 

export default function NutriMedHomepage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  // --- ADDED STATE FOR FORM AND FIREBASE REVIEWS ---
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", condition: "", quote: "" });
  const [approvedReviews, setApprovedReviews] = useState<any[]>([]);

  // --- FETCH APPROVED REVIEWS ON LOAD ---
  useEffect(() => {
    async function fetchApprovedReviews() {
      try {
        // Only fetch reviews where the admin has set status to "approved"
        const q = query(collection(db, "reviews"), where("status", "==", "approved"));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setApprovedReviews(fetched);
      } catch (error) {
        console.error("Error fetching approved reviews:", error);
      }
    }
    fetchApprovedReviews();
  }, []);

  const programs = [
    { title: "Weight Loss", desc: "Sustainable, medically supervised weight management protocols.", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800" },
    { title: "Diabetes Management", desc: "Stabilize blood sugar with tailored Ethiopian dietary plans.", img: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800" },
    { title: "Hypertension Care", desc: "DASH-aligned nutrition to naturally manage blood pressure.", img: "https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&q=80&w=800" },
    { title: "Fatty Liver Disease", desc: "Hepatic recovery through targeted metabolic nutrition.", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" },
    { title: "Weight Gain", desc: "Healthy, calorie-dense planning for structured muscle and weight gain.", img: "https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=80&w=800" },
    { title: "General Nutrition & Wellness", desc: "Balanced everyday eating protocols optimized for sustained energy, vitality, and longevity.", img: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800" },
  ];

  const steps = [
    { num: "1", title: "Create Your Account", desc: "Register securely on our platform." },
    { num: "2", title: "Complete Assessment", desc: "Share your clinical and dietary history." },
    { num: "3", title: "Choose Package", desc: "Select a consultation tier." },
    { num: "4", title: "Doctor Review", desc: "Physicians analyze your biomarkers." },
    { num: "5", title: "Receive Meal Plan", desc: "Get your personalized nutrition protocol." },
    { num: "6", title: "Track Progress", desc: "Monitor outcomes and chat with care team." },
  ];

  const faqs = [
    { q: "How does NutriMed work?", a: "You complete a clinical assessment online, a licensed doctor reviews your data, and we deploy a personalized, medically-sound nutrition plan directly to your dashboard." },
    { q: "Do I need to visit the clinic?", a: "No. NutriMed Ethiopia is a 100% digital telemedicine platform. All consultations and monitoring are handled online." },
    { q: "Can I use the service outside Ethiopia?", a: "Yes. While our meal plans can integrate Ethiopian staple foods, our clinical protocols are adaptable for patients living in the diaspora." },
    { q: "How do I receive my meal plan?", a: "Your personalized plan will be available in your secure patient portal within 48 hours of your doctor's review." },
    { q: "Can I upload my laboratory results?", a: "Absolutely. We encourage uploading recent bloodwork (HbA1c, lipid panels, etc.) for more precise medical nutrition therapy." },
    { q: "How often do I meet my doctor?", a: "Your care doesn't end after receiving your meal plan. You can communicate with our physicians throughout your program for guidance, progress reviews, and adjustments to your nutrition plan.This depends on your selected program." },
  ];

  // Default hardcoded stories
  const defaultStories = [
    { 
      name: "Abebe T.", 
      condition: "Weight Loss & Hypertension", 
      result: "Lost 14 kg & Controlled Blood Pressure",
      quote: "Dropping 14 kg completely changed my life, and keeping my blood pressure steady without restrictive crash dieting has been amazing. The doctor designed meal plans featuring familiar local ingredients made all the difference."
    },
    { 
      name: "Sara M.", 
      condition: "Type 2 Diabetes", 
      result: "Improved HbA1c to Non-Diabetic Range",
      quote: "Managing my blood sugar levels felt overwhelming until I started NutriMed. Seeing my HbA1c drop back into a healthy non-diabetic range through tailored food choices was a true turning point."
    },
    { 
      name: "Helen K.", 
      condition: "Fatty Liver Disease & Metabolic Health", 
      result: "Liver Health & Sustainable Weight Management",
      quote: "My latest liver panel results amazed my physician. Following a targeted nutritional protocol designed specifically for my metabolic health turned things around completely."
    }
  ];

  // Merge approved Firebase reviews with the default ones (Firebase ones go first)
  const displayStories = [...approvedReviews, ...defaultStories];

  // --- UPDATED SUBMIT FUNCTION TO PUSH TO FIREBASE ---
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Send data to Firebase collection "reviews"
      await addDoc(collection(db, "reviews"), {
        name: formData.name,
        condition: formData.condition,
        quote: formData.quote,
        status: "pending", // Important: Set to pending so it goes to Admin Page
        createdAt: new Date(),
        rating: 5 // Defaulting to 5 stars for now
      });

      setReviewSubmitted(true);
      setFormData({ name: "", condition: "", quote: "" }); // Clear the form
      setTimeout(() => setReviewSubmitted(false), 5000); 
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900 flex flex-col">
      
      {/* GLOBAL HEADER */}
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative bg-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-50 via-white to-white opacity-70"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col lg:flex-row items-center relative z-10">
            <div className="lg:w-1/2 pr-0 lg:pr-12 text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-4 leading-[1.1]">
                Eat Better. <br/><span className="text-teal-700">Live Healthier.</span>
              </h1>
              <p className="text-xl font-medium text-slate-700 mb-4">Personalized Nutrition Designed by Doctors.</p>
              <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
                Receive evidence based nutrition care tailored to your health conditions, lifestyle, and goals. Whether you want to lose weight, manage diabetes, improve blood pressure, or reverse fatty liver disease, NutriMed Ethiopia is here to guide you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <Link href="/create-account" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all text-center">
                  Create Account
                </Link>
                <Link href="/#programs" className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-8 py-4 rounded-xl font-bold transition-all text-center">
                  Explore Programs
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start text-sm font-medium text-slate-600">
                <span className="flex items-center gap-2 justify-center"><CheckCircle2 className="w-5 h-5 text-teal-600" /> Doctor-Led Care</span>
                <span className="flex items-center gap-2 justify-center"><CheckCircle2 className="w-5 h-5 text-teal-600" /> Personalized Meal Plans</span>
                <span className="flex items-center gap-2 justify-center"><CheckCircle2 className="w-5 h-5 text-teal-600" /> Available Anywhere</span>
              </div>
            </div>
            <div className="lg:w-1/2 mt-16 lg:mt-0 relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-teal-900/10 relative bg-slate-200">
               <Image 
                  src="/6746c5f1369bd91b2f1942ac.avif" 
                  alt="Doctor consulting patient about nutrition" 
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* TRUST SECTION */}
        <section className="bg-slate-50 py-16 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Stethoscope, title: "Doctor-Led Care", desc: "Licensed physicians create every nutrition plan." },
                { icon: ShieldCheck, title: "Evidence-Based", desc: "Recommendations follow international clinical guidelines." },
                { icon: UserCircle, title: "Personalized", desc: "Every meal plan is entirely unique to the patient." },
                { icon: Activity, title: "Continuous Support", desc: "Track your progress with follow-up consultations." }
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <feature.icon className="w-10 h-10 text-teal-600 mb-4" />
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OUR PROGRAMS */}
        <section id="programs" className="py-24 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Our Programs</h2>
              <p className="mt-4 text-xl text-slate-600">Choose a program designed around your health goals.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs.map((prog, idx) => (
                <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                  <div className="h-48 relative overflow-hidden bg-slate-200">
                     <Image src={prog.img} alt={prog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{prog.title}</h3>
                    <p className="text-slate-600 mb-8 flex-grow">{prog.desc}</p>
                    <div className="flex gap-3">
                      <Link href={`/programs/${prog.title.toLowerCase().replace(/ /g, '-')}`} className="flex-1 bg-slate-50 text-teal-700 font-semibold py-3 px-4 rounded-xl border border-teal-100 text-center hover:bg-teal-50 transition-colors">
                        Learn More
                      </Link>
                      <Link href="/create-account" className="flex-1 bg-teal-700 text-white font-semibold py-3 px-4 rounded-xl text-center hover:bg-teal-800 transition-colors shadow-md shadow-teal-700/20">
                        Get Started
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 bg-slate-900 text-white overflow-hidden relative scroll-mt-20">
           <div className="absolute top-0 right-0 w-96 h-96 bg-teal-900/40 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold tracking-tight">Patient Journey</h2>
              <p className="mt-4 text-xl text-slate-400">How NutriMed works for you.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
              {steps.map((step, idx) => (
                <div key={idx} className="relative p-6 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm">
                  <div className="text-6xl font-black text-slate-700/50 absolute top-4 right-6 pointer-events-none">{step.num}</div>
                  <h3 className="text-xl font-bold text-white mb-2 relative z-10 mt-4">Step {step.num}: {step.title}</h3>
                  <p className="text-slate-400 relative z-10">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE NUTRIMED */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 relative">
                <div className="aspect-square rounded-3xl overflow-hidden bg-slate-200">
                  <Image 
                    src="/chatgpt-image.png" 
                    alt="Why choose NutriMed" 
                    fill 
                    className="object-cover" 
                  />
                 
                </div>
              </div>
              <div className="lg:w-1/2">
                <h2 className="text-4xl font-extrabold text-slate-900 mb-8 tracking-tight">Why Patients Choose NutriMed Ethiopia</h2>
                <ul className="space-y-6">
                  {[
                    "Personalized meal plans built in your kitchen",
                    "Ethiopian friendly local foods and ingredients",
                    "Continuous behavioral and lifestyle coaching",
                    "Medical nutrition therapy standard protocols",
                    "100% online asynchronous and synchronous consultations",
                    "Long term follow up and physiological support"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle2 className="w-5 h-5 text-teal-700" />
                      </div>
                      <span className="text-lg text-slate-700 font-medium leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* MEET YOUR DOCTOR */}
       <section className="py-24 bg-teal-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-teal-900/5 border border-teal-100 flex flex-col md:flex-row items-center gap-12">
            
            {/* Portrait Image Container */}
            <div className="w-full md:w-72 h-80 md:h-96 rounded-2xl overflow-hidden bg-slate-200 flex-shrink-0 relative border-4 border-white shadow-lg">
              <Image 
                src="/photo_2026-08-02_18-46-00.jpg" 
                alt="Dr. Jerry" 
                fill 
                className="object-cover object-top" 
              />
            </div>

            {/* Text Content */}
            <div className="text-center md:text-left">
              <span className="text-teal-700 font-bold uppercase tracking-wider text-sm mb-2 block">Clinical Director</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Dr. Jerry M.D & Nutritional Specialist</h2>
              <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                Leading a doctor led platform dedicated to nutrition and lifestyle medicine. With a compassionate, patient centered approach, we prioritize evidence based care over fad diets, helping you rebuild your physiological baseline safely and sustainably.
              </p>
              <Link href="/create-account" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                Book Consultation <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

        {/* SUCCESS STORIES */}
        <section className="py-24 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Success Stories</h2>
              <p className="mt-4 text-xl text-slate-600">Real outcomes from our clinical pathways.</p>
            </div>
            
            {/* Displaying stories dynamically */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayStories.slice(0, 6).map((story, i) => (
                <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-200 flex flex-col">
                  <div className="flex gap-1 mb-6">
                    {[...Array(story.rating || 5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-orange-500 text-orange-500" />)}
                  </div>
                  {/* Using result if it exists, otherwise just showing 'Success Story' */}
                  <h4 className="text-xl font-bold text-teal-800 mb-2">"{story.result || 'Success Story'}"</h4>
                  <p className="text-slate-600 mb-8 italic flex-grow">"{story.quote}"</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 bg-teal-200 rounded-full flex items-center justify-center text-teal-900 font-bold text-lg">
                      {story.name ? story.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{story.name}</p>
                      <p className="text-sm text-slate-500">{story.condition}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ADD A REVIEW SECTION */}
            <div className="mt-20 max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PenLine className="w-6 h-6 text-teal-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Share Your Experience</h3>
                <p className="mt-2 text-slate-600">Help inspire others by sharing how NutriMed changed your life.</p>
              </div>

              {reviewSubmitted ? (
                <div className="bg-teal-50 border border-teal-200 p-6 rounded-2xl text-center flex flex-col items-center justify-center gap-3">
                  <CheckCircle2 className="w-10 h-10 text-teal-600" />
                  <p className="text-teal-900 font-semibold">Thank you for your review!</p>
                  <p className="text-teal-700 text-sm">Your feedback has been successfully submitted and is currently pending admin approval before it appears on our homepage.</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">Your Name</label>
                      <input 
                        id="name" 
                        required 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Abebe T." 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow" 
                      />
                    </div>
                    <div>
                      <label htmlFor="condition" className="block text-sm font-semibold text-slate-700 mb-1">Condition / Goal</label>
                      <input 
                        id="condition" 
                        required 
                        type="text" 
                        value={formData.condition}
                        onChange={(e) => setFormData({...formData, condition: e.target.value})}
                        placeholder="e.g. Weight Loss" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow" 
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="review" className="block text-sm font-semibold text-slate-700 mb-1">Your Review</label>
                    <textarea 
                      id="review" 
                      required 
                      rows={4} 
                      value={formData.quote}
                      onChange={(e) => setFormData({...formData, quote: e.target.value})}
                      placeholder="Tell us about your journey with NutriMed..." 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow resize-none"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl transition-colors shadow-md"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                  <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1 mt-4">
                    <ShieldCheck className="w-4 h-4" /> All reviews are reviewed by our medical administrators prior to publishing.
                  </p>
                </form>
              )}
            </div>
            
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 bg-slate-50 scroll-mt-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200">
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                  >
                    <span className="font-bold text-slate-900 text-lg">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="bg-gradient-to-br from-teal-700 to-teal-900 py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Ready to Transform Your Health?</h2>
            <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
              Join NutriMed Ethiopia today and receive personalized nutrition care designed by healthcare professionals.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/create-account" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-orange-900/50 transition-all text-center">
                Create Account
              </Link>
              <Link href="/#programs" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold backdrop-blur-sm transition-all text-center">
                Explore Programs
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* GLOBAL FOOTER */}
      <Footer />
    </div>
  );
}