import { NReaderClient } from "../../Client";
import { MessageActionRow, CommandInteraction, Constants, TextChannel } from "oceanic.js";
import { RichEmbed } from "../../Utils/RichEmbed";
import { Util } from "../../Utils";
import { createSearchPaginator } from "../../Modules/SearchPaginator";
import { GuildModel } from "../../Models";
import { setTimeout } from "node:timers/promises";

export async function searchSimilarCommand(client: NReaderClient, interaction: CommandInteraction<TextChannel>) {
    const args: { id?: number } = {};
    const guildData = await GuildModel.findOne({ id: interaction.guildID });

    for (const option of interaction.data.options.raw) {
        args[option.name] = (option as any).value as string;
    }

    const gallery = await client.api.getGallery(args.id.toString());
    const tags = gallery.tags.tags.map((tag) => tag.name);

    if (Util.findCommonElement(tags, client.config.API.RESTRICTED_TAGS) && !guildData.settings.whitelisted) {
        const embed = new RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translate("main.tags.restricted", { channel: "[#info](https://discord.com/channels/763678230976659466/1005030227174490214)", server: "https://discord.gg/b7AW2Zkcsw" }));

        return interaction.createMessage({
            embeds: [embed.data],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }

    await interaction.defer();
    await setTimeout(2000);

    client.api.getGalleryRelated(args.id.toString()).then(async (search) => {
        if (search.result.length === 0) {
            const embed = new RichEmbed()
                .setColor(client.config.BOT.COLOUR)
                .setDescription(client.translate("main.search.empty"));

            return interaction.createMessage({
                embeds: [embed.data],
            });
        }

        const title = search.result.map((gallery, index) => `\`⬛ ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${gallery.id}\`](${gallery.url}) - \`${gallery.title.pretty}\``);

        const embed = new RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(title.join("\n"))
            .setTitle(client.translate("main.page", { firstIndex: search.page, lastIndex: search.numPages.toLocaleString() }));

        const component: MessageActionRow = {
            components: [
                {
                    customID: `see_more_${interaction.id}`,
                    label: client.translate("main.detail"),
                    style: 1,
                    type: 2
                },
                {
                    customID: `stop_result_${interaction.id}`,
                    label: client.translate("main.stop"),
                    style: 4,
                    type: 2
                }
            ],
            type: 1
        };

        createSearchPaginator(client, search, interaction);
        interaction.createFollowup({
            components: [component],
            embeds: [embed.data]
        });
    }).catch((err: Error) => {
        if (err.message === "Request failed with status code 404") {
            const embed = new RichEmbed()
                .setColor(client.config.BOT.COLOUR)
                .setDescription(client.translate("main.read.none", { id: args.id }));

            return interaction.createMessage({
                embeds: [embed.data],
            });
        } else {
            const embed = new RichEmbed()
                .setColor(client.config.BOT.COLOUR)
                .setDescription(client.translate("main.error"));

            interaction.createMessage({
                embeds: [embed.data],
            });
        }

        return client.logger.error({ message: err.message, subTitle: "NHentaiAPI::SearchALike", title: "API" });
    });
}
