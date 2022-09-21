import { NReaderClient } from "../../Client";
import { CommandInteraction, Constants, TextChannel } from "oceanic.js";
import { EmbedBuilder } from "@oceanicjs/builders";
import { Util } from "../../Utils";
import { TLocale } from "../../Types";
import { GuildModel } from "../../Models";

export function configCommand(
    client: NReaderClient,
    interaction: CommandInteraction<TextChannel>
) {
    const language = interaction.data.options.getString<TLocale>("language");

    if (language) {
        GuildModel.findOneAndUpdate(
            { id: interaction.guildID },
            { $set: { "settings.locale": language } }
        ).exec();

        const embed = new EmbedBuilder()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(
                client.translateLocale(language, "mod.language.set", {
                    language: Util.convertLocale(language),
                })
            );

        return interaction.createMessage({
            embeds: [embed.toJSON()],
            flags: Constants.MessageFlags.EPHEMERAL,
        });
    }
}
