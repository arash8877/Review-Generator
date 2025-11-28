import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "./providers";
import { Toaster } from "sonner";
import { AppHeader } from "./components/AppHeader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Review Response Generator",
  description: "AI-powered review response generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AppHeader />
          {children}
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              style: {
                width: "auto",
                minWidth: "max-content",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
