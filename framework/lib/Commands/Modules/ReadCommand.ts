import { NReaderClient } from "../../Client";
import {
    MessageActionRow,
    CommandInteraction,
    Constants,
    TextChannel,
} from "oceanic.js";
import { ComponentBuilder, EmbedBuilder } from "@oceanicjs/builders";
import { createReadPaginator } from "../../Modules/ReadPaginator";
import { setTimeout } from "node:timers/promises";
import { NReaderConstant } from "../../Constant";

export async function readCommand(
    client: NReaderClient,
    interaction: CommandInteraction<TextChannel>
) {
    const galleryID = interaction.data.options.getInteger("id").toString();

    client.stats.updateUserHistory(
        interaction.user.id,
        "searched",
        galleryID,
        "read"
    );

    client.stats.logActivities(interaction.user.id, "read", galleryID);

    await interaction.defer();
    await setTimeout(2000);

    client.api
        .getBook(parseInt(galleryID))
        .then(async (gallery) => {
            const artistTags: string[] = gallery.artists.map((tag) => tag.name);
            const characterTags: string[] = gallery.characters.map(
                (tag) => tag.name
            );
            const contentTags: string[] = gallery.pureTags.map(
                (tag) => `${tag.name} (${tag.count.toLocaleString()})`
            );
            const languageTags: string[] = gallery.languages.map(
                (tag) => tag.name.charAt(0).toUpperCase() + tag.name.slice(1)
            );
            const parodyTags: string[] = gallery.parodies.map(
                (tag) => tag.name
            );
            const uploadedAt = `<t:${gallery.uploaded.getTime() / 1000}:F>`;
            const stringTag =
                contentTags.join("`, `").length >= 1024
                    ? `${contentTags.join("`, `").slice(0, 1010)}...`
                    : contentTags.join("`, `");

            const embed = new EmbedBuilder()
                .setAuthor(
                    gallery.id.toString(),
                    undefined,
                    `https://nhentai.net/g/${gallery.id}`
                )
                .setColor(client.config.BOT.COLOUR)
                .addField(
                    client.translate("main.title"),
                    `\`${gallery.title.pretty}\``
                )
                .addField(
                    client.translate("main.pages"),
                    `\`${gallery.pages.length}\``
                )
                .addField(client.translate("main.released"), uploadedAt)
                .addField(
                    languageTags.length > 1
                        ? client.translate("main.languages")
                        : client.translate("main.language"),
                    `\`${
                        languageTags.length !== 0
                            ? languageTags.join("`, `")
                            : client.translate("main.none")
                    }\``
                )
                .addField(
                    artistTags.length > 1
                        ? client.translate("main.artists")
                        : client.translate("main.artist"),
                    `\`${
                        artistTags.length !== 0
                            ? artistTags.join("`, `")
                            : client.translate("main.none")
                    }\``
                )
                .addField(
                    characterTags.length > 1
                        ? client.translate("main.characters")
                        : client.translate("main.character"),
                    `\`${
                        characterTags.length !== 0
                            ? characterTags.join("`, `")
                            : client.translate("main.original")
                    }\``
                )
                .addField(
                    parodyTags.length > 1
                        ? client.translate("main.parodies")
                        : client.translate("main.parody"),
                    `\`${
                        parodyTags.length !== 0
                            ? parodyTags
                                  .join("`, `")
                                  .replace(
                                      "original",
                                      `${client.translate("main.original")}`
                                  )
                            : client.translate("main.none")
                    }\``
                )
                .addField(
                    contentTags.length > 1
                        ? client.translate("main.tags")
                        : client.translate("main.tag"),
                    `\`${
                        contentTags.length !== 0
                            ? stringTag
                            : client.translate("main.none")
                    }\``
                )
                .setFooter(`⭐ ${gallery.favorites.toLocaleString()}`)
                .setThumbnail(client.api.getImageURL(gallery.cover));

            const components = new ComponentBuilder<MessageActionRow>()
                .addInteractionButton(
                    Constants.ButtonStyles.PRIMARY,
                    `read_${interaction.id}`,
                    client.translate("main.read")
                )
                .addInteractionButton(
                    Constants.ButtonStyles.DANGER,
                    `stop_${interaction.id}`,
                    client.translate("main.stop")
                )
                .addInteractionButton(
                    Constants.ButtonStyles.SECONDARY,
                    `bookmark_${interaction.id}`,
                    client.translate("main.bookmark")
                )
                .addInteractionButton(
                    Constants.ButtonStyles.PRIMARY,
                    `show_cover_${interaction.id}`,
                    client.translate("main.cover.show")
                )
                .toJSON();

            interaction.createFollowup({
                components,
                embeds: [embed.toJSON()],
            });
            createReadPaginator(client, gallery, interaction);
        })
        .catch((err: Error) => {
            const embed = new EmbedBuilder()
                .setColor(client.config.BOT.COLOUR)
                .setDescription(
                    client.translate("main.invalid", {
                        result: NReaderConstant.Source.ID(galleryID),
                    })
                );

            interaction.createFollowup({
                embeds: [embed.toJSON()],
            });

            return client.logger.error({
                message: err.message,
                subTitle: "NHentaiAPI::Book",
                title: "API",
            });
        });
}
