import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | string,
  currency: string = "ETB",
  locale: string = "en-ET"
) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-ET", options).format(d);
}

export function formatDateTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-ET", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function calculateAge(dateOfBirth: Date | string): number {
  const dob = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm) return 0;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function bmiCategory(bmi: number): {
  label: string;
  color: string;
  description: string;
} {
  if (bmi < 18.5)
    return {
      label: "Underweight",
      color: "text-blue-600",
      description: "Below the healthy range.",
    };
  if (bmi < 25)
    return {
      label: "Normal",
      color: "text-green-600",
      description: "Healthy weight for your height.",
    };
  if (bmi < 30)
    return {
      label: "Overweight",
      color: "text-yellow-600",
      description: "Above the healthy range.",
    };
  if (bmi < 35)
    return {
      label: "Obese Class I",
      color: "text-orange-600",
      description: "Consultation recommended.",
    };
  if (bmi < 40)
    return {
      label: "Obese Class II",
      color: "text-red-600",
      description: "Medical support strongly recommended.",
    };
  return {
    label: "Obese Class III",
    color: "text-red-700",
    description: "Urgent medical attention recommended.",
  };
}

export function calculateBMR(
  sex: "MALE" | "FEMALE",
  weightKg: number,
  heightCm: number,
  age: number
): number {
  // Mifflin-St Jeor
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "MALE" ? Math.round(base + 5) : Math.round(base - 161);
}

export function activityMultiplier(level: string): number {
  return {
    SEDENTARY: 1.2,
    LIGHTLY_ACTIVE: 1.375,
    MODERATELY_ACTIVE: 1.55,
    VERY_ACTIVE: 1.725,
    EXTREMELY_ACTIVE: 1.9,
  }[level] ?? 1.2;
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  return Math.round(bmr * activityMultiplier(activityLevel));
}

export function calculateMacros(tdee: number, goal: string) {
  const adjustments: Record<string, { cal: number; p: number; c: number; f: number }> = {
    WEIGHT_LOSS: { cal: tdee - 500, p: 0.30, c: 0.40, f: 0.30 },
    MUSCLE_GAIN: { cal: tdee + 300, p: 0.30, c: 0.45, f: 0.25 },
    DIABETES_CONTROL: { cal: tdee, p: 0.25, c: 0.45, f: 0.30 },
    BLOOD_PRESSURE_CONTROL: { cal: tdee, p: 0.25, c: 0.50, f: 0.25 },
    FERTILITY_OPTIMIZATION: { cal: tdee, p: 0.25, c: 0.45, f: 0.30 },
    PCOS_MANAGEMENT: { cal: tdee - 250, p: 0.30, c: 0.35, f: 0.35 },
    GENERAL_WELLNESS: { cal: tdee, p: 0.25, c: 0.50, f: 0.25 },
    ATHLETIC_PERFORMANCE: { cal: tdee + 400, p: 0.30, c: 0.50, f: 0.20 },
    POSTPARTUM_RECOVERY: { cal: tdee, p: 0.25, c: 0.45, f: 0.30 },
    EXECUTIVE_WELLNESS: { cal: tdee - 200, p: 0.30, c: 0.40, f: 0.30 },
  };
  const a = adjustments[goal] ?? adjustments.GENERAL_WELLNESS;
  return {
    calories: a.cal,
    protein: Math.round((a.cal * a.p) / 4),
    carbs: Math.round((a.cal * a.c) / 4),
    fat: Math.round((a.cal * a.f) / 9),
  };
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${timestamp}-${random}`;
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const masked = user.length > 2 ? user[0] + "***" + user[user.length - 1] : user[0] + "***";
  return `${masked}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (phone.length < 4) return phone;
  return phone.slice(0, 3) + "****" + phone.slice(-3);
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

export function relativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}