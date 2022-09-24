import { NReaderClient } from "../../Client";
import { CommandInteraction, Constants, TextChannel } from "oceanic.js";
import { UserModel } from "../../Models";
import { EmbedBuilder } from "@oceanicjs/builders";
import { Util } from "../../Utils";

export async function premiumCommand(
    client: NReaderClient,
    interaction: CommandInteraction<TextChannel>
) {
    const user = interaction.data.options.getUser("user");
    const premium = interaction.data.options.getBoolean("premium");

    if (user && typeof premium === "boolean") {
        const userData = await UserModel.findOne({ id: user.id });

        if (!userData) {
            const embed = new EmbedBuilder()
                .setColor(client.config.BOT.COLOUR)
                .setDescription(client.translate("developer.user.notfound"));

            return interaction.createMessage({
                embeds: [embed.toJSON()],
                flags: Constants.MessageFlags.EPHEMERAL,
            });
        }

        const embed = new EmbedBuilder()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(
                client.translate("developer.premium.config", {
                    premium: Util.convertBoolean(premium),
                    user: user.tag,
                })
            );

        userData.settings.premium = premium;
        userData.save();

        return interaction.createMessage({
            embeds: [embed.toJSON()],
            flags: Constants.MessageFlags.EPHEMERAL,
        });
    }

    if (!user && typeof premium === "boolean") {
        const usersData = await UserModel.find({});
        const embed = new EmbedBuilder()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(
                client.translate("developer.temporaryPremium.config", {
                    premium: Util.convertBoolean(premium),
                })
            );

        usersData.forEach((user) => {
            user.settings.temporaryPremium = premium;
            user.save();
        });

        return interaction.createMessage({
            embeds: [embed.toJSON()],
            flags: Constants.MessageFlags.EPHEMERAL,
        });
    }
}
