import { TLocale } from "../Types";
import { CommandInteraction, Constants, TextChannel } from "eris";
import { ReaderClient } from "../Client";
import { ICommandRunPayload } from "../Interfaces";
import { Utils } from "givies-framework";

export class Util {

    /**
     * Check for slash commands member permission
     * @param client Reader client
     * @param interaction Eris command interaction
     * @returns {Promise<void>}
     */
    public static checkCommandPerms(client: ReaderClient, interaction: CommandInteraction<TextChannel>): Promise<void> {
        const command = client.commands.get(interaction.data.name);
        const payload: ICommandRunPayload = { client, interaction };
        const embed = new Utils.RichEmbed()
            .setColor(client.config.BOT.COLOUR);

        // Check if an owner-marked slash commands is run by random users
        // By default, there's no command with `adminOnly` set to true. However, this is for
        // security safety
        if (command.adminOnly && !client.config.BOT.ADMIN.includes(interaction.member.id)) {
            return interaction.createMessage({
                embeds: [embed.setDescription(client.translate("mod.noperms"))],
                flags: Constants.MessageFlags.EPHEMERAL
            });
        }
        
        // Check if user with no `manageGuild` perms runs the slash commands for guild mods
        if (command.guildModOnly && !interaction.member.permissions.has("manageGuild")) {
            return interaction.createMessage({
                embeds: [embed.setDescription(client.translate("mod.noperms"))],
                flags: Constants.MessageFlags.EPHEMERAL
            });
        }

        // Bypass NSFW restrictions
        if (command.nsfwOnly && !interaction.channel.nsfw && client.config.BOT.ADMIN.includes(interaction.member.id)) {
            return command.run(payload);
        }

        // Check if an NSFW command is run outside channels marked as NSFW
        if (command.nsfwOnly && !interaction.channel.nsfw) {
            return interaction.createMessage({
                embeds: [embed.setDescription(client.translate("main.noperms"))],
                flags: Constants.MessageFlags.EPHEMERAL
            });
        }

        return command.run(payload);
    }

    /**
     * Convert 2 code country to full text
     * @param locale The locale
     * @returns {string}
     */
    public static convertLocale(locale: TLocale): string {
        let output: string;

        switch (locale) {
            case "en":
                output = "English";
                break;
            case "ja":
                output = "日本語";
                break;
            default:
                output = "Unknown";
                break;

        }

        return output;
    }
}
