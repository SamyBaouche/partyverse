import { useParams } from "react-router";

export default function PlayPage() {
  const { code } = useParams();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <p className="text-zinc-400">Room</p>
      <p className="text-4xl font-black tracking-widest">{code}</p>
      <input
        className="w-full max-w-xs rounded-lg bg-zinc-800 p-3 text-center"
        placeholder="Your nickname"
      />
      <button className="w-full max-w-xs rounded-lg bg-violet-600 p-3 font-bold">Join</button>
    </main>
  );
}
