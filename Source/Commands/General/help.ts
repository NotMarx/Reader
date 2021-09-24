"use strict";

import Collection from "../../Extensions/collection";
import { Command } from "../../Interfaces";
import { EmbedOptions } from "eris";
import RichEmbed from "../../Extensions/embed";

export const command: Command = {
    name: "help",
    description: "Help Menu",
    aliases: ["helpme"],
    category: "General",
    usage: "help <command_name>",
    run: async (client, message, args) => {
        const prefix: string = client.database.fetch(`Database.${message.guildID}.Prefix`) || client.config.PREFIX;
        const command: Command = client.commands.get(args[0]) || client.aliases.get(args[0]);

        // If the first args (command name) is specified 
        if (args[0]) {
            if (!command) return;

            const adminOnly: "`True`" | "`False`" = command.adminOnly ? "`True`" : "`False`";
            const aliases: string = command.aliases ? `\`${command.aliases.join("`, `")}\`` : "No Aliases";
            const category: string = command.category ? `\`${command.category}\`` : "No Category";
            const description: string = command.description ? command.description : "No Description";
            const name: string = command.name;
            const nsfwOnly: "`True`" | "`False`" = command.nsfwOnly ? "`True`" : "`False`";
            const usage: string = command.usage ? `\`${prefix}${command.usage}\`` : "No Usage"

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

            return message.channel.createMessage({ embeds: [helpEmbed], messageReference: { messageID: message.id } });

            // If there is no args provided
        } else {
            const commands: Command[] = await client.commands.filter((cmd) => cmd.name !== "eval" && cmd.name !== "sweep");

            let embed: RichEmbed = new RichEmbed()
                .setTitle(`${client.user.username}'s Commands`)
                .setDescription(`Use \`${prefix}help <command_name>\` for a command detail`)
                .setColor(client.config.COLOUR)
                .setThumbnail(client.user.avatarURL)
                .setTimestamp()
                .setFooter("Made by reinhardt");

            let com: object = {};

            for (let comm of commands.values()) {
                const category = comm.category || "Unknown";
                const name = comm.name;

                if (!com[category]) {
                    com[category] = [];
                }
                com[category].push(name);
            }

            for (const [key, value] of Object.entries(com)) {
                let category: string = key;
                let desc: string = "`" + (value as string[]).join("`, `") + "`";

                embed.addField(`${category} [${(value as string[]).length}]`, desc);
            }

            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
        }
    }
}
