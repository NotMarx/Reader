import { ReaderClient } from "../../Client";
import { ActionRow, CommandInteraction, TextableChannel } from "eris";
import { API } from "nhentai-api";
import { CookieJar } from "tough-cookie";
import { HttpsCookieAgent } from "http-cookie-agent/http";
import { GuildModel } from "../../Models";
import { createReadPaginator } from "../../Modules/ReadPaginator";
import { Utils } from "givies-framework";
import moment from "moment";

export function readCommand(client: ReaderClient, interaction: CommandInteraction<TextableChannel>) {
    const jar = new CookieJar();
    jar.setCookie("cf_clearance=wknDFa_slMQACS1WhjF.ew4urrNbNyxuzIm9nod9qaY-1657590028-0-150", "https://nhentai.net/");

    const agent = new HttpsCookieAgent({ cookies: { jar } });
    // @ts-ignore
    const api = new API({ agent });
    const args: { id?: number } = {};

    for (const option of interaction.data.options) {
        args[option.name] = (option as any).value as string;
    }

    api.getBook(args.id).then(async (book) => {
        const guildData = await GuildModel.findOne({ id: interaction.guildID });
        const artistTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/artist")).map((tag) => tag.name);
        const characterTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/character")).map((tag) => tag.name);
        const contentTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/tag")).map((tag) => `${tag.name} (${tag.count.toLocaleString()})`);
        const languageTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/language")).map((tag) => tag.name);
        const parodyTags: string[] = book.tags.filter((tag) => tag.url.startsWith("/parody")).map((tag) => tag.name);
        const uploadedAt = moment(book.uploaded).locale(guildData.settings.locale).format("dddd, MMMM Do, YYYY h:mm A");

        const embed = new Utils.RichEmbed()
            .setAuthor(book.id.toString(), `https://nhentai.net/g/${book.id.toString()}`)
            .setColor(client.config.BOT.COLOUR)
            .addField(client.translate("main.title"), `\`${book.title.pretty}\``)
            .addField(client.translate("main.pages"), `\`${book.pages.length}\``)
            .addField(client.translate("main.released"), `\`${client.translate("main.date", { date: uploadedAt })}\``)
            .addField(languageTags.length > 1 ? client.translate("main.languages") : client.translate("main.language"), `\`${languageTags.length !== 0 ? languageTags.join("`, `") : client.translate("main.none")}\``)
            .addField(artistTags.length > 1 ? client.translate("main.artists") : client.translate("main.artist"), `\`${artistTags.length !== 0 ? artistTags.join("`, `") : client.translate("main.none")}\``)
            .addField(characterTags.length > 1 ? client.translate("main.characters") : client.translate("main.character"), `\`${characterTags.length !== 0 ? characterTags.join("`, `") : client.translate("main.original")}\``)
            .addField(parodyTags.length > 1 ? client.translate("main.parodies") : client.translate("main.parody"), `\`${parodyTags.length !== 0 ? parodyTags.join("`, `") : client.translate("main.none")}\``)
            .addField(contentTags.length > 1 ? client.translate("main.tags") : client.translate("main.tag"), `\`${contentTags.length !== 0 ? contentTags.join("`, `") : client.translate("main.none")}\``)
            .setFooter(`⭐ ${book.favorites.toLocaleString()}`)
            .setThumbnail(api.getImageURL(book.cover));

        const component: ActionRow = {
            components: [
                {
                    custom_id: `read_${interaction.id}`,
                    label: client.translate("main.read"),
                    style: 1,
                    type: 2
                },
                {
                    custom_id: `stop_${interaction.id}`,
                    label: client.translate("main.stop"),
                    style: 4,
                    type: 2
                },
                {
                    custom_id: `bookmark_${interaction.id}`,
                    label: client.translate("main.bookmark"),
                    style: 2,
                    type: 2
                },
                {
                    custom_id: `show_cover_${interaction.id}`,
                    label: client.translate("main.cover.show"),
                    style: 1,
                    type: 2
                }
            ],
            type: 1
        };

        interaction.createMessage({ components: [component], embeds: [embed] });
        createReadPaginator(client, book, interaction);
    }).catch((err) => {
        return client.logger.error({ message: err, subTitle: "NHentai::API::Book", title: "API" });
    });
}
