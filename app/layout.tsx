import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMIRKLE2 - Don't Laugh Challenge",
  description: "The ultimate Don't Laugh challenge. Keep a poker face while watching videos!",
  keywords: ["don't laugh", "challenge", "game", "poker face", "funny videos"],
  authors: [{ name: "SMIRKLE2 Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#080808" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
