"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spade, Github, Chrome } from "lucide-react";

export default function Home() {
  const [inputName, setInputName] = useState("");
  const router = useRouter();

  const handleGetStarted = () => {
    const trimmedName = inputName.trim();
    if (trimmedName) {
      router.push(`/practice?name=${encodeURIComponent(trimmedName)}`);
    }
  };

  const handleOAuthSignIn = (provider: "google" | "github") => {
    console.log(`Sign in with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--felt-green)] to-[var(--felt-dark)] flex items-center justify-center p-4">
      <div className="card backdrop-blur-xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary)] to-green-700 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <Spade className="w-10 h-10 text-white" fill="white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">PokerGTO</h1>
          <p className="text-gray-400">
            Learn poker by playing. Math revealed in real-time.
          </p>
        </div>

        <div className="space-y-6">
          {/* OAuth Options */}
          <div className="space-y-3">
            <button
              onClick={() => handleOAuthSignIn("google")}
              className="w-full btn bg-white text-gray-800 hover:bg-gray-100 flex items-center justify-center gap-3">
              <Chrome className="w-5 h-5" />
              Continue with Google
            </button>

            <button
              onClick={() => handleOAuthSignIn("github")}
              className="btn-secondary w-full flex items-center justify-center gap-3">
              <Github className="w-5 h-5" />
              Continue with GitHub
            </button>
          </div>

          {/* Name Entry */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quick Play
            </label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleGetStarted()}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent text-white placeholder-gray-500 transition-all"
              autoFocus
            />
          </div>

          <button
            onClick={handleGetStarted}
            disabled={!inputName.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
            Let&apos;s Play
          </button>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center">
              Access curriculum and practice modes once you&apos;re in. Bots will
              teach you as you play!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}