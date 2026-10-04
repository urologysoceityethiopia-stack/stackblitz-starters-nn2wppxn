"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function MealPlanPage() {
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "mealPlans", user.uid));

      if (snap.exists()) {
        setPlan(snap.data());
      }
    };

    load();
  }, []);

  if (!plan) {
    return <p className="p-10">No meal plan assigned yet.</p>;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Your Nutrition Plan</h1>

      <p className="text-gray-600 mt-2">
        Condition: {plan.condition}
      </p>

      <div className="mt-6 space-y-4">
        {Object.entries(plan.meals).map(([day, meals]: any) => (
          <div key={day} className="border p-4 rounded">
            <h2 className="font-bold capitalize">{day}</h2>
            <p><b>Breakfast:</b> {meals.breakfast}</p>
            <p><b>Lunch:</b> {meals.lunch}</p>
            <p><b>Dinner:</b> {meals.dinner}</p>
            <p><b>Snack:</b> {meals.snack}</p>
          </div>
        ))}
      </div>
    </div>
  );
}