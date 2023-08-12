import { NReaderClient } from "../../Client";
import { CommandInteraction, Constants, TextChannel } from "oceanic.js";
import { EmbedBuilder } from "@oceanicjs/builders";
import { UserModel } from "../../Models";
import { IUserSchema } from "../../Interfaces";

export async function profileCommand(
    client: NReaderClient,
    interaction: CommandInteraction<TextChannel>
) {
    const user = interaction.data.options.getUser("user") || interaction.user;
    const userData: IUserSchema = await UserModel.findOne({ id: user.id });

    if (!userData) {
        const embed = new EmbedBuilder()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(
                client.translate("general.user.notfound", {
                    user: user.mention,
                })
            )
            .toJSON();

        return interaction.createMessage({
            embeds: [embed],
            flags: Constants.MessageFlags.EPHEMERAL,
        });
    }

    const readHistory = userData.settings.history
        ? userData.stats.history.read.length !== 0
            ? userData.stats.history.read
                  .reverse()
                  .slice(0, 25)
                  .map(
                      (read) =>
                          `<t:${Math.round(
                              read.date.getTime() / 1000
                          )}:R> - \`${read.id}\``
                  )
                  .join("\n")
            : client.translate("general.profile.history.empty")
        : client.translate("general.profile.history.empty");
    const searchHistory = userData.settings.history
        ? userData.stats.history.searched.length !== 0
            ? userData.stats.history.searched
                  .reverse()
                  .slice(0, 25)
                  .map(
                      (search) =>
                          `<t:${Math.round(
                              search.date.getTime() / 1000
                          )}:R> - \`${search.query}\``
                  )
                  .join("\n")
            : client.translate("general.profile.history.empty")
        : client.translate("general.profile.history.empty");

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
        .setTitle(client.translate("general.profile.title", { user: user.username }))
        .toJSON();

    return interaction.createMessage({
        embeds: [embed],
        flags: Constants.MessageFlags.EPHEMERAL,
    });
}
