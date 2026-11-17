import type { ReactNode } from "react";
import { cameraTarget, type KartRacer, type ObstacleKind, type WishKartState } from "./logic";

type WishKartTrackProps = {
  state: WishKartState;
  className?: string;
  fullscreen?: boolean;
};

type Sprite = {
  key: string;
  x: number;
  y: number;
  scale: number;
  z: number;
  node: ReactNode;
};

/** Forward Mode7 road — fullscreen race toward the horizon. */
export function WishKartTrack({ state, className, fullscreen = false }: WishKartTrackProps) {
  const countdownLeft =
    state.status === "countdown"
      ? Math.max(0, Math.ceil((state.countdownEndsAt - Date.now()) / 1000))
      : 0;

  const cam = cameraTarget(state);
  const camX = cam?.x ?? 0;
  const camZ = cam?.z ?? 0;
  const scroll = ((camZ % 1) + 1) % 1;
  const speedLines = Math.min(1, (cam?.speed ?? 0) / 0.09);

  const sprites: Sprite[] = [];

  for (const obs of state.obstacles ?? []) {
    const p = project(obs.x, obs.z, camX, camZ);
    if (!p) {
      continue;
    }
    sprites.push({
      key: obs.id,
      ...p,
      z: obs.z,
      node: <ObstacleSprite kind={obs.kind} />,
    });
  }

  for (const box of state.boxes) {
    if (box.respawnAt > 0) {
      continue;
    }
    const p = project(box.x, box.z, camX, camZ);
    if (!p) {
      continue;
    }
    sprites.push({
      key: box.id,
      ...p,
      z: box.z,
      node: (
        <g>
          <rect
            x={-0.5}
            y={-0.5}
            width="1"
            height="1"
            rx="0.15"
            fill="#7C5CFF"
            stroke="#1a1a1a"
            strokeWidth="0.08"
            transform="rotate(45)"
          />
          <text
            textAnchor="middle"
            y="0.18"
            fontSize="0.55"
            fill="#fff"
            style={{ fontFamily: "system-ui", fontWeight: 800 }}
          >
            ?
          </text>
        </g>
      ),
    });
  }

  for (const hazard of state.hazards) {
    const p = project(hazard.x, hazard.z, camX, camZ);
    if (!p) {
      continue;
    }
    sprites.push({
      key: hazard.id,
      ...p,
      z: hazard.z,
      node:
        hazard.kind === "shell" ? (
          <ellipse
            cx="0"
            cy="0"
            rx="0.55"
            ry="0.35"
            fill="#FF6B7A"
            stroke="#1a1a1a"
            strokeWidth="0.08"
          />
        ) : (
          <g>
            <ellipse
              cx="0"
              cy="0.1"
              rx="0.55"
              ry="0.32"
              fill="#FFE566"
              stroke="#1a1a1a"
              strokeWidth="0.08"
            />
            <path d="M-0.3 0 Q0 -0.45 0.3 0" fill="none" stroke="#1a1a1a" strokeWidth="0.06" />
          </g>
        ),
    });
  }

  for (const kart of state.players) {
    const p = project(kart.x, kart.z, camX, camZ, kart.id === cam?.id);
    if (!p) {
      continue;
    }
    sprites.push({
      key: kart.id,
      ...p,
      z: kart.z,
      node: <CarSprite kart={kart} hero={kart.id === cam?.id} />,
    });
  }

  sprites.sort((a, b) => a.z - b.z);

  const finishDz = state.finishZ - camZ;
  const finish = finishDz > -1 && finishDz < 14 ? project(0, state.finishZ, camX, camZ) : null;

  return (
    <div className={className}>
      <svg
        viewBox="0 0 1 1"
        className={`h-full w-full ${fullscreen ? "" : "rounded-[1.4rem] border-[3px] border-ink"}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wish-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4BA3E3" />
            <stop offset="55%" stopColor="#9AD4FF" />
            <stop offset="100%" stopColor="#D7EEFF" />
          </linearGradient>
          <linearGradient id="wish-road" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6a6a6a" />
            <stop offset="100%" stopColor="#2a2a2a" />
          </linearGradient>
          <linearGradient id="wish-grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3f8f55" />
            <stop offset="100%" stopColor="#1f5532" />
          </linearGradient>
        </defs>

        <rect width="1" height="0.4" fill="url(#wish-sky)" />
        <circle cx="0.84" cy="0.1" r="0.07" fill="#FFE566" />
        <path d="M0 0.4 Q0.18 0.28 0.36 0.4 T0.72 0.38 T1 0.4 V0.4 H0 Z" fill="#2f6b45" />
        <rect y="0.4" width="1" height="0.6" fill="url(#wish-grass)" />

        <polygon points="0.455,0.4 0.545,0.4 1.2,1 -0.2,1" fill="url(#wish-road)" />
        <polygon points="0.455,0.4 0.42,0.4 -0.28,1 -0.12,1" fill="#FF6B7A" />
        <polygon points="0.545,0.4 0.58,0.4 1.12,1 1.28,1" fill="#f8fbff" />

        {/* Road edge stripes */}
        {Array.from({ length: 12 }, (_, i) => {
          const t = (i + scroll) / 12;
          const y = 0.4 + t * t * 0.6;
          const w = 0.012 + t * 0.04;
          return (
            <g key={`edge-${i}`}>
              <rect
                x={0.18 - t * 0.25}
                y={y}
                width={w}
                height={0.02 + t * 0.02}
                fill="#FFE566"
                opacity="0.7"
              />
              <rect
                x={0.82 + t * 0.2}
                y={y}
                width={w}
                height={0.02 + t * 0.02}
                fill="#FFE566"
                opacity="0.7"
              />
            </g>
          );
        })}

        {Array.from({ length: 12 }, (_, i) => {
          const t = (i + scroll) / 12;
          const y0 = 0.4 + t * t * 0.6;
          const y1 = 0.4 + Math.min(1, t + 0.035) ** 2 * 0.6;
          if (y1 <= y0) {
            return null;
          }
          const w = 0.01 + t * 0.03;
          return (
            <rect
              key={i}
              x={0.5 - w / 2}
              y={y0}
              width={w}
              height={Math.max(0.01, y1 - y0)}
              fill="#f8fbff"
              opacity="0.9"
            />
          );
        })}

        {/* Speed rush lines */}
        {speedLines > 0.2
          ? Array.from({ length: 8 }, (_, i) => (
              <line
                key={`rush-${i}`}
                x1={0.08 + i * 0.12}
                y1={0.55}
                x2={0.05 + i * 0.12}
                y2={0.95}
                stroke="#ffffff"
                strokeWidth={0.004}
                opacity={0.15 + speedLines * 0.35}
              />
            ))
          : null}

        {finish ? (
          <g transform={`translate(${finish.x} ${finish.y}) scale(${finish.scale * 1.3})`}>
            <rect
              x={-2.6}
              y={-1.4}
              width="5.2"
              height="1.6"
              fill="#1a1a1a"
              stroke="#f8fbff"
              strokeWidth="0.12"
            />
            <text
              textAnchor="middle"
              y="-0.2"
              fontSize="1"
              fill="#FFE566"
              style={{ fontFamily: "system-ui", fontWeight: 800 }}
            >
              FINISH
            </text>
          </g>
        ) : null}

        {sprites.map((sprite) => (
          <g
            key={sprite.key}
            transform={`translate(${sprite.x} ${sprite.y}) scale(${sprite.scale})`}
          >
            {sprite.node}
          </g>
        ))}
      </svg>

      {state.status === "countdown" ? (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-7xl text-white drop-shadow-[0_6px_0_#1a1a1a] sm:text-8xl">
          {countdownLeft || "GO"}
        </p>
      ) : null}

      {cam ? (
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div className="space-y-2">
            <div className="h-3 w-48 overflow-hidden rounded-full border-[3px] border-ink bg-white/80 sm:w-64">
              <div
                className="h-full bg-[#FFE566]"
                style={{
                  width: `${Math.min(100, Math.max(0, (cam.z / state.finishZ) * 100))}%`,
                }}
              />
            </div>
            <span className="inline-flex rounded-full border-[3px] border-ink bg-white/90 px-3 py-1 font-body text-xs font-bold text-ink">
              {Math.min(100, Math.max(0, Math.round((cam.z / state.finishZ) * 100)))}% · dodge cones
              & rocks
            </span>
          </div>
          <span
            className="rounded-full border-[3px] border-ink px-3 py-1 font-body text-xs font-bold text-ink"
            style={{ backgroundColor: cam.color }}
          >
            {cam.name}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/** Rear-view sports car — looks like a real voiture from behind. */
function CarSprite({ kart, hero }: { kart: KartRacer; hero: boolean }) {
  const boosting = Date.now() < kart.boostUntil;
  const stunned = Date.now() < kart.stunUntil;
  const body = kart.color;
  const dark = shade(body, -35);
  const light = shade(body, 40);

  return (
    <g opacity={stunned ? 0.55 : 1}>
      {boosting ? (
        <>
          <ellipse cx="-0.35" cy="0.95" rx="0.28" ry="0.35" fill="#FFE566" opacity="0.9" />
          <ellipse cx="0.35" cy="0.95" rx="0.28" ry="0.35" fill="#FF8A3D" opacity="0.85" />
        </>
      ) : null}
      {kart.driftCharge > 0.25 ? (
        <>
          <ellipse cx="-0.85" cy="0.75" rx="0.22" ry="0.12" fill="#FFE566" opacity="0.9" />
          <ellipse cx="0.85" cy="0.75" rx="0.22" ry="0.12" fill="#FFE566" opacity="0.9" />
        </>
      ) : null}

      {/* Shadow */}
      <ellipse cx="0" cy="1.05" rx="1.05" ry="0.22" fill="#000" opacity="0.25" />

      {/* Rear bumper / body */}
      <path
        d="M-1.05 0.55 Q-1.1 0.1 -0.85 -0.15 L-0.45 -0.45 Q0 -0.55 0.45 -0.45 L0.85 -0.15 Q1.1 0.1 1.05 0.55 L0.9 0.85 Q0 1.05 -0.9 0.85 Z"
        fill={body}
        stroke="#1a1a1a"
        strokeWidth="0.08"
      />
      {/* Roof */}
      <path
        d="M-0.55 -0.05 Q0 -0.7 0.55 -0.05 L0.4 0.25 Q0 0.15 -0.4 0.25 Z"
        fill={dark}
        stroke="#1a1a1a"
        strokeWidth="0.07"
      />
      {/* Rear windshield */}
      <path
        d="M-0.42 0.05 Q0 -0.45 0.42 0.05 L0.32 0.28 Q0 0.18 -0.32 0.28 Z"
        fill="#9AD4FF"
        stroke="#1a1a1a"
        strokeWidth="0.05"
        opacity="0.95"
      />
      {/* Spoiler */}
      <rect
        x={-0.7}
        y={-0.22}
        width="1.4"
        height="0.16"
        rx="0.05"
        fill={dark}
        stroke="#1a1a1a"
        strokeWidth="0.05"
      />
      <rect
        x={-0.55}
        y={-0.38}
        width="0.12"
        height="0.22"
        fill={light}
        stroke="#1a1a1a"
        strokeWidth="0.04"
      />
      <rect
        x={0.43}
        y={-0.38}
        width="0.12"
        height="0.22"
        fill={light}
        stroke="#1a1a1a"
        strokeWidth="0.04"
      />

      {/* Tail lights */}
      <rect
        x={-0.95}
        y={0.35}
        width="0.28"
        height="0.16"
        rx="0.04"
        fill="#FF3B4A"
        stroke="#1a1a1a"
        strokeWidth="0.04"
      />
      <rect
        x={0.67}
        y={0.35}
        width="0.28"
        height="0.16"
        rx="0.04"
        fill="#FF3B4A"
        stroke="#1a1a1a"
        strokeWidth="0.04"
      />

      {/* Exhaust */}
      <rect
        x={-0.2}
        y={0.78}
        width="0.14"
        height="0.1"
        rx="0.03"
        fill="#333"
        stroke="#1a1a1a"
        strokeWidth="0.03"
      />
      <rect
        x={0.06}
        y={0.78}
        width="0.14"
        height="0.1"
        rx="0.03"
        fill="#333"
        stroke="#1a1a1a"
        strokeWidth="0.03"
      />

      {/* Wheels */}
      <rect x={-1.15} y={0.45} width="0.28" height="0.42" rx="0.08" fill="#1a1a1a" />
      <rect x={0.87} y={0.45} width="0.28" height="0.42" rx="0.08" fill="#1a1a1a" />
      <rect x={-1.1} y={0.52} width="0.18" height="0.28" rx="0.04" fill="#555" />
      <rect x={0.92} y={0.52} width="0.18" height="0.28" rx="0.04" fill="#555" />

      {/* Plate / number */}
      <rect
        x={-0.28}
        y={0.48}
        width="0.56"
        height="0.2"
        rx="0.04"
        fill="#f8fbff"
        stroke="#1a1a1a"
        strokeWidth="0.04"
      />
      <text
        y="0.64"
        textAnchor="middle"
        fontSize="0.16"
        fill="#1a1a1a"
        style={{ fontFamily: "system-ui", fontWeight: 800 }}
      >
        {kart.name.slice(0, 3).toUpperCase()}
      </text>

      {hero ? (
        <text
          y="-0.95"
          textAnchor="middle"
          fontSize="0.42"
          fill="#fff"
          stroke="#1a1a1a"
          strokeWidth="0.05"
          style={{ fontFamily: "system-ui", fontWeight: 800 }}
        >
          YOU
        </text>
      ) : (
        <text
          y="-0.85"
          textAnchor="middle"
          fontSize="0.36"
          fill="#fff"
          stroke="#1a1a1a"
          strokeWidth="0.04"
          style={{ fontFamily: "system-ui", fontWeight: 700 }}
        >
          {kart.name.slice(0, 8)}
        </text>
      )}
    </g>
  );
}

function ObstacleSprite({ kind }: { kind: ObstacleKind }) {
  if (kind === "cone") {
    return (
      <g>
        <polygon
          points="0,-1.1 -0.55,0.7 0.55,0.7"
          fill="#FF8A3D"
          stroke="#1a1a1a"
          strokeWidth="0.08"
        />
        <rect x={-0.35} y={-0.15} width="0.7" height="0.18" fill="#f8fbff" />
        <ellipse cx="0" cy="0.75" rx="0.55" ry="0.12" fill="#1a1a1a" opacity="0.25" />
      </g>
    );
  }
  if (kind === "rock") {
    return (
      <g>
        <path
          d="M-0.7 0.4 Q-0.8 -0.3 -0.2 -0.7 Q0.3 -0.9 0.75 -0.35 Q0.95 0.2 0.55 0.55 Q0 0.75 -0.7 0.4 Z"
          fill="#8B8680"
          stroke="#1a1a1a"
          strokeWidth="0.08"
        />
        <path d="M-0.3 -0.2 Q0 -0.45 0.35 -0.1" fill="none" stroke="#c4c0ba" strokeWidth="0.08" />
        <ellipse cx="0" cy="0.7" rx="0.7" ry="0.14" fill="#1a1a1a" opacity="0.25" />
      </g>
    );
  }
  if (kind === "barrier") {
    return (
      <g>
        <rect
          x={-1.1}
          y={-0.35}
          width="2.2"
          height="0.85"
          rx="0.1"
          fill="#FF6B7A"
          stroke="#1a1a1a"
          strokeWidth="0.08"
        />
        <rect x={-1.1} y={-0.05} width="2.2" height="0.25" fill="#f8fbff" />
        <rect
          x={-0.95}
          y={0.5}
          width="0.2"
          height="0.35"
          fill="#666"
          stroke="#1a1a1a"
          strokeWidth="0.04"
        />
        <rect
          x={0.75}
          y={0.5}
          width="0.2"
          height="0.35"
          fill="#666"
          stroke="#1a1a1a"
          strokeWidth="0.04"
        />
        <ellipse cx="0" cy="0.85" rx="1" ry="0.12" fill="#1a1a1a" opacity="0.22" />
      </g>
    );
  }
  // oil
  return (
    <g>
      <ellipse cx="0" cy="0.1" rx="1.1" ry="0.45" fill="#1a1a1a" opacity="0.75" />
      <ellipse cx="-0.2" cy="0" rx="0.35" ry="0.12" fill="#4EA1FF" opacity="0.45" />
      <ellipse cx="0.3" cy="0.15" rx="0.25" ry="0.1" fill="#86E3C2" opacity="0.35" />
    </g>
  );
}

function shade(hex: string, amount: number): string {
  const raw = hex.replace("#", "");
  const num = Number.parseInt(raw.length === 3 ? raw.replace(/(.)/g, "$1$1") : raw, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 255) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 255) + amount));
  const b = Math.min(255, Math.max(0, (num & 255) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function project(
  x: number,
  z: number,
  camX: number,
  camZ: number,
  isCameraKart = false,
): { x: number; y: number; scale: number } | null {
  const dz = z - camZ;
  if (isCameraKart) {
    return {
      x: 0.5 + (x - camX) * 0.2,
      y: 0.78,
      scale: 0.14,
    };
  }
  if (dz < -0.8 || dz > 16) {
    return null;
  }
  const depth = Math.max(0.35, dz + 1.1);
  const t = 1 - 1 / (1 + depth * 0.55);
  const y = 0.4 + t * 0.52;
  const roadHalf = 0.04 + t * 0.55;
  const screenX = 0.5 + ((x - camX) / 2) * roadHalf * 2.2;
  const scale = Math.max(0.025, 0.16 / depth);
  return { x: screenX, y, scale };
}
