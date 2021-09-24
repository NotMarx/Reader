"use strict";

import { Command } from "../../Interfaces";
import { ActionRow, EmbedOptions } from "eris";
import API, { Details } from "../../Extensions/API";

export const command: Command = {
    name: "read",
    description: "Read a Doujin",
    aliases: ["doujin"],
    category: "Main",
    usage: "read <doujin_code>",
    nsfwOnly: true,
    run: async (client, message, args) => {
        const isReading: string = await client.database.fetch(`Database.${message.guildID}.${message.author.id}.Book`);

        // Prevent double reading 
        if (isReading) {
            const embed: EmbedOptions = {
                title: "Ongoing",
                color: client.config.COLOUR,
                description: "You can only read one at a time!",
                fields: [
                    {
                        name: "Need Help?",
                        value: "We don't provide any Support for now"
                    }
                ]
            }

            return message.channel.createMessage({ embeds: [embed] });
        }

        API.getCode(args[0]).then((res) => {
            const embed: EmbedOptions = {
                author: {
                    name: args[0],
                    url: res.url
                },
                color: client.config.COLOUR,
                fields: [
                    {
                        name: "Title",
                        value: `\`${res.title}\``
                    },
                    {
                        name: "Pages",
                        value: `\`${(res.details as Details).pages}\``
                    },
                    {
                        name: "Uploaded Since",
                        value: `\`${(res.details as Details).uploaded}\``
                    },
                    {
                        name: "Tags",
                        value: `\`${(res.details as Details).tags.join("`, `")}\``
                    }
                ],
                thumbnail: {
                    url: res.thumbnails[0]
                }
            };

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
