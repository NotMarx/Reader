"use strict";

import { Client, TextableChannel } from "eris";
import Collection from "./collection";
import { Command, Config, Event } from "../Interfaces";
import ConfigJSON from "../Interfaces/config.json";
import { Database } from "xen.db";
import { MessageCollector, MessageCollectorOptions } from "../Extensions/collector";
import path from "path";
import { MongoDatabase } from "./database";
import { readdirSync } from "fs";

export default class Reader extends Client {
    public aliases: Collection<Command> = new Collection();
    public commands: Collection<Command> = new Collection();
    public config: Config = ConfigJSON;
    public events: Map<string, Event> = new Map();
    public database: Database = new Database("Database/ReaderBase.sql", { path: "Database", table: "READER", useWalMode: false });
    public db = new MongoDatabase(ConfigJSON.MONGODB_URI).init();

    /**
     * Initalize the bot
     */
    public async init(): Promise<void> {
        /* Connect the bot */
        this.connect();

        /* Commands Section */
        const commandPath: string = path.join(__dirname, "..", "Commands");
        
        readdirSync(commandPath).forEach((dir) => {
            const commands: string[] = readdirSync(`${commandPath}/${dir}`).filter((file) => file.endsWith(".ts"));

            for (const file of commands) {
                const { command } = require(`${commandPath}/${dir}/${file}`);
                this.commands.set(command.name, command);

                if (command.aliases.length !== 0) {
                    command.aliases.forEach((alias) => {
                        this.aliases.set(alias, command);
                    });
                }
            }
        });

        /* Events Section */
        const eventPath: string = path.join(__dirname, "..", "Events");
        readdirSync(eventPath).forEach( async (file) => {
            const { event } = await import(`${eventPath}/${file}`);
            this.events.set(event.name, event);
            this.on(event.name, event.run.bind(null, this));
        });
    }

    public awaitChannelMessages(channel: TextableChannel, options: MessageCollectorOptions) {
        return new MessageCollector(channel, options).run();
    }
}
