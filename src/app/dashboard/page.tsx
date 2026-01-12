"use client";

import {
  createNewProcess,
  processTextWithAI,
  approveTodoItem,
  rejectTodoItem,
  approveAllTodoItems,
  getTodoistAccessToken
} from "@/actions/processing";
import { authClient, signIn } from "@/lib/auth/client";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

type ProcessStatus = "incomplete" | "processing" | "processed" | "accepted" | "error";

interface TodoItem {
  id: string;
  content: string;
  priority: string | null;
  dueDate: Date | null;
  isApproved: boolean | null;
  processId: string;
}

interface Process {
  id: string;
  status: ProcessStatus;
  content: string;
  errorMessage?: string | null;
  createdAt: Date;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error(error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📝</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Your Todoist
            </h1>
            <p className="text-gray-600 mb-8">
              Sign in with your Todoist account to start adding tasks in bulk.
            </p>
            <button
              onClick={async () => signIn.social({ provider: "todoist" })}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <span className="text-lg">📋</span>
              Sign in with Todoist
            </button>
            <p className="text-sm text-gray-500 mt-4">
              We only access your Todoist account to add tasks. Your data stays secure.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Open Todoist</h1>
                <p className="text-sm text-gray-600">Bulk task management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">{session.user.name}</p>
                <p className="text-sm text-gray-600">Connected to Todoist</p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {session.user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">

      {currentProcess && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-semibold">⚡</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Current Process</h2>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              currentProcess.status === "incomplete" ? "bg-gray-100 text-gray-800" :
              currentProcess.status === "processing" ? "bg-yellow-100 text-yellow-800" :
              currentProcess.status === "processed" ? "bg-blue-100 text-blue-800" :
              currentProcess.status === "accepted" ? "bg-green-100 text-green-800" :
              "bg-red-100 text-red-800"
            }`}>
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                currentProcess.status === "incomplete" ? "bg-gray-400" :
                currentProcess.status === "processing" ? "bg-yellow-500 animate-pulse" :
                currentProcess.status === "processed" ? "bg-blue-500" :
                currentProcess.status === "accepted" ? "bg-green-500" :
                "bg-red-500"
              }`}></span>
              {currentProcess.status === "incomplete" ? "Pending processing" :
               currentProcess.status === "processing" ? "Processing..." :
               currentProcess.status === "processed" ? "Ready for review" :
               currentProcess.status === "accepted" ? "All tasks added to Todoist" :
               "Error occurred"}
            </span>
          </div>
          {currentProcess.status === "error" && currentProcess.errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-red-600">⚠️</span>
                <p className="text-red-800 font-medium">Error</p>
              </div>
              <p className="text-red-700 mt-1">{currentProcess.errorMessage}</p>
            </div>
          )}
          {currentProcess.status === "processed" && todoItems.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-3">Task Summary</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-gray-400 rounded-full"></span>
                  <span className="text-sm text-gray-700">
                    {todoItems.filter(t => t.isApproved === null).length} pending
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-green-700">
                    {todoItems.filter(t => t.isApproved === true).length} approved
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-sm text-red-700">
                    {todoItems.filter(t => t.isApproved === false).length} rejected
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                {todoItems.filter(t => t.isApproved === null).length > 0 && (
                  <button
                    onClick={handleApproveAll}
                    disabled={isApproving}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>✓</span>
                    {isApproving ? "Adding..." : "Approve All"}
                  </button>
                )}
                <button
                  onClick={handleNewProcess}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  New Process
                </button>
              </div>
            </div>
          )}
          {currentProcess.status === "accepted" && (
            <button
              onClick={handleNewProcess}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Process More Text
            </button>
          )}
        </div>
      )}

      {currentProcess?.status === "processed" && todoItems.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-semibold">👁️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Preview & Approve Tasks</h3>
          </div>
          <div className="space-y-3">
            {todoItems.map((item) => (
              <TodoItemRow 
                key={item.id} 
                item={item}
                onApprove={() => handleApprove(item.id)}
                onReject={() => handleReject(item.id)}
                disabled={isApproving}
              />
            ))}
          </div>
        </div>
      )}

      {currentProcess?.status === "accepted" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <h3 className="text-xl font-semibold text-green-800">Success!</h3>
          </div>
          <p className="text-green-700 mb-3">
            {todoItems.length} task{todoItems.length !== 1 ? "s" : ""}
            {todoItems.length !== 1 ? " have" : " has"} been added to your Todoist.
          </p>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">
              ✓ {todoItems.filter(t => t.isApproved === true).length} approved
            </span>
            {todoItems.filter(t => t.isApproved === false).length > 0 && (
              <span className="text-red-600">
                ✗ {todoItems.filter(t => t.isApproved === false).length} rejected
              </span>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <form
          className="flex flex-col gap-4"
          onSubmit={handleTextProcessingClient}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-semibold">📝</span>
            </div>
            <label htmlFor="newtext" className="text-xl font-semibold text-gray-900">
              Add Text to Process
            </label>
          </div>
          <p className="text-gray-600 mb-4">
            Paste any text containing tasks, todos, or planning information. Our AI will extract and organize them for you.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            id="newtext"
            placeholder="Example: Study for math exam on Monday, finish project report by Friday, buy groceries for dinner party, call dentist for appointment..."
            className="p-4 w-full h-44 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-500"
          ></textarea>
          <div className="flex justify-between items-center">
            <span className={`text-sm font-medium ${
              text.length > 9000 ? "text-red-600" :
              text.length > 7000 ? "text-yellow-600" : "text-gray-500"
            }`}>
              {text.length}/10,000 characters
            </span>
            <button
              type="submit"
              disabled={isProcessing || text.length === 0}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>{isProcessing ? "⏳" : "⚡"}</span>
              {isProcessing ? "Processing..." : "Process Text"}
            </button>
          </div>
        </form>
      </div>
        </div>
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
      setCurrentProcess(prev => prev ? { ...prev, status: "error", errorMessage: aiResult.error } : null);
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

    const result = await approveTodoItem(
      todoItemId, 
      tokenResult.accessToken!, 
      currentProcess!.id
    );
    toast.remove();

    if (result.error) {
      toast.error(result.error);
      setIsApproving(false);
      return;
    }

    setTodoItems(prev => 
      prev.map(item => 
        item.id === todoItemId ? { ...item, isApproved: true } : item
      )
    );

    toast.success("Task added to Todoist!");
    
    const allProcessed = todoItems.every(item => item.isApproved !== null);
    if (allProcessed) {
      const allApproved = todoItems.every(item => item.isApproved === true);
      setCurrentProcess(prev => prev ? { ...prev, status: allApproved ? "accepted" : "processed" } : null);
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

    setTodoItems(prev => 
      prev.map(item => 
        item.id === todoItemId ? { ...item, isApproved: false } : item
      )
    );

    toast.success("Task rejected");

    const allProcessed = todoItems.every(item => item.isApproved !== null);
    if (allProcessed) {
      setCurrentProcess(prev => prev ? { ...prev, status: "processed" } : null);
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
    toast.loading(`Adding ${todoItems.filter(t => t.isApproved === null).length} tasks to Todoist...`);

    const result = await approveAllTodoItems(currentProcess!.id, tokenResult.accessToken!);
    toast.remove();

    if (result.error) {
      toast.error(result.error);
      setIsApproving(false);
      return;
    }

    setTodoItems(prev => 
      prev.map(item => ({ ...item, isApproved: true }))
    );

    toast.success(`All ${result.count} tasks added to Todoist!`);
    setCurrentProcess(prev => prev ? { ...prev, status: "accepted" } : null);
    setIsApproving(false);
  }

  function handleNewProcess() {
    setCurrentProcess(null);
    setTodoItems([]);
    setText("");
  }
}

function TodoItemRow({ 
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
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <p className="font-medium text-gray-900 mb-2">{item.content}</p>
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs px-3 py-1 rounded-full font-medium border ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
            {priorityLabels[item.priority as keyof typeof priorityLabels]} Priority
          </span>
          {item.dueDate && (
            <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-medium">
              📅 Due: {item.dueDate.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
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
      </div>
    </div>
  );
}
