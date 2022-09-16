import { NReaderClient } from "../../Client";
import { CommandInteraction, Constants, InteractionOptionsString, InteractionOptionsSubCommand, TextChannel } from "oceanic.js";
import { RichEmbed } from "../../Utils/RichEmbed";
import { Util } from "../../Utils";
import { TLocale } from "../../Types";
import { GuildModel } from "../../Models";

export function configCommand(client: NReaderClient, interaction: CommandInteraction<TextChannel>) {
    const args: { language?: TLocale } = {};

    for (const option of (interaction.data.options[0] as InteractionOptionsSubCommand).options) {
        args[(option as InteractionOptionsString).name] = (option as InteractionOptionsString).value;
    }

    if (args.language) {
        GuildModel.findOneAndUpdate({ id: interaction.guildID }, { $set: { "settings.locale": args.language } }).exec();

        const embed = new RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translateLocale(args.language, "mod.language.set", { language: Util.convertLocale(args.language) }));

        return interaction.createMessage({
            embeds: [embed.data],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }
}
