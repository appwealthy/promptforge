import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptForge — Turn AI Tips Into One-Click Tools",
  description: "Convert social media AI tips into ready-to-use prompt templates, workflows, and installable tools.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
