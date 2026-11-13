import type { ReactNode } from "react";
import { useSearchParams } from "react-router";
import { resolveBackgroundId, type BackgroundId } from "../lib/backgrounds";

type ArcadeShellProps = {
  children: ReactNode;
};

function BackgroundLayers({ id }: { id: BackgroundId }) {
  switch (id) {
    case "squabble":
      return (
        <div className="bg-stage bg-squabble" aria-hidden="true">
          <div className="squabble-wash" />
        </div>
      );
    case "dusk":
      return (
        <div className="bg-stage bg-dusk" aria-hidden="true">
          <div className="dusk-glow dusk-glow-a" />
          <div className="dusk-glow dusk-glow-b" />
          <div className="dusk-grain" />
        </div>
      );
    case "nardo":
      return (
        <div className="bg-stage bg-nardo" aria-hidden="true">
          <div className="nardo-sheen" />
          <div className="nardo-vignette" />
        </div>
      );
    case "mauve":
      return (
        <div className="bg-stage bg-mauve" aria-hidden="true">
          <div className="mauve-grid" />
          <div className="mauve-glow mauve-glow-a" />
          <div className="mauve-glow mauve-glow-b" />
        </div>
      );
    case "friv":
      return (
        <div className="bg-stage bg-friv" aria-hidden="true">
          <div className="friv-dots" />
          <div className="friv-soft-panel" />
        </div>
      );
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
  const showScanlines =
    backgroundId !== "sandbox" &&
    backgroundId !== "friv" &&
    backgroundId !== "mauve" &&
    backgroundId !== "nardo" &&
    backgroundId !== "dusk" &&
    backgroundId !== "squabble";

  return (
    <div className="relative min-h-screen font-body text-ink" data-shell="">
      <BackgroundLayers id={backgroundId} />
      {showScanlines ? <div className="scanlines" aria-hidden="true" /> : null}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
