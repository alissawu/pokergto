"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Spade, ChevronLeft } from "lucide-react";

const modules = [
  {
    id: 1,
    title: "From Beginner to Playable",
    subtitle: "Master the fundamentals",
    href: "/learn/module-1",
    duration: "30 min",
    status: "available" as const,
    progress: 15,
  },
  {
    id: 2,
    title: "Strategy Foundations",
    subtitle: "Value betting & bluffing",
    href: "/learn/module-2",
    duration: "45 min",
    status: "locked" as const,
  },
  {
    id: 3,
    title: "Range Thinking",
    subtitle: "Think in ranges, not hands",
    href: "/learn/module-3",
    duration: "40 min",
    status: "locked" as const,
  },
  {
    id: 4,
    title: "Exploits & Leaks",
    subtitle: "Identify & exploit patterns",
    href: "/learn/module-4",
    duration: "35 min",
    status: "locked" as const,
  },
  {
    id: 5,
    title: "Math of GTO",
    subtitle: "MDF, Nash equilibrium",
    href: "/learn/module-5",
    duration: "40 min",
    status: "locked" as const,
  },
  {
    id: 6,
    title: "Information Theory",
    subtitle: "Bayesian hand reading",
    href: "/learn/module-6",
    duration: "35 min",
    status: "locked" as const,
  },
  {
    id: 7,
    title: "Advanced Concepts",
    subtitle: "ICM, Monte Carlo",
    href: "/learn/module-7",
    duration: "50 min",
    status: "locked" as const,
  },
];

type Section = "curriculum" | "practice";

interface SidebarProps {
  userName?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({
  userName,
  isCollapsed = false,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();
  const [active, setActive] = useState<Section>(
    pathname.includes("/practice") ? "practice" : "curriculum"
  );
  const userParam = userName ? `?name=${encodeURIComponent(userName)}` : "";

  if (isCollapsed) {
    return (
      <div className="w-[var(--sidebar-rail-w)] h-full sidebar-surface border-r border-white/10 flex flex-col items-center gap-3 py-4 flex-shrink-0">
        <button onClick={onToggle} className="rail-btn" title="Expand">
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
        <button
          onClick={() => {
            setActive("curriculum");
            onToggle?.();
          }}
          className="rail-btn"
          title="Curriculum"
        >
          <BookOpen className="w-5 h-5 text-[var(--primary)]" />
          <span className="rail-label">Learn</span>
        </button>
        <button
          onClick={() => {
            setActive("practice");
            onToggle?.();
          }}
          className="rail-btn"
          title="Practice"
        >
          <Spade className="w-5 h-5 text-[var(--primary)]" />
          <span className="rail-label">Play</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isCollapsed
            ? "w-[var(--sidebar-rail-w)]"
            : "w-[var(--sidebar-open-w)]"
        } h-full sidebar-surface border-r border-white/10 flex flex-col flex-shrink-0 relative z-50 transition-[width] duration-200 ease-out`}
      >
        {/* Header */}
        <div className="flex items-center justify-between !pl-[10px] h-[50px] border-b border-white/10">
          <div className="text-sm tracking-widest text-gray-400 uppercase">
            Menu
          </div>
          <button
            onClick={onToggle}
            className="pl-3 hover:bg-white/10 rounded-md transition-colors"
            title="Collapse"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex !pl-[10px] gap-1 p-3">
          <button
            onClick={() => setActive("curriculum")}
            className={`seg ${active === "curriculum" ? "seg-active" : ""}`}
          >
            Curriculum
          </button>
          <button
            onClick={() => setActive("practice")}
            className={`seg ${active === "practice" ? "seg-active" : ""}`}
          >
            Practice
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-3 overflow-y-auto flex-1">
          {active === "curriculum" && (
            <div className="panel-card">
              <div className="panel-title">Modules</div>
              <div className="space-y-2">
                {modules.map((m) => {
                  const locked = m.status === "locked";
                  const activeRow = pathname === m.href;
                  return (
                    <Link
                      key={m.id}
                      href={locked ? "#" : `${m.href}${userParam}`}
                      onClick={(e) => locked && e.preventDefault()}
                      className={`row ${activeRow ? "row-active" : ""} ${
                        locked ? "row-locked" : ""
                      }`}
                    >
                      <div className="row-title">{m.title}</div>
                      <div className="row-sub">{m.subtitle}</div>
                      <div className="row-meta">{m.duration}</div>
                      {"progress" in m && m.progress !== undefined && (
                        <div className="row-bar">
                          <div
                            className="row-bar-fill"
                            style={{ width: `${m.progress}%` }}
                          />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {active === "practice" && (
            <div className="panel-card">
              <div className="panel-title">Game</div>
              <Link href={`/practice${userParam}`} className="row row-cta">
                <div className="row-title">Enter Table</div>
                <div className="row-sub">3-handed GTO practice</div>
              </Link>

              <div className="row row-disabled">
                <div className="row-title">Tournaments</div>
                <div className="row-sub">Coming soon</div>
              </div>

              <div className="row row-disabled">
                <div className="row-title">Play with Friends</div>
                <div className="row-sub">Coming soon</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
