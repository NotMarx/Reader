import { ReaderEvent, ReaderInterface } from "reader-framework";
import { Guild } from "eris";

export const event: ReaderInterface.IEvent = {
    name: "guildCreate",
    run: async (client, guild: Guild) => {
        return new ReaderEvent<Guild, any, any, any>(client, guild).guildCreateEvent();
    }
}
