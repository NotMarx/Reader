"use strict";

import { Command } from "../../Interfaces";
import RichEmbed from "../../Extensions/embed";
import yargs from "yargs/yargs";

export const command: Command = {
    name: "config",
    description: "Configure the Bot",
    aliases: ["configure", "cfg"],
    category: "Admin",
    usage: "config --option <option> --value <value>",
    run: async (client, message, args, guildLanguage) => {
        const flag = await yargs(args.slice(0)).array(["option", "value"]).argv;
        const embed: RichEmbed = new RichEmbed()
            .setColor(client.config.COLOR);

        // Ignore for non-admin users
        if (message.author.id !== message.member.guild.ownerID && !message.member.permissions.has("manageGuild")) {
            embed.setDescription(guildLanguage.ADMIN.CONFIG.NO_PERMS);

            return message.channel.createMessage({ embed: embed, messageReference: { messageID: message.id } });
        }

        const langOpt: string[] = ["english"];
        const readStateOpt: string[] = ["new", "current"];
        const configOpt: string[] = ["hexColor", "prefix", "language", "reading-state"];

        if (!flag.option) {
            embed.setDescription(guildLanguage.ADMIN.CONFIG.NO_OPT.replace("{options}", configOpt.join("`, `")));

            return message.channel.createMessage({ embed: embed, messageReference: { messageID: message.id } });
        }

        if (!configOpt.includes((flag.option[0] as string).toLowerCase())) {
            embed.setDescription(guildLanguage.ADMIN.CONFIG.NO_OPT.replace("{options}", configOpt.join("`, `")));

            return message.channel.createMessage({ embed: embed, messageReference: { messageID: message.id } });
        }

        switch ((flag.option[0] as string).toLowerCase()) {
            case "prefix":
                if (!flag.value || !flag.value[0]) {
                    embed.setDescription(guildLanguage.ADMIN.CONFIG.NO_PREFIX);

                    return message.channel.createMessage({ embed: embed, messageReference: { messageID: message.id } });
                }

                if ((flag.value[0] as string).length > 64) {
                    embed.setDescription(guildLanguage.ADMIN.CONFIG.PREFIX_TOO_LONG);

                    return message.channel.createMessage({ embed: embed, messageReference: { messageID: message.id } });
                }

                embed.setDescription(guildLanguage.ADMIN.CONFIG.PREFIX_SUCCESS.replace("{prefix}", flag.value[0] as string));

                message.channel.createMessage({ embed: embed, messageReference: { messageID: message.id } });
                client.database.set(`Database.${message.guildID}.Prefix`, flag.value[0]);
                break;
            case "language":
                if (!flag.value || !flag.value[0]) {
                    embed.setDescription(guildLanguage.ADMIN.CONFIG.NO_LANG.replace("{language}", "English"));

                    return message.channel.createMessage({ embed: embed, messageReference: { messageID: message.id } });
                }

                if (!langOpt.includes((flag.value[0] as string).toLowerCase())) {
                    embed.setDescription(guildLanguage.ADMIN.CONFIG.INVALID_LANG.replace("{language}", "English"));

                    return message.channel.createMessage({ embed: embed, messageReference: { messageID: message.id } });
                }

                const cfgLanguage: string = (flag.value[0] as string).toLowerCase();

                embed.setDescription(guildLanguage.ADMIN.CONFIG.LANG_SUCCESS.replace("{language}", cfgLanguage.charAt(0).toUpperCase() + cfgLanguage.slice(1)));

                message.channel.createMessage({ embed: embed, messageReference: { messageID: message.id } });
                client.database.set(`Database.${message.guildID}.Language`, (flag.value[0] as string).toUpperCase());
                break;
            case "reading-state":
                if (!flag.value || !flag.value[0]) {
                    embed.setDescription(guildLanguage.ADMIN.CONFIG.NO_READSTATE.replace("{options}", readStateOpt.join("`, `")));

                    return message.channel.createMessage({ embed: embed, messageReference: { messageID: message.id }});
                }

                if (!readStateOpt.includes((flag.value[0] as string).toLowerCase())) {
                    embed.setDescription(guildLanguage.ADMIN.CONFIG.INVALID_READSTATE.replace("{options}", readStateOpt.join("`, `")));

                    return message.channel.createMessage({ embed: embed, messageReference: { messageID: message.id }});
                }

                if ((flag.value[0] as string).toLowerCase() === "new") {
                    embed.setDescription(guildLanguage.ADMIN.CONFIG.READSTATE_SUCCESS_NEW);

                    client.database.set(`Database.${message.guildID}.ReadState`, "new");
                    return message.channel.createMessage({ embed: embed, messageReference: { messageID: message.id }});
                } else if ((flag.value[0] as string).toLowerCase() === "current") {
                    embed.setDescription(guildLanguage.ADMIN.CONFIG.READSTATE_SUCCESS_CURRENT);

                    client.database.set(`Database.${message.guildID}.ReadState`, "current");
                    return message.channel.createMessage({ embed: embed, messageReference: { messageID: message.id }});
                }
                break;
            default:
                embed.setDescription(guildLanguage.ADMIN.CONFIG.NO_OPT.replace("{options}", configOpt.join("`, `")));

                message.channel.createMessage({ embed: embed, messageReference: { messageID: message.id } });
                break;
        }
    }
};
