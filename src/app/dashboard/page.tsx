"use client";

import { TodoItemRow } from "@/components/TodoItemRow";
import {
  createNewProcess,
  processTextWithAI,
  approveTodoItem,
  rejectTodoItem,
  approveAllTodoItems,
  getTodoistAccessToken,
} from "@/actions/processing";
import { authClient, signIn, signOut } from "@/lib/auth/client";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Loader2,
  AlertCircle,
  FileText,
  Sparkles,
  Zap,
  Brain,
  CheckCircle2,
  XCircle,
  User,
  LogOut,
  RotateCcw,
  Send,
  ArrowRight,
  Calendar,
  Target,
} from "lucide-react";

export type ProcessStatus = "incomplete" | "processing" | "processed" | "accepted" | "error";

export interface TodoItem {
  id: string;
  content: string;
  priority: string | null;
  dueDate: Date | null;
  isApproved: boolean | null;
  processId: string;
}

export interface Process {
  id: string;
  status: ProcessStatus;
  content: string;
  errorMessage?: string | null;
  createdAt: Date;
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Status Badge Component
function StatusBadge({ status }: { status: ProcessStatus }) {
  const statusConfig = {
    incomplete: {
      bg: "bg-zinc-500/20",
      text: "text-zinc-400",
      border: "border-zinc-500/30",
      dot: "bg-zinc-500",
      label: "Pending",
      animate: false,
    },
    processing: {
      bg: "bg-yellow-500/20",
      text: "text-yellow-400",
      border: "border-yellow-500/30",
      dot: "bg-yellow-500",
      label: "Processing...",
      animate: true,
    },
    processed: {
      bg: "bg-blue-500/20",
      text: "text-blue-400",
      border: "border-blue-500/30",
      dot: "bg-blue-500",
      label: "Ready for Review",
      animate: false,
    },
    accepted: {
      bg: "bg-green-500/20",
      text: "text-green-400",
      border: "border-green-500/30",
      dot: "bg-green-500",
      label: "Completed",
      animate: false,
    },
    error: {
      bg: "bg-red-500/20",
      text: "text-red-400",
      border: "border-red-500/30",
      dot: "bg-red-500",
      label: "Error",
      animate: false,
    },
  };

  const config = statusConfig[status];

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.animate ? (
        <motion.span
          className={`w-2 h-2 rounded-full ${config.dot}`}
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      ) : (
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      )}
      {config.label}
    </motion.span>
  );
}

