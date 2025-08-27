'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

interface EVCalculatorProps {
  onComplete?: (score: number) => void;
}

export default function EVCalculator({ onComplete }: EVCalculatorProps) {
  const [scenario, setScenario] = useState({
    potSize: 100,
    betSize: 50,
    foldFrequency: 60,
    winRate: 35,
  });

  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{
    show: boolean;
    correct: boolean;
    explanation: string;
  }>({ show: false, correct: false, explanation: '' });

  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  // Calculate actual EV
  const calculateEV = () => {
    const { potSize, betSize, foldFrequency, winRate } = scenario;
    const foldEV = (foldFrequency / 100) * potSize;
    const callLoseEV = ((100 - foldFrequency) / 100) * ((100 - winRate) / 100) * (-betSize);
    const callWinEV = ((100 - foldFrequency) / 100) * (winRate / 100) * (potSize + betSize);
    return foldEV + callLoseEV + callWinEV;
  };

  const checkAnswer = () => {
    const correctEV = calculateEV();
    const userEV = parseFloat(userAnswer);
    const isCorrect = Math.abs(correctEV - userEV) < 1;

    setAttempts(attempts + 1);
    if (isCorrect) setScore(score + 1);

    const explanation = `
      When opponent folds (${scenario.foldFrequency}%): Win $${scenario.potSize}
      When called and win (${(100 - scenario.foldFrequency) * scenario.winRate / 100}%): Win $${scenario.potSize + scenario.betSize}
      When called and lose (${(100 - scenario.foldFrequency) * (100 - scenario.winRate) / 100}%): Lose $${scenario.betSize}
      
      EV = ${(scenario.foldFrequency/100).toFixed(2)} × $${scenario.potSize} + 
           ${((100-scenario.foldFrequency)/100 * scenario.winRate/100).toFixed(2)} × $${scenario.potSize + scenario.betSize} - 
           ${((100-scenario.foldFrequency)/100 * (100-scenario.winRate)/100).toFixed(2)} × $${scenario.betSize}
      EV = $${correctEV.toFixed(2)}
    `;

    setFeedback({
      show: true,
      correct: isCorrect,
      explanation: explanation.trim()
    });

    if (isCorrect && onComplete) {
      setTimeout(() => generateNewScenario(), 2000);
    }
  };

  const generateNewScenario = () => {
    setScenario({
      potSize: Math.round(Math.random() * 150 + 50),
      betSize: Math.round(Math.random() * 75 + 25),
      foldFrequency: Math.round(Math.random() * 40 + 40),
      winRate: Math.round(Math.random() * 30 + 25),
    });
    setUserAnswer('');
    setFeedback({ show: false, correct: false, explanation: '' });
  };

  // Visual representation
  const ev = calculateEV();
  const isPositiveEV = ev > 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">EV Calculator Training</h2>
        <p className="text-gray-400 mb-6">Calculate the Expected Value of this betting scenario</p>

        {/* Scenario Display */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-green-500 mb-3">The Scenario:</h3>
            
            <div className="bg-black/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Current Pot</span>
                <span className="text-xl font-bold text-white">${scenario.potSize}</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Your Bet Size</span>
                <span className="text-xl font-bold text-yellow-400">${scenario.betSize}</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${scenario.betSize / scenario.potSize * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Opponent Folds</span>
                <span className="text-xl font-bold text-blue-400">{scenario.foldFrequency}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${scenario.foldFrequency}%` }}></div>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Win Rate When Called</span>
                <span className="text-xl font-bold text-purple-400">{scenario.winRate}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${scenario.winRate}%` }}></div>
              </div>
            </div>
          </div>

          {/* Visual EV Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold text-green-500 mb-3">Outcome Breakdown:</h3>
            
            <div className="bg-gradient-to-br from-green-900/20 to-green-900/10 rounded-lg p-4 border border-green-800/30">
              <div className="text-sm text-green-400 mb-1">Fold & Win</div>
              <div className="text-2xl font-bold text-white">
                {scenario.foldFrequency}% × ${scenario.potSize}
              </div>
              <div className="text-lg text-green-400">
                = ${(scenario.foldFrequency / 100 * scenario.potSize).toFixed(2)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-blue-900/10 rounded-lg p-4 border border-blue-800/30">
              <div className="text-sm text-blue-400 mb-1">Called & Win</div>
              <div className="text-2xl font-bold text-white">
                {((100 - scenario.foldFrequency) * scenario.winRate / 100).toFixed(1)}% × ${scenario.potSize + scenario.betSize}
              </div>
              <div className="text-lg text-blue-400">
                = ${((100 - scenario.foldFrequency) / 100 * scenario.winRate / 100 * (scenario.potSize + scenario.betSize)).toFixed(2)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-900/20 to-red-900/10 rounded-lg p-4 border border-red-800/30">
              <div className="text-sm text-red-400 mb-1">Called & Lose</div>
              <div className="text-2xl font-bold text-white">
                {((100 - scenario.foldFrequency) * (100 - scenario.winRate) / 100).toFixed(1)}% × -${scenario.betSize}
              </div>
              <div className="text-lg text-red-400">
                = -${((100 - scenario.foldFrequency) / 100 * (100 - scenario.winRate) / 100 * scenario.betSize).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Answer Input */}
        <div className="bg-black/30 rounded-lg p-4 mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Calculate the Expected Value (EV):
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Enter EV..."
                className="w-full pl-8 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-600"
              />
            </div>
            <button
              onClick={checkAnswer}
              disabled={!userAnswer}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Check Answer
            </button>
          </div>
        </div>

        {/* Feedback */}
        {feedback.show && (
          <div className={`p-4 rounded-lg mb-4 ${
            feedback.correct 
              ? 'bg-green-900/20 border border-green-800/50' 
              : 'bg-red-900/20 border border-red-800/50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {feedback.correct ? (
                <>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-green-500">Correct!</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <span className="font-semibold text-red-500">Not quite right</span>
                </>
              )}
            </div>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">{feedback.explanation}</pre>
          </div>
        )}

        {/* Score Display */}
        <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
          <div className="text-sm text-gray-400">
            Score: {score}/{attempts} ({attempts > 0 ? Math.round(score/attempts * 100) : 0}% accuracy)
          </div>
          <button
            onClick={generateNewScenario}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            New Scenario
          </button>
        </div>
      </div>

      {/* Key Insight Box */}
      <div className="bg-gradient-to-br from-green-900/20 to-green-900/10 rounded-xl border border-green-800/30 p-6">
        <h3 className="font-semibold text-green-500 mb-2 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Key Insight
        </h3>
        <p className="text-gray-300">
          The magic of poker: You don't need to win every time! If your opponent folds often enough, 
          or you win enough when called, the bet becomes profitable. This is why aggression works - 
          you have two ways to win: they fold, or you have the best hand.
        </p>
      </div>
    </div>
  );
}