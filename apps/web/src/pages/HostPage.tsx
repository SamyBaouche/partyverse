import { APP_NAME } from "@partyverse/shared";

export default function HostPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-bold">{APP_NAME}</h1>
      <p className="text-zinc-400">Code de la partie</p>
      <p className="text-7xl font-black tracking-widest">ABCD</p>
      <p className="text-zinc-500">En attente des joueurs…</p>
    </main>
  );
}
