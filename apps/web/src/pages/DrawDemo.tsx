import { useState } from "react";
import { Stroke } from "@partyverse/shared";
import { Button, Card } from "../components/ui";
import { DrawingCanvas } from "../features/drawing/DrawingCanvas";
import { StrokeLayer } from "../features/drawing/StrokeLayer";

const DEMO_WORDS = ["CAT", "PIZZA", "ROCKET", "GUITAR", "PENGUIN", "CASTLE"] as const;

export default function DrawDemo() {
  const [wordIndex, setWordIndex] = useState(0);
  const [boardKey, setBoardKey] = useState(0);
  const [mirrorStrokes, setMirrorStrokes] = useState<Stroke[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  const word = DEMO_WORDS[wordIndex] ?? DEMO_WORDS[0];

  function handleStrokeChunk(chunk: Stroke) {
    const parsed = Stroke.safeParse(chunk);
    if (!parsed.success) {
      setInvalidCount((count) => count + 1);
      return;
    }
    setValidCount((count) => count + 1);
    setTotalPoints((count) => count + parsed.data.points.length);
    setMirrorStrokes((previous) => [...previous, parsed.data]);
  }

  function handleClear() {
    setMirrorStrokes([]);
    setValidCount(0);
    setInvalidCount(0);
    setTotalPoints(0);
  }

  /** Mock: teammate found the word → wipe board and deal a new prompt. */
  function handlePartnerFoundWord() {
    handleClear();
    setWordIndex((index) => (index + 1) % DEMO_WORDS.length);
    setBoardKey((key) => key + 1);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 overscroll-none px-4 py-8 touch-manipulation">
      <header className="space-y-2 text-center sm:text-left">
        <p className="font-display text-[10px] uppercase tracking-[0.35em] text-muted">Draw demo</p>
        <h1 className="font-display text-sm uppercase leading-relaxed text-ink sm:text-base">
          You are drawing: {word}
        </h1>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[10px] uppercase tracking-widest text-accent">Phone</h2>
          <DrawingCanvas key={boardKey} onStrokeChunk={handleStrokeChunk} onClear={handleClear} />
          <Button type="button" variant="ghost" onClick={handlePartnerFoundWord}>
            Partner found it
          </Button>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[10px] uppercase tracking-widest text-accent">
            TV mirror
          </h2>
          <Card className="flex flex-col gap-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#070d18]">
              <StrokeLayer
                strokes={mirrorStrokes}
                className="pointer-events-none absolute inset-0"
              />
            </div>
            <dl className="grid grid-cols-3 gap-3 font-body text-sm">
              <div>
                <dt className="text-muted">Valid</dt>
                <dd className="text-lg font-semibold text-success">{validCount}</dd>
              </div>
              <div>
                <dt className="text-muted">Invalid</dt>
                <dd className="text-lg font-semibold text-danger">{invalidCount}</dd>
              </div>
              <div>
                <dt className="text-muted">Points</dt>
                <dd className="text-lg font-semibold text-ink">{totalPoints}</dd>
              </div>
            </dl>
          </Card>
        </section>
      </div>
    </main>
  );
}
