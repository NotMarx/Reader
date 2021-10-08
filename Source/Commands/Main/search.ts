"use strict";

import { API } from "nhentai-api";
import { Command } from "../../Interfaces";
import { ActionRow } from "eris";
import { createSearchResultPaginationEmbed } from "../../Extensions/ButtonNavigator/worker";
import RichEmbed from "../../Extensions/embed";

export const command: Command = {
    name: "search",
    description: "Search a Doujin",
    aliases: [],
    category: "Main",
    nsfwOnly: true,
    run: async (client, message, args) => {
        const api = new API();

        api.search(encodeURIComponent(args.slice(0).join(" ")), 1).then(async (res) => {
            if (res.books.length === 0) {
                const embed = new RichEmbed()
                    .setDescription("No Results Found!")
                    .setColor(client.config.COLOUR);

                return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
            }

            const title = res.books.map((book) => `\`[${book.id}]\` - \`${book.title.pretty}\``);

            const embed = new RichEmbed()
                .setTitle(`Page ${res.page} / ${res.pages}`)
                .setDescription(`**Titles** \n\u2063 ${title.join("\n")}`)
                .setColor(client.config.COLOUR);

            const component: ActionRow = {
                type: 1,
                components: [
                    { style: 1, label: "See More Detail", custom_id: `see_detail_${message.id}`, type: 2 }
                ]
            }

            const msg = await message.channel.createMessage({ embeds: [embed], components: [component], messageReference: { messageID: message.id } });
            createSearchResultPaginationEmbed(client, res, msg, message);
        }).catch(() => {
            const embed = new RichEmbed()
                .setDescription("No Results Found!")
                .setColor(client.config.COLOUR);

            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
        });
    }
}