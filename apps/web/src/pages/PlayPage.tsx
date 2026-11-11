import { useParams } from "react-router";
import { Button, Card, Input } from "../components/ui";

export default function PlayPage() {
  const { code } = useParams();

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <p className="font-display text-[10px] uppercase tracking-[0.35em] text-accent">Room</p>
          <p className="neon-text font-display mt-3 text-3xl text-white">{code}</p>
        </div>
        <Input label="Nickname" placeholder="Your nickname" maxLength={16} />
        <Button fullWidth size="lg">
          Join
        </Button>
      </Card>
    </main>
  );
}
