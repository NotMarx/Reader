import { NReaderEvent, NReaderInterface } from "nreader-framework/lib";
import { Guild } from "oceanic.js";

export const event: NReaderInterface.IEvent = {
    name: "guildDelete",
    run: async (client, guild: Guild) => {
        return new NReaderEvent<Guild, any, any, any>(client, guild).guildDeleteEvent();
    }
};
