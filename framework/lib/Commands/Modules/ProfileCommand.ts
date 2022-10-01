import { NReaderClient } from "../../Client";
import { CommandInteraction, TextChannel } from "oceanic.js";
import { EmbedBuilder } from "@oceanicjs/builders";
import { UserModel } from "../../Models";
import { IUserSchema } from "../../Interfaces";

export async function profileCommand(
    client: NReaderClient,
    interaction: CommandInteraction<TextChannel>
) {
    const user =
        interaction.data.options.resolved !== null
            ? interaction.data.options.getUser("user")
            : interaction.member;
    const userData: IUserSchema = await UserModel.findOne({ id: user.id });
    const readHistory = userData.stats.history.read
        .reverse()
        .map(
            (read) =>
                `<t:${Math.round(read.date.getTime() / 1000)}:R> - \`${
                    read.id
                }\``
        )
        .join("\n");
    const searchHistory = userData.stats.history.searched
        .reverse()
        .map(
            (search) =>
                `<t:${Math.round(search.date.getTime() / 1000)}:R> - \`${
                    search.query
                }\``
        )
        .join("\n");

    const embed = new EmbedBuilder()
        .setColor(client.config.BOT.COLOUR)
        .addField(
            client.translate("general.profile.history.read"),
            readHistory,
            true
        )
        .addField(
            client.translate("general.profile.history.searched"),
            searchHistory,
            true
        )
        .setThumbnail(user.avatarURL())
        .setTitle(client.translate("general.profile.title", { user: user.tag }))
        .toJSON();

    return interaction.createMessage({
        embeds: [embed],
    });
}
