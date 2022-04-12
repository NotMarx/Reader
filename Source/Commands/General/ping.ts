"use strict";

import { Command } from "../../Interfaces";

export const command: Command = {
    name: "ping",
    description: "Ping the Bot",
    aliases: ["pong"],
    category: "General",
    run: async (client, message, args, guildLanguage) => {
        return message.channel.createMessage({ content: guildLanguage.GENERAL.PING.TEXT.replace("{latency}", `${message.member.guild.shard.latency}`), messageReference: { messageID: message.id }});
    }
};