// Skeleton Loader Component
function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-2xl p-6 glow-border"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-zinc-800 rounded-xl animate-shimmer" />
        <div className="w-48 h-6 bg-zinc-800 rounded-lg animate-shimmer" />
      </div>
      <div className="space-y-3">
        <div className="w-full h-4 bg-zinc-800 rounded-lg animate-shimmer" />
        <div className="w-3/4 h-4 bg-zinc-800 rounded-lg animate-shimmer" />
        <div className="w-1/2 h-4 bg-zinc-800 rounded-lg animate-shimmer" />
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { isPending, error, data: session } = authClient.useSession();
  const [text, setText] = useState("");
  const [currentProcess, setCurrentProcess] = useState<Process | null>(null);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  if (isPending) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-zinc-400">Please try refreshing the page</p>
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black mesh-gradient flex items-center justify-center">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ repeat: Infinity, duration: 8 }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
            transition={{ repeat: Infinity, duration: 10 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full mx-4 relative z-10"
        >
          <div className="glass rounded-3xl p-10 text-center glow-border">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-500/30"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(239, 68, 68, 0)",
                  "0 0 0 20px rgba(239, 68, 68, 0.2)",
                  "0 0 0 0 rgba(239, 68, 68, 0)",
                ],
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <FileText className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-4">
              Connect Your Todoist
            </h1>
            <p className="text-zinc-400 mb-8">
              Sign in with your Todoist account to start adding tasks in bulk with AI magic.
            </p>

            <motion.button
              onClick={async () => signIn.social({ provider: "todoist", callbackURL: "/dashboard" })}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg shadow-red-500/30 flex items-center justify-center gap-3"
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(239, 68, 68, 0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              <CheckCircle2 className="w-5 h-5" />
              Sign in with Todoist
            </motion.button>

            <p className="text-sm text-zinc-500 mt-6">
              We only access your Todoist account to add tasks. Your data stays secure.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black mesh-gradient">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 8 }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 60, 0] }}
          transition={{ repeat: Infinity, duration: 10 }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 glass border-b border-zinc-800/50"
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md shadow-red-500/30">
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
              <h1 className="text-xl font-bold text-white">Open Todoist</h1>
            </motion.div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400 hidden sm:flex">
                <User className="w-4 h-4" />
                <span className="text-zinc-300">{session.user.name}</span>
              </div>
              <motion.button
                onClick={async () => signOut()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-8"
        >
          {/* Process Status Card */}
          <AnimatePresence mode="wait">
            {currentProcess && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, y: -20 }}
                className="glass rounded-2xl p-6 glow-border"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                      <Brain className="w-5 h-5 text-red-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Task Processing Status
                    </h2>
                  </div>
                  <StatusBadge status={currentProcess.status} />
                </div>

                {/* Error Display */}
                {currentProcess.status === "error" && currentProcess.errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <div>
                        <p className="text-red-400 font-medium">Error Details</p>
                        <p className="text-red-300/80 text-sm mt-1">{currentProcess.errorMessage}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Task Summary */}
                {currentProcess.status === "processed" && todoItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mb-6"
                  >
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      Tasks to Review
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="w-3 h-3 rounded-full bg-zinc-500" />
                        <span className="text-sm text-zinc-400">
                          {todoItems.filter((t) => t.isApproved === null).length} pending
                        </span>
                      </motion.div>
                      <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm text-green-400">
                          {todoItems.filter((t) => t.isApproved === true).length} approved
                        </span>
                      </motion.div>
                      <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm text-red-400">
                          {todoItems.filter((t) => t.isApproved === false).length} rejected
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <motion.button
                    onClick={handleNewProcess}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Start New
                  </motion.button>

                  {currentProcess.status === "processed" &&
                    todoItems.filter((t) => t.isApproved === null).length > 0 && (
                      <motion.button
                        onClick={handleApproveAll}
                        disabled={isApproving}
                        whileHover={{ scale: isApproving ? 1 : 1.05 }}
                        whileTap={{ scale: isApproving ? 1 : 0.95 }}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-red-500/30"
                      >
                        {isApproving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Adding All...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Approve All ({todoItems.filter((t) => t.isApproved === null).length})
                          </>
                        )}
                      </motion.button>
                    )}

                  {currentProcess.status === "accepted" && (
                    <motion.button
                      onClick={handleNewProcess}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-red-500/30"
                    >
                      <Sparkles className="w-4 h-4" />
                      Process More Text
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Task List */}
          <AnimatePresence>
            {currentProcess?.status === "processed" && todoItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass rounded-2xl p-6 glow-border"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Preview & Approve Tasks
                  </h3>
                </div>

                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {todoItems.map((item, index) => (
                      <TodoItemRow
                        key={item.id}
                        item={item}
                        onApprove={() => handleApprove(item.id)}
                        onReject={() => handleReject(item.id)}
                        disabled={isApproving}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Card */}
          <AnimatePresence>
            {currentProcess?.status === "accepted" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass rounded-2xl p-6 glow-border border-green-500/30"
              >
                <div className="flex items-center gap-4 mb-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30"
                  >
                    <Check className="w-8 h-8 text-white" strokeWidth={3} />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Tasks Successfully Added!
                    </h3>
                    <p className="text-zinc-400">
                      {todoItems.filter((t) => t.isApproved === true).length} task
                      {todoItems.filter((t) => t.isApproved === true).length !== 1 ? "s" : ""} added to your Todoist
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 text-sm border-t border-zinc-800 pt-4">
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-green-400 font-medium flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {todoItems.filter((t) => t.isApproved === true).length} approved
                  </motion.span>
                  {todoItems.filter((t) => t.isApproved === false).length > 0 && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-red-400 font-medium flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      {todoItems.filter((t) => t.isApproved === false).length} rejected
                    </motion.span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text Input Card */}
          <motion.div
            variants={fadeInUp}
            className="glass rounded-2xl p-6 glow-border"
          >
            <form className="flex flex-col gap-4" onSubmit={handleTextProcessingClient}>
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <FileText className="w-5 h-5 text-red-400" />
                </motion.div>
                <label htmlFor="newtext" className="text-xl font-semibold text-white">
                  Add Text to Process
                </label>
              </div>

              <p className="text-zinc-400 mb-2">
                Paste any text containing tasks, todos, or planning information. Our AI will extract and organize them for you.
              </p>

              <motion.div
                whileFocus={{ scale: 1.01 }}
                className="relative"
              >
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  id="newtext"
                  placeholder="Example: Study for math exam on Monday, finish project report by Friday, buy groceries for dinner party, call dentist for appointment..."
                  className="p-4 w-full h-44 bg-zinc-900/80 border border-zinc-800 rounded-xl resize-none text-white placeholder-zinc-600 transition-all focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
                />
                <motion.div
                  className="absolute bottom-3 right-3 text-xs text-zinc-500 font-medium"
                  animate={{
                    color: text.length > 9000 ? "#ef4444" : text.length > 7000 ? "#eab308" : "#71717a",
                  }}
                >
                  {text.length}/10,000
                </motion.div>
              </motion.div>

              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  disabled={isProcessing || text.length === 0}
                  whileHover={{ scale: isProcessing || text.length === 0 ? 1 : 1.05 }}
                  whileTap={{ scale: isProcessing || text.length === 0 ? 1 : 0.95 }}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-red-500/30"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Process Text
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );

  async function handleTextProcessingClient(ev: FormEvent) {
    ev.preventDefault();

    if (!session) {
      return toast.error("Please sign in first");
    }

    if (text.length === 0) {
      return toast("Please enter some text to process");
    }

    if (text.length > 10_000) {
      return toast("Text is too long (max 10,000 characters)");
    }

    setIsProcessing(true);
    toast.loading("Creating process...");

    const { error, process: newProcess } = await createNewProcess(text, session.user.id);
    toast.remove();

    if (error) {
      toast.error(error);
      setIsProcessing(false);
      return;
    }

    if (!newProcess) {
      toast.error("Failed to create process");
      setIsProcessing(false);
      return;
    }

    setCurrentProcess({ ...newProcess, status: "incomplete" });
    toast.loading("Processing with AI...");

    const aiResult = await processTextWithAI(text, newProcess.id);
    toast.remove();

    if (aiResult.error) {
      toast.error(aiResult.error);
      setIsProcessing(false);
      setCurrentProcess((prev) =>
        prev ? { ...prev, status: "error", errorMessage: aiResult.error } : null
      );
      return;
    }

    if (aiResult.todoItems) {
      setTodoItems(aiResult.todoItems);
      const updatedProcess = { ...newProcess, status: "processed" as ProcessStatus };
      setCurrentProcess(updatedProcess);
      toast.success(`Found ${aiResult.todoItems.length} tasks!`);
    }

    setIsProcessing(false);
    setText("");
  }

  async function handleApprove(todoItemId: string) {
    if (!session) {
      return toast.error("Please sign in first");
    }

    const tokenResult = await getTodoistAccessToken(session.user.id);
    if (tokenResult.error) {
      toast.error("Please sign in with Todoist first");
      return;
    }

    setIsApproving(true);
    toast.loading("Adding to Todoist...");

    const result = await approveTodoItem(todoItemId, tokenResult.accessToken!, currentProcess!.id);
    toast.remove();

    if (result.error) {
      toast.error(result.error);
      setIsApproving(false);
      return;
    }

    setTodoItems((prev) =>
      prev.map((item) => (item.id === todoItemId ? { ...item, isApproved: true } : item))
    );

    toast.success("Task added to Todoist!");

    const allProcessed = todoItems.every((item) => item.isApproved !== null);
    if (allProcessed) {
      const allApproved = todoItems.every((item) => item.isApproved === true);
      setCurrentProcess((prev) =>
        prev ? { ...prev, status: allApproved ? "accepted" : "processed" } : null
      );
    }

    setIsApproving(false);
  }

  async function handleReject(todoItemId: string) {
    setIsApproving(true);

    const result = await rejectTodoItem(todoItemId, currentProcess!.id);

    if (result.error) {
      toast.error(result.error);
      setIsApproving(false);
      return;
    }

    setTodoItems((prev) =>
      prev.map((item) => (item.id === todoItemId ? { ...item, isApproved: false } : item))
    );

    toast.success("Task rejected");

    const allProcessed = todoItems.every((item) => item.isApproved !== null);
    if (allProcessed) {
      setCurrentProcess((prev) => (prev ? { ...prev, status: "processed" } : null));
    }

    setIsApproving(false);
  }

  async function handleApproveAll() {
    if (!session) {
      return toast.error("Please sign in first");
    }

    const tokenResult = await getTodoistAccessToken(session.user.id);
    if (tokenResult.error) {
      toast.error("Please sign in with Todoist first");
      return;
    }

    setIsApproving(true);
    toast.loading(`Adding ${todoItems.filter((t) => t.isApproved === null).length} tasks to Todoist...`);

    const result = await approveAllTodoItems(currentProcess!.id, tokenResult.accessToken!);
    toast.remove();

    if (result.error) {
      toast.error(result.error);
      setIsApproving(false);
      return;
    }

    setTodoItems((prev) => prev.map((item) => ({ ...item, isApproved: true })));

    toast.success(`All ${result.count} tasks added to Todoist!`);
    setCurrentProcess((prev) => (prev ? { ...prev, status: "accepted" } : null));
    setIsApproving(false);
  }

  function handleNewProcess() {
    setCurrentProcess(null);
    setTodoItems([]);
    setText("");
  }
}
