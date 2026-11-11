import { Button, Card, Input, PlayerAvatar } from "../components/ui";

export default function UiGallery() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 p-8 text-white">
      <header>
        <h1 className="text-3xl font-bold">UI Gallery</h1>
        <p className="mt-1 text-zinc-400">Design system playground (development only)</p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Buttons</h2>
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
        <h2 className="text-xl font-semibold">Inputs</h2>
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
        <h2 className="text-xl font-semibold">Player avatars</h2>
        <Card className="flex flex-wrap items-end gap-4">
          <PlayerAvatar name="Samy" />
          <PlayerAvatar name="Momo" />
          <PlayerAvatar name="Lina" />
          <PlayerAvatar name="Alex" />
          <PlayerAvatar name="Samy" size="lg" />
        </Card>
      </section>
    </main>
  );
}
