import { CommandInteraction, TextChannel } from "oceanic.js";
import { NReaderEvent, NReaderInterface } from "nreader-framework/lib";

export const event: NReaderInterface.IEvent = {
    name: "interactionCreate",
    run: (client, interaction: CommandInteraction<TextChannel>) => {
    return new NReaderEvent<CommandInteraction<TextChannel>, any, any, any>(client, interaction).interactionCreateEvent();
    }
};
