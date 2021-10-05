"use strict";

import { Command } from "../../Interfaces";
import { ActionRow, EmbedOptions } from "eris";
import API, { Details } from "../../Extensions/API";
import RichEmbed from "../../Extensions/embed";

export const command: Command = {
    name: "read",
    description: "Read a Doujin",
    aliases: ["doujin"],
    category: "Main",
    usage: "read <doujin_code>",
    nsfwOnly: true,
    run: async (client, message, args) => {
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
                .setDescription("You can only read one at a time!")
                .setColor(client.config.COLOUR);

            return message.channel.createMessage({ embeds: [embed], messageReference: { messageID: message.id }});
        }

        API.getCode(args[0]).then((res) => {
            const embed = new RichEmbed()
                .setAuthor(args[0], res.url)
                .setColor(client.config.COLOUR)
                .addField("Title", `\`${res.title}\``)
                .addField("Pages", `\`${(res.details as Details).pages}\``)
                .addField("Uploaded Since", `\`${(res.details as Details).uploaded}\``)
                .addField("Tags", `\`${(res.details as Details).tags.join("`, `")}\``)
                .setThumbnail(res.thumbnails[0]);

            const component: ActionRow = {
                    type: 1,
                    components: [
                        {
                            label: "Read",
                            custom_id: "read_prop",
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

            client.database.set(`Database.${message.guildID}.${message.author.id}.Book`, args[0]);
            message.channel.createMessage({ embeds: [embed], components: [component], messageReference: { messageID: message.id }});
        }).catch((err) => {
            return message.channel.createMessage({ content: err, messageReference: { messageID: message.id }});
        });
    }
}
