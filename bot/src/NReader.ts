import { NReaderClient } from "nreader-framework";
import * as Config from "../../config/config.json";

const client = new NReaderClient(Config.BOT.TOKEN, {
    defaultImageFormat: "png",
    intents: [
        "guilds",
        "guildMessages",
        "guildMembers"
    ],
    maxShards: "auto"
});

client.config = Config;
client.initialiseEverything();
