import { ReaderClient } from "../../Client";
import { CommandInteraction, Constants, TextableChannel } from "eris";
import { ICommandRunPayload } from "../../Interfaces";
import { t } from "i18next";
import { GuildModel, UserModel } from "../../Models";
import { Utils } from "givies-framework";

export async function interactionCreateEvent(client: ReaderClient, interaction: CommandInteraction<TextableChannel>) {
    if (!interaction.guildID) return;

    if (interaction.member.bot) return;

    const command = client.commands.get(interaction.data.name);
    const payload: ICommandRunPayload = { client, interaction };
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
                readState: "new"
            }
        });

        return interaction.createMessage({
            embeds: [embed],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }

    if (interaction.type === 2) {
        return command.run(payload);
    }
}
