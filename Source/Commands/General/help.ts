"use strict";

import { Command } from "../../Interfaces";
import { EmbedOptions, TextChannel } from "eris";
import RichEmbed from "../../Extensions/embed";

export const command: Command = {
    name: "help",
    description: "Help Menu",
    aliases: ["helpme"],
    category: "General",
    usage: "help <command_name>",
    run: async (client, message, args, guildLanguage) => {
        const prefix: string = client.database.fetch(`Database.${message.guildID}.Prefix`) || client.config.PREFIX;
        const command: Command = client.commands.get(args[0]) || client.aliases.get(args[0]);

        // If the first args (command name) is specified
        if (args[0]) {
            if (!command) return;

            const adminOnly: "`True`" | "`False`" = command.adminOnly ? "`True`" : "`False`";
            const aliases: string = command.aliases.length === 0 ? "No Aliases" : `\`${command.aliases.join("`, `")}\``;
            const category: string = command.category ? `\`${command.category}\`` : "No Category";
            const description: string = command.description ? command.description : "No Description";
            const name: string = command.name;
            const nsfwOnly: "`True`" | "`False`" = command.nsfwOnly ? "`True`" : "`False`";
            const usage: string = command.usage ? `\`${prefix}${command.usage}\`` : "No Usage";

            if (command.nsfwOnly && !(message.channel as TextChannel).nsfw && client.config.ADMIN_ID.includes(message.author.id)) {
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
                    color: client.config.COLOR,
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

                const embed: RichEmbed = new RichEmbed()
                    .setTitle(`${client.user.username}'s Commands`)
                    .setDescription(`Use \`${prefix}help <command_name>\` for a command detail`)
                    .setColor(client.config.COLOR)
                    .setThumbnail(client.user.avatarURL)
                    .setTimestamp()
                    .setFooter("Made by reinhardt");

                const com = {};

                for (const comm of commands.values()) {
                    const category = comm.category || "Unknown";
                    const name = comm.name;

                    if (!com[category]) {
                        com[category] = [];
                    }
                    com[category].push(name);
                }

                for (const [key, value] of Object.entries(com)) {
                    const category: string = key;
                    const desc: string = "`" + (value as string[]).join("`, `") + "`";

                    embed.addField(`${category} [${(value as string[]).length}]`, desc);
                }

                message.channel.createMessage({ embed: embed, messageReference: { messageID: message.id } });
            }

            if (command.nsfwOnly && !(message.channel as TextChannel).nsfw) {
                return message.channel.createMessage({ embeds: [{ description: "This command is only executable in **NSFW Channels**!", color: client.config.COLOR }], messageReference: { messageID: message.id } });
            }

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
                color: client.config.COLOR,
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

            const embed: RichEmbed = new RichEmbed()
                .setTitle(`${client.user.username}'s Commands`)
                .setDescription(`Use \`${prefix}help <command_name>\` for a command detail`)
                .setColor(client.config.COLOR)
                .setThumbnail(client.user.avatarURL)
                .setTimestamp()
                .setFooter("Made by reinhardt");

            const com = {};

            for (const comm of commands.values()) {
                const category = comm.category || "Unknown";
                const name = comm.name;

                if (!com[category]) {
                    com[category] = [];
                }
                com[category].push(name);
            }

            for (const [key, value] of Object.entries(com)) {
                const category: string = key;
                const desc: string = "`" + (value as string[]).join("`, `") + "`";

                embed.addField(`${category} [${(value as string[]).length}]`, desc);
            }

            return message.channel.createMessage({ embed: embed, messageReference: { messageID: message.id } });
        }
    }
};
