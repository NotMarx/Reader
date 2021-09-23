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
                text: `Made by ${client.users.get(client.config.ADMIN_ID[0]).username}`,
                icon_url: client.users.get(client.config.ADMIN_ID[0]).avatarURL
            }
        }

        message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
    }
}