"use strict";

import { Event } from "../Interfaces";
import { Guild } from "eris";
import Logger from "../Extensions/logger";

export const event: Event = {
    name: "guildCreate",
    run: async (client, guild: Guild) => {
        Logger.system("JOINED GUILD", `Connected To Guild: ${guild.name} (${guild.id}) | Total Guilds: ${client.guilds.size}`);
    }
}