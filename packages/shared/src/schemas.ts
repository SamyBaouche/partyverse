import { z } from "zod";

// ---------- Briques de base ----------
export const RoomCode = z.string().regex(/^[A-Z]{4}$/, "Code à 4 lettres majuscules");
export const PlayerName = z.string().trim().min(1).max(16);
export const PlayerId = z.string().min(1).max(64);

export const Phase = z.enum(["lobby", "drawing", "reveal", "scores"]);

// Coordonnées normalisées : 0 = bord gauche/haut, 1 = bord droit/bas
export const Point = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

export const Stroke = z.object({
  points: z.array(Point).min(1).max(500),
});

export const Player = z.object({
  id: PlayerId,
  name: PlayerName,
  score: z.number().int().min(0),
});

// ---------- Téléphone / télé → serveur ----------
export const ClientMessage = z.discriminatedUnion("type", [
  z.object({ type: z.literal("join"), code: RoomCode, name: PlayerName }),
  z.object({ type: z.literal("startGame") }),
  z.object({ type: z.literal("drawStroke"), stroke: Stroke }),
  z.object({ type: z.literal("clearCanvas") }),
  z.object({ type: z.literal("guess"), text: z.string().trim().min(1).max(50) }),
]);

// ---------- Serveur → téléphones / télé ----------
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

// ---------- Types TypeScript générés automatiquement ----------
export type RoomCode = z.infer<typeof RoomCode>;
export type Phase = z.infer<typeof Phase>;
export type Point = z.infer<typeof Point>;
export type Stroke = z.infer<typeof Stroke>;
export type Player = z.infer<typeof Player>;
export type ClientMessage = z.infer<typeof ClientMessage>;
export type ServerMessage = z.infer<typeof ServerMessage>;
