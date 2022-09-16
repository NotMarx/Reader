import { CommandInteraction, Constants, TextChannel } from "oceanic.js";
import { NReaderClient } from "../../Client";
import { RichEmbed } from "../../Utils/RichEmbed";
import { NReaderConstant } from "../../Constant";

export function helpCommand(client: NReaderClient, interaction: CommandInteraction<TextChannel>) {
    if (interaction.channel.nsfw) {
        const embed = new RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translate("general.help.description", { server: "https://discord.gg/b7AW2Zkcsw", user: interaction.member.username }))
            .addField(client.translate("general.help.usage.name"), client.translate("general.help.usage.value", { bot: client.user.username, doujin: `[nhentai.net](${NReaderConstant.Source.BASE})` }))
            .addField(client.translate("general.help.search.name"), client.translate("general.help.search.value", { doujin: `[nhentai.net](${NReaderConstant.Source.TAGS})` }))
            .setTitle(client.translate("general.help.title"));

        return interaction.createMessage({
            embeds: [embed.data],
        });
    } else {
        const embed = new RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translate("general.help.nsfw"))
            .setTitle(client.translate("general.help.title"));

        return interaction.createMessage({
            embeds: [embed.data],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }
}
