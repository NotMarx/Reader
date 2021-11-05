"use strict";

import { Event } from "../Interfaces";
import { ActionRowComponents, ComponentInteraction, EmbedOptions, TextableChannel } from "eris";

export const event: Event = {
    name: "interactionCreate",
    run: async (client, interaction: ComponentInteraction<TextableChannel>) => {
        if (interaction.type === 3 && interaction.data.component_type === 2) {
            switch (interaction.data.custom_id) {
                case "agree_privacy":
                    const agreeComponent: ActionRowComponents[] = [
                        {
                            type: 2,
                            custom_id: "agree_privacy",
                            label: "Agree",
                            style: 3,
                            disabled: true
                        },
                        {
                            type: 2,
                            custom_id: "disagree_policy",
                            label: "Disagree",
                            style: 4,
                            disabled: true
                        }
                    ];

                    const agreeEmbed: EmbedOptions = {
                        title: "First Experience [APPROVED]",
                        description: `You've agreed to the **Privacy Policy**! You may start using the commands. If you're completely new, type \`${client.database.fetch(`Database.${interaction.guildID}.Prefix`) || client.config.PREFIX}help\``,
                        color: client.config.COLOR
                    }

                    interaction.acknowledge().then(() => {
                        interaction.editMessage(interaction.message.id, { embeds: [agreeEmbed], components: [{ type: 1, components: agreeComponent }] });
                    })
                    client.database.set(`Database.${interaction.member ? interaction.member.id : interaction.user.id}.Experience`, true);
                    break;
                case "disagree_privacy":
                    const disagreeComponent: ActionRowComponents[] = [
                        {
                            type: 2,
                            custom_id: "agree_privacy",
                            label: "Agree",
                            style: 3,
                            disabled: true
                        },
                        {
                            type: 2,
                            custom_id: "disagree_policy",
                            label: "Disagree",
                            style: 4,
                            disabled: true
                        }
                    ];

                    const disagreeEmbed: EmbedOptions = {
                        title: "First Experience [DISAPPROVED]",
                        description: `You've **NOT** agree to the **Privacy Policy**! You're not permitted to use any commands unless you click **Agree**.`,
                        color: client.config.COLOR
                    }

                    interaction.acknowledge().then(() => {
                        interaction.editMessage(interaction.message.id, { embeds: [disagreeEmbed], components: [{ type: 1, components: disagreeComponent }] });
                    })
                    client.database.set(`${interaction.member ? interaction.member.id : interaction.user.id}`, false);
                    break;
                case "bookmark_prop":
                    const savedCode: string = interaction.message.embeds[0].author.name;
                    const codeBank: string[] = await client.database.fetch(`Database.${interaction.member.id}.Bookmark`);
                    const prefix: string = await client.database.fetch(`Database.${interaction.guildID}.Prefix`) || client.config.PREFIX;

                    if (!codeBank) {
                        client.database.set(`Database.${interaction.member.id}.Bookmark`, []);
                        return interaction.createMessage({
                            embeds: [
                                {
                                    title: "First Experience",
                                    description: "It seems that this is your first time bookmarking therefore, I've created a Bookmark Database for you! \n\n Click the **Bookmark** button again to proceed",
                                    color: client.config.COLOR
                                }
                            ],
                            flags: 64
                        });
                    }

                    if (codeBank.length === 25) {
                        return interaction.createMessage({
                            embeds: [
                                {
                                    title: "Max Bookmarks Exceeded!",
                                    description: "I'm sorry but you've reached the maximum amount of bookmarked doujins. If you wish to bookmark more doujins, you may unbookmarked your bookmarked doujins.",
                                    color: client.config.COLOR
                                }
                            ],
                            flags: 64
                        })
                    }

                    if (codeBank.includes(savedCode)) {
                        await client.database.extract(`Database.${interaction.member.id}.Bookmark`, savedCode);
                        return interaction.createMessage({
                            embeds: [
                                {
                                    description: `Successfully removed [${savedCode}](https://nhentai.net/g/${savedCode}/) from your bookmarks!`,
                                    color: client.config.COLOR
                                }
                            ],
                            flags: 64
                        });
                    }

                    client.database.push(`Database.${interaction.member.id}.Bookmark`, savedCode);

                    interaction.createMessage({ embeds: [{
                        description: `Successfully added [${savedCode}](https://nhentai.net/g/${savedCode}/) to your bookmarks! Use \`${prefix}bookmark\` to view them.`,
                        color: client.config.COLOR
                    }], flags: 64 });
                    break;
                case "kill_prop":
                    interaction.acknowledge();
                    interaction.message.delete();
                    break;
                case "easter_kill_prop":
                    interaction.createMessage({ content: "https://media.discordapp.net/attachments/847182285144588308/885694559659622420/party-kirby.gif", flags: 64 });
            }
        }
    }
}
