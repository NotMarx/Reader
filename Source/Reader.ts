"use strict";

import Reader from "./Extensions/client";
import { Dashboard } from "../Dashboard/Dashboard";
import { TOKEN } from "./Interfaces/config.json";

const client = new Reader(`Bot ${TOKEN}`, {
    defaultImageFormat: "png",
    defaultImageSize: 512,
    intents: [
        "guilds",
        "guildMessages"
    ],
    maxShards: "auto",
    messageLimit: 75
});

// Initialize the bot
client.init();
client.setMaxListeners(Infinity);
Dashboard(client);
