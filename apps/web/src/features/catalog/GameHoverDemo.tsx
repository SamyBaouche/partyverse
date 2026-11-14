import type { CatalogGameId } from "../session/types";
import { GameIcon } from "./GameIcons";

type GameHoverDemoProps = {
  id: CatalogGameId;
  accent: string;
};

/** Lightweight looping “demo” on the DS top screen after a long hover. */
export function GameHoverDemo({ id, accent }: GameHoverDemoProps) {
  return (
    <div className="game-demo absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(160deg, ${accent}, #fff8 45%, ${accent}cc)` }}
      />
      {id === "draw-guess" ? (
        <div className="absolute inset-0">
          <GameIcon id="draw-guess" className="h-full w-full" />
        </div>
      ) : null}
      {id === "imposter" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#E8DCC8] p-3">
          <GameIcon id="imposter" className="h-full w-full" />
        </div>
      ) : null}
      {id === "bomb-party" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#FFE566] p-3">
          <GameIcon id="bomb-party" className="h-full w-full" />
        </div>
      ) : null}
      {id === "connect-four" ? (
        <div className="absolute inset-0">
          <GameIcon id="connect-four" className="h-full w-full" />
        </div>
      ) : null}
      {id === "tic-tac-toe" ? (
        <div className="absolute inset-0">
          <GameIcon id="tic-tac-toe" className="h-full w-full" />
        </div>
      ) : null}
      {id === "rock-paper-scissors" ? (
        <div className="absolute inset-0">
          <GameIcon id="rock-paper-scissors" className="h-full w-full" />
        </div>
      ) : null}
      {id === "word-rush" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 font-display text-[9px] text-white">
          <span className="demo-slide">CAT</span>
          <span className="demo-slide demo-slide-delay">DOG</span>
          <span className="demo-slide demo-slide-delay-2">SUN</span>
        </div>
      ) : null}
      {id === "trivia-blitz" ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="demo-spin h-14 w-14 rounded-full border-4 border-dashed border-white/70" />
        </div>
      ) : null}
      {id === "charades" ? (
        <div className="absolute inset-0 flex items-end justify-center pb-6">
          <div className="demo-wave h-8 w-14 rounded-t-full bg-white/70" />
        </div>
      ) : null}
      {id === "spyfall" ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="demo-eye h-10 w-16 rounded-full border-2 border-white/80">
            <div className="demo-pupil mx-auto mt-2 h-5 w-5 rounded-full bg-[#1a1230]" />
          </div>
        </div>
      ) : null}
      {id === "red-flag" ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="demo-flag h-12 w-8 origin-bottom-left bg-[#ff5a6a]" />
        </div>
      ) : null}
    </div>
  );
}
