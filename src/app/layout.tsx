import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://satguruvisioncare.com"),
  title: "SATGURU VISION CARE – Optical Store Management System",
  description: "Complete optical shop ERP and clinical eye prescription management system for Satguru Vision Care (satguruvisioncare.com).",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    title: "SATGURU VISION CARE – Optical Store Management System",
    description: "Complete optical shop ERP and clinical eye prescription management system for Satguru Vision Care.",
    url: "https://satguruvisioncare.com",
    siteName: "Satguru Vision Care",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Satguru Vision Care Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
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

