"use client";

import { TodoItem } from "@/app/dashboard/page";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Calendar, Flag, CheckCircle2, Trash2 } from "lucide-react";

interface TodoItemRowProps {
  item: TodoItem;
  onApprove: () => void;
  onReject: () => void;
  disabled: boolean;
  index: number;
}

export function TodoItemRow({
  item,
  onApprove,
  onReject,
  disabled,
  index,
}: TodoItemRowProps) {
  const priorityConfig = {
    p1: {
      bg: "bg-red-500/20",
      text: "text-red-400",
      border: "border-red-500/30",
      label: "High",
      iconColor: "text-red-500",
    },
    p2: {
      bg: "bg-orange-500/20",
      text: "text-orange-400",
      border: "border-orange-500/30",
      label: "Medium-High",
      iconColor: "text-orange-500",
    },
    p3: {
      bg: "bg-yellow-500/20",
      text: "text-yellow-400",
      border: "border-yellow-500/30",
      label: "Medium",
      iconColor: "text-yellow-500",
    },
    p4: {
      bg: "bg-zinc-500/20",
      text: "text-zinc-400",
      border: "border-zinc-500/30",
      label: "Low",
      iconColor: "text-zinc-500",
    },
  };

  const priority = priorityConfig[item.priority as keyof typeof priorityConfig] || priorityConfig.p4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.9 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      whileHover={{
        scale: 1.02,
        y: -2,
        boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.3)",
      }}
      className={`
        flex items-start gap-4 p-5 rounded-xl border transition-all duration-300
        ${
          item.isApproved === true
            ? "bg-green-500/10 border-green-500/40"
            : item.isApproved === false
            ? "bg-red-500/10 border-red-500/40"
            : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700"
        }
      `}
    >
      {/* Status Indicator */}
      <motion.div
        className="mt-1"
        initial={false}
        animate={
          item.isApproved === true
            ? { scale: 1, opacity: 1 }
            : item.isApproved === false
            ? { scale: 1, opacity: 0.5 }
            : { scale: 1, opacity: 1 }
        }
      >
        <AnimatePresence mode="wait">
          {item.isApproved === true ? (
            <motion.div
              key="approved"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </motion.div>
          ) : item.isApproved === false ? (
            <motion.div
              key="rejected"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -180 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-6 h-6 rounded-full bg-red-500/50 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" strokeWidth={3} />
            </motion.div>
          ) : (
            <motion.div
              key="pending"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-6 h-6 rounded-full border-2 border-zinc-600"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <motion.p
          className={`font-medium mb-3 text-base ${
            item.isApproved === true
              ? "text-green-400"
              : item.isApproved === false
              ? "text-red-400 line-through"
              : "text-white"
          }`}
          initial={false}
          animate={
            item.isApproved === true
              ? { opacity: 1 }
              : item.isApproved === false
              ? { opacity: 0.5 }
              : { opacity: 1 }
          }
        >
          {item.content}
        </motion.p>

        <div className="flex flex-wrap gap-2">
          {/* Priority Badge */}
          <motion.span
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border ${priority.bg} ${priority.text} ${priority.border}`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Flag className={`w-3 h-3 ${priority.iconColor}`} />
            {priority.label} Priority
          </motion.span>

          {/* Due Date Badge */}
          {item.dueDate && (
            <motion.span
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border bg-blue-500/20 text-blue-400 border-blue-500/30"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Calendar className="w-3 h-3 text-blue-400" />
              Due: {item.dueDate.toLocaleDateString()}
            </motion.span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0">
        <AnimatePresence mode="wait">
          {item.isApproved === null && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex gap-2"
            >
              <motion.button
                onClick={onApprove}
                disabled={disabled}
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-green-500/30"
              >
                <Check className="w-4 h-4" />
                Approve
              </motion.button>

              <motion.button
                onClick={onReject}
                disabled={disabled}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-red-500/30"
              >
                <Trash2 className="w-4 h-4" />
                Reject
              </motion.button>
            </motion.div>
          )}

          {item.isApproved === true && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-sm font-medium text-green-400 flex items-center gap-2 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/30"
            >
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle2 className="w-5 h-5" />
              </motion.div>
              Added
            </motion.span>
          )}

          {item.isApproved === false && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-sm font-medium text-red-400 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/30"
            >
              <Trash2 className="w-5 h-5" />
              Rejected
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
