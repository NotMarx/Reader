import { NReaderClient } from "../../Client";
import { CommandInteraction, Constants, TextChannel } from "oceanic.js";
import { t } from "i18next";
import { GuildModel, UserModel } from "../../Models";
import { Util } from "../../Utils";
import { RichEmbed } from "../../Utils/RichEmbed";

export async function interactionCreateEvent(client: NReaderClient, interaction: CommandInteraction<TextChannel>) {
    if (!interaction.guildID) return;

    if (interaction.member.bot) return;

    const command = client.commands.get(interaction.data.name);
    const guildData = await GuildModel.findOne({ id: interaction.guildID });
    const userData = await UserModel.findOne({ id: interaction.user.id });

    client.translate = function (key, format) {
        const locale = guildData.settings.locale;

        client.initialiseLocale(locale);

        return t(key, format);
    };

    if (!userData) {
        const embed = new RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translate("general.register"));

        UserModel.create({
            bookmark: [],
            createdAt: new Date(),
            id: interaction.member.id,
            settings: {
                premium: false,
            }
        });

        return interaction.createMessage({
            embeds: [embed.data],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }

    if (interaction.type === 2) {
        if (command) {
            return Util.checkCommandPerms(client, interaction);
        }
    }
}
