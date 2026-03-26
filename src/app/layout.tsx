import type { Metadata } from "next";
import { Space_Grotesk, Manrope, Lexend } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Team Squads - IPL Draft",
  description: "The Digital Arena",
};

import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${manrope.variable} ${lexend.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-on-background selection:bg-primary selection:text-on-primary-fixed">
        <Topbar />
        <Sidebar />
        <main className="lg:pl-64 pt-24 pb-24 lg:pb-8 px-4 md:px-8 bg-background min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
