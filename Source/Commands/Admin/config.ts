"use strict";

import { Command } from "../../Interfaces";
import RichEmbed from "../../Extensions/embed";

export const command: Command = {
    name: "config",
    description: "Configure the Bot",
    aliases: ["configure", "cfg"],
    category: "Admin",
    run: async (client, message, args) => {
        let embed: RichEmbed = new RichEmbed()
            .setColor(client.config.COLOUR);
        
        // Ignore for non-admin users
        if (message.author.id !== message.member.guild.ownerID && !message.member.permissions.has("manageGuild")) {
                embed.setDescription("You're not allowed to use this command!");

            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
        }

        const configOpt: string[] = ["hexColour", "prefix"];
        const prefix: string = args[1];

        if (!args[0]) {
            embed.setDescription(`Please specify one of these following options: \`${configOpt.join("`, `")}\``);
            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
        }

        switch (args[0]) {
            case "prefix":
                if (!prefix) {
                    embed.setDescription("Please specify a new prefix!")

                    return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
                }

                embed.setDescription(`Successfully changed the prefix to \`${prefix}\``);

                await client.database.set(`Database.${message.guildID}.Prefix`, prefix);
                message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
                break;
        }
    }
}