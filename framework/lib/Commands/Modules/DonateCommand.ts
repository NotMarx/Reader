import { CommandInteraction, TextChannel } from "oceanic.js";
import { EmbedBuilder } from "@oceanicjs/builders";
import { NReaderClient } from "../../Client";

export function donateCommand(
    client: NReaderClient,
    interaction: CommandInteraction<TextChannel>
) {
    const embed = new EmbedBuilder()
        .setColor(client.config.BOT.COLOUR)
        .setDescription(client.translate("general.donation", {
            kofi: "https://ko-fi.com/reinhello/goal?g=0"
        }))
        .toJSON();

    return interaction.createMessage({
        embeds: [embed],
    });
}
