"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import PracticeGame from "@/components/PracticeGame";

export default function Practice() {
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Get name from URL params or localStorage
    const urlName = searchParams.get("name");
    const storedName = localStorage.getItem("playerName");
    const name = urlName || storedName;
    if (name) {
      setUserName(name);
      if (!storedName && urlName) {
        localStorage.setItem("playerName", urlName);
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[var(--background)] to-black">
      {/* Top Navigation */}
      <TopBar userName={userName || undefined} />
      
      {/* Main Content with Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar 
          userName={userName || undefined} 
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Practice Area */}
        <div className="flex-1 flex flex-col">
          {/* Practice Game Container */}
          <div className="flex-1 p-8">
            <PracticeGame playerName={userName || "Player"} />
          </div>
        </div>
      </div>
    </div>
  );
}