/* eslint-disable @typescript-eslint/no-unused-vars */
import { NReaderClient } from "../../Client";
import { CommandInteraction, TextChannel } from "oceanic.js";
import { inspect } from "util";
import { EmbedBuilder } from "@oceanicjs/builders";
import { UserModel, GuildModel } from "../../Models";
import { IUserSchema } from "../../Interfaces";

export async function evalCommand(
    client: NReaderClient,
    interaction: CommandInteraction<TextChannel>
) {
    const code = interaction.data.options.getString("code");
    const model = { GuildModel, UserModel };
    const userData = await UserModel.findOne({ id: interaction.user.id });
    const guildData = await GuildModel.findOne({ id: interaction.guildID });
    const usersData = await UserModel.find({});
    const guildsData = await GuildModel.find({});

    try {
        const evaluated = inspect(eval(code), { depth: 0 });
        const embed = new EmbedBuilder()
            .setColor(client.config.BOT.COLOUR)
            .setTitle("Code Evaluation")
            .addField("Input", `\`\`\`js\n${code}\n\`\`\``)
            .addField("Output", `\`\`\`js\n${evaluated}\n\`\`\``)
            .setTimestamp(new Date().toISOString());

        return interaction.createMessage({ embeds: [embed.toJSON()] });
    } catch (err) {
        const embed = new EmbedBuilder()
            .setColor(client.config.BOT.COLOUR)
            .setTitle("Code Evaluation")
            .setDescription(`\`\`\`js\n${err}\n\`\`\``);

        return interaction.createMessage({ embeds: [embed.toJSON()] });
    }
}
