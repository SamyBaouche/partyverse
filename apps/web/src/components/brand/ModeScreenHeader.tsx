import { PartyverseWordmark } from "./PartyverseWordmark";

type ModeScreenHeaderProps = {
  onBack: () => void;
};

/** Games fixed top-left; Partyverse fixed top-center. */
export function ModeScreenHeader({ onBack }: ModeScreenHeaderProps) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="fixed top-4 left-4 z-[70] inline-flex h-14 items-center gap-2.5 rounded-full border-[3px] border-ink bg-white px-5 font-body text-lg font-bold text-ink shadow-[4px_4px_0_var(--color-hard-shadow)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:left-5 sm:h-16 sm:gap-3 sm:px-6 sm:text-xl"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden fill="none">
          <path
            d="M15 5.5 L8.5 12 L15 18.5"
            stroke="currentColor"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Games
      </button>

      <div className="pointer-events-none fixed top-4 left-1/2 z-[70] -translate-x-1/2 sm:top-5">
        <PartyverseWordmark className="text-2xl sm:text-3xl md:text-[2.1rem]" />
      </div>

      {/* Spacer so page content clears the fixed chrome */}
      <div className="h-16 sm:h-20" aria-hidden />
    </>
  );
}
