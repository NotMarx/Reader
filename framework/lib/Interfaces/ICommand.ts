import { ReaderClient } from "../Client";
import { ApplicationCommandTypes, ApplicationCommandOption, CommandInteraction, TextableChannel } from "eris";

export interface ICommandRunPayload {
    client: ReaderClient;
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
    options?: ApplicationCommandOption<3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>[];
    run: ICommandRun;
    type: ApplicationCommandTypes;
}
