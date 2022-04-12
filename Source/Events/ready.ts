"use strict";

import { Event } from "../Interfaces";
import Logger from "../Extensions/logger";

export const event: Event = {
    name: "ready",
    run: async (client) => {
        Logger.success("DISCORD", `${client.user.username}#${client.user.discriminator} Has Connected!`);

        const guilds = client.guilds.map((guild) => guild.id);

        for (let i = 0; i < guilds.length; i++) {
            const guildHasDB: boolean = await client.database.fetch(`Database.${guilds[i]}`);

            if (!guildHasDB) {
                client.database.set(`Database.${guilds[i]}`, {
                    Language: "ENGLISH",
                    Prefix: "n;",
                    ReadState: "current"
                });
            }
        }
    }
};
