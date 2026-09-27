import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "StatLearnAI — AI Learning Platform for Official Statistics",
  description: "AI-enabled competency-based learning platform for India's Official Statistical System. Identify skill gaps, get personalized iGOT/NSSTA course recommendations, and generate quizzes from learning materials.",
  keywords: "statistics, AI, learning, iGOT, NSSTA, competency, skill gap, India, official statistics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <ChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
