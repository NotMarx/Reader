import { NReaderClient } from "../../Client";
import { CommandInteraction, Constants, TextChannel } from "oceanic.js";
import { EmbedBuilder } from "@oceanicjs/builders";
import { UserModel } from "../../Models";

export async function profileEditCommand(
    client: NReaderClient,
    interaction: CommandInteraction<TextChannel>
) {
    const userData = await UserModel.findOne({
        id: interaction.user.id,
    });
    const history = interaction.data.options.getBoolean("history") || false;
    const embed = new EmbedBuilder()
        .setColor(client.config.BOT.COLOUR)
        .addField(
            client.translate("mod.profile.history"),
            history
                ? client.translate("mod.enabled")
                : client.translate("mod.disabled"),
            true
        )
        .setTitle(
            client.translate("mod.profile.title", {
                user: interaction.user.username,
            })
        )
        .toJSON();

    userData.settings.history = history;
    userData.save();

    return interaction.createMessage({
        embeds: [embed],
        flags: Constants.MessageFlags.EPHEMERAL,
    });
}
