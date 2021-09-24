"use strict"

import { Command } from "../../Interfaces";
import { EmbedOptions } from "eris";

export const command: Command = {
    name: "stats",
    description: "The bot's stats",
    aliases: ["status"],
    category: "General",
    run: async (client, message, args) => {
        const embed: EmbedOptions = {
            title: `${client.user.username}'s Stats`,
            color: client.config.COLOUR,
            footer: {
                text: `Made by reinhardt`,
                icon_url: "https://cdn.discordapp.com/avatars/516186529547288576/0bf219f20a58380d381649dcde4d38e5.png?size=512"
            }
        }

        message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
    }
}