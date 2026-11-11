import { HostLobby } from "../features/lobby/HostLobby";
import { useMockLobby } from "../features/lobby/useMockLobby";

export default function HostPage() {
  const { code, players } = useMockLobby();
  const joinUrl = `${window.location.origin}/play/${code}`;

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-zinc-950 px-4 py-8 text-white">
      <h1 className="text-2xl font-bold tracking-wide text-zinc-300">Partyverse</h1>
      <HostLobby
        code={code}
        joinUrl={joinUrl}
        players={players}
        maxPlayers={8}
        onStart={() => {
          console.log("Start game");
        }}
      />
    </main>
  );
}
