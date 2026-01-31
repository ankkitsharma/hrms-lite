import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { Github, PersonStanding } from "lucide-react";
import Link from "next/link";
import "./globals.css";
import { AppNav } from "@/components/app-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const sourceSerif4 = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HRMS Lite",
  description: "Employee and attendance management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${sourceSerif4.variable} font-sans min-h-screen antialiased`}
      >
        <Providers>
          <header className="border-b bg-card">
            <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold text-foreground hover:opacity-80"
              >
                <PersonStanding className="size-6" aria-hidden />
                HRMS Lite
              </Link>
              <AppNav />
              <div className="ml-auto flex items-center gap-1">
                <a
                  href="https://github.com/ankkitsharma/hrms-lite"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  aria-label="View source on GitHub"
                >
                  <Github className="size-5" />
                </a>
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
