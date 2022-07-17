import { ReaderClient } from "reader-framework";
import * as Config from "../../config/config.json";

const client = new ReaderClient(Config.BOT.TOKEN, {
    intents: [
        "guilds",
        "guildMessages",
        "guildMembers"
    ],
    maxShards: "auto"
});

client.config = Config;
client.initialiseEverything();
