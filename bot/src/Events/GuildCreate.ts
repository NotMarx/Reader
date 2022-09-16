import { NReaderEvent, NReaderInterface } from "nreader-framework/lib";
import { Guild } from "oceanic.js";

export const event: NReaderInterface.IEvent = {
    name: "guildCreate",
    run: async (client, guild: Guild) => {
        return new NReaderEvent<Guild, any, any, any>(client, guild).guildCreateEvent();
    }
};
