"use strict";

import { Command } from "../../Interfaces";
import RichEmbed from "../../Extensions/embed";
import yargs from "yargs/yargs";

export const command: Command = {
    name: "config",
    description: "Configure the Bot",
    aliases: ["configure", "cfg"],
    category: "Admin",
    usage: "config --settings <options> --value <value>",
    run: async (client, message, args, guildLanguage) => {
        const flag = await yargs(args.slice(0)).array(["settings", "value"]).argv;
        let embed: RichEmbed = new RichEmbed()
            .setColor(client.config.COLOR);

        // Ignore for non-admin users
        if (message.author.id !== message.member.guild.ownerID && !message.member.permissions.has("manageGuild")) {
            embed.setDescription(guildLanguage.ADMIN.CONFIG.NO_PERMS);

            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
        }

        const langOpt: string[] = ["english"];
        const configOpt: string[] = ["hexColor", "prefix", "language"];
        // const argsValue: string = args[1];

        if (!flag.settings) {
            embed.setDescription(guildLanguage.ADMIN.CONFIG.NO_OPT.replace("{options}", configOpt.join("`, `")));

            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
        }

        if (!configOpt.includes(flag.settings[0] as string)) {
            embed.setDescription(guildLanguage.ADMIN.CONFIG.NO_OPT.replace("{options}", configOpt.join("`, `")));

            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
        }

        switch (flag.settings[0]) {
            case "prefix":
                if (!flag.value[0]) {
                    embed.setDescription(guildLanguage.ADMIN.CONFIG.NO_PREFIX);

                    return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
                }

                if ((flag.value[0] as string).length > 64) {
                    embed.setDescription(guildLanguage.ADMIN.CONFIG.PREFIX_TOO_LONG);

                    return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
                }

                embed.setDescription(guildLanguage.ADMIN.CONFIG.PREFIX_SUCCESS.replace("{prefix}", flag.value[0] as string));

                await client.database.set(`Database.${message.guildID}.Prefix`, flag.value[0]);
                message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
                break;
            case "language":
                if (!flag.value[0]) {
                    embed.setDescription(guildLanguage.ADMIN.CONFIG.NO_LANG.replace("{language}", "English"));

                    return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
                }

                if (!langOpt.includes((flag.value[0] as string).toLowerCase())) {
                    embed.setDescription(guildLanguage.ADMIN.CONFIG.INVALID_LANG.replace("{language}", "English"));

                    return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
                }

                const cfgLanguage: string = (flag.value[0] as string).toLowerCase();

                embed.setDescription(guildLanguage.ADMIN.CONFIG.LANG_SUCCESS.replace("{language}", cfgLanguage.charAt(0).toUpperCase() + cfgLanguage.slice(1)))

                message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
                client.database.set(`Database.${message.guildID}.Language`, (flag.value[0] as string).toUpperCase());
                break;
            default:
                embed.setDescription(guildLanguage.ADMIN.CONFIG.NO_OPT.replace("{options}", configOpt.join("`, `")));

                message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
                break;
        }

        /* if (!args[0]) {
            embed.setDescription(guildLanguage.ADMIN.CONFIG.NO_OPT.replace("{options}", configOpt.join("`, `")));

            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
        }

        switch (args[0]) {
            case "prefix":
                if (!argsValue) {
                    embed.setDescription(guildLanguage.ADMIN.CONFIG.NO_PREFIX);

                    return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
                }

                embed.setDescription(guildLanguage.ADMIN.CONFIG.PREFIX_SUCCESS.replace("{prefix}", argsValue));

                await client.database.set(`Database.${message.guildID}.Prefix`, argsValue);
                message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
                break;
            case "language":
                if (!argsValue) {
                    embed.setDescription(guildLanguage.ADMIN.CONFIG.NO_LANG.replace("{language}", "English"));

                    return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
                }

                if (!langOpt.includes(args[1].toLowerCase())) {
                    embed.setDescription(guildLanguage.ADMIN.CONFIG.INVALID_LANG.replace("{language}", "English"));

                    return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
                }

                const cfgLanguage: string = args[1].toLowerCase();

                embed.setDescription(guildLanguage.ADMIN.CONFIG.LANG_SUCCESS.replace("{language}", cfgLanguage.charAt(0).toUpperCase() + cfgLanguage.slice(1)))

                message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
                client.database.set(`Database.${message.guildID}.Language`, args[1].toUpperCase());
                break;
            default: 
            embed.setDescription(guildLanguage.ADMIN.CONFIG.NO_OPT.replace("{options}", configOpt.join("`, `")));

            message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
            break;
        } */
    }
}