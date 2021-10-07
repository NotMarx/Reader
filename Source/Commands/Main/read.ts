"use strict";

import { Command } from "../../Interfaces";
import { ActionRow, EmbedOptions, Message, TextableChannel } from "eris";
import { API } from "nhentai-api";
import { createPaginationEmbed } from "../../Extensions/ButtonNavigator/worker";
import RichEmbed from "../../Extensions/embed";
import moment from "moment";

export const command: Command = {
    name: "read",
    description: "Read a Doujin",
    aliases: ["doujin"],
    category: "Main",
    usage: "read <doujin_code>",
    nsfwOnly: true,
    run: async (client, message, args) => {
        const api = new API();
        const code: string = client.database.fetch(`Database.${message.guildID}.${message.author.id}.Book`);

        // Check if code is provided
        if (!args[0]) {
            const embed: EmbedOptions = {
                description: "Wanna read something? Your keyword is a **6 Digits Code**.",
                color: client.config.COLOUR
            };
            
            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
        }

        if (code) {
            const embed = new RichEmbed()
                .setDescription("You may read multiple doujins at the same time but you can only view one at a time! Click the **Read** or the **Stop** button to view/read another doujin.")
                .setColor(client.config.COLOUR);

            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
        }

        api.getBook(parseInt(args[0])).then(async (res) => {
            const contentTags: string[] = res.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`);
            const languageTags: string[] = res.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name);
            const uploadedAt: string = `\`${moment(res.uploaded).format("On dddd, MMMM Do, YYYY h:mm A")}\``;

            const embed = new RichEmbed()
                .setAuthor(args[0], `https://nhentai.net/g/${args[0]}`, "https://cdn.discordapp.com/attachments/755253854819582114/894895960931590174/845298862184726538.png")
                .setColor(client.config.COLOUR)
                .addField("Title", `\`${res.title.pretty}\``)
                .addField("Pages", `\`${res.pages.length}\``)
                .addField("Date Released", uploadedAt)
                .addField("Languages", `\`${languageTags.join("`, `")}\``)
                .addField("Tags", `\`${contentTags.join("`, `")}\``)
                .setFooter(`⭐ ${res.favorites.toLocaleString()}`)
                .setThumbnail(api.getImageURL(res.cover));

            const component: ActionRow = {
                    type: 1,
                    components: [
                        {
                            label: "Read",
                            custom_id: `read_prop_${message.id}`,
                            style: 1,
                            type: 2
                        },
                        {
                            label: "Dismiss",
                            custom_id: "kill_prop",
                            style: 4,
                            type: 2,
                        },
                        {
                            label: "Bookmark",
                            custom_id: "bookmark_prop",
                            style: 2,
                            type: 2
                        }
                    ]
                }

            const msg = await message.channel.createMessage({ embeds: [embed], components: [component], messageReference: { messageID: message.id }});
            createPaginationEmbed(client, res, msg, message);
        }).catch((err) => {
            return message.channel.createMessage({ content: err, messageReference: { messageID: message.id }});
        });
    }
}
