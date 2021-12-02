"use strict";

import { Event } from "../Interfaces";
import { Guild } from "eris";

export const event: Event = {
    name: "guildAvailable",
    run: async (client, guild: Guild) => {
        const guildSettings = client.db.findOne({ GuildID: guild.id });

        // Create a database if guild is first-time available
        if (!guildSettings) {
            client.db.create({
                GuildID: guild.id,
                Settings: {
                    Language: "ENGLISH",
                    Prefix: client.config.PREFIX
                }
            });
        }
    }
}