"use strict";

import { API } from "nhentai-api";
import { Command } from "../../Interfaces";
import { ActionRow } from "eris";
import { createSearchResultPaginationEmbed } from "../../Extensions/ButtonNavigator/worker";
import RichEmbed from "../../Extensions/embed";
import yargs from "yargs/yargs";

export const command: Command = {
    name: "search",
    description: "Search a Doujin",
    aliases: [],
    category: "Main",
    usage: "search --query <query> --page <page>",
    nsfwOnly: true,
    run: async (client, message, args, guildLanguage) => {
        const prefix: string = client.database.fetch(`Database.${message.guildID}.Prefix`) || client.config.PREFIX;
        const api = new API();
        const flag = await yargs(args.slice(0)).array(["query", "page"]).argv;

        if (!flag.query) {
            const embed = new RichEmbed()
                .setDescription(guildLanguage.MAIN.SEARCH.NO_QUERY.replace("{command_example}", `${prefix}search --query Search Something Here --page 3`))
                .setColor(client.config.COLOR)

            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
        }

        if (flag.query.length === 0) {
            const embed = new RichEmbed()
                .setDescription(guildLanguage.MAIN.SEARCH.NO_QUERY.replace("{command_example}", `${prefix}search --query Search Something Here --page 3`))
                .setColor(client.config.COLOR)

            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
        }

        if (flag.page && typeof flag.page[0] !== "number") {
            const embed = new RichEmbed()
                .setDescription(guildLanguage.MAIN.SEARCH.INVALID_PAGE)
                .setColor(client.config.COLOR)

            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
        }

        api.search(encodeURIComponent((flag.query as string[]).join(" ")), flag.page ? flag.page[0] as number : 1).then(async (res) => {
            if (res.books.length === 0) {
                const embed = new RichEmbed()
                    .setDescription(guildLanguage.MAIN.SEARCH.NOT_FOUND)
                    .setColor(client.config.COLOR);

                return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
            }

            const title = res.books.map((book) => `\`[${book.id}]\` - \`${book.title.pretty}\``);

            const embed = new RichEmbed()
                .setTitle(guildLanguage.MAIN.SEARCH.PAGE.replace("{page}", `${res.page} / ${res.pages}`))
                .setDescription(guildLanguage.MAIN.SEARCH.TITLES.replace("{titles}", `\u2063 ${title.join("\n")}`))
                .setColor(client.config.COLOR);

            const component: ActionRow = {
                type: 1,
                components: [
                    { style: 1, label: guildLanguage.MAIN.SEARCH.DETAIL, custom_id: `see_detail_${message.id}`, type: 2 }
                ]
            }

            const msg = await message.channel.createMessage({ embeds: [embed], components: [component], messageReference: { messageID: message.id } });
            createSearchResultPaginationEmbed(client, res, msg, message);
        }).catch(() => {
            const embed = new RichEmbed()
                .setDescription(guildLanguage.MAIN.SEARCH.NOT_FOUND)
                .setColor(client.config.COLOR);

            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
        });
    }
}