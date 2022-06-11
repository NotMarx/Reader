"use strict";

import { Event } from "../Interfaces";
import { Guild } from "eris";

export const event: Event = {
    name: "guildCreate",
    run: async (client, guild: Guild) => {
        client.logger.info({ message: `Connected to Guild: ${guild.name} (${guild.id})`, subTitle: "Reader::Gateway::GuildCreate", title: `SHARD ${guild.shard.id ?? "N/A"}` });

        const guildHasDB: boolean = await client.database.fetch(`Database.${guild.id}`);

        if (!guildHasDB) {
            client.database.set(`Database.${guild.id}`, {
                Language: "ENGLISH",
                Prefix: "n;",
                ReadState: "current"
            });
        }
    }
};
