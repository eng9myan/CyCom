import type { Metadata } from "next";
import "./globals.css";
import { CompanyProvider } from "@/context/CompanyContext";
import { AuthProvider } from "@/context/AuthContext";
import CycomLayoutWrapper from "@/components/layout/CycomLayoutWrapper";

export const metadata: Metadata = {
  title: "Cycom ERP — Enterprise Resource Planning",
  description: "Cycom ERP — Cycom enterprise management system covering HR, Payroll, Attendance, POS, Sales, Inventory and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#030712] text-white">
        <AuthProvider>
          <CompanyProvider>
            <CycomLayoutWrapper>
              {children}
            </CycomLayoutWrapper>
          </CompanyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

