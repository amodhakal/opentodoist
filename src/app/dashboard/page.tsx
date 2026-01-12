"use client";

import { authClient, signIn } from "@/lib/auth/client";

// TODO: If not signed in, ask the user to sign in with todoist
// TODO: If signed in, allow user to add files ( find S3 alternative) and textbox for AI to process
// TODO: Use AI workflow with Vercel AI SDK for processing, and add strict rate limiting the API
// TODO: Allow the user to see the preview of what will be added, and allow the user to approve, disapprove indiviaully or together
// TODO: If it fails, in process, or succeeded, show the text and the documents status that is stored.

export default function DashboardPage() {
  const { isPending, error, data: session } = authClient.useSession();

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

  return <div className="">Welcome {session.user.name}</div>;
}
