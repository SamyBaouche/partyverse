import { useState } from "react";
import { Button, Card, Input, PlayerAvatar } from "../components/ui";
import { Countdown, celebrate } from "../components/effects";
import { SOUND_NAMES, useSound } from "../lib/audio";

export default function UiGallery() {
  const { play, startMusic, stopMusic } = useSound();
  const [showCountdown, setShowCountdown] = useState(false);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 p-8">
      <header>
        <h1 className="font-display text-xl uppercase leading-relaxed text-ink neon-text">
          UI Gallery
        </h1>
        <p className="font-body mt-2 text-muted">Design system playground (development only)</p>
        <div className="font-body mt-3 flex flex-col gap-1.5 text-brand">
          <a href="/draw-demo" className="underline-offset-4 hover:underline">
            Drawing canvas demo →
          </a>
          <a href="/play/KXPM?role=guesser" className="underline-offset-4 hover:underline">
            Phone guesser (mock) →
          </a>
          <a href="/play/KXPM?role=drawer" className="underline-offset-4 hover:underline">
            Phone drawer (mock) →
          </a>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-sm uppercase text-accent">Buttons</h2>
        <Card className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Disabled primary</Button>
            <Button variant="secondary" disabled>
              Disabled secondary
            </Button>
            <Button variant="ghost" disabled>
              Disabled ghost
            </Button>
          </div>
          <Button fullWidth size="lg">
            Full width large
          </Button>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-sm uppercase text-accent">Inputs</h2>
        <Card className="flex flex-col gap-6">
          <Input label="Nickname" placeholder="Your nickname" />
          <Input
            label="Nickname"
            placeholder="Your nickname"
            defaultValue="Samy"
            error="This nickname is already taken"
          />
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-sm uppercase text-accent">Player avatars</h2>
        <Card className="flex flex-wrap items-end gap-4">
          <PlayerAvatar name="Samy" />
          <PlayerAvatar name="Momo" />
          <PlayerAvatar name="Lina" />
          <PlayerAvatar name="Alex" />
          <PlayerAvatar name="Samy" size="lg" />
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-sm uppercase text-accent">Sound & effects</h2>
        <Card className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-3">
            {SOUND_NAMES.map((name) => (
              <Button key={name} variant="secondary" onClick={() => play(name)}>
                {name}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => startMusic()}>Start music</Button>
            <Button variant="ghost" onClick={() => stopMusic()}>
              Stop music
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowCountdown(true);
              }}
            >
              Countdown
            </Button>
            <Button
              onClick={() => {
                celebrate();
                play("win");
              }}
            >
              Celebrate
            </Button>
          </div>
        </Card>
      </section>

      {showCountdown ? (
        <Countdown
          onDone={() => {
            setShowCountdown(false);
            celebrate();
          }}
        />
      ) : null}
    </main>
  );
}
