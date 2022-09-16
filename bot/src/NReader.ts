import { NReaderClient } from "nreader-framework/lib";
import * as Config from "../../config/config.json";

const client = new NReaderClient({
    auth: Config.BOT.TOKEN,
    gateway: {
        intents: ["GUILDS"],
        maxShards: "auto"
    },
    defaultImageFormat: "png"
})

client.config = Config;
client.initialiseEverything();
