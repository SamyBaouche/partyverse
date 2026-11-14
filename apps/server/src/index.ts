import { loadConfig } from "./config.js";
import { buildApp } from "./app.js";

const config = loadConfig();

const { app } = await buildApp({
  webPubSub: {
    connectionString: config.WEBPUBSUB_CONNECTION_STRING,
    hub: config.WEBPUBSUB_HUB,
  },
});

try {
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
