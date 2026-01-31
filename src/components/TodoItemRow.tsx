"use client";

import { TodoItem } from "@/app/dashboard/page";

export function TodoItemRow({
  item,
  onApprove,
  onReject,
  disabled
}: {
  item: TodoItem;
  onApprove: () => void;
  onReject: () => void;
  disabled: boolean;
}) {
  const priorityColors = {
    p1: "bg-red-100 text-red-800 border-red-200",
    p2: "bg-orange-100 text-orange-800 border-orange-200",
    p3: "bg-yellow-100 text-yellow-800 border-yellow-200",
    p4: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const priorityLabels = {
    p1: "High",
    p2: "Medium-High",
    p3: "Medium",
    p4: "Low",
  };

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
        item.isApproved === true
          ? "bg-green-50 border-green-200"
          : item.isApproved === false
          ? "bg-red-50 border-red-200"
          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
      }`}
    >
      <div className="flex-1">
        <p className="font-medium text-gray-900 mb-2">{item.content}</p>
        <div className="flex flex-wrap gap-2">
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium border ${
              priorityColors[item.priority as keyof typeof priorityColors]
            }`}
          >
            {priorityLabels[item.priority as keyof typeof priorityLabels]} Priority
          </span>
          {item.dueDate && (
            <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-medium">
              📅 Due: {item.dueDate.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        {item.isApproved === null && (
          <>
            <button
              onClick={onApprove}
              disabled={disabled}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span>✓</span>
              Approve
            </button>
            <button
              onClick={onReject}
              disabled={disabled}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span>✗</span>
              Reject
            </button>
          </>
        )}
        {item.isApproved === true && (
          <span className="text-sm font-medium text-green-700 flex items-center gap-1">
            <span className="text-lg">✅</span> Added
          </span>
        )}
        {item.isApproved === false && (
          <span className="text-sm font-medium text-red-700 flex items-center gap-1">
            <span className="text-lg">🗑️</span> Rejected
          </span>
        )}
      </div>
    </div>
  );
}
