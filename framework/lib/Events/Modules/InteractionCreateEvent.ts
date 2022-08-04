import { ReaderClient } from "../../Client";
import { CommandInteraction, Constants, TextChannel } from "eris";
import { t } from "i18next";
import { GuildModel, UserModel } from "../../Models";
import { Utils } from "givies-framework";
import { Util } from "../../Utils";

export async function interactionCreateEvent(client: ReaderClient, interaction: CommandInteraction<TextChannel>) {
    if (!interaction.guildID) return;

    if (interaction.member.bot) return;

    const command = client.commands.get(interaction.data.name);
    const guildData = await GuildModel.findOne({ id: interaction.guildID });
    const userData = await UserModel.findOne({ id: interaction.member.id });

    client.translate = function (key, format) {
        const locale = guildData.settings.locale;

        client.initialiseLocale(locale);

        return t(key, format);
    };

    if (!userData) {
        const embed = new Utils.RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translate("general.register"));

        UserModel.create({
            bookmark: [],
            createdAt: new Date(),
            id: interaction.member.id,
            settings: {
                premium: false,
                readState: "current"
            }
        });

        return interaction.createMessage({
            embeds: [embed],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }

    if (interaction.type === 2) {
        if (command) {
            return Util.checkCommandPerms(client, interaction);
        }
    }
}
