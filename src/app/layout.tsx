import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";
import { ScreenTracker } from "./ScreenTracker";
import { Navigation } from "./Navigation";
import { PWAInstallBanner } from "../components/PWAInstallBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bahar - Resilient Athletic Training",
  description: "The resilient training app. Works offline, expects failure, builds momentum.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bahar",
  },
};

export const viewport: Viewport = {
  themeColor: "#090d16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-lime-400 selection:text-slate-950 pb-20 md:pb-8">
        <ServiceWorkerRegister />
        <ScreenTracker />
        <Navigation />
        <div className="flex-1 w-full">
          {children}
        </div>
        <PWAInstallBanner />
      </body>
    </html>
  );
}
