import { Book } from "nhentai-api";
import {
    CommandInteraction,
    ComponentInteraction,
    ComponentTypes,
    Constants,
    EmbedOptions,
    InteractionContent,
    MessageActionRow,
    Message,
    ModalActionRow,
    ModalSubmitInteraction,
    TextChannel,
} from "oceanic.js";
import { ComponentBuilder, EmbedBuilder } from "@oceanicjs/builders";
import { NReaderClient } from "../Client";
import { UserModel } from "../Models";
import { NReaderConstant } from "../Constant";
import { Util } from "../Utils";

export class ReadPaginator {
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
    gallery: Book;

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
     * @param book Current book
     * @param interaction Oceanic command interaction
     */
    constructor(
        client: NReaderClient,
        gallery: Book,
        interaction: CommandInteraction<TextChannel>
    ) {
        this.client = client;
        this.embed = 1;
        this.embeds = gallery.pages.map((page, index) => {
            return new EmbedBuilder()
                .setAuthor(
                    gallery.id.toString(),
                    undefined,
                    this.client.api.getImageURL(page)
                )
                .setColor(client.config.BOT.COLOUR)
                .setFooter(
                    client.translate("main.page", {
                        firstIndex: index + 1,
                        lastIndex: gallery.pages.length,
                    })
                )
                .setImage(this.client.api.getImageURL(page))
                .setTitle(gallery.title.pretty)
                .setURL(`https://nhentai.net/g/${gallery.id}`)
                .toJSON();
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
        const components = new ComponentBuilder<MessageActionRow>()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `first_page_${this.interaction.id}`,
                this.client.translate("main.page.first")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `previous_page_${this.interaction.id}`,
                this.client.translate("main.page.previous")
            )
            .addInteractionButton(
                Constants.ButtonStyles.DANGER,
                `stop_${this.interaction.id}`,
                this.client.translate("main.stop")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `next_page_${this.interaction.id}`,
                this.client.translate("main.page.next")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `last_page_${this.interaction.id}`,
                this.client.translate("main.page.last")
            )
            .addRow()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `jumpto_page_${this.interaction.id}`,
                this.client.translate("main.page.enter")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `bookmark_${this.interaction.id}`,
                this.client.translate("main.bookmark")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `home_${this.interaction.id}`,
                this.client.translate("main.home")
            )
            .toJSON();

        const messageContent: InteractionContent = {
            components,
            embeds: [this.embeds[this.embed - 1]],
        };

        this.client.stats.updateUserHistory(
            this.interaction.user.id,
            "read",
            this.gallery.id.toString()
        );

        this.client.stats.logActivities(
            this.interaction.user.id,
            "read-paginator",
            this.gallery.id.toString(),
            this.embed,
            undefined,
            undefined
        );

        this.message = await this.interaction.editOriginal(messageContent);
    }

    /**
     * Start reading
     * @param interaction Oceanic component interaction
     */
    public async onRead(
        interaction:
            | ComponentInteraction<ComponentTypes.BUTTON>
            | ModalSubmitInteraction<TextChannel>
    ) {
        const userData = await UserModel.findOne({ id: interaction.user.id });

        if (interaction.member.bot) return;

        const artistTags: string[] = this.gallery.artists.map(
            (tag) => tag.name
        );
        const characterTags: string[] = this.gallery.characters.map(
            (tag) => tag.name
        );
        const contentTags: string[] = this.gallery.pureTags.map(
            (tag) => `${tag.name} (${tag.count.toLocaleString()})`
        );
        const languageTags: string[] = this.gallery.languages.map(
            (tag) => tag.name.charAt(0).toUpperCase() + tag.name.slice(1)
        );
        const parodyTags: string[] = this.gallery.parodies.map(
            (tag) => tag.name
        );
        const uploadedAt = `<t:${this.gallery.uploaded.getTime() / 1000}:F>`;
        const stringTag =
            contentTags.join("`, `").length >= 1024
                ? `${contentTags.join("`, `").slice(0, 1010)}...`
                : contentTags.join("`, `");

        const resultEmbed = new EmbedBuilder()
            .setAuthor(
                this.gallery.id.toString(),
                undefined,
                `https://nhentai.net/g/${this.gallery.id}`
            )
            .setColor(this.client.config.BOT.COLOUR)
            .addField(
                this.client.translate("main.title"),
                `\`${this.gallery.title.pretty}\``
            )
            .addField(
                this.client.translate("main.pages"),
                `\`${this.gallery.pages.length}\``
            )
            .addField(this.client.translate("main.released"), uploadedAt)
            .addField(
                languageTags.length > 1
                    ? this.client.translate("main.languages")
                    : this.client.translate("main.language"),
                `\`${
                    languageTags.length !== 0
                        ? languageTags.join("`, `")
                        : this.client.translate("main.none")
                }\``
            )
            .addField(
                artistTags.length > 1
                    ? this.client.translate("main.artists")
                    : this.client.translate("main.artist"),
                `\`${
                    artistTags.length !== 0
                        ? artistTags.join("`, `")
                        : this.client.translate("main.none")
                }\``
            )
            .addField(
                characterTags.length > 1
                    ? this.client.translate("main.characters")
                    : this.client.translate("main.character"),
                `\`${
                    characterTags.length !== 0
                        ? characterTags.join("`, `")
                        : this.client.translate("main.original")
                }\``
            )
            .addField(
                parodyTags.length > 1
                    ? this.client.translate("main.parodies")
                    : this.client.translate("main.parody"),
                `\`${
                    parodyTags.length !== 0
                        ? parodyTags
                              .join("`, `")
                              .replace(
                                  "original",
                                  `${this.client.translate("main.original")}`
                              )
                        : this.client.translate("main.none")
                }\``
            )
            .addField(
                contentTags.length > 1
                    ? this.client.translate("main.tags")
                    : this.client.translate("main.tag"),
                `\`${
                    contentTags.length !== 0
                        ? stringTag
                        : this.client.translate("main.none")
                }\``
            )
            .setFooter(`⭐ ${this.gallery.favorites.toLocaleString()}`)
            .setThumbnail(this.client.api.getImageURL(this.gallery.cover));

        const hideComponent = new ComponentBuilder<MessageActionRow>()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `read_${this.interaction.id}`,
                this.client.translate("main.read")
            )
            .addInteractionButton(
                Constants.ButtonStyles.DANGER,
                `stop_${this.interaction.id}`,
                this.client.translate("main.stop")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `bookmark_${this.interaction.id}`,
                this.client.translate("main.bookmark")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `hide_cover_${this.interaction.id}`,
                this.client.translate("main.cover.hide")
            )
            .toJSON();

