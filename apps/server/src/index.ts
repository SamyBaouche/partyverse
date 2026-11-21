import { loadConfig } from "./config.js";
import { buildApp } from "./app.js";
import { createCosmosRoomStore } from "./persist/cosmosRoomStore.js";

const config = loadConfig();

const roomStore = config.COSMOS_CONNECTION_STRING
  ? await createCosmosRoomStore({ connectionString: config.COSMOS_CONNECTION_STRING })
  : undefined;

const { app } = await buildApp({
  webPubSub: {
    connectionString: config.WEBPUBSUB_CONNECTION_STRING,
    hub: config.WEBPUBSUB_HUB,
  },
  roomStore,
});

try {
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  if (roomStore) {
    app.log.info("Cosmos room store enabled");
  }
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
