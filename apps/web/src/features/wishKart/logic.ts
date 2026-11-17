export type KartColor = "#FF6B7A" | "#4EA1FF" | "#FFE566" | "#86E3C2";

export const KART_COLORS: KartColor[] = ["#FF6B7A", "#4EA1FF", "#FFE566", "#86E3C2"];

export type KartItem = "mushroom" | "banana" | "shell" | null;

export type KartInput = {
  steer: number; // -1 .. 1
  gas: boolean;
  brake: boolean;
  drift: boolean;
  useItem: boolean;
};

export type KartRacer = {
  id: string;
  name: string;
  color: KartColor;
  isBot: boolean;
  /** Lane position −1 (left) … 1 (right). */
  x: number;
  /** Distance along the forward track. */
  z: number;
  speed: number;
  driftCharge: number;
  boostUntil: number;
  stunUntil: number;
  item: KartItem;
  input: KartInput;
  finishedAt: number | null;
};

export type TrackHazard = {
  id: string;
  kind: "banana" | "shell";
  x: number;
  z: number;
  /** Shells fly forward. */
  vz: number;
};

export type ObstacleKind = "cone" | "rock" | "barrier" | "oil";

export type TrackObstacle = {
  id: string;
  kind: ObstacleKind;
  x: number;
  z: number;
  /** Hit radius in lane units. */
  radius: number;
};

export type ItemBox = {
  id: string;
  x: number;
  z: number;
  respawnAt: number;
};

export type WishKartState = {
  players: KartRacer[];
  hazards: TrackHazard[];
  obstacles: TrackObstacle[];
  boxes: ItemBox[];
  status: "lobby" | "countdown" | "racing" | "finished";
  /** Finish line distance. */
  finishZ: number;
  countdownEndsAt: number;
  winnerId: string | null;
  tick: number;
  raceStartedAt: number;
};

/** Forward track: drive +Z toward the finish. */
export const TRACK = {
  halfWidth: 1,
  finishZ: 12,
} as const;

const MAX_SPEED = 0.055;
const BOOST_SPEED = 0.09;
const ACCEL = 0.0032;
const BRAKE = 0.006;
const FRICTION = 0.965;
const STEER_RATE = 0.07;
const DRIFT_STEER = 0.11;
const BOT_NAMES = ["CPU Peach", "CPU Luigi", "CPU Toad", "CPU Yoshi"];

export function createWishKartLobby(): WishKartState {
  return {
    players: fillWithBots([]),
    hazards: [],
    obstacles: createObstacles(),
    boxes: createItemBoxes(),
    status: "lobby",
    finishZ: TRACK.finishZ,
    countdownEndsAt: 0,
    winnerId: null,
    tick: 0,
    raceStartedAt: 0,
  };
}

export function joinKart(state: WishKartState, id: string, name: string): WishKartState {
  if (state.status !== "lobby") {
    return state;
  }
  if (state.players.some((p) => p.id === id)) {
    return state;
  }
  const humans = state.players.filter((p) => !p.isBot);
  if (humans.length >= 4) {
    return state;
  }
  const withoutExtraBots = state.players.filter((p) => !p.isBot);
  const nextPlayers = [...withoutExtraBots, makeRacer(id, name, withoutExtraBots.length, false)];
  return { ...state, players: fillWithBots(nextPlayers) };
}

export function leaveKart(state: WishKartState, id: string): WishKartState {
  const next = state.players.filter((p) => p.id !== id);
  return {
    ...state,
    players: state.status === "lobby" ? fillWithBots(next.filter((p) => !p.isBot)) : next,
  };
}

export function setKartInput(
  state: WishKartState,
  id: string,
  input: Partial<KartInput>,
): WishKartState {
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === id
        ? {
            ...p,
            input: {
              steer: clamp(input.steer ?? p.input.steer, -1, 1),
              gas: input.gas ?? p.input.gas,
              brake: input.brake ?? p.input.brake,
              drift: input.drift ?? p.input.drift,
              useItem: input.useItem ?? p.input.useItem,
            },
          }
        : p,
    ),
  };
}

/** Host keeps physics; remote phones only contribute inputs. */
export function mergeKartRemote(local: WishKartState, remote: WishKartState): WishKartState {
  if (local.status === "lobby" || remote.status === "lobby") {
    return remote;
  }
  if (remote.tick > local.tick) {
    return remote;
  }
  return {
    ...local,
    players: local.players.map((p) => {
      const other = remote.players.find((r) => r.id === p.id);
      return other && !p.isBot ? { ...p, input: other.input } : p;
    }),
  };
}

