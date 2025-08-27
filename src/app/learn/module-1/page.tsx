"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Circle,
  Play,
  Brain,
  Target,
  Zap,
  BookOpen,
} from "lucide-react";
import { module1 } from "@/lib/curriculum";
import EVCalculator from "@/components/exercises/EVCalculator";

export default function Module1() {
  const [userName, setUserName] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showPractice, setShowPractice] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    if (storedName) setUserName(storedName);
  }, []);

  const currentLesson = module1.lessons[currentLessonIndex];

  const markComplete = (lessonId: string) => {
    setCompletedLessons((prev) => new Set(prev).add(lessonId));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[var(--background)] to-black">
      {/* Top Navigation */}
      <TopBar userName={userName || undefined} />

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 pt-[var(--nav-height)]">
        {/* Sidebar */}
        <Sidebar
          userName={userName || undefined}
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 pb-12">
            {/* Module Header */}
            <div className="mb-8 pt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>

              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center text-2xl">
                  {module1.icon}
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{module1.title}</h1>
                  <p className="text-gray-400">{module1.description}</p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Lesson Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-[#1a1a1c]/50 backdrop-blur-sm rounded-xl border border-white/5 p-4">
                  <h3 className="font-semibold mb-4 text-sm uppercase text-gray-400 tracking-wider">
                    Lessons
                  </h3>
                  <div className="space-y-2">
                    {module1.lessons.map((lesson, index) => (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setCurrentLessonIndex(index);
                          setShowPractice(false);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                          currentLessonIndex === index
                            ? "bg-gradient-to-r from-green-600/20 to-green-700/20 border border-green-600/50"
                            : "hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {completedLessons.has(lesson.id) ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {lesson.title}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {lesson.subtitle}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {lesson.estimatedTime} min
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <div className="text-xs text-gray-400 mb-2">
                      Module Progress
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-600 to-green-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (completedLessons.size / module1.lessons.length) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {completedLessons.size}/{module1.lessons.length} lessons
                      completed
                    </div>
                  </div>
                </div>
              </div>

              {/* Lesson Content */}
              <div className="lg:col-span-3">
                <div className="bg-[#1a1a1c]/50 backdrop-blur-sm rounded-xl border border-white/5 p-8">
                  {!showPractice ? (
                    <>
                      {/* Learning Objectives */}
                      <div className="mb-8 p-6 bg-gradient-to-r from-blue-600/10 to-blue-700/10 rounded-xl border border-blue-600/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-5 h-5 text-blue-500" />
                          <span className="text-sm font-semibold text-blue-500 uppercase tracking-wider">
                            Learning Objectives
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {currentLesson.objectives.map((objective, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-blue-400 mt-1">•</span>
                              <span className="text-gray-300">{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Hook */}
                      <div className="mb-8 p-6 bg-gradient-to-r from-green-600/10 to-green-700/10 rounded-xl border border-green-600/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-semibold text-green-500 uppercase tracking-wider">
                            Hook
                          </span>
                        </div>
                        <p className="text-lg font-medium mb-3">
                          {currentLesson.hook.question}
                        </p>
                        {currentLesson.hook.scenario && (
                          <p className="text-gray-400 mb-3">
                            {currentLesson.hook.scenario}
                          </p>
                        )}
                        <div className="mt-4 p-4 bg-black/30 rounded-lg">
                          <div className="text-sm text-green-400 mb-1">
                            The Answer:
                          </div>
                          <p className="text-gray-300">
                            {currentLesson.hook.reveal}
                          </p>
                        </div>
                      </div>

                      {/* Theory */}
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                          <BookOpen className="w-6 h-6 text-gray-400" />
                          {currentLesson.title}
                        </h2>

                        <div className="prose prose-invert max-w-none">
                          <div className="whitespace-pre-line text-gray-300 leading-relaxed mb-6">
                            {currentLesson.theory.explanation}
                          </div>

                          {/* Examples */}
                          <div className="space-y-4 mb-6">
                            {currentLesson.theory.examples.map((example, i) => (
                              <div
                                key={i}
                                className="bg-black/30 rounded-lg p-4 border border-white/5"
                              >
                                <h4 className="font-semibold text-yellow-400 mb-2">
                                  {example.title}
                                </h4>
                                <p className="text-gray-300">
                                  {example.description}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Key Takeaways */}
                          <div className="bg-gradient-to-br from-purple-600/10 to-purple-700/10 rounded-xl p-6 border border-purple-600/20">
                            <h4 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
                              <Zap className="w-5 h-5" />
                              Key Takeaways
                            </h4>
                            <ul className="space-y-2">
                              {currentLesson.theory.keyTakeaways.map(
                                (takeaway, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="text-purple-400 mt-1">
                                      ✓
                                    </span>
                                    <span className="text-gray-300">
                                      {takeaway}
                                    </span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Practice Button */}
                      <div className="flex justify-between items-center pt-6 border-t border-white/5">
                        <button
                          onClick={() =>
                            setCurrentLessonIndex(
                              Math.max(0, currentLessonIndex - 1)
                            )
                          }
                          disabled={currentLessonIndex === 0}
                          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Previous
                        </button>

                        <button
                          onClick={() => setShowPractice(true)}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                        >
                          <Play className="w-5 h-5" />
                          Start Practice
                        </button>

                        <button
                          onClick={() =>
                            setCurrentLessonIndex(
                              Math.min(
                                module1.lessons.length - 1,
                                currentLessonIndex + 1
                              )
                            )
                          }
                          disabled={
                            currentLessonIndex === module1.lessons.length - 1
                          }
                          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div>
                      {/* Practice Section - Show appropriate exercise based on lesson */}
                      {currentLesson.id === "1.1" && (
                        <EVCalculator
                          onComplete={(score) => {
                            if (score >= 3) {
                              markComplete(currentLesson.id);
                              setShowPractice(false);
                              if (
                                currentLessonIndex <
                                module1.lessons.length - 1
                              ) {
                                setCurrentLessonIndex(currentLessonIndex + 1);
                              }
                            }
                          }}
                        />
                      )}

                      {/* Placeholder for other exercises */}
                      {currentLesson.id !== "1.1" && (
                        <div className="text-center py-12">
                          <p className="text-gray-400 mb-4">
                            Practice exercise for &quot;{currentLesson.title}
                            &quot; coming soon!
                          </p>
                          <button
                            onClick={() => {
                              markComplete(currentLesson.id);
                              setShowPractice(false);
                            }}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                          >
                            Mark Complete & Continue
                          </button>
                        </div>
                      )}

                      <div className="flex justify-center mt-6">
                        <button
                          onClick={() => setShowPractice(false)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back to Lesson
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mastery Checklist */}
                {!showPractice && (
                  <div className="mt-6 bg-[#1a1a1c]/50 backdrop-blur-sm rounded-xl border border-white/5 p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Mastery Checklist
                    </h3>
                    <div className="space-y-2">
                      {currentLesson.mastery.selfCheck.map((item, i) => (
                        <label
                          key={i}
                          className="flex items-start gap-3 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 w-4 h-4 rounded border-gray-600 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-gray-300 group-hover:text-white transition-colors">
                            {item}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
