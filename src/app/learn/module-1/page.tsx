"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function Module1() {
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    const urlName = searchParams.get("name");
    if (urlName) {
      setUserName(urlName);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[var(--background)] to-black">
      <TopBar userName={userName || undefined} />
      
      <div className="flex flex-1">
        <Sidebar 
          userName={userName || undefined} 
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="flex-1 p-8">
          <div style={{ maxWidth: "600px", padding: "20px" }}>
            <h1>Module 1: From Beginner to Playable</h1>
            <br />
            <p>
              Still working on developing curriculum, for now check out the practice
              table, which I've been focusing on!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
