"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Spade } from "lucide-react";

const modules = [
  {
    id: 1,
    title: "From Beginner to Playable",
    subtitle: "Master the fundamentals",
    href: "/learn/module-1",
  },
  {
    id: 2,
    title: "Strategy Foundations",
    subtitle: "Value betting & bluffing",
    href: "/learn/module-2",
  },
  {
    id: 3,
    title: "Range Thinking",
    subtitle: "Think in ranges, not hands",
    href: "/learn/module-3",
  },
  {
    id: 4,
    title: "Exploits & Leaks",
    subtitle: "Identify & exploit patterns",
    href: "/learn/module-4",
  },
  {
    id: 5,
    title: "Math of GTO",
    subtitle: "MDF, Nash equilibrium",
    href: "/learn/module-5",
  },
  {
    id: 6,
    title: "Information Theory",
    subtitle: "Bayesian hand reading",
    href: "/learn/module-6",
  },
  {
    id: 7,
    title: "Advanced Concepts",
    subtitle: "ICM, Monte Carlo",
    href: "/learn/module-7",
  },
];

export default function Navigation() {
  const [learnOpen, setLearnOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setLearnOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) =>
      e.key === "Escape" && setLearnOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className={`nav-surface fixed top-0 w-full border-b border-white/5 z-[70] ${
        scrolled ? "nav-scrolled" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-[20px]">
        <div className="flex items-center justify-between h-[68px]">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1eb854] to-[#15843c] grid place-items-center shadow-lg group-hover:shadow-green-500/20 transition-shadow">
              <Spade className="w-5 h-5 text-white" fill="white" />
            </div>
            <div className="leading-tight">
              <span className="text-[19px] font-bold text-white tracking-tight">
                PokerGTO
              </span>
              <span className="block text-[10px] text-gray-400 -mt-0.5 tracking-[0.18em] uppercase">
                Master the Game
              </span>
            </div>
          </Link>

          {/* Primary nav */}
          <div className="flex items-center gap-4 mr-[20px]">
            <div className="relative" ref={dropdownRef}>
              <button
                ref={buttonRef}
                onClick={() => setLearnOpen((v) => !v)}
                className={`menu-trigger ${
                  isActive("/learn") ? "is-active" : ""
                }`}
              >
                <span>Learn</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    learnOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {learnOpen && (
                <div
                  id="learn-menu"
                  role="menu"
                  className="dropdown-panel"
                  style={{
                    width: "500px",
                    maxWidth: "calc(100vw - 100px)",
                  }}
                >
                  <div className="dropdown-caret" aria-hidden="true" />
                  <div className="dropdown-inner">
                    <div className="dropdown-section-title">Curriculum</div>
                    <div className="dropdown-divider" />

                    <div className="dropdown-list">
                      {modules.map((m) => (
                        <Link
                          key={m.id}
                          href={m.href}
                          role="menuitem"
                          className="dropdown-item"
                          onClick={() => setLearnOpen(false)}
                        >
                          <div className="item-title">{m.title}</div>
                          <div className="item-subtitle">{m.subtitle}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/practice"
              className={`menu-link underline-on-hover ${
                isActive("/practice") ? "is-active" : ""
              }`}
            >
              Practice
            </Link>

            <Link
              href="/signin"
              className="btn-primary px-5 py-2 rounded-lg font-medium tracking-wide text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-transform hover:-translate-y-0.5 ml-[10px]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
