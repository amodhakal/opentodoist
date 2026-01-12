"use client";

import { authClient, signIn } from "@/lib/auth/client";
import { useEffect } from "react";

export default function HomePage() {
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