        const showComponent = new ComponentBuilder<MessageActionRow>()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `read_${this.interaction.id}`,
                this.client.translate("main.read")
            )
            .addInteractionButton(
                Constants.ButtonStyles.DANGER,
                `stop_${this.interaction.id}`,
                this.client.translate("main.stop")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `bookmark_${this.interaction.id}`,
                this.client.translate("main.bookmark")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `show_cover_${this.interaction.id}`,
                this.client.translate("main.cover.show")
            )
            .toJSON();

        if (interaction instanceof ComponentInteraction) {
            switch (interaction.data.customID) {
                case `read_${this.interaction.id}`:
                    this.initialisePaginator();
                    interaction.deferUpdate();
                    break;
                case `show_cover_${this.interaction.id}`:
                    resultEmbed.setImage(
                        this.client.api.getImageURL(this.gallery.cover)
                    );
                    this.interaction.editOriginal({
                        components: hideComponent,
                        embeds: [resultEmbed.toJSON()],
                    });
                    interaction.deferUpdate();
                    break;
                case `hide_cover_${this.interaction.id}`:
                    resultEmbed.removeImage();
                    this.interaction.editOriginal({
                        components: showComponent,
                        embeds: [resultEmbed.toJSON()],
                    });
                    interaction.deferUpdate();
                    break;
                case `home_${this.interaction.id}`:
                    this.interaction.editOriginal({
                        components: showComponent,
                        embeds: [resultEmbed.toJSON()],
                    });
                    interaction.deferUpdate();
                    break;
                case `stop_${this.interaction.id}`:
                    interaction.message.delete();
                    interaction.deferUpdate();
                    this.stopPaginator();
                    break;
                case `bookmark_${this.interaction.id}`:
                    if (
                        userData.bookmark.includes(this.embeds[0].author.name)
                    ) {
                        interaction.createMessage({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(this.client.config.BOT.COLOUR)
                                    .setDescription(
                                        this.client.translate(
                                            "main.bookmark.removed",
                                            {
                                                id: `[\`${
                                                    this.embeds[0].author.name
                                                }\`](${NReaderConstant.Source.ID(
                                                    this.embeds[0].author.name
                                                )})`,
                                            }
                                        )
                                    )
                                    .toJSON(),
                            ],
                            flags: Constants.MessageFlags.EPHEMERAL,
                        });

                        this.client.stats.logActivities(
                            this.interaction.user.id,
                            "bookmarked",
                            this.embeds[0].author.name,
                            undefined,
                            undefined,
                            undefined,
                            "removed"
                        );

                        UserModel.findOneAndUpdate(
                            { id: interaction.member.id },
                            { $pull: { bookmark: this.embeds[0].author.name } }
                        ).exec();
                    } else {
                        if (
                            !userData.settings.premium &&
                            userData.bookmark.length === 25
                        ) {
                            return interaction.createMessage({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor(this.client.config.BOT.COLOUR)
                                        .setDescription(
                                            this.client.translate(
                                                "main.bookmark.maxed"
                                            )
                                        )
                                        .toJSON(),
                                ],
                                flags: Constants.MessageFlags.EPHEMERAL,
                            });
                        }

                        interaction.createMessage({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(this.client.config.BOT.COLOUR)
                                    .setDescription(
                                        this.client.translate(
                                            "main.bookmark.saved",
                                            {
                                                id: `[\`${
                                                    this.embeds[0].author.name
                                                }\`](${NReaderConstant.Source.ID(
                                                    this.embeds[0].author.name
                                                )})`,
                                            }
                                        )
                                    )
                                    .toJSON(),
                            ],
                            flags: Constants.MessageFlags.EPHEMERAL,
                        });

                        this.client.stats.logActivities(
                            this.interaction.user.id,
                            "bookmarked",
                            this.embeds[0].author.name,
                            undefined,
                            undefined,
                            undefined,
                            "added"
                        );

                        UserModel.findOneAndUpdate(
                            { id: interaction.member.id },
                            { $push: { bookmark: this.embeds[0].author.name } }
                        ).exec();
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
                        components: new ComponentBuilder<ModalActionRow>()
                            .addTextInput(
                                Constants.TextInputStyles.SHORT,
                                this.client.translate("main.page.enter"),
                                "page_number",
                                "5"
                            )
                            .toJSON(),
                        customID: `jumpto_page_modal_${this.interaction.id}`,
                        title: this.client.translate("main.page.enter"),
                    });

                    break;
            }
        } else {
            switch (interaction.data.customID) {
                case `jumpto_page_modal_${this.interaction.id}`:
                    /* eslint-disable-next-line */
                    const page = parseInt(
                        Util.getModalID(interaction, "page_number")
                    );

                    if (isNaN(page)) {
                        return interaction.createMessage({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(this.client.config.BOT.COLOUR)
                                    .setDescription(
                                        this.client.translate(
                                            "main.page.enter.invalid"
                                        )
                                    )
                                    .toJSON(),
                            ],
                            flags: Constants.MessageFlags.EPHEMERAL,
                        });
                    }

                    if (page > this.embeds.length) {
                        return interaction.createMessage({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(this.client.config.BOT.COLOUR)
                                    .setDescription(
                                        this.client.translate(
                                            "main.page.enter.unknown",
                                            {
                                                index: page.toLocaleString(),
                                            }
                                        )
                                    )
                                    .toJSON(),
                            ],
                            flags: Constants.MessageFlags.EPHEMERAL,
                        });
                    }

                    if (page <= 0) {
                        return interaction.createMessage({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(this.client.config.BOT.COLOUR)
                                    .setDescription(
                                        this.client.translate(
                                            "main.page.enter.unknown",
                                            {
                                                index: page.toLocaleString(),
                                            }
                                        )
                                    )
                                    .toJSON(),
                            ],
                            flags: Constants.MessageFlags.EPHEMERAL,
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

        setTimeout(() => {
            this.client.off("interactionCreate", this.onRead);
        }, 7200 * 1000);
    }

    /**
     * Stop the paginator class
     */
    public stopPaginator() {
        this.client.off("interactionCreate", this.onRead);
        this.running = false;
    }

    /**
     * Update the paginator class
     */
    public updatePaginator() {
        const components = new ComponentBuilder<MessageActionRow>()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `first_page_${this.interaction.id}`,
                this.client.translate("main.page.first")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `previous_page_${this.interaction.id}`,
                this.client.translate("main.page.previous")
            )
            .addInteractionButton(
                Constants.ButtonStyles.DANGER,
                `stop_${this.interaction.id}`,
                this.client.translate("main.stop")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `next_page_${this.interaction.id}`,
                this.client.translate("main.page.next")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `last_page_${this.interaction.id}`,
                this.client.translate("main.page.last")
            )
            .addRow()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `jumpto_page_${this.interaction.id}`,
                this.client.translate("main.page.enter")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `bookmark_${this.interaction.id}`,
                this.client.translate("main.bookmark")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `home_${this.interaction.id}`,
                this.client.translate("main.home")
            )
            .toJSON();

        this.client.stats.logActivities(
            this.interaction.user.id,
            "read-paginator",
            this.gallery.id.toString(),
            this.embed,
            undefined,
            undefined
        );

        this.message.edit({
            components,
            embeds: [this.embeds[this.embed - 1]],
        });
    }
}

export async function createReadPaginator(
    client: NReaderClient,
    gallery: Book,
    interaction: CommandInteraction<TextChannel>
) {
    const paginator = new ReadPaginator(client, gallery, interaction);

    paginator.runPaginator();

    return Promise.resolve(paginator.message);
}
