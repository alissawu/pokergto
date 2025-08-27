"use client";

import { useState } from "react";
import { Play, Settings, ChevronDown } from "lucide-react";

type Seat = "HERO" | "BTN" | "BB";

export default function PokerTable() {
  const [started, setStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    stackSize: 100,
    blinds: "1/2",
    speed: "normal",
    showHints: true,
  });

  return (
    <div className="h-full flex flex-col">
      {/* Game Settings Bar */}
      <div className="card backdrop-blur-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-400">
              <span className="text-white font-medium">Stack:</span>{" "}
              {gameSettings.stackSize}BB
            </div>
            <div className="text-sm text-gray-400">
              <span className="text-white font-medium">Blinds:</span> $
              {gameSettings.blinds}
            </div>
            <div className="text-sm text-gray-400">
              <span className="text-white font-medium">Format:</span>{" "}
              3-Handed GTO
            </div>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-ghost text-sm py-1.5 px-4 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                showSettings ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {showSettings && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Stack Size
              </label>
              <select
                value={gameSettings.stackSize}
                onChange={(e) =>
                  setGameSettings({
                    ...gameSettings,
                    stackSize: Number(e.target.value),
                  })
                }
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--ring)]/50 transition-colors"
              >
                <option value={20}>20 BB</option>
                <option value={50}>50 BB</option>
                <option value={100}>100 BB</option>
                <option value={200}>200 BB</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Blinds
              </label>
              <select
                value={gameSettings.blinds}
                onChange={(e) =>
                  setGameSettings({
                    ...gameSettings,
                    blinds: e.target.value,
                  })
                }
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--ring)]/50 transition-colors"
              >
                <option value="0.5/1">$0.5/$1</option>
                <option value="1/2">$1/$2</option>
                <option value="2/5">$2/$5</option>
                <option value="5/10">$5/$10</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Speed
              </label>
              <select
                value={gameSettings.speed}
                onChange={(e) =>
                  setGameSettings({
                    ...gameSettings,
                    speed: e.target.value,
                  })
                }
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--ring)]/50 transition-colors"
              >
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() =>
                  setGameSettings({
                    ...gameSettings,
                    showHints: !gameSettings.showHints,
                  })
                }
                className={`text-sm py-1.5 px-4 rounded-lg font-medium transition-all w-full ${
                  gameSettings.showHints
                    ? "bg-[var(--ring)]/20 text-[var(--ring)] border border-[var(--ring)]/30"
                    : "bg-white/5 text-gray-400 border border-white/10"
                }`}
              >
                {gameSettings.showHints ? "Hints On" : "Hints Off"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-4xl mx-auto">
          {/* Poker Table */}
          <div className="relative aspect-[16/10] w-full">
            {/* Table Felt */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-[70%]">
                {/* Outer Rail */}
                <div className="absolute inset-0 rounded-[9999px] bg-[#0d0d0e] border border-white/10 shadow-2xl" />
                {/* Inner Felt */}
                <div className="absolute inset-[14px] rounded-[9999px] felt-texture border border-black/50" />
              </div>
            </div>

            {/* Players */}
            <Player position="top-left" label="BB" stack={100} isBot />
            <Player position="top-right" label="BTN" stack={100} isBot />
            <Player position="bottom" label="SB (You)" stack={100} isHero />

            {/* Dealer Button */}
            <div className="absolute right-[28%] top-[35%] w-8 h-8 rounded-full bg-white text-black font-bold grid place-items-center shadow-lg text-sm">
              D
            </div>

            {/* Pot Display */}
            <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2">
              <div className="px-4 py-2 rounded-lg bg-black/60 border border-white/20 backdrop-blur-sm">
                <div className="text-xs text-gray-400 mb-1">Pot</div>
                <div className="text-lg font-bold text-white">
                  ${started ? "6.00" : "0.00"}
                </div>
              </div>
            </div>

            {/* Community Cards */}
            <div className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} revealed={started && i <= 3} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          {!started ? (
            <button
              onClick={() => setStarted(true)}
              className="px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all hover:scale-105"
            >
              <Play className="w-5 h-5" />
              Start Game
            </button>
          ) : (
            <>
              <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all">
                Fold
              </button>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all">
                Call $2
              </button>
              <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all">
                Raise to $6
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Player({
  position,
  label,
  stack,
  isHero = false,
  isBot = false,
}: {
  position: "top-left" | "top-right" | "bottom";
  label: string;
  stack: number;
  isHero?: boolean;
  isBot?: boolean;
}) {
  const positionStyles = {
    "top-left": "left-[20%] top-[15%]",
    "top-right": "right-[20%] top-[15%]",
    bottom: "left-1/2 -translate-x-1/2 bottom-[10%]",
  };

  return (
    <div className={`absolute ${positionStyles[position]}`}>
      <div className="flex flex-col items-center gap-2">
        {/* Avatar */}
        <div
          className={`w-16 h-16 rounded-full border-2 ${
            isHero
              ? "border-green-500 bg-green-900/30"
              : "border-gray-600 bg-gray-800"
          } flex items-center justify-center`}
        >
          <div className="text-white font-bold">
            {isBot ? "BOT" : isHero ? "YOU" : ""}
          </div>
        </div>

        {/* Player Info */}
        <div className="text-center">
          <div className="text-xs font-semibold text-white px-2 py-1 bg-black/60 rounded">
            {label}
          </div>
          <div className="text-xs text-gray-400 mt-1">${stack}.00</div>
        </div>

        {/* Player Cards */}
        {isHero && (
          <div className="flex gap-1 mt-1">
            <div className="w-10 h-14 rounded bg-white border border-gray-300 flex items-center justify-center text-2xl">
              A♠
            </div>
            <div className="w-10 h-14 rounded bg-white border border-gray-300 flex items-center justify-center text-2xl">
              K♥
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ revealed = false }: { revealed?: boolean }) {
  return (
    <div
      className={`w-14 h-20 rounded-lg border ${
        revealed
          ? "bg-white border-gray-300 flex items-center justify-center text-3xl"
          : "bg-gradient-to-br from-blue-900 to-blue-950 border-blue-800"
      } shadow-lg`}
    >
      {revealed && "A♠"}
    </div>
  );
}