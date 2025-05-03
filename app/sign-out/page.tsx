// This file is part of the Next.js application and handles the sign-out functionality.
// It uses Clerk for authentication and provides a simple UI for users to sign out.

'use client';

import { useClerk, useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function SignOutPage() {
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Sign Out</h1>
      {isSignedIn ? (
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      ) : (
        <p>
          You are already signed out.{" "}
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      )}
    </div>
  );
}