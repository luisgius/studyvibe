import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyVibe",
  description: "Personalized study environments with music, ambient sounds, and visuals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-gray-900 text-gray-100">{children}</body>
    </html>
  );
}
