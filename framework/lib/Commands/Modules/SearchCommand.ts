import { API } from "nhentai-api";
import { NReaderClient } from "../../Client";
import { ActionRow, CommandInteraction, Constants, TextableChannel } from "eris";
import { CookieJar } from "tough-cookie";
import { HttpsCookieAgent } from "http-cookie-agent/http";
import { Utils } from "givies-framework";
import { createSearchPaginator } from "../../Modules/SearchPaginator";
import { GuildModel } from "../../Models";
import { setTimeout } from "node:timers/promises";

export async function searchCommand(client: NReaderClient, interaction: CommandInteraction<TextableChannel>) {
    const jar = new CookieJar();
    jar.setCookie(client.config.API.COOKIE, "https://nhentai.net/");

    const agent = new HttpsCookieAgent({ cookies: { jar } });
    // @ts-ignore
    const api = new API({ agent });
    const args: { page?: number, query?: string } = {};
    const guildData = await GuildModel.findOne({ id: interaction.guildID });

    for (const option of interaction.data.options) {
        args[option.name] = (option as any).value as string;
    }

    const queryArgs = args.query.split(" ");

    if (Utils.Util.findCommonElement(queryArgs, ["lolicon", "loli", "shotacon"]) && !guildData.settings.whitelisted) {
        const embed = new Utils.RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translate("main.tags.restricted", { channel: "[#info](https://discord.com/channels/763678230976659466/1005030227174490214)", server: "https://discord.gg/b7AW2Zkcsw" }));

        return interaction.createMessage({
            embeds: [embed],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }

    await interaction.defer();
    await setTimeout(2000);

    api.search(encodeURIComponent(guildData.settings.whitelisted ? args.query : `${args.query} -lolicon -shotacon`), args.page || 1).then(async (search) => {
        if (search.books.length === 0) {
            const embed = new Utils.RichEmbed()
                .setColor(client.config.BOT.COLOUR)
                .setDescription(client.translate("main.search.none", { query: args.query }));

            return interaction.createMessage({
                embeds: [embed],
            });
        }

        const title = search.books.map((book, index) => `\`⬛ ${(index + 1).toString().length > 1 ? `${index + 1}`  : `${index + 1} `}\` - [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\``);

        const embed = new Utils.RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translate("main.search.titles", { titles: title.join("\n") }))
            .setTitle(client.translate("main.page", { firstIndex: search.page, lastIndex: search.pages.toLocaleString() }));

        const component: ActionRow = {
            components: [
                {
                    custom_id: `see_more_${interaction.id}`,
                    label: client.translate("main.detail"),
                    style: 1,
                    type: 2
                },
                {
                    custom_id: `stop_result_${interaction.id}`,
                    label: client.translate("main.stop"),
                    style: 4,
                    type: 2
                }
            ],
            type: 1
        };

        createSearchPaginator(client, search, interaction);
        interaction.createMessage({
            components: [component],
            embeds: [embed]
        });
    }).catch((err: string) => {
        return client.logger.error({ message: err, subTitle: "NHentaiAPI::Search", title: "API" });
    });
}
