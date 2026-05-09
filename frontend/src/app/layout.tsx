import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Multi-LLM Router — Compare AI Models Side by Side",
  description:
    "Query Groq Llama 3, Gemini Flash & GPT-4o Mini simultaneously. Compare responses, track tokens, and see real-time cost per query.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
