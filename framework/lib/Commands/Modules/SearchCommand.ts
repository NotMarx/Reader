import { Constant } from "../../API";
import { NReaderClient } from "../../Client";
import { MessageActionRow, CommandInteraction, Constants, TextChannel } from "oceanic.js";
import { RichEmbed } from "../../Utils/RichEmbed";
import { Util } from "../../Utils";
import { createSearchPaginator } from "../../Modules/SearchPaginator";
import { GuildModel } from "../../Models";
import { setTimeout } from "node:timers/promises";

export async function searchCommand(client: NReaderClient, interaction: CommandInteraction<TextChannel>) {
    const page = interaction.data.options.getInteger("page");
    const query = interaction.data.options.getString("query");
    const sort = interaction.data.options.getString<Constant.TSearchSort>("sort");
    const guildData = await GuildModel.findOne({ id: interaction.guildID });

    const queryArgs = query.split(" ");

    if (Util.findCommonElement(queryArgs, client.config.API.RESTRICTED_TAGS) && !guildData.settings.whitelisted) {
        const embed = new RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translate("main.tags.restricted", { channel: "[#info](https://discord.com/channels/763678230976659466/1005030227174490214)", server: "https://discord.gg/b7AW2Zkcsw" }));

        return interaction.createFollowup({
            embeds: [embed.data],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }

    await interaction.defer();
    await setTimeout(2000);

    client.api.searchGalleries(encodeURIComponent(guildData.settings.whitelisted ? query : `${query} -lolicon -shotacon`), page || 1, sort || "").then(async (search) => {
        if (search.result.length === 0) {
            const embed = new RichEmbed()
                .setColor(client.config.BOT.COLOUR)
                .setDescription(client.translate("main.search.none", { query: query }));

            return interaction.createMessage({
                embeds: [embed.data],
            });
        }

        const title = search.result.map((gallery, index) => `\`⬛ ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${gallery.id}\`](${gallery.url}) - \`${gallery.title.pretty.length >= 30 ? `${gallery.title.pretty.slice(0, 30)}...` : gallery.title.pretty}\``);

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
        if (err) {
            const embed = new RichEmbed()
                .setColor(client.config.BOT.COLOUR)
                .setDescription(client.translate("main.error"));

            interaction.createFollowup({
                embeds: [embed.data],
            });
        }

        return client.logger.error({ message: err.message, subTitle: "NHentaiAPI::Search", title: "API" });
    });
}
