// app/tournament/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZyberQuest — Tournament Mode (WIP)",
  description: "Insert coin flow and ranked runs are coming soon.",
};

export default function TournamentPage() {
  return (
    <main className="min-h-[100svh] bg-[var(--zx-ink)] text-white grid place-items-center px-6">
      <div className="max-w-xl text-center">
        <h1 className="font-mono text-3xl md:text-4xl">Tournament Mode (WIP)</h1>
        <p className="mt-3 text-zinc-300">
          Compete for rewards. On-chain interactions, insert coin flow, and ranked runs.
        </p>
        <p className="mt-1 text-sm text-zinc-500">Coming soon…</p>
      </div>
    </main>
  );
}
