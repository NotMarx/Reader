"use strict";

import { API } from "nhentai-api";
import { ActionRow } from "eris";
import { Command } from "../../Interfaces";
import { createSearchResultPaginationEmbed } from "../../Extensions/ButtonNavigator/worker";
import RichEmbed from "../../Extensions/embed";

export const command: Command = {
    name: "search-like",
    description: "Search a similar Doujin",
    aliases: ["search-similar", "more-like"],
    category: "Main",
    nsfwOnly: true,
    run: async (client, message, args, guildLanguage) => {
        const api = new API();

        api.searchAlike(parseInt(args[0])).then(async (res) => {
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
        });
    }
}