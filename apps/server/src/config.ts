import { z } from "zod";

const EnvSchema = z.object({
  WEBPUBSUB_CONNECTION_STRING: z
    .string()
    .min(1, "WEBPUBSUB_CONNECTION_STRING is required (see apps/server/.env.example)"),
  WEBPUBSUB_HUB: z.string().min(1).default("partyverse"),
  PORT: z.coerce.number().int().positive().default(3000),
  /** Optional — enables durable room activity / reconnect across scale-to-zero (ADR 0012). */
  COSMOS_CONNECTION_STRING: z.string().optional().default(""),
});

export type ServerConfig = z.infer<typeof EnvSchema>;

/** Load and validate server env. Fails fast with a clear message if required values are missing. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => issue.message).join("; ");
    throw new Error(`Invalid server configuration: ${details}`);
  }
  return parsed.data;
}
