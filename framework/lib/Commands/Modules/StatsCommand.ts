import { NReaderClient } from "../../Client";
import { CommandInteraction, TextableChannel, VERSION } from "eris";
import { Utils } from "givies-framework";
import { Util } from "../../Utils";
import osUtils from "os-utils";

export async function statsCommand(client: NReaderClient, interaction: CommandInteraction<TextableChannel>) {
    const memory: number = process.memoryUsage().rss;

    /* eslint-disable-next-line */
    const totalMemory = `${Util.bytesToSize(memory).value}${Util.bytesToSize(memory).unit} / ${Util.bytesToSize(require("os").totalmem()).value}${Util.bytesToSize(require("os").totalmem()).unit}`;

    /* eslint-disable-next-line */
    const totalMem = Util.bytesToSize(require("os").totalmem()).value * 1000 ;
    const used: number = process.memoryUsage().rss / totalMem / totalMem;

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
            .addField(client.translate("general.stats.platform"), `${process.platform.charAt(0).toUpperCase() + process.platform.slice(1)}`, true);

        return interaction.createMessage({
            embeds: [embed]
        });
    });
}
