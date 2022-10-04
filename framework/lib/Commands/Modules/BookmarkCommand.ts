import { NReaderClient } from "../../Client";
import {
    MessageActionRow,
    CommandInteraction,
    Constants,
    TextChannel,
} from "oceanic.js";
import { ComponentBuilder, EmbedBuilder } from "@oceanicjs/builders";
import { Gallery } from "../../API";
import { UserModel } from "../../Models";
import { createBookmarkPaginator } from "../../Modules/BookmarkPaginator";
import { setTimeout } from "node:timers/promises";

export async function bookmarkCommand(
    client: NReaderClient,
    interaction: CommandInteraction<TextChannel>
) {
    const user = interaction.data.options.getUser("user") || interaction.user;
    const userData = await UserModel.findOne({ id: user.id });

    client.stats.updateUserHistory(
        interaction.user.id,
        "searched",
        `${user.tag} (${user.id})`,
        "bookmark"
    );

    if (!userData) {
        const embed = new EmbedBuilder()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translate("general.user.notfound", { user: user.mention }))
            .toJSON();

        return interaction.createMessage({
            embeds: [embed],
            flags: Constants.MessageFlags.EPHEMERAL,
        });
    }

    const bookmarked = userData.bookmark;

    if (user) {
        if (!bookmarked || bookmarked.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(client.config.BOT.COLOUR)
                .setDescription(
                    client.translate("main.bookmark.none", {
                        user: user.username,
                    })
                )
                .setTitle(
                    client.translate("main.bookmark.title", {
                        user: user.username,
                    })
                );

            return interaction.createMessage({
                embeds: [embed.toJSON()],
                flags: Constants.MessageFlags.EPHEMERAL,
            });
        }

        await interaction.defer();
        await setTimeout(2000);

        const bookmarkedTitle: string[] = [];
        const galleries: Gallery[] = [];

        for (let i = 0; i < bookmarked.length; i++) {
            let title: string;
            let gallery: Gallery;

            try {
                title = await client.api
                    .getGallery(bookmarked[i])
                    .then(
                        (gallery) =>
                            `\`⬛ ${
                                (i + 1).toString().length > 1
                                    ? `${i + 1}`
                                    : `${i + 1} `
                            }\` - [\`${gallery.id}\`](${gallery.url}) - \`${
                                gallery.title.pretty.length >= 30
                                    ? `${gallery.title.pretty.slice(0, 30)}...`
                                    : gallery.title.pretty
                            }\``
                    );
                gallery = await client.api.getGallery(bookmarked[i]);
            } catch (err) {
                const embed = new EmbedBuilder()
                    .setColor(client.config.BOT.COLOUR)
                    .setDescription(client.translate("main.error"));

                return interaction.createMessage({
                    embeds: [embed.toJSON()],
                });
            }

            galleries.push(gallery);
            bookmarkedTitle.push(title);
        }

        const components = new ComponentBuilder<MessageActionRow>()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `see_more_${interaction.id}`,
                client.translate("main.detail")
            )
            .addInteractionButton(
                Constants.ButtonStyles.DANGER,
                `stop_result_${interaction.id}`,
                client.translate("main.stop")
            )
            .toJSON();

        const embed = new EmbedBuilder()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(bookmarkedTitle.join("\n"))
            .setTitle(
                client.translate("main.bookmark.title", { user: user.username })
            );

        createBookmarkPaginator(client, galleries, interaction, user);
        return interaction.createFollowup({
            components,
            embeds: [embed.toJSON()],
        });
    } else {
        const embed = new EmbedBuilder()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translate("main.error"));

        return interaction.createFollowup({
            embeds: [embed.toJSON()],
        });
    }
}
