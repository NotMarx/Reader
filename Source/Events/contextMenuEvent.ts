"use strict";

import { API, Book } from "nhentai-api";
import { Event, GuildLanguage } from "../Interfaces";
import { ActionRow, CommandInteraction, TextableChannel } from "eris";
import LanguageConstants from "../../Languages/LANG.json";
import RichEmbed from "../Extensions/embed";
import { createBookmarkButtonNavigator } from "../Extensions/ButtonNavigator/worker";

export const event: Event = {
    name: "interactionCreate",
    run: async (client, interaction: CommandInteraction<TextableChannel>) => {
        const api = new API();
        const prefix: string = client.database.fetch(`Database.${interaction.guildID}.Prefix`) ?? client.config.PREFIX;
        const guildLanguage: GuildLanguage = LanguageConstants[client.database.fetch(`Database.${interaction.guildID}.Language`)];

        if (interaction.type === 2 && interaction.data.type === 2) {
            switch (interaction.data.name) {
                case "See Bookmark":
                    const user = client.users.get(interaction.data.target_id);
                    const bookmarked: string[] = client.database.fetch(`Database.${user.id ?? interaction.data.target_id}.Bookmark`);

                    if (!bookmarked || bookmarked.length === 0) {
                        const embed: RichEmbed = new RichEmbed()
                            .setTitle(guildLanguage.MAIN.BOOKMARK.TITLE.replace("{user}", user.username))
                            .setThumbnail(user.avatarURL)
                            .setColor(client.config.COLOR)
                            .setDescription(guildLanguage.MAIN.BOOKMARK.DESC.replace("{user}", user.username).replace("{prefix}", prefix))
                            .addField(guildLanguage.MAIN.BOOKMARK.BOOKMARKED.replace("{count}", "0"), guildLanguage.MAIN.BOOKMARK.NONE);

                        return interaction.createMessage({ embeds: [embed], flags: 64 });
                    }

                    const msg = await client.createMessage(interaction.channel.id, {
                        embeds: [
                            { description: guildLanguage.MAIN.BOOKMARK.LOADING_STATE, color: client.config.COLOR }
                        ]
                    });
                    interaction.acknowledge();

                    let bookmarkedTitle: string[] = [];
                    let books: Book[] = [];

                    for (let i = 0; i < bookmarked.length; i++) {
                        const title = await api.getBook(parseInt(bookmarked[i])).then((res) => `\`[${res.id}]\` - \`${res.title.pretty}\``);
                        const book = await api.getBook(parseInt(bookmarked[i]));
                        books.push(book);
                        bookmarkedTitle.push(title);
                    }

                    const component: ActionRow = {
                        type: 1,
                        components: [
                            { style: 1, label: guildLanguage.MAIN.SEARCH.DETAIL, custom_id: `see_detail_${interaction.id}`, type: 2 }
                        ]
                    }

                    const embed: RichEmbed = new RichEmbed()
                        .setTitle(guildLanguage.MAIN.BOOKMARK.TITLE.replace("{user}", user.username))
                        .setThumbnail(user.avatarURL)
                        .setColor(client.config.COLOR)
                        .setDescription(`${guildLanguage.MAIN.BOOKMARK.DESC.replace("{user}", user.username).replace("{prefix}", prefix)} \n\n **${guildLanguage.MAIN.BOOKMARK.BOOKMARKED.replace("{count}", `${bookmarked.length}`)}** \n ${bookmarkedTitle.join("\n")}`);

                    const message = await client.createMessage(interaction.channel.id, { embeds: [embed] });
                    createBookmarkButtonNavigator(client, books, msg, message)
            }
        }
    }
}