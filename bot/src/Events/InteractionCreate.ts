import { NReaderEvent, NReaderInterface, NReaderOceanic } from "nreader-framework/lib";

export const event: NReaderInterface.IEvent = {
    name: "interactionCreate",
    run: (client, interaction: NReaderOceanic.CommandInteraction<NReaderOceanic.TextChannel>) => {
    return new NReaderEvent<NReaderOceanic.CommandInteraction<NReaderOceanic.TextChannel>, any, any, any>(client, interaction).interactionCreateEvent();
    }
};
