import { TLocale } from "../Types";
import { CommandInteraction, Constants, TextChannel } from "eris";
import { NReaderClient } from "../Client";
import { ICommandRunPayload } from "../Interfaces";
import { Utils } from "givies-framework";
import byteSize from "byte-size";

interface IByteSize {
    value: number;
    unit: string;
}

export class Util {

    /**
     * Convert a number to a readable size
     * @param bytes The bytes to convert
     * @returns {IByteSize}
     */
    public static bytesToSize(bytes: number): IByteSize {
        return byteSize(bytes) as any;
    }

    /**
     * Check for slash commands member permission
     * @param client NReader client
     * @param interaction Eris command interaction
     * @returns {Promise<void>}
     */
    public static checkCommandPerms(client: NReaderClient, interaction: CommandInteraction<TextChannel>): Promise<void> {
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
            case "id":
                output = "Bahasa Indonesia";
                break;
            case "ja":
                output = "日本語";
                break;
            case "zh":
                output = "中文";
                break;
            default:
                output = "Unknown";
                break;

        }

        return output;
    }

    /**
     * Round a number value
     * @param value The value to convert
     * @param decimals The number of decimals to round to
     * @returns {number}
     */
    public static round(value: number, decimals: number): number {
        const multiplier = Math.pow(10, decimals || 0);

        return Math.round(value * multiplier) / multiplier;
    }

    public static time(s: number): string {
        const pad = (n: number, z = 2) => {
            return ("00" + n).slice(-z);
        };

        const ms = s % 1000;
        s = (s - ms) / 1000;
        const secs = s % 60;
        s = (s - secs) / 60;
        const mins = s % 60;
        let hrs = (s - mins) / 60;

        let days = Math.floor(hrs / 24);
        hrs = hrs % 24;

        let weeks = Math.floor(days / 7);
        days = days % 7;

        const months = Math.floor(weeks / 7);
        weeks = weeks % 7;

        return (
            (months > 0 ? pad(months) + " mo, " : "") +
            (weeks > 0 ? pad(weeks) + " week, " : "") +
            (days > 0 ? pad(days) + " days, " : "") +
            (hrs > 0 ? pad(hrs) + " hrs, " : "") +
            (mins > 0 ? pad(mins) + " mins and " : "") +
            (pad(secs) + " secs")
        );
    }
}
