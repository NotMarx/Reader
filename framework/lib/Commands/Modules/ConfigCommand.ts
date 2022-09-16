import { NReaderClient } from "../../Client";
import { CommandInteraction, Constants, InteractionOptionsString, InteractionOptionsSubCommand, TextChannel } from "oceanic.js";
import { RichEmbed } from "../../Utils/RichEmbed";
import { Util } from "../../Utils";
import { TLocale } from "../../Types";
import { GuildModel } from "../../Models";

export function configCommand(client: NReaderClient, interaction: CommandInteraction<TextChannel>) {
    const language = interaction.data.options.getString<TLocale>("language");

    if (language) {
        GuildModel.findOneAndUpdate({ id: interaction.guildID }, { $set: { "settings.locale": language } }).exec();

        const embed = new RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translateLocale(language, "mod.language.set", { language: Util.convertLocale(language) }));

        return interaction.createMessage({
            embeds: [embed.data],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }
}
