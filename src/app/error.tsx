"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center space-y-4 max-w-md px-6">
        <div className="text-4xl">⚠</div>
        <h2 className="text-red-400 text-xl font-semibold">
          Something went wrong
        </h2>
        <p className="text-gray-400 text-sm">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
