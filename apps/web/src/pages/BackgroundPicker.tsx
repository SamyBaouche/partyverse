import { Link } from "react-router";
import { Card } from "../components/ui";
import { BACKGROUNDS } from "../lib/backgrounds";

export default function BackgroundPicker() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="font-display text-[10px] uppercase tracking-[0.35em] text-brand">
          Dev picker
        </p>
        <h1 className="font-display text-2xl uppercase leading-relaxed text-ink neon-text">
          Backgrounds
        </h1>
        <p className="font-body text-muted">
          Open each lobby link, compare, then tell me which id to keep.
        </p>
      </header>

      <ul className="flex flex-col gap-4">
        {BACKGROUNDS.map((background) => (
          <li key={background.id}>
            <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-xs uppercase text-ink">{background.title}</p>
                <p className="font-body mt-2 text-sm text-muted">{background.blurb}</p>
                <p className="font-mono mt-2 text-xs text-brand">?bg={background.id}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="rounded-2xl border border-white/15 bg-brand px-4 py-3 font-display text-[10px] uppercase text-white shadow-[0_4px_0_#2347a8]"
                  to={`/host?bg=${background.id}`}
                >
                  Open lobby
                </Link>
                <Link
                  className="rounded-2xl border border-white/10 bg-surface-raised px-4 py-3 font-display text-[10px] uppercase text-ink shadow-[0_4px_0_#0b1220]"
                  to={`/play/ABCD?bg=${background.id}`}
                >
                  Open join
                </Link>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}
