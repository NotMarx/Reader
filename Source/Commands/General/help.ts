"use strict";

import { Command } from "../../Interfaces";
import { EmbedOptions } from "eris";

export const command: Command = {
    name: "help",
    description: "Help Menu",
    aliases: ["helpme"],
    category: "General",
    usage: "help <command_name>",
    run: async (client, message, args) => {
        const prefix: string = client.database.fetch(`Database.${message.guildID}.Prefix`) || client.config.PREFIX;
        const command = client.commands.get(args[0]) || client.aliases.get(args[0]);

        if (args[0]) {
            if (!command) return;

            const adminOnly: "`True`" | "`False`" = command.adminOnly ? "`True`" : "`False`";
            const aliases: string = command.aliases ? `\`${command.aliases.join("`, `")}\`` : "No Aliases";
            const category: string = command.category ? `\`${command.category}\`` : "No Category";
            const description: string = command.description ? command.description : "No Description";
            const name: string = command.name;
            const nsfwOnly: "`True`" | "`False`" = command.nsfwOnly ? "`True`" : "`False`";
            const usage: string = command.usage ? `\`${prefix}${command.usage}\`` : "No Usage`"

            const helpEmbed: EmbedOptions = {
                title: `${prefix}${name}`,
                description: description,
                fields: [
                    {
                        name: "Aliases",
                        value: aliases,
                        inline: true,
                    },
                    {
                        name: "Category",
                        value: category,
                        inline: true
                    },
                    {
                        name: "\u200b",
                        value: "\u200b",
                        inline: false
                    },
                    {
                        name: "Usage",
                        value: usage,
                        inline: true
                    },
                    {
                        name: "\u200b",
                        value: "\u200b",
                        inline: false
                    },
                    {
                        name: "Admin Only",
                        value: adminOnly,
                        inline: true
                    },
                    {
                        name: "NSFW Only",
                        value: nsfwOnly,
                        inline: true
                    }
                ],
                color: client.config.COLOUR,
                thumbnail: {
                    url: client.user.avatarURL
                },
                timestamp: new Date().toISOString(),
                footer: {
                    text: "Made by reinhardt"
                }
            };

            message.channel.createMessage({ embeds: [helpEmbed], messageReference: { messageID: message.id }});
        }
    }
}
