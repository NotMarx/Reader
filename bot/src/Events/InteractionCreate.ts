import { CommandInteraction, TextableChannel } from "eris";
import { NReaderEvent, NReaderInterface } from "nreader-framework";

export const event: NReaderInterface.IEvent = {
    name: "interactionCreate",
    run: (client, interaction: CommandInteraction<TextableChannel>) => {
    return new NReaderEvent<CommandInteraction<TextableChannel>, any, any, any>(client, interaction).interactionCreateEvent();
    }
}
