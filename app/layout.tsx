import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Funeral Service Trainer",
  description: "Practice · Study · NBE Prep",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
