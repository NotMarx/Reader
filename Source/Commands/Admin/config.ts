"use strict";

import { Command } from "../../Interfaces";
import RichEmbed from "../../Extensions/embed";

export const command: Command = {
    name: "config",
    description: "Configure the Bot",
    aliases: ["configure", "cfg"],
    category: "Admin",
    run: async (client, message, args, guildLanguage) => {
        let embed: RichEmbed = new RichEmbed()
            .setColor(client.config.COLOUR);
        
        // Ignore for non-admin users
        if (message.author.id !== message.member.guild.ownerID && !message.member.permissions.has("manageGuild")) {
                embed.setDescription("You're not allowed to use this command!");

            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
        }

        const langOpt: string[] = ["english"];
        const configOpt: string[] = ["hexColour", "prefix", "language"];
        const argsValue: string = args[1];

        if (!args[0]) {
            embed.setDescription(`Please specify one of these following options: \`${configOpt.join("`, `")}\``);

            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
        }

        switch (args[0]) {
            case "prefix":
                if (!argsValue) {
                    embed.setDescription("Please specify a new prefix!");

                    return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
                }

                embed.setDescription(`Successfully changed the prefix to \`${argsValue}\``);

                await client.database.set(`Database.${message.guildID}.Prefix`, argsValue);
                message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
                break;
            case "language":
                if (!argsValue) {
                    embed.setDescription("Please specify a language to be use! \n\n The only supported languages are: **English**");

                    return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
                }

                if (!langOpt.includes(args[1].toLowerCase())) {
                    embed.setDescription("The only supported languages are: **English**");

                    return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
                }

                const cfgLanguage: string = args[1].toLowerCase();

                embed.setDescription(`Successfully changed the language to **${cfgLanguage.charAt(0).toUpperCase() + cfgLanguage.slice(1)}**`)

                message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
                client.database.set(`Database.${message.guildID}.Language`, args[1].toUpperCase());
                break;
            default: 
            embed.setDescription(`Please specify one of these following options: \`${configOpt.join("`, `")}\``);

            message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
            break;
        }
    }
}