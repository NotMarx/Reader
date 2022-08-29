import { NReaderClient } from "../../Client";
import { CommandInteraction, TextableChannel, VERSION } from "eris";
import { GuildModel, UserModel } from "../../Models";
import { Utils } from "givies-framework";
import { Util } from "../../Utils";
import osUtils from "os-utils";
import os from "os";
import packageJson from "../../../package.json";
import { setTimeout } from "node:timers/promises";

export async function statsCommand(client: NReaderClient, interaction: CommandInteraction<TextableChannel>) {
    const memory: number = process.memoryUsage().rss;

    await interaction.defer();
    await setTimeout(2000);

    const totalMemory = `${Util.bytesToSize(memory).value}${Util.bytesToSize(memory).unit} / ${Util.bytesToSize(os.totalmem()).value}${Util.bytesToSize(os.totalmem()).unit}`;
    const totalMem = Util.bytesToSize(os.totalmem()).value * 1000 ;
    const used: number = process.memoryUsage().rss / totalMem / totalMem;
    const guildData = await GuildModel.find({});
    const userData = await UserModel.find({});

    osUtils.cpuUsage((percentage) => {
        const embed = new Utils.RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setFooter(client.user.username, client.user.avatarURL)
            .setThumbnail(client.user.avatarURL)
            .setTimestamp()
            .setTitle(client.translate("general.stats.title").replace("{bot}", client.user.username))
            .addField(client.translate("general.stats.memory"), `${totalMemory} \n (${Math.round(used * 100) / 100}%)`, true)
            .addField(client.translate("general.stats.cpu"), `${Util.round(percentage, 2)}%`, true)
            .addField(client.translate("general.stats.uptime"), `${Util.time(client.uptime)}`, true)
            .addField("NodeJS", `${process.versions.node}`, true)
            .addField("Eris", `${VERSION}`, true)
            .addField("API", packageJson.dependencies["nhentai-api"].replace("^", ""), true)
            .addField(client.translate("general.stats.server"), `${guildData.length.toLocaleString()} (${client.guilds.size.toLocaleString()})`, true)
            .addField(client.translate("general.stats.user"), `${userData.length.toLocaleString()} (${client.users.size.toLocaleString()})`, true)
            .addField(client.translate("general.stats.platform"), `${process.platform.charAt(0).toUpperCase() + process.platform.slice(1)}`, true);

        return interaction.createMessage({
            embeds: [embed]
        });
    });
}
