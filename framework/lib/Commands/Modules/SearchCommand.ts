import { API } from "nhentai-api";
import { ReaderClient } from "../../Client";
import { ActionRow, CommandInteraction, Constants, TextableChannel } from "eris";
import { CookieJar } from "tough-cookie";
import { HttpsCookieAgent } from "http-cookie-agent/http";
import { Utils } from "givies-framework";

export function searchCommand(client: ReaderClient, interaction: CommandInteraction<TextableChannel>) {
    const jar = new CookieJar();
    jar.setCookie("cf_clearance=q.vXMnN0OYjby.7IVpb79vIujJpiKysmj_udGw1wj70-1657627490-0-150", "https://nhentai.net/");

    const agent = new HttpsCookieAgent({ cookies: { jar } });
    // @ts-ignore
    const api = new API({ agent });
    const args: { page?: number, query?: string } = {};

    for (const option of interaction.data.options) {
        args[option.name] = (option as any).value as string;
    }

    api.search(encodeURIComponent(args.query), args.page || 1).then(async (search) => {
        if (search.books.length === 0) {
            const embed = new Utils.RichEmbed()
                .setColor(client.config.BOT.COLOUR)
                .setDescription(client.translate("main.search.none"))

            return interaction.createMessage({
                embeds: [embed],
                flags: Constants.MessageFlags.EPHEMERAL
            });
        }

        const title = search.books.map((book, index) => `**${index + 1}**. [\`${book.id}\`](https://nhentai.net/g/${book.id}) - \`${book.title.pretty}\``);

        const embed = new Utils.RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translate("main.search.titles", { titles: `\u2063 ${title.join("\n")}`}))
            .setTitle(client.translate("main.page", { firstIndex: search.page, lastIndex: search.pages }));

        const component: ActionRow = {
            type: 1,
            components: [
                {
                    custom_id: `see_more_${interaction.id}`,
                    label: client.translate("main.detail"),
                    style: 1,
                    type: 2
                }
            ]
        };

        interaction.createMessage({
            embeds: [embed],
            components: [component]
        });
    }).catch((err: string) => {
        return client.logger.error({ message: err, subTitle: "NHentaiAPI::Search", title: "API" });
    });
}
