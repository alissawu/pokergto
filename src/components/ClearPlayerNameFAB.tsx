"use client";

import { useCallback, useState } from "react";
import { Trash2 } from "lucide-react";

export default function ClearPlayerNameFAB() {
  const [hover, setHover] = useState(false);
  const handleClear = useCallback(() => {
    try {
      localStorage.removeItem("playerName");
      // Optional: provide quick visual feedback before reload
      // Small delay to allow ripple/feedback to appear
      setTimeout(() => {
        window.location.reload();
      }, 50);
    } catch (e) {
      // Fallback: reload anyway
      window.location.reload();
    }
  }, []);

  return (
    <button
      type="button"
      aria-label="Clear saved player name"
      onClick={handleClear}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="fixed bottom-4 right-4 z-[100] rounded-full p-3 bg-zinc-900/90 border border-white/10 shadow-lg hover:bg-zinc-800/90 transition-colors"
      title="Clear saved name"
    >
      <Trash2
        className={`w-5 h-5 ${hover ? "text-red-400" : "text-gray-300"}`}
      />
    </button>
  );
}
