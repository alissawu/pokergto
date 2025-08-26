import Navigation from "@/components/Navigation";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  TrendingUp,
  Users,
  Zap,
  Trophy,
  Target,
  BookOpen,
} from "lucide-react";

export default function Home() {
  return (
    <>
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Sophisticated background */}
        <div className="absolute inset-0 grid-background"></div>

        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 fade-in leading-tight tracking-tight">
            Master <span className="gradient-text">Game Theory</span>
            <br />
            <span className="text-3xl md:text-5xl font-light text-gray-400">
              Dominate the Table
            </span>
          </h1>

          <p
            className="text-lg text-gray-400 max-w-2xl mx-auto mb-12 fade-in leading-relaxed"
            style={{ animationDelay: "0.1s" }}
          >
            The only poker platform that teaches you to think like a pro. Build
            intuition through interactive lessons and practice against
            game-theory optimal opponents.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <Link
              href="/learn/module-1"
              className="group px-8 py-4 btn-primary text-white rounded-xl font-semibold flex items-center gap-2 min-w-[200px] justify-center"
            >
              Start Learning
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/practice"
              className="px-8 py-4 btn-secondary text-white rounded-xl font-semibold min-w-[200px] text-center"
            >
              Practice Now
            </Link>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-8 mt-20 fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">7</div>
              <div className="text-sm text-gray-500">Learning Modules</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">100+</div>
              <div className="text-sm text-gray-500">Practice Scenarios</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">GTO</div>
              <div className="text-sm text-gray-500">Optimal Strategy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why <span className="gradient-text">PokerGTO</span> Works
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Brain className="w-8 h-8 text-green-500" />}
              title="Intuitive Learning"
              description="Build understanding through interactive exercises, not memorization"
            />

            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-green-500" />}
              title="Progressive Curriculum"
              description="7 modules from basics to advanced GTO concepts"
            />

            <FeatureCard
              icon={<Zap className="w-8 h-8 text-green-500" />}
              title="Instant Feedback"
              description="See EV calculations and explanations for every decision"
            />

            <FeatureCard
              icon={<Users className="w-8 h-8 text-green-500" />}
              title="Practice vs GTO Bots"
              description="Test your skills against game-theory optimal opponents"
            />
          </div>
        </div>
      </section>

      {/* Curriculum Preview */}
      <section className="py-24 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Your Journey to <span className="gradient-text">Mastery</span>
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            A comprehensive curriculum designed to build deep understanding, not
            just surface knowledge
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModuleCard
              number="1"
              title="From Beginner to Playable"
              topics={[
                "Hand Rankings",
                "Pot Odds",
                "Position Basics",
                "Starting Hands",
              ]}
              color="from-green-600 to-green-700"
            />

            <ModuleCard
              number="2"
              title="Strategy Foundations"
              topics={[
                "Value Betting",
                "Bluffing",
                "Board Texture",
                "Expected Value",
              ]}
              color="from-green-500 to-green-600"
            />

            <ModuleCard
              number="3"
              title="Range Thinking"
              topics={[
                "Range Construction",
                "Range Advantage",
                "Equity vs Range",
              ]}
              color="from-green-400 to-green-500"
            />

            <ModuleCard
              number="4"
              title="Exploits & Leaks"
              topics={[
                "Population Tendencies",
                "Exploitative Play",
                "Player Types",
              ]}
              color="from-yellow-500 to-yellow-600"
            />

            <ModuleCard
              number="5"
              title="Math of GTO"
              topics={[
                "MDF",
                "Bluff-to-Value",
                "Nash Equilibrium",
                "Toy Games",
              ]}
              color="from-orange-500 to-orange-600"
            />

            <ModuleCard
              number="6"
              title="Information Theory"
              topics={["Bayes Theorem", "Hand Reading", "Information Sets"]}
              color="from-red-500 to-red-600"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Think Like a <span className="gradient-text">Pro</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join thousands of players learning poker the right way
          </p>

          <Link
            href="/learn/module-1"
            className="inline-flex items-center gap-2 px-10 py-5 bg-green-600 hover:bg-green-700 text-white text-lg rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
          >
            Start Your Journey
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors duration-200">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function ModuleCard({
  number,
  title,
  topics,
  color,
}: {
  number: string;
  title: string;
  topics: string[];
  color: string;
}) {
  return (
    <Link href={`/learn/module-${number}`}>
      <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all duration-200 cursor-pointer group">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
        >
          <span className="text-white font-bold text-lg">{number}</span>
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <ul className="space-y-1">
          {topics.map((topic, i) => (
            <li key={i} className="text-sm text-gray-400">
              • {topic}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
