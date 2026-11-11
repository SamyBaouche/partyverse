import { useParams } from "react-router";
import { Button, Card, Input } from "../components/ui";

export default function PlayPage() {
  const { code } = useParams();

  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-white">
      <Card className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <p className="text-sm text-zinc-400">Room</p>
          <p className="mt-1 text-4xl font-black tracking-widest">{code}</p>
        </div>
        <Input label="Nickname" placeholder="Your nickname" maxLength={16} />
        <Button fullWidth size="lg">
          Join
        </Button>
      </Card>
    </main>
  );
}
