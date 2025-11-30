"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/emails", label: "Emails" },
  { href: "/phone-calls", label: "Phone Calls" },
  { href: "/reviews", label: "Reviews" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-dark-gradient border-b border-white/5">
      <div className="max-w-8xl mx-auto px-4 sm:px-5 lg:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-100 font-semibold">
          <span className="text-xl neon-text-cyan">DanTV</span>
          <span className="text-xs text-cyan-100/70 uppercase tracking-wide">AI Service Co-Pilot</span>
        </div>
        <nav className="flex items-center gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-100 border border-cyan-400/40 neon-glow-cyan"
                    : "text-cyan-100/70 hover:text-cyan-100 hover:bg-white/5 border border-transparent"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
