import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PokerGTO - Master Game Theory Optimal Poker",
  description:
    "Learn poker through interactive lessons and practice against GTO bots",
  keywords: ["poker", "GTO", "game theory", "poker training", "poker strategy"],
  authors: [{ name: "PokerGTO Team" }],
  openGraph: {
    title: "PokerGTO - Master Game Theory Optimal Poker",
    description:
      "Learn poker through interactive lessons and practice against GTO bots",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f0f10",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
