"use strict";

import { Event } from "../Interfaces";

export const event: Event = {
    name: "ready",
    run: async (client) => {
        client.logger.system({ message: `${client.user.username}#${client.user.discriminator} Has Connected`, subTitle: "Reader::Gateway::Ready", title: "CLIENT" });

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
