import { PartyverseWordmark } from "../../components/brand/PartyverseWordmark";
import { cn } from "../../lib/cn";
import type { CatalogGameId } from "../session/types";
import { CHIP_SHELL, TiltChip } from "./parts/TiltChip";
import { HowItWorks } from "./parts/HowItWorks";
import { GameReel } from "./parts/GameReel";

type GameCatalogProps = {
  onSelect: (gameId: CatalogGameId) => void;
  /** Replay the boot splash and return to the catalog home. */
  onLogoClick?: () => void;
};

export function GameCatalog({ onSelect, onLogoClick }: GameCatalogProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-8 px-4 pb-5 pt-20 sm:gap-10 sm:px-8 sm:pb-8 sm:pt-24 md:gap-12 md:px-10 md:pb-10 lg:px-12">
      <button
        type="button"
        onClick={onLogoClick}
        className="fixed top-4 left-4 z-[70] max-w-[min(70vw,18rem)] rounded-sm text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:left-5"
        aria-label="Partyverse home"
      >
        <PartyverseWordmark className="text-xl sm:text-2xl md:text-[1.7rem]" />
      </button>

      <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] lg:gap-12 xl:gap-16">
        <div>
          <h1 className="sr-only">Partyverse living-room mini games</h1>
          <div className="flex flex-col items-start gap-4 perspective-[800px] sm:gap-5">
            <TiltChip
              as="a"
              href="#battles"
              lean={-6}
              className={cn(CHIP_SHELL, "bg-[#FFE566] text-[1.7rem] sm:text-4xl md:text-5xl")}
            >
              Pick a game.
            </TiltChip>
            <TiltChip
              as="a"
              href="/play/KXPM"
              lean={7}
              className={cn(
                CHIP_SHELL,
                "bg-[#86E3C2] text-[1.7rem] sm:ml-6 sm:text-4xl md:ml-10 md:text-5xl",
              )}
            >
              Join on phones.
            </TiltChip>
          </div>
          <p className="mt-10 max-w-xl font-body text-lg leading-relaxed text-ink/75 sm:mt-12 sm:text-xl md:mt-14 md:text-[1.35rem]">
            Quick mini-games for the living room. Every move shows up on phones and the TV. No
            accounts, no downloads.
          </p>
        </div>

        <HowItWorks />
      </section>

      <section id="battles" className="scroll-mt-24 space-y-5 sm:scroll-mt-28 sm:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <h2 className="font-body text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Choose your battle
          </h2>
          <p className="max-w-2xl font-body text-base text-ink/70 sm:text-lg">
            Swipe the reel. Host on the TV. Friends scan the QR on their phone.
          </p>
        </div>

        <GameReel onSelect={onSelect} />
      </section>
    </div>
  );
}
