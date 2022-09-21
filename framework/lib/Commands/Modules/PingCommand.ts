import { CommandInteraction, Constants, TextChannel } from "oceanic.js";
import { EmbedBuilder } from "@oceanicjs/builders";
import { NReaderClient } from "../../Client";

export function pingCommand(
    client: NReaderClient,
    interaction: CommandInteraction<TextChannel>
) {
    const embed = new EmbedBuilder()
        .setColor(client.config.BOT.COLOUR)
        .setDescription(
            client.translate("general.ping", {
                latency: interaction.member.guild.shard.latency.toString(),
            })
        );

    return interaction.createMessage({
        embeds: [embed.toJSON()],
        flags: Constants.MessageFlags.EPHEMERAL,
    });
}
