import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
