import { CommandInteraction, Constants, TextableChannel } from "eris";
import { Utils } from "givies-framework";
import { ReaderClient } from "../../Client";

export function pingCommand(client: ReaderClient, interaction: CommandInteraction<TextableChannel>) {
    const embed = new Utils.RichEmbed()
        .setColor(client.config.BOT.COLOUR)
        .setDescription(client.translate("general.ping", { latency: interaction.member.guild.shard.latency.toString() }));

    return interaction.createMessage({
        embeds: [embed],
        flags: Constants.MessageFlags.EPHEMERAL
    });
}
