import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ConditionalNavbar } from "@/components/ConditionalNavbar";
import { LanguageSync } from "./language-script";
import { GlobalSearch } from "@/components/GlobalSearch";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ColonyAI - AI-Powered Bacterial Colony Detection",
  description: "Automated Plate Count Reader for Microbiology Laboratories",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ColonyAI",
  },
};

export const viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        <LanguageSync />
        <Providers>
          <ConditionalNavbar />
          <main id="main-content">{children}</main>
          <GlobalSearch />
        </Providers>
      </body>
    </html>
  );
}
