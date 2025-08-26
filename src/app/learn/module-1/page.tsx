'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle, Circle, Play } from 'lucide-react';

const lessons = [
  {
    id: 1,
    title: "Hand Rankings & Kickers",
    description: "Learn what beats what and why kickers matter",
    completed: false,
    content: {
      hook: "You have pocket Kings, your opponent has AK, and a King hits the flop. Who wins?",
      theory: `
        In poker, hands are ranked from highest to lowest:
        1. Royal Flush (A-K-Q-J-10 of same suit)
        2. Straight Flush (5 cards in sequence, same suit)
        3. Four of a Kind (4 cards of same rank)
        4. Full House (3 of a kind + pair)
        5. Flush (5 cards of same suit)
        6. Straight (5 cards in sequence)
        7. Three of a Kind (3 cards of same rank)
        8. Two Pair
        9. One Pair
        10. High Card

        **Kickers Matter!**
        When players have the same hand rank, the "kicker" (highest unpaired card) determines the winner.
        Example: AK vs KQ on a K-7-3 board → Both have a pair of Kings, but Ace kicker beats Queen kicker.
      `,
      practice: "hand-rankings"
    }
  },
  {
    id: 2,
    title: "Expected Value Fundamentals",
    description: "The mathematical foundation of every poker decision",
    completed: false,
    content: {
      hook: "Why do professional players sometimes fold pocket Aces preflop in tournaments?",
      theory: `
        Expected Value (EV) is the average amount you expect to win or lose from a decision.
        
        **Formula: EV = (Win % × Win Amount) - (Lose % × Lose Amount)**
        
        Example: You bet $100 into a $100 pot
        - Opponent folds 60% of the time → You win $100
        - Opponent calls 40% of the time → You win 30% when called
        
        EV = (0.6 × $100) + (0.4 × (0.3 × $200 - 0.7 × $100))
        EV = $60 + (0.4 × ($60 - $70))
        EV = $60 + (0.4 × -$10)
        EV = $60 - $4 = $56
        
        This bet has +$56 EV, making it profitable!
      `,
      practice: "ev-calculator"
    }
  },
  {
    id: 3,
    title: "Calculating Outs",
    description: "Identify cards that improve your hand",
    completed: false,
    content: {
      hook: "You have A♥K♥ on a flop of Q♥J♥3♣. How many cards give you the winning hand?",
      theory: `
        Outs are cards that improve your hand to likely win at showdown.
        
        **Quick Out Calculations:**
        - Flush Draw: 9 outs (13 suited cards - 4 you see)
        - Open-ended Straight Draw: 8 outs
        - Gutshot Straight Draw: 4 outs
        - Two Overcards: 6 outs
        
        **Rule of 2 and 4:**
        - Flop to Turn: Multiply outs by 2 for approximate percentage
        - Flop to River: Multiply outs by 4 for approximate percentage
        
        Example: 9 outs (flush draw)
        - Turn: 9 × 2 = 18% chance
        - River: 9 × 4 = 36% chance (if you see both cards)
      `,
      practice: "outs-trainer"
    }
  },
  {
    id: 4,
    title: "Pot Odds Basics",
    description: "When to call based on the price",
    completed: false,
    content: {
      hook: "Your opponent bets $50 into a $100 pot. You need 25% equity. Should you call with your flush draw?",
      theory: `
        Pot odds compare the cost of calling to the potential reward.
        
        **Formula: Pot Odds = Call Amount / (Pot + Call Amount)**
        
        Example: Opponent bets $50 into $100 pot
        - You need to call $50 to win $150
        - Pot Odds = $50 / ($100 + $50 + $50) = $50 / $200 = 25%
        
        If your hand has >25% equity, calling is profitable!
        
        **Common Pot Odds:**
        - Half pot bet → 25% equity needed
        - Full pot bet → 33% equity needed
        - 2x pot bet → 40% equity needed
      `,
      practice: "pot-odds-trainer"
    }
  }
];

