import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";
import { ScreenTracker } from "./ScreenTracker";
import { Navigation } from "./Navigation";
import { PWAInstallBanner } from "../components/PWAInstallBanner";
import { ThemeProvider } from "../context/ThemeContext";

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
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('bahar_theme');
                var m = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var isDark = t === 'dark' || (!t && m) || (t === 'system' && m) || !t;
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-lime-400 selection:text-slate-950 pb-20 md:pb-8 transition-colors duration-200">
        <ThemeProvider>
          <ServiceWorkerRegister />
          <ScreenTracker />
          <Navigation />
          <div className="flex-1 w-full">
            {children}
          </div>
          <PWAInstallBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
