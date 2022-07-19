import { CommandInteraction, TextableChannel } from "eris";
import { ReaderClient } from "../Client";
import { ICommandRunPayload } from "../Interfaces";
import * as CommandModules from "./Modules";

export class ReaderCommand {

    /**
     * Reader client
     */
    private client: ReaderClient;

    /**
     * Eris command interaction
     */
    private interaction: CommandInteraction<TextableChannel>;

    constructor(payload: ICommandRunPayload) {
        this.client = payload.client;
        this.interaction = payload.interaction;
    }

    /**
     * Executes a `config` command
     * @returns {Promise<void>}
     */
    public configCommand() {
        return CommandModules.configCommand(this.client, this.interaction);
    }

    /**
     * Executes a `ping` command
     * @returns  {Promise<void>}
     */
    public pingCommand() {
        return CommandModules.pingCommand(this.client, this.interaction);
    }

    /**
     * Executes a `read` command
     * @returns {Promise<void>}
     */
    public readCommand() {
        return CommandModules.readCommand(this.client, this.interaction);
    }

    /**
     * Executes a `search` command
     * @returns {Promise<void>}
     */
    public searchCommand() {
        return CommandModules.searchCommand(this.client, this.interaction);
    }

    /**
     * Executes a `search-similar` command
     * @returns {Promise<void>}
     */
    public searchSimilarCommand() {
        return CommandModules.searchSimilarCommand(this.client, this.interaction);
    }
}
