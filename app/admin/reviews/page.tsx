"use client";

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  XCircle, 
  Star, 
  Search, 
  ShieldCheck,
  Check,
  Loader2
} from 'lucide-react';

interface Review {
  id: string;
  status?: string;
  name?: string;
  userName?: string;
  author?: string;
  condition?: string;
  title?: string;
  quote?: string;
  text?: string;
  message?: string;
  content?: string;
  result?: string;
  rating?: number;
  date?: string;
  createdAt?: { seconds: number };
  [key: string]: any;
}

export default function ReviewApprovalPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const querySnapshot = await getDocs(collection(db, "reviews"));
        const fetchedReviews: Review[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const pendingReviews = fetchedReviews.filter(rev => rev.status !== "approved");
        setReviews(pendingReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchReviews();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const reviewRef = doc(db, "reviews", id);
      await updateDoc(reviewRef, {
        status: "approved"
      });
      
      setReviews(reviews.filter(review => review.id !== id));
      alert("Review approved successfully!");
    } catch (error) {
      console.error("Error approving review:", error);
      alert("Failed to approve review. Check console for details.");
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete and reject this review?")) return;
    
    try {
      await deleteDoc(doc(db, "reviews", id));
      setReviews(reviews.filter(review => review.id !== id));
    } catch (error) {
      console.error("Error rejecting review:", error);
      alert("Failed to reject review. Check console for details.");
    }
  };

  const filteredReviews = reviews.filter(review => {
    const name = review.name || review.userName || "";
    const condition = review.condition || review.title || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           condition.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-screen font-sans text-slate-900">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Review Approvals
            {!loading && (
              <span className="bg-orange-100 text-orange-700 text-sm py-1 px-3 rounded-full font-bold">
                {reviews.length} Pending
              </span>
            )}
          </h1>
          <p className="text-slate-500 mt-2">Manage and moderate patient testimonials before they appear on the homepage.</p>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search reviews..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50/50 text-sm font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-3">Patient Details</div>
          <div className="col-span-6">Review Content</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin text-teal-600 mb-4" />
              <p className="text-lg font-medium">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
              <ShieldCheck className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm">No pending reviews require your approval right now.</p>
            </div>
          ) : (
            filteredReviews.map((review) => {
              const name = review.name || review.userName || review.author || "Anonymous Patient";
              const condition = review.condition || review.title || "General Feedback";
              const quote = review.quote || review.text || review.message || review.content || "No comment provided.";
              const result = review.result || (review.rating ? `${review.rating}/5 Stars` : "Review");
              
              let displayDate = "Recent";
              if (review.date) displayDate = review.date;
              else if (review.createdAt?.seconds) {
                displayDate = new Date(review.createdAt.seconds * 1000).toLocaleDateString();
              }

              return (
                <div key={review.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 items-start hover:bg-slate-50/50 transition-colors">
                  
                  <div className="col-span-1 md:col-span-3">
                    <p className="font-bold text-slate-900">{name}</p>
                    <p className="text-sm text-teal-700 font-medium mt-1">{condition}</p>
                    <p className="text-xs text-slate-400 mt-2">{displayDate}</p>
                  </div>

                  <div className="col-span-1 md:col-span-6">
                    <div className="flex gap-1 mb-2">
                      {[...Array(review.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                      ))}
                    </div>
                    {/* Fixed quotes below */}
                    <h4 className="font-bold text-slate-800 text-lg mb-1">&quot;{result}&quot;</h4>
                    <p className="text-slate-600 text-sm italic leading-relaxed">
                      &quot;{quote}&quot;
                    </p>
                  </div>

                  <div className="col-span-1 md:col-span-3 flex items-center justify-start md:justify-end gap-3 mt-4 md:mt-0">
                    <button 
                      onClick={() => handleReject(review.id)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(review.id)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-teal-600 border border-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
