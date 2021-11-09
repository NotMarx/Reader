"use strict";

import { API } from "nhentai-api";
import { Command } from "../../Interfaces";
import RichEmbed from "../../Extensions/embed";

export const command: Command = {
    name: "bookmark",
    description: "Check your bookmarked Doujin",
    aliases: ["library"],
    category: "Main",
    nsfwOnly: true,
    run: async (client, message, args, guildLanguage) => {
        const api = new API();
        const otherMember = client.users.find((user) => user.username === args[0]) || client.users.find((user) => user.id === args[0]) || message.mentions[0];
        const prefix: string = await client.database.fetch(`Database.${message.guildID}.Prefix`) || client.config.PREFIX;
        const bookmarked: string[] = await client.database.fetch(`Database.${otherMember ? otherMember.id : message.author.id}.Bookmark`);

        if (args[0]) {
            if (!otherMember) {
                const embed = new RichEmbed()
                    .setDescription("Cannot find that user!")
                    .setColor(client.config.COLOR);
    
                return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
            }

            if (!bookmarked || bookmarked.length === 0) {
                const embed: RichEmbed = new RichEmbed()
                    .setTitle(guildLanguage.MAIN.BOOKMARK.TITLE.replace("{user}", otherMember.username))
                    .setThumbnail(otherMember.avatarURL)
                    .setColor(client.config.COLOR)
                    .setDescription(guildLanguage.MAIN.BOOKMARK.MEMBER.DESC.replace("{user}", otherMember.username))
                    .addField(guildLanguage.MAIN.BOOKMARK.BOOKMARKED.replace("{count}", "0"), guildLanguage.MAIN.BOOKMARK.NONE);
    
                return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
            }
    
            const msg = await message.channel.createMessage({
                embeds: [
                    { description: guildLanguage.MAIN.BOOKMARK.MEMBER.LOADING_STATE, color: client.config.COLOR }
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
                .setTitle(guildLanguage.MAIN.BOOKMARK.TITLE.replace("{user}", otherMember.username))
                .setThumbnail(otherMember.avatarURL)
                .setColor(client.config.COLOR)
                .setDescription(guildLanguage.MAIN.BOOKMARK.MEMBER.DESC.replace("{user}", otherMember.username))
                .addField(guildLanguage.MAIN.BOOKMARK.BOOKMARKED.replace("{count}", `${bookmarked.length}`), bookmarkedTitle.join("\n"));
    
            return msg.edit({ embeds: [embed], messageReference: { messageID: message.id } });
        } else {
            if (!bookmarked || bookmarked.length === 0) {
                const embed: RichEmbed = new RichEmbed()
                    .setTitle(guildLanguage.MAIN.BOOKMARK.TITLE.replace("{user}", message.author.username))
                    .setThumbnail(message.author.avatarURL)
                    .setColor(client.config.COLOR)
                    .setDescription(guildLanguage.MAIN.BOOKMARK.DESC.replace("{user}", message.author.username).replace("{prefix}", prefix))
                    .addField(guildLanguage.MAIN.BOOKMARK.BOOKMARKED.replace("{count}", "0"), guildLanguage.MAIN.BOOKMARK.NONE);
    
                return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id } });
            }
    
            const msg = await message.channel.createMessage({
                embeds: [
                    { description: guildLanguage.MAIN.BOOKMARK.LOADING_STATE, color: client.config.COLOR }
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
                .setTitle(guildLanguage.MAIN.BOOKMARK.TITLE.replace("{user}", message.author.username))
                .setThumbnail(message.author.avatarURL)
                .setColor(client.config.COLOR)
                .setDescription(`${guildLanguage.MAIN.BOOKMARK.DESC.replace("{user}", message.author.username).replace("{prefix}", prefix)} \n\n **${guildLanguage.MAIN.BOOKMARK.BOOKMARKED.replace("{count}", `${bookmarked.length}`)}** \n ${bookmarkedTitle.join("\n")}`)
    
            return msg.edit({ embeds: [embed], messageReference: { messageID: message.id } });
        }
    }
}
