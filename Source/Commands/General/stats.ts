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
    run: async (client, message, args) => {
        const memory: number = process.memoryUsage().rss
        const totalMemory: string = `${Util.bytes(memory).value}${Util.bytes(memory).unit} / ${Util.bytes(require("os").totalmem()).value}${Util.bytes(require("os").totalmem()).unit}`;
        const used: number = process.memoryUsage().rss / 12800 / 12800;

        os.cpuUsage(async (cpu) => {
            const embed: EmbedOptions = {
                title: `${client.user.username}'s Stats`,
                description: `This is the current stats for **${client.user.username}**. \n Shard ID she's currently in: **${message.member.guild.shard.id}** \n\n **Fun Fact**: **${client.user.username}** is now Open-Source! You can find her [Here](https://github.com/NotMarx/Reader).`,
                color: client.config.COLOUR,
                fields: [
                    {
                        name: "Memory Usage",
                        value: `${totalMemory} \n (${Math.round(used * 100) / 100}%)`,
                        inline: true
                    },
                    {
                        name: "CPU Usage",
                        value: `${Util.round(cpu, 2)}%`,
                        inline: true
                    },
                    {
                        name: "Database Size",
                        value: `${Util.bytes(client.database.size()).value}${Util.bytes(client.database.size()).unit}`,
                        inline: true
                    },
                    {
                        name: "NodeJS",
                        value: "14.16.0",
                        inline: true
                    },
                    {
                        name: "Eris",
                        value: VERSION,
                        inline: true
                    },
                    {
                        name: "Platform",
                        value: `${process.platform.charAt(0).toUpperCase() + process.platform.slice(1)}`,
                        inline: true
                    }
                ],
                thumbnail: {
                    url: client.user.avatarURL
                },
                footer: {
                    text: `Made by reinhardt`,
                    icon_url: "https://cdn.discordapp.com/avatars/516186529547288576/0bf219f20a58380d381649dcde4d38e5.png?size=512"
                }
            }
    
            message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }}); 
        });
    }
}