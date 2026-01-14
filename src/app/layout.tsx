import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { DataProvider } from "@/context/data-context";
import { AuthProvider } from "@/context/auth-context";
import QueryProvider from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

import { Epilogue } from "next/font/google";

const epilogue = Epilogue({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hubz Porto KOL",
  description: "KOL Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${epilogue.variable} antialiased`}
        suppressHydrationWarning
      >
        <div suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <AuthProvider>
                <DataProvider>
                  {children}
                  <Toaster />
                </DataProvider>
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
