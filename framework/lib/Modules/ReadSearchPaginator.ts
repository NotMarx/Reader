import { Gallery } from "../API";
import { CommandInteraction, ComponentInteraction, Constants, EmbedOptions, InteractionContent, MessageActionRow, Message, ModalSubmitInteraction, TextChannel } from "oceanic.js";
import { NReaderClient } from "../Client";
import { RichEmbed } from "../Utils/RichEmbed";
import { UserModel } from "../Models";
import { NReaderConstant } from "../Constant";
import { Util } from "../Utils";

export class ReadSearchPaginator {

    /**
     * NReader client
     */
    client: NReaderClient;

    /**
     * The index of current embed page
     */
    embed: number;

    /**
     * An array of embed pages
     */
    embeds: EmbedOptions[];

    /**
     * Current NHentai gallery
     */
    gallery: Gallery;

    /**
     * Oceanic command interaction
     */
    interaction: CommandInteraction<TextChannel>;

    /**
     * The message for embed pages
     */
    message: Message<TextChannel>;

    /**
     * Whether the paginator is running or not
     */
    running: boolean;

    /**
     * Creates a read paginator
     * @param client NReader client
     * @param gallery Current NHentai gallery
     * @param interaction Oceanic command interaction
     */
    constructor(client: NReaderClient, gallery: Gallery, interaction: CommandInteraction<TextChannel>) {
        this.client = client;
        this.embed = 1;
        this.embeds = gallery.pages.map((page, index) => {
            return new RichEmbed()
                .setAuthor(gallery.id, page.url)
                .setColor(client.config.BOT.COLOUR)
                .setFooter(client.translate("main.page", { firstIndex: index + 1, lastIndex: gallery.pages.length }))
                .setImage(page.url)
                .setTitle(gallery.title.pretty)
                .setURL(gallery.url).data;
        });
        this.gallery = gallery;
        this.interaction = interaction;
        this.onRead = this.onRead.bind(this);
        this.running = false;
    }

    /**
     * Initialise the paginator class
     */
    public async initialisePaginator() {
        const messageContent: InteractionContent = {
            components: [
                {
                    components: [
                        { customID: `first_page_${this.interaction.id}`, label: this.client.translate("main.page.first"), style: 1, type: 2 },
                        { customID: `previous_page_${this.interaction.id}`, label: this.client.translate("main.page.previous"), style: 2, type: 2 },
                        { customID: `stop_result_${this.interaction.id}`, label: this.client.translate("main.stop"), style: 4, type: 2 },
                        { customID: `next_page_${this.interaction.id}`, label: this.client.translate("main.page.next"), style: 2, type: 2 },
                        { customID: `last_page_${this.interaction.id}`, label: this.client.translate("main.page.last"), style: 1, type: 2 }
                    ],
                    type: 1
                },
                {
                    components: [
                        { customID: `jumpto_page_${this.interaction.id}`, label: this.client.translate("main.page.enter"), style: 1, type: 2 },
                        { customID: `bookmark_${this.interaction.id}`, label: this.client.translate("main.bookmark"), style: 2, type: 2 },
                        { customID: `home_result_${this.interaction.id}`, label: this.client.translate("main.home"), style: 1, type: 2 }
                    ],
                    type: 1
                }
            ],
            embeds: [this.embeds[this.embed - 1]]
        };

        this.message = await this.interaction.editOriginal(messageContent);
    }

    /**
     * Update the paginator class
     */
    public updatePaginator() {
        this.message.edit({
            components: [
                {
                    components: [
                        { customID: `first_page_${this.interaction.id}`, label: this.client.translate("main.page.first"), style: 1, type: 2 },
                        { customID: `previous_page_${this.interaction.id}`, label: this.client.translate("main.page.previous"), style: 2, type: 2 },
                        { customID: `stop_result_${this.interaction.id}`, label: this.client.translate("main.stop"), style: 4, type: 2 },
                        { customID: `next_page_${this.interaction.id}`, label: this.client.translate("main.page.next"), style: 2, type: 2 },
                        { customID: `last_page_${this.interaction.id}`, label: this.client.translate("main.page.last"), style: 1, type: 2 }
                    ],
                    type: 1
                },
                {
                    components: [
                        { customID: `jumpto_page_${this.interaction.id}`, label: this.client.translate("main.page.enter"), style: 1, type: 2 },
                        { customID: `bookmark_${this.interaction.id}`, label: this.client.translate("main.bookmark"), style: 2, type: 2 },
                        { customID: `home_result_${this.interaction.id}`, label: this.client.translate("main.home"), style: 1, type: 2 }
                    ],
                    type: 1
                }
            ],
            embeds: [this.embeds[this.embed - 1]]
        });
    }

