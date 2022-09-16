import { NReaderClient } from "nreader-framework/lib";
import * as Config from "../../config/config.json";

const client = new NReaderClient({
    auth: Config.BOT.TOKEN,
    defaultImageFormat: "png",
    gateway: {
        intents: ["GUILDS"],
        maxShards: "auto"
    }
});

client.config = Config;
client.initialiseEverything();
