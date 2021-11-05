"use strict"

import { Command } from "../../Interfaces";
import { EmbedOptions, VERSION } from "eris";
import Util from "../../Extensions/util";
import os from "os-utils";

export const command: Command = {
    name: "stats",
    description: "The bot's stats",
    aliases: ["status"],
    category: "General",
    run: async (client, message, args, guildLanguage) => {
        const memory: number = process.memoryUsage().rss
        const totalMemory: string = `${Util.bytes(memory).value}${Util.bytes(memory).unit} / ${Util.bytes(require("os").totalmem()).value}${Util.bytes(require("os").totalmem()).unit}`;
        const used: number = process.memoryUsage().rss / 12800 / 12800;

        os.cpuUsage(async (cpu) => {
            const embed: EmbedOptions = {
                title: guildLanguage.GENERAL.STATS.TITLE.replace("{bot}", client.user.username),
                description: guildLanguage.GENERAL.STATS.DESC.replace(/{bot}/g, client.user.username).replace("{shard}", `${message.member.guild.shard.id}`).replace("{gh_url}", "https://github.com/NotMarx/Reader"),
                color: client.config.COLOR,
                fields: [
                    {
                        name: guildLanguage.GENERAL.STATS.FIELDS.MEMORY_USAGE.NAME,
                        value: guildLanguage.GENERAL.STATS.FIELDS.MEMORY_USAGE.VALUE.replace("{total_mem}", totalMemory).replace("{percentage}", `${Math.round(used * 100) / 100}`),
                        inline: true
                    },
                    {
                        name: guildLanguage.GENERAL.STATS.FIELDS.CPU_USAGE.NAME,
                        value: guildLanguage.GENERAL.STATS.FIELDS.CPU_USAGE.VALUE.replace("{percentage}", `${Util.round(cpu, 2)}`),
                        inline: true
                    },
                    {
                        name: guildLanguage.GENERAL.STATS.FIELDS.DATABASE_SIZE.NAME,
                        value: guildLanguage.GENERAL.STATS.FIELDS.DATABASE_SIZE.VALUE.replace("{size}", `${Util.bytes(client.database.size()).value}${Util.bytes(client.database.size()).unit}`),
                        inline: true
                    },
                    {
                        name: guildLanguage.GENERAL.STATS.FIELDS.NODEJS.NAME,
                        value: guildLanguage.GENERAL.STATS.FIELDS.NODEJS.VALUE.replace("{version}", process.versions.node),
                        inline: true
                    },
                    {
                        name: guildLanguage.GENERAL.STATS.FIELDS.ERIS.NAME,
                        value: guildLanguage.GENERAL.STATS.FIELDS.ERIS.VALUE.replace("{version}", VERSION),
                        inline: true
                    },
                    {
                        name: guildLanguage.GENERAL.STATS.FIELDS.PLATFORM.NAME,
                        value: guildLanguage.GENERAL.STATS.FIELDS.PLATFORM.VALUE.replace("{platform}", process.platform.charAt(0).toUpperCase() + process.platform.slice(1)),
                        inline: true
                    }
                ],
                thumbnail: {
                    url: client.user.avatarURL
                },
                footer: {
                    text: guildLanguage.GENERAL.STATS.FOOTER.replace("{dev}", "reinhardt"),
                    icon_url: "https://cdn.discordapp.com/avatars/516186529547288576/0bf219f20a58380d381649dcde4d38e5.png?size=512"
                }
            }
    
            message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }}); 
        });
    }
}