import { ReaderClient } from "../../Client";
import { CommandInteraction, Constants, InteractionDataOptionsString, InteractionDataOptionsSubCommand, TextableChannel } from "eris";
import { Utils } from "givies-framework";
import { Util } from "../../Utils";
import { TLocale } from "../../Types";
import { GuildModel } from "../../Models";

export function configCommand(client: ReaderClient, interaction: CommandInteraction<TextableChannel>) {
    const args: { language?: TLocale } = {};

    for (const option of (interaction.data.options[0] as InteractionDataOptionsSubCommand).options) {
        args[(option as InteractionDataOptionsString).name] = (option as InteractionDataOptionsString).value;
    }

    if (args.language) {
        GuildModel.findOneAndUpdate({ id: interaction.guildID }, { $set: { "settings.locale": args.language } }).exec();

        const embed = new Utils.RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translateLocale(args.language, "mod.language.set", { language: Util.convertLocale(args.language) }));

        return interaction.createMessage({
            embeds: [embed],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }
}