export function startCountdown(state: WishKartState, now = Date.now()): WishKartState {
  const roster = state.players.length > 0 ? state.players : fillWithBots([]);
  return {
    ...state,
    players: roster.map((p, index) => ({
      ...p,
      ...spawnPose(index),
      speed: 0,
      driftCharge: 0,
      boostUntil: 0,
      stunUntil: 0,
      item: null,
      finishedAt: null,
      input: emptyInput(),
    })),
    hazards: [],
    obstacles: createObstacles(),
    boxes: createItemBoxes(),
    status: "countdown",
    countdownEndsAt: now + 3000,
    winnerId: null,
    raceStartedAt: 0,
  };
}

export function rematchKart(state: WishKartState, now = Date.now()): WishKartState {
  return startCountdown(
    {
      ...state,
      players: state.players.map((p) => ({ ...p, input: emptyInput() })),
    },
    now,
  );
}

export function stepRace(state: WishKartState, now = Date.now()): WishKartState {
  if (state.status === "countdown" && now >= state.countdownEndsAt) {
    return stepRace(
      {
        ...state,
        status: "racing",
        raceStartedAt: now,
      },
      now,
    );
  }
  if (state.status !== "racing") {
    return state;
  }

  let hazards = state.hazards
    .map((h) => (h.kind === "shell" ? { ...h, z: h.z + h.vz } : h))
    .filter((h) => h.z < state.finishZ + 2);

  let boxes = state.boxes.map((box) =>
    box.respawnAt > 0 && now >= box.respawnAt ? { ...box, respawnAt: 0 } : box,
  );

  const withBotInput = state.players.map((racer) =>
    racer.isBot ? { ...racer, input: botInput(racer) } : racer,
  );

  const stepped: KartRacer[] = [];
  for (const racer of withBotInput) {
    const result = integrate(racer, state.finishZ, now, hazards, boxes, state.obstacles ?? []);
    hazards = result.hazards;
    boxes = result.boxes;
    stepped.push(result.racer);
  }

  // Soft bumper between karts (same stretch).
  for (let i = 0; i < stepped.length; i++) {
    for (let j = i + 1; j < stepped.length; j++) {
      const a = stepped[i];
      const b = stepped[j];
      if (!a || !b) {
        continue;
      }
      const dz = Math.abs(a.z - b.z);
      const dx = Math.abs(a.x - b.x);
      if (dz < 0.35 && dx < 0.35) {
        const push = 0.04;
        if (a.z >= b.z) {
          stepped[i] = { ...a, z: a.z + push * 0.3, speed: a.speed * 0.9 };
          stepped[j] = { ...b, z: b.z - push * 0.2, speed: b.speed * 0.85 };
        } else {
          stepped[j] = { ...b, z: b.z + push * 0.3, speed: b.speed * 0.9 };
          stepped[i] = { ...a, z: a.z - push * 0.2, speed: a.speed * 0.85 };
        }
        if (a.x < b.x) {
          stepped[i] = { ...stepped[i]!, x: clamp(a.x - 0.03, -TRACK.halfWidth, TRACK.halfWidth) };
          stepped[j] = { ...stepped[j]!, x: clamp(b.x + 0.03, -TRACK.halfWidth, TRACK.halfWidth) };
        }
      }
    }
  }

  // Shell hits.
  for (const shell of hazards.filter((h) => h.kind === "shell")) {
    for (let i = 0; i < stepped.length; i++) {
      const kart = stepped[i];
      if (!kart || kart.finishedAt) {
        continue;
      }
      if (shell.id.includes(kart.id)) {
        continue;
      }
      if (Math.abs(shell.z - kart.z) < 0.4 && Math.abs(shell.x - kart.x) < 0.35) {
        stepped[i] = {
          ...kart,
          stunUntil: now + 1100,
          speed: kart.speed * 0.12,
        };
        hazards = hazards.filter((h) => h.id !== shell.id);
        break;
      }
    }
  }

  const finished = stepped.filter((p) => p.finishedAt !== null);
  const winner =
    finished.length > 0
      ? [...finished].sort((a, b) => (a.finishedAt ?? 0) - (b.finishedAt ?? 0))[0]
      : null;

  return {
    ...state,
    players: stepped.map((p) => ({ ...p, input: { ...p.input, useItem: false } })),
    hazards,
    boxes,
    tick: state.tick + 1,
    status: winner ? "finished" : "racing",
    winnerId: winner?.id ?? state.winnerId,
  };
}

export function standingsOf(state: WishKartState): KartRacer[] {
  return [...state.players].sort((a, b) => {
    if ((a.finishedAt ?? Infinity) !== (b.finishedAt ?? Infinity)) {
      return (a.finishedAt ?? Infinity) - (b.finishedAt ?? Infinity);
    }
    return b.z - a.z;
  });
}

