'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Settings, Info, RotateCcw, Users, Coins, Timer, ChevronDown } from 'lucide-react';

// Card representations
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

type Card = {
  rank: string;
  suit: string;
  color: string;
};

type Player = {
  id: string;
  name: string;
  chips: number;
  cards: Card[];
  position: string;
  isHero: boolean;
  hasActed: boolean;
  currentBet: number;
  isFolded: boolean;
};

export default function Practice() {
  const [showSettings, setShowSettings] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    stackSize: 20,
    playerCount: 3,
    speed: 'normal',
    showHints: true,
  });

  const [gameState, setGameState] = useState({
    pot: 1.5,
    currentBet: 1,
    board: [] as Card[],
    phase: 'preflop', // preflop, flop, turn, river, showdown
  });

  const [players, setPlayers] = useState<Player[]>([
    {
      id: 'hero',
      name: 'You',
      chips: 20,
      cards: [
        { rank: 'K', suit: '♠', color: 'black' },
        { rank: '6', suit: '♥', color: 'red' }
      ],
      position: 'SB',
      isHero: true,
      hasActed: false,
      currentBet: 0.5,
      isFolded: false,
    },
    {
      id: 'bot1',
      name: 'GTO Bot 1',
      chips: 20,
      cards: [],
      position: 'BB',
      isHero: false,
      hasActed: false,
      currentBet: 1,
      isFolded: false,
    },
    {
      id: 'bot2',
      name: 'GTO Bot 2',
      chips: 20,
      cards: [],
      position: 'BTN',
      isHero: false,
      hasActed: true,
      currentBet: 0,
      isFolded: true,
    }
  ]);

  const [showEV, setShowEV] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // EV calculations (simplified for demo)
  const evCalculations = {
    fold: { ev: 0, percentage: 0 },
    call: { ev: 0.19, percentage: 0 },
    raise: { ev: 0.21, percentage: 0.1 },
    allin: { ev: 0.22, percentage: 100 }
  };

  const handleAction = (action: string, amount?: number) => {
    setSelectedAction(action);
    // Game logic would go here
    console.log(`Action: ${action}, Amount: ${amount}`);
  };

  return (
    <>
      <Navigation />
      
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f10] to-black pt-20">
        {/* Game Settings Bar */}
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="bg-[#1a1a1c]/50 backdrop-blur-sm rounded-xl border border-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Stack Size */}
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#1eb854]" />
                  <select 
                    value={gameSettings.stackSize}
                    onChange={(e) => setGameSettings({...gameSettings, stackSize: Number(e.target.value)})}
                    className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1eb854]/50"
                  >
                    <option value={10}>10 BB</option>
                    <option value={20}>20 BB</option>
                    <option value={50}>50 BB</option>
                    <option value={100}>100 BB</option>
                  </select>
                </div>

                {/* Players */}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1eb854]" />
                  <select 
                    value={gameSettings.playerCount}
                    onChange={(e) => setGameSettings({...gameSettings, playerCount: Number(e.target.value)})}
                    className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1eb854]/50"
                  >
                    <option value={2}>Heads Up</option>
                    <option value={3}>3-Handed</option>
                    <option value={6}>6-Max</option>
                    <option value={9}>Full Ring</option>
                  </select>
                </div>

                {/* Speed */}
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-[#1eb854]" />
                  <select 
                    value={gameSettings.speed}
                    onChange={(e) => setGameSettings({...gameSettings, speed: e.target.value})}
                    className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1eb854]/50"
                  >
                    <option value="slow">Slow</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Hints Toggle */}
                <button
                  onClick={() => setGameSettings({...gameSettings, showHints: !gameSettings.showHints})}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    gameSettings.showHints 
                      ? 'bg-[#1eb854]/20 text-[#1eb854] border border-[#1eb854]/30' 
                      : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}
                >
                  {gameSettings.showHints ? 'Hints On' : 'Hints Off'}
                </button>

                {/* Advanced Settings */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Advanced
                  <ChevronDown className={`w-3 h-3 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="max-w-7xl mx-auto px-8 py-6">
          {/* Table */}
          <div className="relative felt-texture rounded-3xl shadow-2xl p-8 mb-6 border border-black/50">

            {/* Pot */}
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-black/30 px-4 py-2 rounded-lg">
                <div className="text-xs text-gray-400 text-center">POT</div>
                <div className="text-2xl font-bold text-white">{gameState.pot} BB</div>
              </div>
            </div>

            {/* Board Cards */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-2">
              {gameState.board.length === 0 ? (
                // Placeholder cards for preflop
                [1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-16 h-24 bg-zinc-800 rounded-lg border-2 border-zinc-700"></div>
                ))
              ) : (
                gameState.board.map((card, i) => (
                  <CardComponent key={i} card={card} />
                ))
              )}
            </div>

            {/* Players */}
            {/* Hero (Bottom) */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <PlayerSpot player={players[0]} isActive={true} />
            </div>

            {/* Bot 1 (Left) */}
            <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
              <PlayerSpot player={players[1]} isActive={false} />
            </div>

            {/* Bot 2 (Top) */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
              <PlayerSpot player={players[2]} isActive={false} />
            </div>
          </div>

          {/* Action Panel */}
          <div className="bg-[#1a1a1c]/80 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <ActionButton
                label="FOLD"
                onClick={() => handleAction('fold')}
                ev={evCalculations.fold}
                color="red"
              />
              <ActionButton
                label="CALL"
                onClick={() => handleAction('call', gameState.currentBet)}
                ev={evCalculations.call}
                color="yellow"
              />
              <ActionButton
                label="RAISE 2x"
                onClick={() => handleAction('raise', gameState.currentBet * 2)}
                ev={evCalculations.raise}
                color="orange"
              />
              <ActionButton
                label="ALL IN"
                onClick={() => handleAction('allin', players[0].chips)}
                ev={evCalculations.allin}
                color="green"
                recommended={true}
              />
            </div>

            {/* EV Display Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowEV(!showEV)}
                className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 border border-white/10 rounded-lg transition-all"
              >
                <Info className="w-4 h-4" />
                {showEV ? 'Hide' : 'Show'} EV Calculations
              </button>

              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 border border-white/10 rounded-lg transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                New Hand
              </button>
            </div>

            {/* EV Explanation */}
            {showEV && (
              <div className="mt-4 p-4 bg-gradient-to-br from-[#1eb854]/10 to-[#1eb854]/5 rounded-lg border border-[#1eb854]/20">
                <h3 className="font-semibold mb-2 text-[#1eb854]">Why All-In is Optimal:</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  With K6o at {gameSettings.stackSize/2}BB effective stack, shoving has the highest EV (+0.22BB). 
                  Your fold equity combined with ~32% equity when called makes this more 
                  profitable than calling (which plays poorly OOP) or min-raising (which 
                  allows villain to realize equity).
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="bg-black/30 rounded-lg p-2">
                    <div className="text-xs text-gray-500">Fold Equity</div>
                    <div className="text-sm font-semibold text-white">68%</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2">
                    <div className="text-xs text-gray-500">Win Rate if Called</div>
                    <div className="text-sm font-semibold text-white">32%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function PlayerSpot({ player, isActive }: { player: Player; isActive: boolean }) {
  return (
    <div className={`text-center ${player.isFolded ? 'opacity-50' : ''}`}>
      {/* Cards */}
      <div className="flex justify-center gap-1 mb-2">
        {player.isHero ? (
          player.cards.map((card, i) => (
            <CardComponent key={i} card={card} />
          ))
        ) : (
          // Hidden cards for bots
          <>
            <div className="w-12 h-18 bg-zinc-800 rounded border-2 border-zinc-700"></div>
            <div className="w-12 h-18 bg-zinc-800 rounded border-2 border-zinc-700"></div>
          </>
        )}
      </div>

      {/* Player info */}
      <div className="bg-black/50 px-3 py-2 rounded-lg">
        <div className="flex items-center gap-2 justify-center">
          <span className="text-xs px-2 py-0.5 bg-zinc-700 rounded text-gray-300">
            {player.position}
          </span>
          <span className="text-sm text-white font-medium">{player.name}</span>
        </div>
        <div className="text-lg font-bold text-yellow-400">{player.chips} BB</div>
        {player.currentBet > 0 && (
          <div className="text-xs text-gray-400">Bet: {player.currentBet} BB</div>
        )}
      </div>

      {/* Active indicator */}
      {isActive && !player.isFolded && (
        <div className="mt-2">
          <div className="w-2 h-2 bg-green-500 rounded-full mx-auto animate-pulse"></div>
        </div>
      )}
    </div>
  );
}

function CardComponent({ card }: { card: Card }) {
  return (
    <div className="w-12 h-18 bg-white rounded shadow-lg flex flex-col items-center justify-center">
      <span className={`text-2xl font-bold ${card.color === 'red' ? 'text-red-500' : 'text-black'}`}>
        {card.rank}
      </span>
      <span className={`text-xl ${card.color === 'red' ? 'text-red-500' : 'text-black'}`}>
        {card.suit}
      </span>
    </div>
  );
}

function ActionButton({ 
  label, 
  onClick, 
  ev, 
  color, 
  recommended = false 
}: { 
  label: string;
  onClick: () => void;
  ev: { ev: number; percentage: number };
  color: string;
  recommended?: boolean;
}) {
  const colorClasses = {
    red: 'from-red-600/20 to-red-700/20 hover:from-red-600/30 hover:to-red-700/30 border-red-500/30',
    yellow: 'from-yellow-600/20 to-yellow-700/20 hover:from-yellow-600/30 hover:to-yellow-700/30 border-yellow-500/30',
    orange: 'from-orange-600/20 to-orange-700/20 hover:from-orange-600/30 hover:to-orange-700/30 border-orange-500/30',
    green: 'from-[#1eb854]/20 to-[#15843c]/20 hover:from-[#1eb854]/30 hover:to-[#15843c]/30 border-[#1eb854]/30',
  }[color];

  return (
    <button
      onClick={onClick}
      className={`relative p-4 bg-gradient-to-br ${colorClasses} backdrop-blur-sm rounded-xl border text-white font-bold transition-all transform hover:scale-105 ${
        recommended ? 'ring-2 ring-[#1eb854] ring-offset-2 ring-offset-[#1a1a1c]' : ''
      }`}
    >
      {recommended && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#1eb854] to-[#15843c] text-white text-xs px-2 py-1 rounded-full font-medium">
          GTO
        </div>
      )}
      <div className="text-sm opacity-80">{ev.percentage}%</div>
      <div className="text-lg">{label}</div>
      <div className="text-xs opacity-80">{ev.ev > 0 ? '+' : ''}{ev.ev} EV</div>
    </button>
  );
}