    /**
     * Start reading
     * @param interaction Oceanic component interaction
     */
    public async onRead(interaction: ComponentInteraction<TextChannel> | ModalSubmitInteraction<TextChannel>) {
        if (interaction.member.bot) return;

        const userData = await UserModel.findOne({ id: interaction.user.id })
        const artistTags: string[] = this.gallery.tags.artists.map((tag) => tag.name);
        const characterTags: string[] = this.gallery.tags.characters.map((tag) => tag.name);
        const contentTags: string[] = this.gallery.tags.tags.map((tag) => `${tag.name} (${tag.count.toLocaleString()})`);
        const languageTags: string[] = this.gallery.tags.languages.map((tag) => tag.name.charAt(0).toUpperCase() + tag.name.slice(1));
        const parodyTags: string[] = this.gallery.tags.parodies.map((tag) => tag.name);
        const uploadedAt = `<t:${this.gallery.uploadDate.getTime() / 1000}:F>`;

        const resultEmbed = new RichEmbed()
            .setAuthor(this.gallery.id, this.gallery.url)
            .setColor(this.client.config.BOT.COLOUR)
            .addField(this.client.translate("main.title"), `\`${this.gallery.title.pretty}\``)
            .addField(this.client.translate("main.pages"), `\`${this.gallery.pages.length}\``)
            .addField(this.client.translate("main.released"), uploadedAt)
            .addField(languageTags.length > 1 ? this.client.translate("main.languages") : this.client.translate("main.language"), `\`${languageTags.length !== 0 ? languageTags.join("`, `") : this.client.translate("main.none")}\``)
            .addField(artistTags.length > 1 ? this.client.translate("main.artists") : this.client.translate("main.artist"), `\`${artistTags.length !== 0 ? artistTags.join("`, `") : this.client.translate("main.none")}\``)
            .addField(characterTags.length > 1 ? this.client.translate("main.characters") : this.client.translate("main.character"), `\`${characterTags.length !== 0 ? characterTags.join("`, `") : this.client.translate("main.original")}\``)
            .addField(parodyTags.length > 1 ? this.client.translate("main.parodies") : this.client.translate("main.parody"), `\`${parodyTags.length !== 0 ? parodyTags.join("`, `").replace("original", `${this.client.translate("main.original")}`) : this.client.translate("main.none")}\``)
            .addField(contentTags.length > 1 ? this.client.translate("main.tags") : this.client.translate("main.tag"), `\`${contentTags.length !== 0 ? contentTags.join("`, `") : this.client.translate("main.none")}\``)
            .setFooter(`⭐ ${this.gallery.favourites.toLocaleString()}`)
            .setThumbnail(this.gallery.cover.url);

        const hideComponent: MessageActionRow = {
            components: [
                {
                    customID: `read_${this.interaction.id}`,
                    label: this.client.translate("main.read"),
                    style: 1,
                    type: 2
                },
                {
                    customID: `stop_${this.interaction.id}`,
                    label: this.client.translate("main.stop"),
                    style: 4,
                    type: 2
                },
                {
                    customID: `bookmark_${this.interaction.id}`,
                    label: this.client.translate("main.bookmark"),
                    style: 2,
                    type: 2
                },
                {
                    customID: `hide_cover_${this.interaction.id}`,
                    label: this.client.translate("main.cover.hide"),
                    style: 1,
                    type: 2
                }
            ],
            type: 1
        };

        const showComponent: MessageActionRow = {
            components: [
                {
                    customID: `read_${this.interaction.id}`,
                    label: this.client.translate("main.read"),
                    style: 1,
                    type: 2
                },
                {
                    customID: `stop_${this.interaction.id}`,
                    label: this.client.translate("main.stop"),
                    style: 4,
                    type: 2
                },
                {
                    customID: `bookmark_${this.interaction.id}`,
                    label: this.client.translate("main.bookmark"),
                    style: 2,
                    type: 2
                },
                {
                    customID: `show_cover_${this.interaction.id}`,
                    label: this.client.translate("main.cover.show"),
                    style: 1,
                    type: 2
                }
            ],
            type: 1
        };

        if (interaction instanceof ComponentInteraction) {
            switch (interaction.data.customID) {
                case `read_${this.interaction.id}`:
                    this.initialisePaginator();
                    interaction.deferUpdate();
                    break;
                case `show_cover_${this.interaction.id}`:
                    resultEmbed.setImage(this.gallery.cover.url);
                    this.interaction.editOriginal({ components: [hideComponent], embeds: [resultEmbed.data] });
                    interaction.deferUpdate();
                    break;
                case `hide_cover_${this.interaction.id}`:
                    resultEmbed.setImage("");
                    this.interaction.editOriginal({ components: [showComponent], embeds: [resultEmbed.data] });
                    interaction.deferUpdate();
                    break;
                case `bookmark_${this.interaction.id}`:
                    if (userData.bookmark.includes(this.embeds[0].author.name)) {
                        interaction.createMessage({
                            embeds: [
                                new RichEmbed()
                                    .setColor(this.client.config.BOT.COLOUR)
                                    .setDescription(this.client.translate("main.bookmark.removed", { id: `[\`${this.embeds[0].author.name}\`](${NReaderConstant.Source.ID(this.embeds[0].author.name)})` })).data
                            ],
                            flags: Constants.MessageFlags.EPHEMERAL
                        });

                        UserModel.findOneAndUpdate({ id: interaction.member.id }, { $pull: { "bookmark": this.embeds[0].author.name } }).exec();
                    } else {
                        if (userData.bookmark.length === 25) {
                            return interaction.createMessage({
                                embeds: [
                                    new RichEmbed()
                                        .setColor(this.client.config.BOT.COLOUR)
                                        .setDescription(this.client.translate("main.bookmark.maxed")).data
                                ],
                                flags: Constants.MessageFlags.EPHEMERAL
                            });
                        }

                        interaction.createMessage({
                            embeds: [
                                new RichEmbed()
                                    .setColor(this.client.config.BOT.COLOUR)
                                    .setDescription(this.client.translate("main.bookmark.saved", { id: `[\`${this.embeds[0].author.name}\`](${NReaderConstant.Source.ID(this.embeds[0].author.name)})` })).data
                            ],
                            flags: Constants.MessageFlags.EPHEMERAL
                        });

                        UserModel.findOneAndUpdate({ id: interaction.member.id }, { $push: { "bookmark": this.embeds[0].author.name } }).exec();
                    }

                    break;
                case `next_page_${this.interaction.id}`:
                    interaction.deferUpdate();

                    if (this.embed < this.embeds.length) {
                        this.embed++;
                        this.updatePaginator();
                    }

                    break;
                case `previous_page_${this.interaction.id}`:
                    interaction.deferUpdate();

                    if (this.embed > 1) {
                        this.embed--;
                        this.updatePaginator();
                    }

                    break;
                case `first_page_${this.interaction.id}`:
                    interaction.deferUpdate();

                    this.embed = 1;
                    this.updatePaginator();
                    break;
                case `last_page_${this.interaction.id}`:
                    interaction.deferUpdate();

                    this.embed = this.embeds.length;
                    this.updatePaginator();
                    break;
                case `jumpto_page_${this.interaction.id}`:
                    interaction.createModal({
                        components: [
                            {
                                components: [
                                    {
                                        customID: "page_number",
                                        label: this.client.translate("main.page.enter"),
                                        placeholder: "5",
                                        required: true,
                                        style: 1,
                                        type: 4
                                    }
                                ],
                                type: 1
                            }
                        ],
                        customID: `jumpto_page_modal_${this.interaction.id}`,
                        title: this.client.translate("main.page.enter")
                    });

                    break;
            }
        } else {
            switch (interaction.data.customID) {
                case `jumpto_page_modal_${this.interaction.id}`:
                    /* eslint-disable-next-line */
                    const page = parseInt(Util.getModalID(interaction, "page_number"));

                    if (isNaN(page)) {
                        return interaction.createMessage({
                            embeds: [
                                new RichEmbed()
                                    .setColor(this.client.config.BOT.COLOUR)
                                    .setDescription(this.client.translate("main.page.enter.invalid")).data
                            ],
                            flags: Constants.MessageFlags.EPHEMERAL
                        });
                    }

                    if (page > this.embeds.length) {
                        return interaction.createMessage({
                            embeds: [
                                new RichEmbed()
                                    .setColor(this.client.config.BOT.COLOUR)
                                    .setDescription(this.client.translate("main.page.enter.unknown", { index: page.toLocaleString() })).data
                            ],
                            flags: Constants.MessageFlags.EPHEMERAL
                        });
                    }

                    if (page <= 0) {
                        return interaction.createMessage({
                            embeds: [
                                new RichEmbed()
                                    .setColor(this.client.config.BOT.COLOUR)
                                    .setDescription(this.client.translate("main.page.enter.unknown", { index: page.toLocaleString() })).data
                            ],
                            flags: Constants.MessageFlags.EPHEMERAL
                        });
                    }

                    this.embed = page;
                    this.updatePaginator();
                    interaction.deferUpdate();
                    break;
            }
        }
    }

    /**
     * Run the paginator class
     */
    public runPaginator() {
        this.client.on("interactionCreate", this.onRead);
        this.running = true;
    }

    /**
     * Stop the paginator class
     */
    public stopPaginator() {
        this.client.off("interactionCreate", this.onRead);
        this.running = false;
    }
}

export async function createReadSearchPaginator(client: NReaderClient, gallery: Gallery, interaction: CommandInteraction<TextChannel>) {
    const paginator = new ReadSearchPaginator(client, gallery, interaction);

    paginator.runPaginator();

    return Promise.resolve(paginator.message);
}
