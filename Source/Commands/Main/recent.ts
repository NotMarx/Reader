"use strict";

import { Command } from "../../Interfaces";
import { API, Book } from "nhentai-api";
import RichEmbed from "../../Extensions/embed";

export const command: Command = {
    name: "recent",
    description: "Shows the top 10 recent uploaded doujins",
    aliases: ["recent_doujin", "recent-upload"],
    category: "Main",
    nsfwOnly: true,
    run: async (client, message, args) => {
        let api = new API();

        api.search("*", 1).then((res) => {
            const title: Book[] = [];
            
            for (let i = 0; i < 10; i++) {
                const recentUpload = res.books[i];
                title.push(recentUpload);
            }

            const embed = new RichEmbed()
                .setTitle(`Top 10 Recent Uploaded Doujins`)
                .addField("Title", title.map((book) => `\`[${book.id}]\` - \`${book.title.pretty}\``).join("\n"))
                .setColor(client.config.COLOUR);

            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
        });
    }

}