/** Camera follow target: lead human, else race leader. */
export function cameraTarget(state: WishKartState): KartRacer | null {
  const humans = state.players.filter((p) => !p.isBot && !p.finishedAt);
  if (humans.length > 0) {
    return [...humans].sort((a, b) => b.z - a.z)[0] ?? null;
  }
  return standingsOf(state)[0] ?? null;
}

export function emptyInput(): KartInput {
  return { steer: 0, gas: false, brake: false, drift: false, useItem: false };
}

function fillWithBots(humans: KartRacer[]): KartRacer[] {
  const list = [...humans];
  let botIndex = 0;
  while (list.length < 4) {
    const name = BOT_NAMES[botIndex] ?? `CPU ${botIndex + 1}`;
    list.push(makeRacer(`bot-${botIndex}`, name, list.length, true));
    botIndex += 1;
  }
  return list.slice(0, 4);
}

function makeRacer(id: string, name: string, index: number, isBot: boolean): KartRacer {
  return {
    id,
    name,
    color: KART_COLORS[index % KART_COLORS.length] ?? "#FF6B7A",
    isBot,
    ...spawnPose(index),
    speed: 0,
    driftCharge: 0,
    boostUntil: 0,
    stunUntil: 0,
    item: null,
    input: emptyInput(),
    finishedAt: null,
  };
}

function createItemBoxes(): ItemBox[] {
  const zs = [1.5, 3.2, 5, 6.8, 8.5, 10.2];
  const lanes = [-0.55, 0.55, -0.2, 0.35, -0.45, 0.15];
  return zs.map((z, index) => ({
    id: `box-${index}`,
    x: lanes[index] ?? 0,
    z,
    respawnAt: 0,
  }));
}

function createObstacles(): TrackObstacle[] {
  const layout: Array<{ kind: ObstacleKind; x: number; z: number; radius: number }> = [
    { kind: "cone", x: -0.35, z: 1.1, radius: 0.22 },
    { kind: "cone", x: -0.15, z: 1.25, radius: 0.22 },
    { kind: "rock", x: 0.55, z: 2.2, radius: 0.32 },
    { kind: "barrier", x: -0.65, z: 2.8, radius: 0.38 },
    { kind: "oil", x: 0.1, z: 3.6, radius: 0.4 },
    { kind: "cone", x: 0.4, z: 4.3, radius: 0.22 },
    { kind: "cone", x: 0.55, z: 4.45, radius: 0.22 },
    { kind: "rock", x: -0.5, z: 5.2, radius: 0.34 },
    { kind: "barrier", x: 0.7, z: 6.1, radius: 0.4 },
    { kind: "oil", x: -0.25, z: 6.9, radius: 0.42 },
    { kind: "rock", x: 0.2, z: 7.7, radius: 0.3 },
    { kind: "cone", x: -0.6, z: 8.3, radius: 0.22 },
    { kind: "cone", x: -0.4, z: 8.45, radius: 0.22 },
    { kind: "barrier", x: 0.0, z: 9.2, radius: 0.36 },
    { kind: "oil", x: 0.5, z: 9.9, radius: 0.4 },
    { kind: "rock", x: -0.3, z: 10.6, radius: 0.32 },
    { kind: "cone", x: 0.35, z: 11.2, radius: 0.22 },
  ];
  return layout.map((entry, index) => ({
    id: `obs-${index}`,
    ...entry,
  }));
}

function spawnPose(index: number): Pick<KartRacer, "x" | "z"> {
  const lanes = [-0.55, -0.18, 0.18, 0.55];
  return {
    x: lanes[index] ?? 0,
    z: -index * 0.35,
  };
}

function botInput(racer: KartRacer): KartInput {
  if (racer.finishedAt || Date.now() < racer.stunUntil) {
    return emptyInput();
  }
  // Weave, but prefer clearer lanes.
  const targetLane = Math.sin(racer.z * 0.55 + racer.id.length) * 0.5;
  const steer = clamp((targetLane - racer.x) * 2.4, -1, 1);
  const useItem =
    Boolean(racer.item) &&
    (racer.item === "mushroom" ||
      (racer.item === "shell" && Math.random() < 0.025) ||
      (racer.item === "banana" && Math.random() < 0.02));
  return {
    steer,
    gas: true,
    brake: false,
    drift: Math.abs(steer) > 0.55 && racer.speed > MAX_SPEED * 0.5,
    useItem,
  };
}

