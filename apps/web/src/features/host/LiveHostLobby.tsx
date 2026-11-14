import { HostDrawBoard, usePartyPhase, usePartyPlayers, useSendMessage } from "../realtime";
import { HostLobby } from "../lobby/HostLobby";

export function LiveHostLobby({
  code,
  joinUrl,
  onBack,
}: {
  code: string;
  joinUrl: string;
  onBack: () => void;
}) {
  const players = usePartyPlayers();
  const actions = useSendMessage();
  const partyPhase = usePartyPhase();

  if (partyPhase !== "lobby") {
    return <HostDrawBoard onBack={onBack} />;
  }

  return (
    <div className="flex w-full flex-col items-center gap-8 px-4 py-8">
      <div className="space-y-3 text-center">
        <p className="inline-flex rounded-full border-[3px] border-ink bg-[#86e3c2] px-3 py-1 font-display text-[9px] uppercase tracking-[0.2em] text-ink">
          Draw Guess · live
        </p>
        <h1 className="font-display text-lg uppercase tracking-wide text-ink sm:text-xl">
          Scan to join
        </h1>
      </div>
      <HostLobby
        code={code}
        joinUrl={joinUrl}
        players={players}
        maxPlayers={8}
        startLabel="Start match"
        onStart={() => {
          actions.startGame();
        }}
      />
      <button
        type="button"
        onClick={onBack}
        className="rounded-sm font-display text-[10px] uppercase tracking-widest text-muted underline-offset-4 hover:text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Back to games
      </button>
    </div>
  );
}
