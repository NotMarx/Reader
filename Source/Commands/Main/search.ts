"use strict";

import { API } from "nhentai-api";
import { Command } from "../../Interfaces";
import RichEmbed from "../../Extensions/embed";

export const command: Command = {
    name: "search",
    description: "Search a Doujin",
    aliases: [],
    category: "Main",
    nsfwOnly: true,
    run: async (client, message, args) => {
        const api = new API();

        api.search(encodeURIComponent(args.slice(1).join(" ")), parseInt(args[0])).then((res) => {
            if (res.books.length === 0) {
                const embed = new RichEmbed()
                    .setDescription("No Results Found!")
                    .setColor(client.config.COLOUR);

                return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
            }

            if (parseInt(args[0]) > res.pages) {
                const embed = new RichEmbed()
                    .setDescription(`Only **${res.pages}** result ${res.pages >= 2 ? "pages" : "page"} ${res.pages >= 2 ? "are" : "is"} found!`)
                    .setColor(client.config.COLOUR);

                return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
            }

            const title = res.books.map((book) => `\`[${book.id}]\` - \`${book.title.pretty}\``);

            const embed = new RichEmbed()
                .setTitle(`Page ${res.page} / ${res.pages}`)
                .setDescription(`**Titles** \n\u2063 ${title.join("\n")}`)
                .setColor(client.config.COLOUR);

            message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
        }).catch(() => {
                return message.channel.createMessage({
                    embeds: [
                        {
                            description: "Something went wrong! This is an known-issue and the dev is currently working on it.",
                            color: client.config.COLOUR
                        }
                    ],
                    messageReference: {
                        messageID: message.id
                    }
                });
        });

    }
}