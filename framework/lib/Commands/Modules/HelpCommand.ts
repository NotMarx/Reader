import { CommandInteraction, Constants, TextableChannel, TextChannel } from "eris";
import { NReaderClient } from "../../Client";
import { Utils } from "givies-framework";

export function helpCommand(client: NReaderClient, interaction: CommandInteraction<TextableChannel>) {
    if ((interaction.channel as TextChannel).nsfw) {
        const embed = new Utils.RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translate("general.help.description", { user: interaction.member.username }))
            .addField(client.translate("general.help.usage.name"), client.translate("general.help.usage.value", { bot: client.user.username, doujin: "[nhentai.net](https://nhentai.net)" }))
            .addField(client.translate("general.help.search.name"), client.translate("general.help.search.value", { doujin: "[nhentai.net](https://nhentai.net/tags/)" }))
            .setTitle(client.translate("general.help.title"));

        return interaction.createMessage({
            embeds: [embed],
        });
    } else {
        const embed = new Utils.RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translate("general.help.nsfw"))
            .setTitle(client.translate("general.help.title"));

        return interaction.createMessage({
            embeds: [embed],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }
}
