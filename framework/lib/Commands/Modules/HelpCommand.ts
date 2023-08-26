import { CommandInteraction, Constants, TextChannel } from "oceanic.js";
import { NReaderClient } from "../../Client";
import { EmbedBuilder } from "@oceanicjs/builders";
import { NReaderConstant } from "../../Constant";

export function helpCommand(
    client: NReaderClient,
    interaction: CommandInteraction<TextChannel>
) {
    if (interaction.channel.nsfw) {
        const embed = new EmbedBuilder()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(
                client.translate("general.help.description", {
                    server: "https://discord.gg/b7AW2Zkcsw",
                    user: interaction.member.username,
                })
            )
            .addField(
                client.translate("general.help.usage.name"),
                client.translate("general.help.usage.value", {
                    bot: client.user.username,
                    doujin: `[nhentai.net](${NReaderConstant.Source.BASE})`,
                })
            )
            .addField(
                client.translate("general.help.search.name"),
                client.translate("general.help.search.value", {
                    doujin: `[nhentai.net](${NReaderConstant.Source.TAGS})`,
                }) +
                    "\n\n" +
                    `> ${client.translate("general.donation", {
                        kofi: "https://ko-fi.com/reinhello/goal",
                    })}`
            )
            .setTitle(client.translate("general.help.title"));

        return interaction.createMessage({
            embeds: [embed.toJSON()],
        });
    } else {
        const embed = new EmbedBuilder()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translate("general.help.nsfw"))
            .setTitle(client.translate("general.help.title"));

        return interaction.createMessage({
            embeds: [embed.toJSON()],
            flags: Constants.MessageFlags.EPHEMERAL,
        });
    }
}
