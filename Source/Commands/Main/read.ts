"use strict";

import { Command } from "../../Interfaces";
import { ActionRow } from "eris";
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
    run: async (client, message, args, guildLanguage) => {
        const api = new API();

        // Check if code is provided
        if (!args[0]) {
            return;
        }

        api.getBook(parseInt(args[0])).then(async (res) => {
            const artistTags: string[] = res.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name);
            const characterTags: string[] = res.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name);
            const contentTags: string[] = res.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`);
            const languageTags: string[] = res.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name);
            const parodyTags: string[] = res.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name);
            const uploadedAt: string = `\`${moment(res.uploaded).format("On dddd, MMMM Do, YYYY h:mm A")}\``;

            const embed = new RichEmbed()
                .setAuthor(args[0], `https://nhentai.net/g/${args[0]}`, "https://cdn.discordapp.com/attachments/755253854819582114/894895960931590174/845298862184726538.png")
                .setColor(client.config.COLOR)
                .addField(guildLanguage.MAIN.READ.TITLE, `\`${res.title.pretty}\``)
                .addField(guildLanguage.MAIN.READ.PAGES, `\`${res.pages.length}\``)
                .addField(guildLanguage.MAIN.READ.DATE, uploadedAt)
                .addField(`${languageTags.length > 1 ? guildLanguage.MAIN.READ.LANGUAGES : guildLanguage.MAIN.READ.LANGUAGE}`, `\`${languageTags.length !== 0 ? languageTags.join("`, `") : guildLanguage.MAIN.READ.NONE}\``)
                .addField(`${artistTags.length > 1 ? guildLanguage.MAIN.READ.ARTISTS : guildLanguage.MAIN.READ.ARTIST}`, `\`${artistTags.length !== 0 ? artistTags.join("`, `") : guildLanguage.MAIN.READ.NOT_PROVIDED}\``)
                .addField(`${characterTags.length > 1 ? guildLanguage.MAIN.READ.CHARACTERS : guildLanguage.MAIN.READ.CHARACTER}`, `\`${characterTags.length !== 0 ? characterTags.join("`, `") : "Original"}\``)
                .addField(guildLanguage.MAIN.READ.PARODY, `\`${parodyTags.length !== 0 ? parodyTags.join("`, `") : "Not Provided"}\``)
                .addField(`${contentTags.length > 1 ? guildLanguage.MAIN.READ.TAGS : guildLanguage.MAIN.READ.TAG}`, `\`${contentTags.length !== 0 ? contentTags.join("`, `") : guildLanguage.MAIN.READ.NOT_PROVIDED}\``)
                .setFooter(`⭐ ${res.favorites.toLocaleString()}`)
                .setThumbnail(api.getImageURL(res.cover));

            const component: ActionRow = {
                    type: 1,
                    components: [
                        {
                            label: guildLanguage.MAIN.READ.READ,
                            custom_id: `read_prop_${message.id}`,
                            style: 1,
                            type: 2
                        },
                        {
                            label: guildLanguage.MAIN.READ.DISMISS,
                            custom_id: "kill_prop",
                            style: 4,
                            type: 2,
                        },
                        {
                            label: guildLanguage.MAIN.READ.BOOKMARK,
                            custom_id: "bookmark_prop",
                            style: 2,
                            type: 2
                        },
                        {
                            label: guildLanguage.MAIN.READ.SHOW_COVER,
                            custom_id: `show_book_cover_${message.id}`,
                            style: 1,
                            type: 2
                        }
                    ]
                };

            const msg = await message.channel.createMessage({ embed: embed, components: [component], messageReference: { messageID: message.id }});
            createPaginationEmbed(client, res, msg, message);
        }).catch((err) => {
            return message.channel.createMessage({ content: err, messageReference: { messageID: message.id }});
        });
    }
}
