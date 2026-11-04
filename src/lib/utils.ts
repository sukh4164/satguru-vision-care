import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  const numeric = typeof amount === "number" ? amount : Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(numeric);
}

export function formatDate(dateString: string | null | undefined, includeTime = false): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...(includeTime ? { hour: "2-digit", minute: "2-digit", hour12: true } : {}),
    });
  } catch {
    return dateString;
  }
}

export function calculateAge(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export function formatWhatsAppUrl(phone: string, message: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned; // default to India code
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

export function sanitizeSearch(term: string): string {
  return term.trim().toLowerCase();
}