export default function Module1() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showPractice, setShowPractice] = useState(false);

  const lesson = lessons[currentLesson];

  return (
    <>
      <Navigation />
      
      <div className="min-h-screen pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Module Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            
            <h1 className="text-4xl font-bold mb-2">Module 1: From Beginner to Playable</h1>
            <p className="text-gray-400">Master the fundamentals that every poker player needs</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Lesson Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                <h3 className="font-semibold mb-4 text-sm uppercase text-gray-400">Lessons</h3>
                <div className="space-y-2">
                  {lessons.map((l, index) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setCurrentLesson(index);
                        setShowPractice(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                        currentLesson === index 
                          ? 'bg-green-600/20 border border-green-600/50' 
                          : 'hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {l.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-sm">{l.title}</div>
                          <div className="text-xs text-gray-400 mt-1">{l.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lesson Content */}
            <div className="lg:col-span-3">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
                {!showPractice ? (
                  <>
                    {/* Hook */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-green-600/10 to-green-700/10 rounded-xl border border-green-600/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-green-500">HOOK</span>
                      </div>
                      <p className="text-lg">{lesson.content.hook}</p>
                    </div>

                    {/* Theory */}
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-4">{lesson.title}</h2>
                      <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-line text-gray-300 leading-relaxed">
                          {lesson.content.theory}
                        </div>
                      </div>
                    </div>

                    {/* Practice Button */}
                    <div className="flex justify-between items-center pt-6 border-t border-zinc-800">
                      <button
                        onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
                        disabled={currentLesson === 0}
                        className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                      </button>
                      
                      <button
                        onClick={() => setShowPractice(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        <Play className="w-5 h-5" />
                        Start Practice
                      </button>
                      
                      <button
                        onClick={() => setCurrentLesson(Math.min(lessons.length - 1, currentLesson + 1))}
                        disabled={currentLesson === lessons.length - 1}
                        className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <PracticeSection 
                    lessonId={lesson.id} 
                    practiceType={lesson.content.practice}
                    onComplete={() => {
                      lessons[currentLesson].completed = true;
                      setShowPractice(false);
                      if (currentLesson < lessons.length - 1) {
                        setCurrentLesson(currentLesson + 1);
                      }
                    }}
                    onBack={() => setShowPractice(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PracticeSection({ lessonId, practiceType, onComplete, onBack }: any) {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Sample practice for hand rankings
  const questions = [
    {
      question: "You have A♠K♠, opponent has K♥Q♥. Board: K♦ 7♣ 3♥ 2♠ 9♦. Who wins?",
      options: ["You win (Ace kicker)", "Opponent wins (Queen kicker)", "Split pot", "Need more cards"],
      correct: 0,
      explanation: "Both have a pair of Kings, but your Ace kicker beats their Queen kicker."
    },
    {
      question: "Which hand is stronger?",
      options: ["Two pair: Aces and Kings", "Three of a kind: Threes", "Flush: All hearts", "Straight: 5-6-7-8-9"],
      correct: 2,
      explanation: "Flush beats straight, which beats three of a kind, which beats two pair."
    }
  ];
  
  const q = questions[currentQuestion];
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Practice: {practiceType}</h3>
          <div className="text-sm text-gray-400">
            Question {currentQuestion + 1} of {questions.length} • Score: {score}/{questions.length}
          </div>
        </div>
        
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-600 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="bg-zinc-800 rounded-xl p-6 mb-6">
        <p className="text-lg mb-6">{q.question}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {q.options.map((option, i) => (
            <button
              key={i}
              onClick={() => {
                if (i === q.correct) {
                  setScore(score + 1);
                }
                if (currentQuestion < questions.length - 1) {
                  setCurrentQuestion(currentQuestion + 1);
                } else {
                  onComplete();
                }
              }}
              className="p-4 bg-zinc-900 hover:bg-zinc-700 rounded-lg text-left transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lesson
        </button>
        
        <button
          onClick={onComplete}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
        >
          Complete Lesson
        </button>
      </div>
    </div>
  );
}