function integrate(
  racer: KartRacer,
  finishZ: number,
  now: number,
  hazards: TrackHazard[],
  boxes: ItemBox[],
  obstacles: TrackObstacle[],
): { racer: KartRacer; hazards: TrackHazard[]; boxes: ItemBox[] } {
  if (racer.finishedAt !== null) {
    return { racer, hazards, boxes };
  }

  let nextHazards = hazards;
  let nextBoxes = boxes;
  let { x, z, speed, driftCharge, boostUntil, stunUntil, item } = racer;

  const stunned = now < stunUntil;
  const boosting = now < boostUntil;
  const drifting =
    !stunned && racer.input.drift && racer.input.gas && Math.abs(racer.input.steer) > 0.35;

  if (stunned) {
    speed *= 0.88;
  } else if (racer.input.brake) {
    speed = Math.max(0, speed - BRAKE);
  } else if (racer.input.gas) {
    const max = boosting ? BOOST_SPEED : MAX_SPEED;
    speed = Math.min(max, speed + ACCEL);
  } else {
    speed *= FRICTION;
  }
  speed *= FRICTION;

  const steerRate = drifting ? DRIFT_STEER : STEER_RATE;
  x = clamp(
    x + racer.input.steer * steerRate * (0.4 + speed / MAX_SPEED),
    -TRACK.halfWidth,
    TRACK.halfWidth,
  );

  if (drifting) {
    driftCharge = Math.min(1, driftCharge + 0.04);
  } else if (driftCharge > 0.55 && racer.input.gas) {
    boostUntil = Math.max(boostUntil, now + 700 + driftCharge * 500);
    driftCharge = 0;
  } else {
    driftCharge = Math.max(0, driftCharge - 0.05);
  }

  // Off-road edges: slow down hard past ±0.85
  if (Math.abs(x) > 0.85) {
    speed *= 0.82;
  }

  z += speed;

  // Static circuit obstacles
  for (const obs of obstacles) {
    if (Math.abs(obs.z - z) < 0.4 && Math.abs(obs.x - x) < obs.radius) {
      if (obs.kind === "oil") {
        x = clamp(x + (Math.random() > 0.5 ? 0.35 : -0.35), -TRACK.halfWidth, TRACK.halfWidth);
        speed *= 0.55;
      } else {
        stunUntil = Math.max(stunUntil, now + (obs.kind === "barrier" ? 1000 : 700));
        speed *= obs.kind === "rock" ? 0.12 : 0.25;
        z = Math.max(z - 0.15, obs.z - 0.45);
        x = clamp(x + (x >= obs.x ? 0.2 : -0.2), -TRACK.halfWidth, TRACK.halfWidth);
      }
      break;
    }
  }

  // Banana hits
  for (const hazard of nextHazards) {
    if (hazard.kind !== "banana") {
      continue;
    }
    if (Math.abs(hazard.z - z) < 0.3 && Math.abs(hazard.x - x) < 0.28) {
      stunUntil = now + 900;
      speed *= 0.15;
      nextHazards = nextHazards.filter((h) => h.id !== hazard.id);
      break;
    }
  }

  // Item boxes
  nextBoxes = nextBoxes.map((box) => {
    if (box.respawnAt > 0) {
      return box;
    }
    if (Math.abs(box.z - z) < 0.35 && Math.abs(box.x - x) < 0.3 && !item) {
      item = rollItem();
      return { ...box, respawnAt: now + 3500 };
    }
    return box;
  });

  if (racer.input.useItem && item && !stunned) {
    if (item === "mushroom") {
      boostUntil = Math.max(boostUntil, now + 1100);
    } else if (item === "banana") {
      const peel: TrackHazard = {
        id: `banana-${racer.id}-${now}`,
        kind: "banana",
        x,
        z: z - 0.55,
        vz: 0,
      };
      nextHazards = [...nextHazards, peel].slice(-14);
    } else if (item === "shell") {
      const shell: TrackHazard = {
        id: `shell-${racer.id}-${now}`,
        kind: "shell",
        x,
        z: z + 0.5,
        vz: 0.18,
      };
      nextHazards = [...nextHazards, shell];
    }
    item = null;
  }

  const finishedAt = z >= finishZ ? now : null;
  return {
    racer: {
      ...racer,
      x,
      z,
      speed,
      driftCharge,
      boostUntil,
      stunUntil,
      item,
      finishedAt,
    },
    hazards: nextHazards,
    boxes: nextBoxes,
  };
}

function rollItem(): Exclude<KartItem, null> {
  const roll = Math.random();
  if (roll < 0.4) {
    return "mushroom";
  }
  if (roll < 0.75) {
    return "banana";
  }
  return "shell";
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
