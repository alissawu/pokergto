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
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors mb-6 text-sm"
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </Link>

              <div className="mb-2">
                <h1 className="text-2xl font-light mb-2">
                  <span className="text-gray-500 mr-2">{module1.icon}</span>
                  Module 1: <span className="font-normal">Foundations</span>
                </h1>
                <p className="text-gray-500 text-sm">{module1.description}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Lesson Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-black/20 backdrop-blur-sm rounded border border-white/5 p-4">
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
                        className={`w-full text-left p-3 rounded transition-all duration-200 ${
                          currentLessonIndex === index
                            ? "bg-white/5 border-l-2 border-white"
                            : "hover:bg-white/5 border-l-2 border-transparent"
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
                <div className="bg-black/20 backdrop-blur-sm rounded border border-white/5 p-8">
                  {!showPractice ? (
                    <>
                      {/* Learning Objectives */}
                      <div className="mb-8">
                        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3 font-light">
                          Objectives
                        </h3>
                        <ul className="space-y-1.5">
                          {currentLesson.objectives.map((objective, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-gray-600 mt-0.5 text-xs">→</span>
                              <span className="text-gray-400 text-sm">{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Hook */}
                      <div className="mb-10 border-l-2 border-gray-800 pl-6">
                        <p className="text-base font-light mb-3 text-gray-300 italic">
                          "{currentLesson.hook.question}"
                        </p>
                        {currentLesson.hook.scenario && (
                          <p className="text-sm text-gray-500 mb-3">
                            {currentLesson.hook.scenario}
                          </p>
                        )}
                        <div className="mt-4">
                          <p className="text-sm text-gray-400 leading-relaxed">
                            {currentLesson.hook.reveal}
                          </p>
                        </div>
                      </div>

                      {/* Theory */}
                      <div className="mb-8">
                        <h2 className="text-xl font-light mb-6">
                          {currentLesson.title}
                        </h2>

                        <div className="prose prose-invert max-w-none">
                          <div className="whitespace-pre-line text-gray-300 leading-relaxed mb-6">
                            {currentLesson.theory.explanation}
                          </div>

                          {/* Examples */}
                          <div className="space-y-3 mb-8">
                            {currentLesson.theory.examples.map((example, i) => (
                              <div
                                key={i}
                                className="pl-4 border-l border-gray-800"
                              >
                                <h4 className="font-medium text-gray-300 text-sm mb-1">
                                  {example.title}
                                </h4>
                                <p className="text-gray-500 text-sm">
                                  {example.description}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Key Takeaways */}
                          <div className="border-t border-gray-800 pt-6">
                            <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-light">
                              Key Points
                            </h4>
                            <ul className="space-y-2">
                              {currentLesson.theory.keyTakeaways.map(
                                (takeaway, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="text-gray-600 mt-0.5 text-xs">
                                      •
                                    </span>
                                    <span className="text-gray-400 text-sm">
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
                          className="px-6 py-2.5 bg-white text-black hover:bg-gray-100 rounded font-medium text-sm transition-all"
                        >
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
