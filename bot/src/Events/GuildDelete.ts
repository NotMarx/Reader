import { NReaderEvent, NReaderInterface } from "nreader-framework";
import { Guild } from "eris";

export const event: NReaderInterface.IEvent = {
    name: "guildDelete",
    run: async (client, guild: Guild) => {
        return new NReaderEvent<Guild, any, any, any>(client, guild).guildDeleteEvent();
    }
}
