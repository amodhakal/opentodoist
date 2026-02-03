"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  FileText,
  Sparkles,
  Zap,
  Calendar,
  Target,
  Brain,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Clock,
  Flag,
} from "lucide-react";
import { useEffect, useState } from "react";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
};

// Demo animation component
function LiveDemo() {
  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const fullText = "Study for math exam on Monday, finish project report by Friday, buy groceries for dinner party...";
  const [tasks, setTasks] = useState<string[]>([]);
  const [approvedTasks, setApprovedTasks] = useState<number[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (step === 0) {
      setTypedText("");
      setTasks([]);
      setApprovedTasks([]);
      let i = 0;
      const typing = setInterval(() => {
        if (i <= fullText.length) {
          setTypedText(fullText.slice(0, i));
          i++;
        } else {
          clearInterval(typing);
        }
      }, 30);
      return () => clearInterval(typing);
    }
    if (step === 2) {
      setTasks([
        "Study for math exam",
        "Finish project report",
        "Buy groceries",
      ]);
    }
    if (step === 3) {
      setApprovedTasks([0]);
      setTimeout(() => setApprovedTasks([0, 1]), 600);
      setTimeout(() => setApprovedTasks([0, 1, 2]), 1200);
    }
  }, [step]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="relative max-w-2xl mx-auto mt-16"
    >
      {/* Demo Card */}
      <div className="glass rounded-2xl p-6 glow-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Sparkles className="w-4 h-4" />
            <span>AI Demo</span>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-zinc-900 rounded-xl p-4 mb-4 border border-zinc-800">
          <div className="flex items-center gap-2 mb-2 text-zinc-500 text-sm">
            <FileText className="w-4 h-4" />
            <span>Input Text</span>
          </div>
          <div className="text-zinc-300 font-mono text-sm min-h-[3rem]">
            {typedText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-2 h-4 bg-red-500 ml-1"
            />
          </div>
        </div>

        {/* AI Processing Indicator */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 text-zinc-400 mb-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <Brain className="w-5 h-5 text-red-500" />
            </motion.div>
            <span className="text-sm">AI is analyzing your text...</span>
          </motion.div>
        )}

        {/* Extracted Tasks */}
        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 mb-3 text-zinc-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Extracted Tasks</span>
            </div>
            {tasks.map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                  approvedTasks.includes(index)
                    ? "bg-green-500/10 border-green-500/50"
                    : "bg-zinc-900 border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      approvedTasks.includes(index)
                        ? "bg-green-500 border-green-500"
                        : "border-zinc-600"
                    }`}
                  >
                    {approvedTasks.includes(index) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      approvedTasks.includes(index)
                        ? "text-green-400"
                        : "text-zinc-300"
                    }`}
                  >
                    {task}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      index === 0
                        ? "bg-red-500/20 text-red-400"
                        : index === 1
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {index === 0 ? "High" : index === 1 ? "Medium" : "Low"}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Success Message */}
        {step === 3 && approvedTasks.length === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
          >
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">All tasks added to Todoist!</span>
            </div>
          </motion.div>
        )}

        {/* Reset Indicator */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-zinc-500 text-sm"
          >
            Restarting demo...
          </motion.div>
        )}
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute -top-8 -right-8 w-16 h-16 bg-red-500/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ repeat: Infinity, duration: 4 }}
      />
      <motion.div
        className="absolute -bottom-8 -left-8 w-20 h-20 bg-purple-500/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ repeat: Infinity, duration: 5, delay: 1 }}
      />
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen mesh-gradient overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 60, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-6 relative z-10"
      >
        <nav className="flex justify-between items-center">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
            <span className="text-xl font-bold text-white">
              Open Todoist
            </span>
          </motion.div>
          <Link href="/dashboard">
            <motion.span
              className="text-red-400 hover:text-red-300 font-medium transition-colors flex items-center gap-1"
              whileHover={{ x: 3 }}
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            Bulk Add Tasks to{" "}
            <span className="text-gradient">Todoist</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Transform any text into organized Todoist tasks with AI. Perfect for
            semester planning, project management, or any situation where you
            need to add multiple tasks quickly.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/dashboard">
              <motion.button
                className="group relative bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Start Adding Tasks
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>

            <motion.a
              href="#how-it-works"
              className="border-2 border-zinc-700 hover:border-red-500/50 text-zinc-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-5 h-5" />
              How It Works
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Live Demo */}
        <LiveDemo />

        {/* How It Works Section */}
        <motion.section
          id="how-it-works"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-24"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center text-white mb-16"
          >
            How It Works
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: FileText,
                title: "1. Paste Your Text",
                description:
                  "Copy and paste any text containing tasks, todos, or planning information.",
                color: "from-blue-500 to-blue-600",
                delay: 0,
              },
              {
                icon: Brain,
                title: "2. AI Processing",
                description:
                  "Our AI analyzes your text and extracts all tasks, setting priorities and due dates automatically.",
                color: "from-purple-500 to-purple-600",
                delay: 0.1,
              },
              {
                icon: CheckCircle2,
                title: "3. Review & Add",
                description:
                  "Review the extracted tasks, make any adjustments, and add them to your Todoist with one click.",
                color: "from-red-500 to-red-600",
                delay: 0.2,
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: step.delay, duration: 0.5 }}
                whileHover={{ y: -10 }}
                className="text-center group"
              >
                <motion.div
                  className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <step.icon className="w-10 h-10 text-white" strokeWidth={2} />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-zinc-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-16"
        >
          <div className="glass rounded-3xl p-8 md:p-12 glow-border">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-center text-white mb-12"
            >
              Why Choose Open Todoist?
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: Brain,
                  title: "Smart Task Extraction",
                  description:
                    "AI understands context and creates meaningful tasks from any text source.",
                  color: "bg-green-500/20 text-green-400",
                },
                {
                  icon: Calendar,
                  title: "Automatic Due Dates",
                  description:
                    "Detects dates and deadlines in your text and sets them appropriately.",
                  color: "bg-blue-500/20 text-blue-400",
                },
                {
                  icon: Target,
                  title: "Priority Detection",
                  description:
                    "Automatically assigns appropriate priorities based on urgency and importance.",
                  color: "bg-purple-500/20 text-purple-400",
                },
                {
                  icon: Zap,
                  title: "Bulk Operations",
                  description:
                    "Add multiple tasks at once with approve-all functionality for efficiency.",
                  color: "bg-yellow-500/20 text-yellow-400",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(23, 23, 23, 0.8)" }}
                  className="flex items-start gap-4 p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 transition-all cursor-default"
                >
                  <motion.div
                    className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center shrink-0`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-white mb-1 text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-400 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-24 text-center"
        >
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(239, 68, 68, 0)",
                "0 0 0 20px rgba(239, 68, 68, 0.1)",
                "0 0 0 0 rgba(239, 68, 68, 0)",
              ],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-block rounded-3xl"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Ready to Supercharge Your Todoist?
            </h2>
          </motion.div>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Join thousands of users who save hours by automating their task
            creation process.
          </p>
          <Link href="/dashboard">
            <motion.button
              className="group relative bg-gradient-to-r from-red-500 to-red-600 text-white px-12 py-5 rounded-2xl font-bold text-xl overflow-hidden shadow-2xl shadow-red-500/30"
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(239, 68, 68, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                Get Started Now - It&apos;s Free!
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.span>
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>
          </Link>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="border-t border-zinc-800 py-12 relative z-10"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            className="flex items-center justify-center gap-2 mb-4"
            whileHover={{ scale: 1.1 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <span className="font-bold text-white text-lg">Open Todoist</span>
          </motion.div>
          <p className="text-zinc-500">
            Transform your productivity with AI-powered task management.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
