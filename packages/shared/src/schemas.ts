import { z } from "zod";

// ---------- Building blocks ----------
export const RoomCode = z.string().regex(/^[A-Z]{4}$/, "Room code must be 4 uppercase letters");
export const PlayerName = z.string().trim().min(1).max(16);
export const PlayerId = z.string().min(1).max(64);

export const Phase = z.enum(["lobby", "drawing", "reveal", "scores"]);

export const RoomErrorCode = z.enum([
  "INVALID_INPUT",
  "ROOM_NOT_FOUND",
  "ROOM_FULL",
  "GAME_STARTED",
  "NAME_TAKEN",
  "NOT_HOST",
  "PLAYER_NOT_FOUND",
]);

// Normalized coordinates: 0 = left/top edge, 1 = right/bottom edge
export const Point = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

/** Hex color used for ink strokes (e.g. "#FF5A6A"). */
export const StrokeColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Stroke color must be a #RRGGBB hex value");

export const Stroke = z.object({
  id: z.string().min(1).max(64),
  /** Ink color for this stroke. Defaults to near-white for older clients. */
  color: StrokeColor.default("#F8FBFF"),
  points: z.array(Point).min(1).max(500),
});

export const Player = z.object({
  id: PlayerId,
  name: PlayerName,
  score: z.number().int().min(0),
});

// ---------- Phone / TV → server ----------
export const ClientMessage = z.discriminatedUnion("type", [
  z.object({ type: z.literal("join"), code: RoomCode, name: PlayerName }),
  z.object({ type: z.literal("startGame") }),
  z.object({ type: z.literal("drawStroke"), stroke: Stroke }),
  z.object({ type: z.literal("clearCanvas") }),
  z.object({ type: z.literal("guess"), text: z.string().trim().min(1).max(50) }),
]);

// ---------- Server → phones / TV ----------
export const ServerMessage = z.discriminatedUnion("type", [
  z.object({ type: z.literal("playerJoined"), player: Player }),
  z.object({ type: z.literal("playerLeft"), playerId: PlayerId }),
  z.object({ type: z.literal("phaseChanged"), phase: Phase, round: z.number().int().min(0) }),
  z.object({ type: z.literal("strokeDrawn"), stroke: Stroke }),
  z.object({ type: z.literal("canvasCleared") }),
  z.object({ type: z.literal("guessResult"), playerId: PlayerId, correct: z.boolean() }),
  z.object({ type: z.literal("scoresUpdated"), players: z.array(Player) }),
  z.object({ type: z.literal("error"), message: z.string() }),
]);

// ---------- TypeScript types inferred from schemas ----------
export type RoomCode = z.infer<typeof RoomCode>;
export type Phase = z.infer<typeof Phase>;
export type RoomErrorCode = z.infer<typeof RoomErrorCode>;
export type Point = z.infer<typeof Point>;
export type StrokeColor = z.infer<typeof StrokeColor>;
export type Stroke = z.infer<typeof Stroke>;
export type Player = z.infer<typeof Player>;
export type ClientMessage = z.infer<typeof ClientMessage>;
export type ServerMessage = z.infer<typeof ServerMessage>;
