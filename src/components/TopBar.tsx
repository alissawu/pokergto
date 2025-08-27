"use client";

import Link from "next/link";
import { Spade } from "lucide-react";

interface TopBarProps {
  userName?: string;
}

export default function TopBar({ userName }: TopBarProps) {
  return (
    <nav className="w-full nav-surface border-b border-white/5">
      <div className="h-[var(--nav-height)] flex items-center justify-between px-[20px]">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-green-700 grid place-items-center shadow-lg group-hover:shadow-green-500/20 transition-shadow">
            <Spade className="w-5 h-5 text-white" fill="white" />
          </div>
          <div className="leading-tight">
            <span className="text-[19px] font-bold gradient-text tracking-tight">
              PokerGTO
            </span>
            <span className="block text-[10px] text-gray-400 -mt-0.5 tracking-[0.18em] uppercase">
              Master the Game
            </span>
          </div>
        </Link>

        {/* Right: user + sign in */}
        <div className="flex items-center gap-4">
          {userName && (
            <div className="text-gray-300">
              Hello,&nbsp;
              <span className="text-white font-medium">{userName}</span>
            </div>
          )}
          <Link href="/signin" className="btn-primary text-sm py-2">
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}