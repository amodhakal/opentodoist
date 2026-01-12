"use client";

import { 
  createNewProcess, 
  processTextWithAI, 
  approveTodoItem, 
  rejectTodoItem, 
  approveAllTodoItems,
  getTodoistAccessToken,
  getProcessWithTodoItems
} from "@/actions/processing";
import { authClient, signIn } from "@/lib/auth/client";
import { FormEvent, useState, useTransition } from "react";
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
    return <div className="">Loading...</div>;
  }

  if (error) {
    console.error(error);
    return <div className="">Something is wrong</div>;
  }

  if (!session) {
    return (
      <button
        onClick={async () => signIn.social({ provider: "todoist" })}
        className="bg-red-400 p-4 text-white"
      >
        Sign in to Todoist
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4 max-w-4xl mx-auto">
      <div className="text-5xl font-bold">Welcome {session.user.name}</div>

      {currentProcess && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Current Process</h2>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded-full ${
              currentProcess.status === "incomplete" ? "bg-gray-400" :
              currentProcess.status === "processing" ? "bg-yellow-500 animate-pulse" :
              currentProcess.status === "processed" ? "bg-blue-500" :
              currentProcess.status === "accepted" ? "bg-green-500" :
              "bg-red-500"
            }`}></span>
            <span className="capitalize">
              {currentProcess.status === "incomplete" ? "Pending processing" :
               currentProcess.status === "processing" ? "Processing..." :
               currentProcess.status === "processed" ? "Ready for review" :
               currentProcess.status === "accepted" ? "All tasks added to Todoist" :
               "Error occurred"}
            </span>
          </div>
          {currentProcess.status === "error" && currentProcess.errorMessage && (
            <p className="text-red-600 mt-2">{currentProcess.errorMessage}</p>
          )}
          {currentProcess.status === "processed" && todoItems.length > 0 && (
            <div className="mt-4">
              <div className="flex gap-2 mb-2">
                <span className="text-sm text-gray-600">
                  {todoItems.filter(t => t.isApproved === null).length} pending
                </span>
                <span className="text-sm text-green-600">
                  {todoItems.filter(t => t.isApproved === true).length} approved
                </span>
                <span className="text-sm text-red-600">
                  {todoItems.filter(t => t.isApproved === false).length} rejected
                </span>
              </div>
              {todoItems.filter(t => t.isApproved === null).length > 0 && (
                <button
                  onClick={handleApproveAll}
                  disabled={isApproving}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {isApproving ? "Adding..." : "Approve All"}
                </button>
              )}
              <button
                onClick={handleNewProcess}
                className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                New Process
              </button>
            </div>
          )}
          {currentProcess.status === "accepted" && (
            <button
              onClick={handleNewProcess}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Process More Text
            </button>
          )}
        </div>
      )}

      {currentProcess?.status === "processed" && todoItems.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Preview & Approve Tasks</h3>
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Success!</h3>
          <p className="text-green-700">
            {todoItems.length} task{todoItems.length !== 1 ? "s" : ""} 
            {todoItems.length !== 1 ? " have" : " has"} been added to your Todoist.
          </p>
          <div className="mt-2 text-sm text-green-600">
            {todoItems.filter(t => t.isApproved === true).length} approved
            {todoItems.filter(t => t.isApproved === false).length > 0 && 
              `, ${todoItems.filter(t => t.isApproved === false).length} rejected`}
          </div>
        </div>
      )}

      <form
        className="flex flex-col gap-2"
        onSubmit={handleTextProcessingClient}
      >
        <label htmlFor="newtext" className="font-semibold">
          Add the text to process: 
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          id="newtext"
          placeholder="Paste your text here. I'll extract all the tasks and todos from it..."
          className="p-4 w-full h-44 border rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        ></textarea>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {text.length}/10,000 characters
          </span>
          <button 
            type="submit" 
            disabled={isProcessing || text.length === 0}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isProcessing ? "Processing..." : "Process Text"}
          </button>
        </div>
      </form>
    </div>
  );

  async function handleTextProcessingClient(ev: FormEvent) {
    ev.preventDefault();

    if (text.length === 0) {
      return toast("Please enter some text to process");
    }

    if (text.length > 10_000) {
      return toast("Text is too long (max 10,000 characters)");
    }

    setIsProcessing(true);
    toast.loading("Creating process...");

    const { error, process: newProcess } = await createNewProcess(text, session?.user.id!);
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
    const tokenResult = await getTodoistAccessToken(session?.user.id!);
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
    const tokenResult = await getTodoistAccessToken(session?.user.id!);
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
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{item.content}</p>
        <div className="flex gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded border ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
            {priorityLabels[item.priority as keyof typeof priorityLabels]} Priority
          </span>
          {item.dueDate && (
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Due: {item.dueDate.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onApprove}
          disabled={disabled}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={onReject}
          disabled={disabled}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
