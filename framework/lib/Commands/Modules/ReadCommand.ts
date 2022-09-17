import { NReaderClient } from "../../Client";
import { MessageActionRow, CommandInteraction, Constants, TextChannel } from "oceanic.js";
import { Util } from "../../Utils";
import { GuildModel } from "../../Models";
import { createReadPaginator } from "../../Modules/ReadPaginator";
import { RichEmbed } from "../../Utils/RichEmbed";
import { setTimeout } from "node:timers/promises";

export async function readCommand(client: NReaderClient, interaction: CommandInteraction<TextChannel>) {
    const galleryID = interaction.data.options.getInteger("id").toString();

    await interaction.defer();
    await setTimeout(2000);

    client.api.getGallery(galleryID).then(async (gallery) => {
        const guildData = await GuildModel.findOne({ id: interaction.guildID });
        const artistTags: string[] = gallery.tags.artists.map((tag) => tag.name);
        const characterTags: string[] = gallery.tags.characters.map((tag) => tag.name);
        const contentTags: string[] = gallery.tags.tags.map((tag) => `${tag.name} (${tag.count.toLocaleString()})`);
        const languageTags: string[] = gallery.tags.languages.map((tag) => tag.name.charAt(0).toUpperCase() + tag.name.slice(1));
        const parodyTags: string[] = gallery.tags.parodies.map((tag) => tag.name);
        const uploadedAt = `<t:${gallery.uploadDate.getTime() / 1000}:F>`;
        const tags = gallery.tags.tags.map((tag) => tag.name);

        if (Util.findCommonElement(tags, client.config.API.RESTRICTED_TAGS) && !guildData.settings.whitelisted) {
            const embed = new RichEmbed()
                .setColor(client.config.BOT.COLOUR)
                .setDescription(client.translate("main.tags.restricted", { channel: "[#info](https://discord.com/channels/763678230976659466/1005030227174490214)", server: "https://discord.gg/b7AW2Zkcsw" }));

            return interaction.createFollowup({
                embeds: [embed.data],
                flags: Constants.MessageFlags.EPHEMERAL
            });
        }

        const embed = new RichEmbed()
            .setAuthor(gallery.id, gallery.url)
            .setColor(client.config.BOT.COLOUR)
            .addField(client.translate("main.title"), `\`${gallery.title.pretty}\``)
            .addField(client.translate("main.pages"), `\`${gallery.pages.length}\``)
            .addField(client.translate("main.released"), uploadedAt)
            .addField(languageTags.length > 1 ? client.translate("main.languages") : client.translate("main.language"), `\`${languageTags.length !== 0 ? languageTags.join("`, `") : client.translate("main.none")}\``)
            .addField(artistTags.length > 1 ? client.translate("main.artists") : client.translate("main.artist"), `\`${artistTags.length !== 0 ? artistTags.join("`, `") : client.translate("main.none")}\``)
            .addField(characterTags.length > 1 ? client.translate("main.characters") : client.translate("main.character"), `\`${characterTags.length !== 0 ? characterTags.join("`, `") : client.translate("main.original")}\``)
            .addField(parodyTags.length > 1 ? client.translate("main.parodies") : client.translate("main.parody"), `\`${parodyTags.length !== 0 ? parodyTags.join("`, `").replace("original", `${client.translate("main.original")}`) : client.translate("main.none")}\``)
            .addField(contentTags.length > 1 ? client.translate("main.tags") : client.translate("main.tag"), `\`${contentTags.length !== 0 ? contentTags.join("`, `") : client.translate("main.none")}\``)
            .setFooter(`⭐ ${gallery.favourites.toLocaleString()}`)
            .setThumbnail(gallery.cover.url);

        const component: MessageActionRow = {
            components: [
                {
                    customID: `read_${interaction.id}`,
                    label: client.translate("main.read"),
                    style: 1,
                    type: 2
                },
                {
                    customID: `stop_${interaction.id}`,
                    label: client.translate("main.stop"),
                    style: 4,
                    type: 2
                },
                {
                    customID: `bookmark_${interaction.id}`,
                    label: client.translate("main.bookmark"),
                    style: 2,
                    type: 2
                },
                {
                    customID: `show_cover_${interaction.id}`,
                    label: client.translate("main.cover.show"),
                    style: 1,
                    type: 2
                }
            ],
            type: 1
        };

        interaction.createFollowup({ components: [component], embeds: [embed.data] });
        createReadPaginator(client, gallery, interaction);
    }).catch((err: Error) => {
        const embed = new RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translate("main.error"));

        interaction.createFollowup({
            embeds: [embed.data],
        });

        return client.logger.error({ message: err.message, subTitle: "NHentaiAPI::Book", title: "API" });
    });
}
