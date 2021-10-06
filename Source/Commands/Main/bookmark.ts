"use strict";

import { API } from "nhentai-api";
import { Command } from "../../Interfaces";
import RichEmbed from "../../Extensions/embed";

export const command: Command = {
    name: "bookmark",
    description: "Check your bookmarked Doujin",
    aliases: [],
    category: "Main",
    nsfwOnly: true,
    run: async (client, message, args) => {
        const api = new API();
        const prefix: string = await client.database.fetch(`Database.${message.guildID}.Prefix`) || client.config.PREFIX;
        const bookmarked: string[] = await client.database.fetch(`Database.${message.author.id}.Bookmark`);

        if (!bookmarked || bookmarked.length === 0) {
            const embed: RichEmbed = new RichEmbed()
                .setTitle(`${message.author.username}'s Bookmarks`)
                .setColor(client.config.COLOUR)
                .setDescription(`Welcome! Please have a look. \n\n **Wanna remove your bookmarked Doujin?** \n Simply visit the page (\`${prefix}read <doujin_code>\`) and click the **Bookmark** button again to remove.`)
                .addField("⭐ Bookmarked Doujin [0]", "`None`");

            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
        }

        const msg = await message.channel.createMessage({
            embeds: [
                { description: "Fetching your data, please wait...", color: client.config.COLOUR }
            ],
            messageReference: {
                messageID: message.id
            }
        });

        const bookmarkedTitle: string[] = [];

        for (let i = 0; i < bookmarked.length; i++) {
            const theAPI = await api.getBook(parseInt(bookmarked[i])).then((res) => `\`[${res.id}]\` - \`${res.title.pretty}\``);
            bookmarkedTitle.push(theAPI);
        }

        const embed: RichEmbed = new RichEmbed()
            .setTitle(`${message.author.username}'s Bookmarks`)
            .setColor(client.config.COLOUR)
            .setDescription(`Welcome! Please have a look. \n\n **Wanna remove your bookmarked Doujin?** \n Simply visit the page (\`${prefix}read <doujin_code>\`) and click the **Bookmark** button again to remove.`)
            .addField(`⭐ Bookmarked Doujin [${bookmarked.length}]`, bookmarkedTitle.join("\n"));

        return msg.edit({ embeds: [embed], messageReference: { messageID: message.id } });
    }

}
