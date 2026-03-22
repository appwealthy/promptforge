import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptForge — Turn AI Tips Into One-Click Tools",
  description:
    "Paste any AI tip, tweet, or video and get ready-to-use prompts, skill files, and workflow guides.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
