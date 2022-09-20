import { CommandInteraction, Constants, TextChannel } from "oceanic.js";
import { RichEmbed } from "../../Utils/RichEmbed";
import { NReaderClient } from "../../Client";

export function pingCommand(
    client: NReaderClient,
    interaction: CommandInteraction<TextChannel>
) {
    const embed = new RichEmbed()
        .setColor(client.config.BOT.COLOUR)
        .setDescription(
            client.translate("general.ping", {
                latency: interaction.member.guild.shard.latency.toString(),
            })
        );

    return interaction.createMessage({
        embeds: [embed.data],
        flags: Constants.MessageFlags.EPHEMERAL,
    });
}
