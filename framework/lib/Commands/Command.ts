import { CommandInteraction, TextChannel } from "oceanic.js";
import { NReaderClient } from "../Client";
import { ICommandRunPayload } from "../Interfaces";
import * as CommandModules from "./Modules";

export class NReaderCommand {
    /**
   * NReader client
   */
    private client: NReaderClient;

    /**
   * Oceanic command interaction
   */
    private interaction: CommandInteraction<TextChannel>;

    constructor(payload: ICommandRunPayload) {
        this.client = payload.client;
        this.interaction = payload.interaction;
    }

    /**
   * Executes a `bookmark` command
   * @returns {Promise<void>}
   */
    public bookmarkCommand() {
        return CommandModules.bookmarkCommand(this.client, this.interaction);
    }

    /**
   * Executes a `config` command
   * @returns {Promise<void>}
   */
    public configCommand() {
        return CommandModules.configCommand(this.client, this.interaction);
    }

    /**
   * Executes a `help` command
   * @returns {Promise<void>}
   */
    public helpCommand() {
        return CommandModules.helpCommand(this.client, this.interaction);
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

    /**
   * Executes a `stats` command
   * @returns {Promise<void>}
   */
    public statsCommand() {
        return CommandModules.statsCommand(this.client, this.interaction);
    }
}
