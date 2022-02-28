"use strict";

import Reader from "./Extensions/client";
import { TOKEN } from "./Interfaces/config.json";

const client = new Reader(`Bot ${TOKEN}`, {
    defaultImageFormat: "png",
    defaultImageSize: 512,
    intents: [
        "guilds",
        "guildMembers",
        "guildMessages",
        "directMessages"
    ],
    maxShards: "auto",
    messageLimit: 100
});

// Initialize the bot
client.init();
client.setMaxListeners(Infinity);
