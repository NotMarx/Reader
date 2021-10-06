"use strict";

import { Command } from "../../Interfaces";
import RichEmbed from "../../Extensions/embed";
import minimist from "minimist";

export const command: Command = {
    name: "reset",
    description: "Reset your Information status",
    aliases: ["reset-stats"],
    category: "Main",
    nsfwOnly: true,
    run: async (client, message, args) => {
        const flag = minimist(args.slice(0));

        if (flag.reading) {
            client.database.delete(`Database.${message.guildID}.${message.author.id}.Book`);
        }

        message.addReaction("✅")
    }
}
