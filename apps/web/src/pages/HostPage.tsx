import { HostLobby } from "../features/lobby/HostLobby";
import { useMockLobby } from "../features/lobby/useMockLobby";

export default function HostPage() {
  const { code, players } = useMockLobby();
  const joinUrl = `${window.location.origin}/play/${code}`;

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 px-4 py-8">
      <h1 className="font-display text-lg uppercase tracking-widest text-white neon-text sm:text-xl">
        Partyverse
      </h1>
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
