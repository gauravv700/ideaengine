import { Geist, Geist_Mono } from "next/font/google";
import "nprogress/nprogress.css";
import "./globals.css";
import Navbar from "@/components/Navbar";
import NProgressProvider from "@/components/NProgressProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "IdeaEngine",
  description: "Generate Blueprint for your idea",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NProgressProvider>
          <Navbar />
          {children}
        </NProgressProvider>
      </body>
    </html>
  );
}
