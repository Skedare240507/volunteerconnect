import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "VolunteerConnect | Smart Resource Allocator",
  description: "An NGO platform for AI-powered resource allocation and volunteer coordination.",
  keywords: ["NGO", "Volunteer", "AI", "Resource Allocation", "Social Good", "SDG"],
};

import { AuthProvider } from "@/lib/auth-context";
import AIChatbot from "@/components/AIChatbot";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          {/* Background Decorations */}
          <div className="bg-glow">
            <div className="bg-glow-1" />
            <div className="bg-glow-2" />
            <div className="grid-pattern absolute inset-0 opacity-20" />
          </div>
          
          <main className="relative z-10 flex-grow">
            {children}
          </main>

          <AIChatbot />
        </AuthProvider>
      </body>
    </html>
  );
}
