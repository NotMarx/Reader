"use strict";

import { ActionRow } from "eris";
import { Command } from "../../Interfaces";
import { API, Book } from "nhentai-api";
import { createSearchResultPaginationEmbed } from "../../Extensions/ButtonNavigator/worker";
import RichEmbed from "../../Extensions/embed";

export const command: Command = {
    name: "recent",
    description: "Shows the top 10 recent uploaded doujins",
    aliases: ["recent_doujin", "recent-upload"],
    category: "Main",
    nsfwOnly: true,
    run: async (client, message, args, guildLanguage) => {
        let api = new API();

        api.search("*", 1).then(async (res) => {
            const title: Book[] = [];

            for (let i = 0; i < 10; i++) {
                const recentUpload = res.books[i];
                title.push(recentUpload);
            }

            const embed = new RichEmbed()
                .setTitle(`Top 10 Recent Uploaded Doujins`)
                .addField("Title", title.map((book) => `\`[${book.id}]\` - \`${book.title.pretty}\``).join("\n"))
                .setColor(client.config.COLOR);

            const component: ActionRow = {
                type: 1,
                components: [
                    { style: 1, label: "See More Detail", custom_id: `see_detail_${message.id}`, type: 2 }
                ]
            }

            const msg = await message.channel.createMessage({ embeds: [embed], components: [component], messageReference: { messageID: message.id } });
            createSearchResultPaginationEmbed(client, res, msg, message);
        });
    }

}
