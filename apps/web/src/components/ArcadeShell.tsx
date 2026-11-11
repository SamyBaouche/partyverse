import type { ReactNode } from "react";
import { useSearchParams } from "react-router";
import { resolveBackgroundId, type BackgroundId } from "../lib/backgrounds";

type ArcadeShellProps = {
  children: ReactNode;
};

function BackgroundLayers({ id }: { id: BackgroundId }) {
  switch (id) {
    case "sandbox":
      return (
        <div className="bg-stage bg-sandbox" aria-hidden="true">
          <div className="sandbox-cloud sandbox-cloud-a" />
          <div className="sandbox-cloud sandbox-cloud-b" />
          <div className="sandbox-cloud sandbox-cloud-c" />
          <div className="sandbox-block sandbox-block-red" />
          <div className="sandbox-block sandbox-block-blue" />
          <div className="sandbox-block sandbox-block-yellow" />
          <div className="sandbox-block sandbox-block-green" />
          <div className="sandbox-block sandbox-block-purple" />
        </div>
      );
    case "tunnel":
      return (
        <div className="bg-stage bg-tunnel" aria-hidden="true">
          <div className="arcade-tunnel" />
          <div className="arcade-reticle" />
          <div className="arcade-beam" />
        </div>
      );
    case "synthwave":
      return <div className="bg-stage bg-synthwave" aria-hidden="true" />;
    case "phosphor":
      return <div className="bg-stage bg-phosphor" aria-hidden="true" />;
    case "vortex":
      return <div className="bg-stage bg-vortex" aria-hidden="true" />;
    case "hex":
      return <div className="bg-stage bg-hex" aria-hidden="true" />;
    case "starstreak":
      return <div className="bg-stage bg-starstreak" aria-hidden="true" />;
    case "marquee":
      return <div className="bg-stage bg-marquee" aria-hidden="true" />;
    case "plasma":
      return <div className="bg-stage bg-plasma" aria-hidden="true" />;
  }
}

export function ArcadeShell({ children }: ArcadeShellProps) {
  const [params] = useSearchParams();
  const backgroundId = resolveBackgroundId(params.get("bg"));
  const showScanlines = backgroundId !== "sandbox";

  return (
    <div className="relative min-h-screen font-body text-ink">
      <BackgroundLayers id={backgroundId} />
      {showScanlines ? <div className="scanlines" aria-hidden="true" /> : null}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
