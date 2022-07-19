import { API } from "nhentai-api";
import { ReaderClient } from "../../Client";
import { ActionRow, CommandInteraction, Constants, TextableChannel } from "eris";
import { CookieJar } from "tough-cookie";
import { HttpsCookieAgent } from "http-cookie-agent/http";
import { Utils } from "givies-framework";
import { createSearchPaginator } from "../../Modules/SearchPaginator";

export function searchSimilarCommand(client: ReaderClient, interaction: CommandInteraction<TextableChannel>) {
    const jar = new CookieJar();
    jar.setCookie("cf_clearance=h87Y8lBhhqkjIKC_X5lW8XUIbjaJ5dMVnmhWVU27aWw-1658193445-0-150", "https://nhentai.net/");

    const agent = new HttpsCookieAgent({ cookies: { jar } });
    // @ts-ignore
    const api = new API({ agent });
    const args: { id?: number } = {};

    for (const option of interaction.data.options) {
        args[option.name] = (option as any).value as string;
    }

    api.searchAlike(args.id).then(async (search) => {
        if (search.books.length === 0) {
            const embed = new Utils.RichEmbed()
                .setColor(client.config.BOT.COLOUR)
                .setDescription(client.translate("main.search.none"));

            return interaction.createMessage({
                embeds: [embed],
                flags: Constants.MessageFlags.EPHEMERAL
            });
        }

        const title = search.books.map((book, index) => `${index + 1}. [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\``);

        const embed = new Utils.RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translate("main.search.titles", { titles: `\u2063 ${title.join("\n")}` }))
            .setTitle(client.translate("main.page", { firstIndex: search.page, lastIndex: search.pages }));

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
        return client.logger.error({ message: err, subTitle: "NHentaiAPI::SearchALike", title: "API" });
    });
}
