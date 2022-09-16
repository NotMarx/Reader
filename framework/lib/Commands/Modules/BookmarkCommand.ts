import { NReaderClient } from "../../Client";
import { MessageActionRow, CommandInteraction, Constants, TextChannel } from "oceanic.js";
import { RichEmbed } from "../../Utils/RichEmbed";
import { Gallery } from "../../API";
import { UserModel } from "../../Models";
import { createBookmarkPaginator } from "../../Modules/BookmarkPaginator";
import { setTimeout } from "node:timers/promises";

export async function bookmarkCommand(client: NReaderClient, interaction: CommandInteraction<TextChannel>) {
    const args: { user?: string } = {};

    if (interaction.data.options) {
        for (const option of interaction.data.options.raw) {
            args[option.name] = (option as any).value;
        }
    }

    const user = interaction.member.guild.members.get(args.user || interaction.member.id);
    const guildData = await UserModel.findOne({ id: user.id });
    const bookmarked = guildData.bookmark;

    if (user) {
        if (!bookmarked || bookmarked.length === 0) {
            const embed = new RichEmbed()
                .setColor(client.config.BOT.COLOUR)
                .setDescription(client.translate("main.bookmark.none", { user: user.username }))
                .setTitle(client.translate("main.bookmark.title", { user: user.username }));

            return interaction.createMessage({
                embeds: [embed.data],
                flags: Constants.MessageFlags.EPHEMERAL
            });
        }

        await interaction.defer();
        await setTimeout(2000);

        const bookmarkedTitle: string[] = [];
        const galleries: Gallery[] = [];

        for (let i = 0; i < bookmarked.length; i++) {
            let title: string;
            let gallery: Gallery;

            try {
                title = await client.api.getGallery(bookmarked[i]).then((gallery) => `\`⬛ ${(i + 1).toString().length > 1 ? `${i + 1}` : `${i + 1} `}\` - [\`${gallery.id}\`](${gallery.url}) - \`${gallery.title.pretty.length >= 30 ? `${gallery.title.pretty.slice(0, 30)}...` : gallery.title.pretty}\``);
                gallery = await client.api.getGallery(bookmarked[i]);
            } catch (err) {
                const embed = new RichEmbed()
                    .setColor(client.config.BOT.COLOUR)
                    .setDescription(client.translate("main.error"));

                return interaction.createMessage({
                    embeds: [embed.data],
                });
            }

            galleries.push(gallery);
            bookmarkedTitle.push(title);
        }

        const component: MessageActionRow = {
            components: [
                {
                    customID: `see_more_${interaction.id}`,
                    label: client.translate("main.detail"),
                    style: 1,
                    type: 2
                },
                {
                    customID: `stop_result_${interaction.id}`,
                    label: client.translate("main.stop"),
                    style: 4,
                    type: 2
                }
            ],
            type: 1
        };

        const embed = new RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(bookmarkedTitle.join("\n"))
            .setTitle(client.translate("main.bookmark.title", { user: user.username }));

        createBookmarkPaginator(client, galleries, interaction, user);
        return interaction.createFollowup({
            components: [component],
            embeds: [embed.data],
        });
    } else {
        const embed = new RichEmbed()
            .setColor(client.config.BOT.COLOUR)
            .setDescription(client.translate("main.error"));

        return interaction.createMessage({
            embeds: [embed.data],
        });
    }
}
