"use strict";

import { Command } from "../../Interfaces";
import RichEmbed from "../../Extensions/embed";

export const command: Command = {
    name: "bookmark",
    description: "Check your bookmarked Doujin",
    aliases: [],
    category: "Main",
    nsfwOnly: true,
    run: async (client, message, args) => {
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

        const embed: RichEmbed = new RichEmbed()
            .setTitle(`${message.author.username}'s Bookmarks`)
            .setColor(client.config.COLOUR)
            .setDescription(`Welcome! Please have a look. \n\n **Wanna remove your bookmarked Doujin?** \n Simply visit the page (\`${prefix}read <doujin_code>\`) and click the **Bookmark** button again to remove.`)
            .addField(`⭐ Bookmarked Doujin [${bookmarked.length}]`, `\`${bookmarked.join("`, `")}\``);

        return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
    }

}
