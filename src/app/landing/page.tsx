"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spade } from "lucide-react";

export default function Landing() {
  const [playerName, setPlayerName] = useState("");
  const router = useRouter();

  const handleGetStarted = () => {
    if (playerName.trim()) {
      // Store the name in localStorage or context
      localStorage.setItem("playerName", playerName);
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0e5937] to-[#0a3d26] flex items-center justify-center">
      <div className="bg-[#1a1a1c]/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#1eb854] to-[#15843c] rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Spade className="w-10 h-10 text-white" fill="white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">PokerGTO</h1>
          <p className="text-gray-400">
            Learn poker by playing. Math revealed in real-time.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleGetStarted()}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#1eb854] focus:border-transparent text-white placeholder-gray-500"
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-300">Choose your table:</h3>

            <button
              onClick={handleGetStarted}
              disabled={!playerName.trim()}
              className="w-full bg-gradient-to-r from-[#1eb854] to-[#15843c] text-white py-4 rounded-xl font-semibold hover:from-[#22c55e] hover:to-[#1eb854] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-lg"
            >
              🎓 Practice Table ($1/$2)
            </button>
            <p className="text-xs text-gray-500 text-center -mt-2">
              Play against teaching bots with real-time explanations
            </p>

            <button
              disabled
              className="w-full bg-gray-700/50 text-gray-500 py-4 rounded-xl font-semibold cursor-not-allowed border border-gray-600/50"
            >
              👥 Play with Friends (Coming Soon)
            </button>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">
              New to poker?
            </h4>
            <p className="text-xs text-gray-500">
              Don&apos;t worry! Turn on Tutorial Mode and click any position to
              learn what it means. The bots will teach you as you play.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
