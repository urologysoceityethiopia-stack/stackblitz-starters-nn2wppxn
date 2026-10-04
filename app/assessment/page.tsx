'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AssessmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    reasonForConsultation: '',
    medicalHistory: '',
    currentSymptoms: '',
    medications: '',
    dietaryHistory: '',
    dietaryRestrictions: '',
    physicalActivity: '',
    lifestyleFactors: '',
    additionalInfo: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("You must be logged in.");

      await addDoc(collection(db, 'assessments'), {
        userId: currentUser.uid,
        ...formData,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => router.push('/client-portal'), 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FCFB] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white border border-[#EAF6F5] rounded-2xl p-8 sm:p-10 shadow-sm">
        
        <div className="text-center mb-10 border-b border-[#EAF6F5] pb-8">
          <h1 className="text-3xl font-bold text-[#0C312F] tracking-tight">Nutrition Counseling History</h1>
          <p className="mt-3 text-sm text-[#64748B]">
            Please provide accurate details to help our medical team tailor your clinical nutrition plan. All information is secured and strictly confidential.
          </p>
        </div>

        {success ? (
          <div className="bg-[#EAF6F5] border border-[#218A83] rounded-xl p-8 text-center shadow-sm">
            <h3 className="font-bold text-xl text-[#0C312F] mb-3">Assessment Submitted Successfully</h3>
            <p className="text-sm text-[#64748B]">Your care team has received your file. Redirecting to your medical dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && <div className="bg-[#fff5ef] border border-[#fdecdb] text-[#FA7A18] p-4 rounded-lg text-sm font-medium">{error}</div>}

            <div className="space-y-6">
              
              <div className="bg-[#F7FCFB] p-5 rounded-xl border border-[#EAF6F5]">
                <label className="block text-sm font-bold text-[#0C312F] mb-2">Primary Reason for Consultation</label>
                <textarea name="reasonForConsultation" rows={2} onChange={handleInputChange} required 
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm text-[#0C312F] focus:border-[#218A83] focus:ring-1 focus:ring-[#218A83] outline-none shadow-sm transition-shadow" 
                  placeholder="What are you hoping to achieve?"/>
              </div>

              <div className="bg-[#F7FCFB] p-5 rounded-xl border border-[#EAF6F5]">
                <label className="block text-sm font-bold text-[#0C312F] mb-2">Medical History & Diagnoses</label>
                <textarea name="medicalHistory" rows={2} onChange={handleInputChange} required 
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm text-[#0C312F] focus:border-[#218A83] focus:ring-1 focus:ring-[#218A83] outline-none shadow-sm transition-shadow" 
                  placeholder="e.g., Hypertension, Type 2 Diabetes, None"/>
              </div>

              <div className="bg-[#F7FCFB] p-5 rounded-xl border border-[#EAF6F5]">
                <label className="block text-sm font-bold text-[#0C312F] mb-2">Current Medications & Supplements</label>
                <textarea name="medications" rows={2} onChange={handleInputChange} 
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm text-[#0C312F] focus:border-[#218A83] focus:ring-1 focus:ring-[#218A83] outline-none shadow-sm transition-shadow" />
              </div>

              <div className="bg-[#F7FCFB] p-5 rounded-xl border border-[#EAF6F5]">
                <label className="block text-sm font-bold text-[#0C312F] mb-2">Usual Daily Eating Pattern</label>
                <textarea name="dietaryHistory" rows={3} onChange={handleInputChange} required 
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm text-[#0C312F] focus:border-[#218A83] focus:ring-1 focus:ring-[#218A83] outline-none shadow-sm transition-shadow" 
                  placeholder="Describe your typical breakfast, lunch, dinner, and snacks."/>
              </div>

              <div className="bg-[#F7FCFB] p-5 rounded-xl border border-[#EAF6F5]">
                <label className="block text-sm font-bold text-[#0C312F] mb-2">Dietary Restrictions, Allergies, or Intolerances</label>
                <textarea name="dietaryRestrictions" rows={2} onChange={handleInputChange} required 
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm text-[#0C312F] focus:border-[#FA7A18] focus:ring-1 focus:ring-[#FA7A18] outline-none shadow-sm transition-shadow" 
                  placeholder="List any foods you must strictly avoid."/>
              </div>
            </div>

            <div className="pt-8 border-t border-[#EAF6F5]">
              <button type="submit" disabled={loading} 
                className="w-full bg-[#218A83] text-white py-3.5 rounded-xl font-bold text-base shadow-md hover:shadow-lg hover:opacity-90 transition-all disabled:opacity-50">
                {loading ? 'Transmitting Securely...' : 'Submit Clinical Assessment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}