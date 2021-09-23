"use strict";

import { Command } from "../../Interfaces";

export const command: Command = {
    name: "ping",
    description: "Ping the Bot",
    aliases: ["pong"],
    category: "General",
    run: async (client, message, args) => {
        return message.channel.createMessage({ content: `Pong! | ${message.member.guild.shard.latency}ms`, messageReference: { messageID: message.id }});
    }
}
