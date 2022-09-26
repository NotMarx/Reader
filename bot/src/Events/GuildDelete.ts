import { NReaderEvent, NReaderInterface, NReaderOceanic } from "nreader-framework/lib";

export const event: NReaderInterface.IEvent = {
    name: "guildDelete",
    run: async (client, guild: NReaderOceanic.Guild) => {
        return new NReaderEvent<NReaderOceanic.Guild, any, any, any>(client, guild).guildDeleteEvent();
    }
};
