import { NReaderClient } from "../Client";
import { ApplicationCommandTypes, ApplicationCommandOptions, CommandInteraction, TextableChannel } from "eris";

export interface ICommandRunPayload {
    client: NReaderClient;
    interaction: CommandInteraction<TextableChannel>;
}

export interface  ICommandRun {
    (payload: ICommandRunPayload);
}

export interface ICommand {
    adminOnly?: boolean;
    description?: string;
    guildModOnly?: boolean;
    guildOwnerOnly?: boolean;
    name: string;
    nsfwOnly?: boolean;
    options?: ApplicationCommandOptions[];
    run: ICommandRun;
    type: ApplicationCommandTypes;
}
