import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SATGURU VISION CARE – Optical Store Management System",
  description: "Complete optical shop ERP and clinical eye prescription management system for Satguru Vision Care.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

