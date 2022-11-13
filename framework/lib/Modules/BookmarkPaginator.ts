import { RequestHandler, Gallery } from "../API";
import {
    CommandInteraction,
    ComponentInteraction,
    Constants,
    EmbedOptions,
    InteractionContent,
    MessageActionRow,
    Message,
    ModalActionRow,
    ModalSubmitInteraction,
    TextChannel,
    User,
} from "oceanic.js";
import { ComponentBuilder, EmbedBuilder } from "@oceanicjs/builders";
import { NReaderClient } from "../Client";
import { UserModel } from "../Models";
import { ReadSearchPaginator } from "./ReadSearchPaginator";
import { NReaderConstant } from "../Constant";
import { Util } from "../Utils";
import { IUserSchema } from "../Interfaces";

export class BookmarkPaginator {
    /**
     * NHentai API
     */
    api: RequestHandler;

    /**
     * An array of bookmark chunks
     */
    bookmarkChunks: string[][];

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
     * Bookmarked doujin
     */
    galleries: Gallery[];

    /**
     * Oceanic command interaction
     */
    interaction: CommandInteraction<TextChannel>;

    /**
     * The message for embed pages
     */
    message: Message<TextChannel>;

    /**
     * Current page index of the bookmark chunks
     */
    page: number;

    /**
     * The read paginator
     */
    paginationEmbed: ReadSearchPaginator;

    /**
     * Whether the paginator is running or not
     */
    running: boolean;

    /**
     * The user who owned the bookmark
     */
    user: User;

    /**
     * Creates a read paginator
     * @param client NReader client
     * @param galleries Current galleries
     * @param interaction Oceanic command interaction
     */
    constructor(
        client: NReaderClient,
        galleries: Gallery[],
        interaction: CommandInteraction<TextChannel>,
        user: User
    ) {
        this.api = client.api;
        this.client = client;
        this.embed = 1;
        this.page = 1;
        this.embeds = [];
        this.galleries = galleries;
        this.interaction = interaction;
        this.onSearch = this.onSearch.bind(this);
        this.running = false;
        this.user = user;
    }

    /**
     * Get the index page of the bookmark chunks
     * @param interaction Component interaction
     * @param page The index page
     * @returns {Promise<void>}
     */
    private async getBookmarkPage() {
        const galleries: Gallery[] = [];
        const bookmarked = this.bookmarkChunks[this.page - 1];

        for (let i = 0; i < bookmarked.length; i++) {
            const gallery: Gallery = await this.client.api.getGallery(
                bookmarked[i]
            );

            galleries.push(gallery);
        }

        const title = galleries.map(
            (gallery, index) =>
                `\`⬛ ${
                    (index + 1).toString().length > 1
                        ? `${index + 1}`
                        : `${index + 1} `
                }\` - [\`${gallery.id}\`](${gallery.url}) - \`${
                    gallery.title.pretty
                }\``
        );
        const embeds = galleries.map((gallery, index) => {
            const artistTags: string[] = gallery.tags.artists.map(
                (tag) => tag.name
            );
            const characterTags: string[] = gallery.tags.characters.map(
                (tag) => tag.name
            );
            const contentTags: string[] = gallery.tags.tags.map(
                (tag) => `${tag.name} (${tag.count.toLocaleString()})`
            );
            const languageTags: string[] = gallery.tags.languages.map(
                (tag) => tag.name.charAt(0).toUpperCase() + tag.name.slice(1)
            );
            const parodyTags: string[] = gallery.tags.parodies.map(
                (tag) => tag.name
            );
            const uploadedAt = `<t:${gallery.uploadDate.getTime() / 1000}:F>`;

            return new EmbedBuilder()
                .setAuthor(gallery.id, undefined, gallery.url)
                .setColor(this.client.config.BOT.COLOUR)
                .setDescription(
                    title
                        .join("\n")
                        .replace(
                            `\`⬛ ${
                                (index + 1).toString().length > 1
                                    ? `${index + 1}`
                                    : `${index + 1} `
                            }\` - [\`${gallery.id}\`](${gallery.url}) - \`${
                                gallery.title.pretty
                            }\``,
                            `**\`🟥 ${
                                (index + 1).toString().length > 1
                                    ? `${index + 1}`
                                    : `${index + 1} `
                            }\` - [\`${gallery.id}\`](${gallery.url}) - \`${
                                gallery.title.pretty
                            }\`**`
                        )
                )
                .setFooter(`⭐ ${gallery.favourites.toLocaleString()}`)
                .setTitle(
                    this.client.translate("main.page", {
                        firstIndex: this.page,
                        lastIndex: this.bookmarkChunks.length,
                    })
                )
                .setThumbnail(gallery.cover.url)
                .addField(
                    this.client.translate("main.title"),
                    `\`${gallery.title.pretty}\``
                )
                .addField(
                    this.client.translate("main.pages"),
                    `\`${gallery.pages.length}\``
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
                                      `${this.client.translate(
                                          "main.original"
                                      )}`
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
                            ? contentTags.join("`, `")
                            : this.client.translate("main.none")
                    }\``
                )
                .toJSON();
        });

        this.embeds = embeds;
        this.embed = 1;
        this.galleries = galleries;
        this.updatePaginator();
    }

    /**
     * Initialise the paginator class
     */
    public async initialisePaginator() {
        const userData: IUserSchema = await UserModel.findOne({
            id: this.user.id,
        });
        const title = this.galleries.map(
            (gallery, index) =>
                `\`⬛ ${
                    (index + 1).toString().length > 1
                        ? `${index + 1}`
                        : `${index + 1} `
                }\` - [\`${gallery.id}\`](${gallery.url}) - \`${
                    gallery.title.pretty
                }\``
        );

        this.bookmarkChunks = Util.arrayToChunks(userData.bookmark, 5);

        const embeds = this.galleries.map((gallery, index) => {
            const artistTags: string[] = gallery.tags.artists.map(
                (tag) => tag.name
            );
            const characterTags: string[] = gallery.tags.characters.map(
                (tag) => tag.name
            );
            const contentTags: string[] = gallery.tags.tags.map(
                (tag) => `${tag.name} (${tag.count.toLocaleString()})`
            );
            const languageTags: string[] = gallery.tags.languages.map(
                (tag) => tag.name.charAt(0).toUpperCase() + tag.name.slice(1)
            );
            const parodyTags: string[] = gallery.tags.parodies.map(
                (tag) => tag.name
            );
            const uploadedAt = `<t:${gallery.uploadDate.getTime() / 1000}:F>`;

            return new EmbedBuilder()
                .setAuthor(gallery.id, undefined, gallery.url)
                .setColor(this.client.config.BOT.COLOUR)
                .setDescription(
                    title
                        .join("\n")
                        .replace(
                            `\`⬛ ${
                                (index + 1).toString().length > 1
                                    ? `${index + 1}`
                                    : `${index + 1} `
                            }\` - [\`${gallery.id}\`](${gallery.url}) - \`${
                                gallery.title.pretty
                            }\``,
                            `**\`🟥 ${
                                (index + 1).toString().length > 1
                                    ? `${index + 1}`
                                    : `${index + 1} `
                            }\` - [\`${gallery.id}\`](${gallery.url}) - \`${
                                gallery.title.pretty
                            }\`**`
                        )
                )
                .setFooter(`⭐ ${gallery.favourites.toLocaleString()}`)
                .setTitle(
                    this.client.translate("main.page", {
                        firstIndex: this.page,
                        lastIndex: this.bookmarkChunks.length,
                    })
                )
                .setThumbnail(gallery.cover.url)
                .addField(
                    this.client.translate("main.title"),
                    `\`${gallery.title.pretty}\``
                )
                .addField(
                    this.client.translate("main.pages"),
                    `\`${gallery.pages.length}\``
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
                                      `${this.client.translate(
                                          "main.original"
                                      )}`
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
                            ? contentTags.join("`, `")
                            : this.client.translate("main.none")
                    }\``
                )
                .toJSON();
        });

        this.embeds = embeds;

        const components = new ComponentBuilder<MessageActionRow>()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `first_result_${this.interaction.id}`,
                this.client.translate("main.result.first")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `previous_result_${this.interaction.id}`,
                this.client.translate("main.result.previous")
            )
            .addInteractionButton(
                Constants.ButtonStyles.DANGER,
                `stop_result_${this.interaction.id}`,
                this.client.translate("main.stop")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `next_result_${this.interaction.id}`,
                this.client.translate("main.result.next")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `last_result_${this.interaction.id}`,
                this.client.translate("main.result.last")
            )
            .addRow()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `first_result_page_${this.interaction.id}`,
                this.client.translate("main.page.first")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `previous_result_page_${this.interaction.id}`,
                this.client.translate("main.page.previous")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `next_result_page_${this.interaction.id}`,
                this.client.translate("main.page.next")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `last_result_page_${this.interaction.id}`,
                this.client.translate("main.page.last")
            )
            .addRow()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `jumpto_result_${this.interaction.id}`,
                this.client.translate("main.result.enter")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `jumpto_result_page_${this.interaction.id}`,
                this.client.translate("main.page.enter")
            )
            .addRow()
            .addInteractionButton(
                Constants.ButtonStyles.SUCCESS,
                `read_result_${this.interaction.id}`,
                this.client.translate("main.read")
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

        const messageContent: InteractionContent = {
            components,
            embeds: [this.embeds[this.embed - 1]],
        };

        this.message = await this.interaction.editOriginal(messageContent);
        this.updatePaginator();
    }

    /**
     * Start searching
     * @param interaction Oceanic component interaction
     */
    public async onSearch(
        interaction:
            | ComponentInteraction<TextChannel>
            | ModalSubmitInteraction<TextChannel>
    ) {
        const userData: IUserSchema = await UserModel.findOne({
            id: interaction.user.id,
        });

        if (interaction.member.bot) return;

        const embed = EmbedBuilder.loadFromJSON(
            (interaction as ComponentInteraction<TextChannel>).message
                ? (interaction as ComponentInteraction<TextChannel>).message
                      .embeds[0]
                : undefined
        );

        const hideComponent = new ComponentBuilder<MessageActionRow>()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `first_result_${this.interaction.id}`,
                this.client.translate("main.result.first")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `previous_result_${this.interaction.id}`,
                this.client.translate("main.result.previous")
            )
            .addInteractionButton(
                Constants.ButtonStyles.DANGER,
                `stop_result_${this.interaction.id}`,
                this.client.translate("main.stop")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `next_result_${this.interaction.id}`,
                this.client.translate("main.result.next")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `last_result_${this.interaction.id}`,
                this.client.translate("main.result.last")
            )
            .addRow()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `first_result_page_${this.interaction.id}`,
                this.client.translate("main.page.first")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `previous_result_page_${this.interaction.id}`,
                this.client.translate("main.page.previous")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `next_result_page_${this.interaction.id}`,
                this.client.translate("main.page.next")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `last_result_page_${this.interaction.id}`,
                this.client.translate("main.page.last")
            )
            .addRow()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `jumpto_result_${this.interaction.id}`,
                this.client.translate("main.result.enter")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `jumpto_result_page_${this.interaction.id}`,
                this.client.translate("main.page.enter")
            )
            .addRow()
            .addInteractionButton(
                Constants.ButtonStyles.SUCCESS,
                `read_result_${this.interaction.id}`,
                this.client.translate("main.read")
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
                `first_result_${this.interaction.id}`,
                this.client.translate("main.result.first")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `previous_result_${this.interaction.id}`,
                this.client.translate("main.result.previous")
            )
            .addInteractionButton(
                Constants.ButtonStyles.DANGER,
                `stop_result_${this.interaction.id}`,
                this.client.translate("main.stop")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `next_result_${this.interaction.id}`,
                this.client.translate("main.result.next")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `last_result_${this.interaction.id}`,
                this.client.translate("main.result.last")
            )
            .addRow()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `first_result_page_${this.interaction.id}`,
                this.client.translate("main.page.first")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `previous_result_page_${this.interaction.id}`,
                this.client.translate("main.page.previous")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `next_result_page_${this.interaction.id}`,
                this.client.translate("main.page.next")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `last_result_page_${this.interaction.id}`,
                this.client.translate("main.page.last")
            )
            .addRow()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `jumpto_result_${this.interaction.id}`,
                this.client.translate("main.result.enter")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `jumpto_result_page_${this.interaction.id}`,
                this.client.translate("main.page.enter")
            )
            .addRow()
            .addInteractionButton(
                Constants.ButtonStyles.SUCCESS,
                `read_result_${this.interaction.id}`,
                this.client.translate("main.read")
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
                case `read_result_${this.interaction.id}`:
                    interaction.deferUpdate();

                    this.api
                        .getGallery(embed.toJSON().author.name)
                        .then(async (gallery) => {
                            this.paginationEmbed = new ReadSearchPaginator(
                                this.client,
                                gallery,
                                this.interaction,
                                this
                            );
                            await this.paginationEmbed.initialisePaginator();
                            this.paginationEmbed.runPaginator();
                        });

                    break;
                case `see_more_${this.interaction.id}`:
                    interaction.deferUpdate();
                    this.initialisePaginator();
                    break;
                case `show_cover_${this.interaction.id}`:
                    embed.setImage(
                        (await this.api.getGallery(embed.toJSON().author.name))
                            .cover.url
                    );
                    this.interaction.editOriginal({
                        components: hideComponent,
                        embeds: [embed.toJSON()],
                    });
                    interaction.deferUpdate();
                    break;
                case `hide_cover_${this.interaction.id}`:
                    embed.removeImage();
                    this.interaction.editOriginal({
                        components: showComponent,
                        embeds: [embed.toJSON()],
                    });
                    interaction.deferUpdate();
                    break;
                case `home_result_${this.interaction.id}`:
                    this.interaction.editOriginal({
                        components: showComponent,
                        embeds: [this.embeds[this.embed - 1]],
                    });
                    this.paginationEmbed.stopPaginator();
                    interaction.deferUpdate();
                    break;
                case `stop_result_${this.interaction.id}`:
                    interaction.message.delete();
                    interaction.deferUpdate();
                    this.stopPaginator();

                    try {
                        this.paginationEmbed.stopPaginator();
                    } catch (err) {
                        return;
                    }

                    break;
                case `bookmark_${this.interaction.id}`:
                    if (this.paginationEmbed && this.paginationEmbed.running) {
                        return;
                    }

                    if (
                        userData.bookmark.includes(embed.toJSON().author.name)
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
                                                    embed.toJSON().author.name
                                                }\`](${NReaderConstant.Source.ID(
                                                    embed.toJSON().author.name
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
                            embed.toJSON().author.name,
                            undefined,
                            undefined,
                            undefined,
                            "removed"
                        );

                        UserModel.findOneAndUpdate(
                            { id: interaction.member.id },
                            { $pull: { bookmark: embed.toJSON().author.name } }
                        ).exec();
                    } else {
                        if (!userData.settings.premium && userData.bookmark.length === 25) {
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
                                                    embed.toJSON().author.name
                                                }\`](${NReaderConstant.Source.ID(
                                                    embed.toJSON().author.name
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
                            embed.toJSON().author.name,
                            undefined,
                            undefined,
                            undefined,
                            "added"
                        );

                        UserModel.findOneAndUpdate(
                            { id: interaction.member.id },
                            { $push: { bookmark: embed.toJSON().author.name } }
                        ).exec();
                    }

                    break;
                case `next_result_${this.interaction.id}`:
                    interaction.deferUpdate();

                    if (this.embed < this.embeds.length) {
                        this.embed++;
                        this.updatePaginator();
                    }

                    break;
                case `previous_result_${this.interaction.id}`:
                    interaction.deferUpdate();

                    if (this.embed > 1) {
                        this.embed--;
                        this.updatePaginator();
                    }

                    break;
                case `first_result_${this.interaction.id}`:
                    interaction.deferUpdate();

                    this.embed = 1;
                    this.updatePaginator();
                    break;
                case `last_result_${this.interaction.id}`:
                    interaction.deferUpdate();

                    this.embed = this.embeds.length;
                    this.updatePaginator();
                    break;
                case `jumpto_result_${this.interaction.id}`:
                    interaction.createModal({
                        components: new ComponentBuilder<ModalActionRow>()
                            .addTextInput(
                                Constants.TextInputStyles.SHORT,
                                this.client.translate("main.result.enter"),
                                "result_number",
                                "10"
                            )
                            .toJSON(),
                        customID: `jumpto_result_modal_${this.interaction.id}`,
                        title: this.client.translate("main.result.enter"),
                    });

                    break;
                case `jumpto_result_page_${this.interaction.id}`:
                    interaction.createModal({
                        components: new ComponentBuilder<ModalActionRow>()
                            .addTextInput(
                                Constants.TextInputStyles.SHORT,
                                this.client.translate("main.page.enter"),
                                "result_page_number",
                                "5"
                            )
                            .toJSON(),
                        customID: `jumpto_result_page_modal_${this.interaction.id}`,
                        title: this.client.translate("main.page.enter"),
                    });

                    break;
                case `next_result_page_${this.interaction.id}`:
                    interaction.deferUpdate();

                    if (this.page < this.bookmarkChunks.length) {
                        this.page++;
                        this.getBookmarkPage();
                    }

                    break;
                case `previous_result_page_${this.interaction.id}`:
                    interaction.deferUpdate();

                    if (this.page > 1) {
                        this.page--;
                        this.getBookmarkPage();
                    }

                    break;
                case `first_result_page_${this.interaction.id}`:
                    interaction.deferUpdate();

                    this.page = 1;
                    this.getBookmarkPage();
                    break;
                case `last_result_page_${this.interaction.id}`:
                    interaction.deferUpdate();

                    this.page = this.bookmarkChunks.length;
                    this.getBookmarkPage();
                    break;
            }
        } else {
            switch (interaction.data.customID) {
                case `jumpto_result_modal_${this.interaction.id}`:
                    /* eslint-disable-next-line */
                    const pageResult = parseInt(
                        Util.getModalID(interaction, "result_number")
                    );

                    if (isNaN(pageResult)) {
                        return interaction.createMessage({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(this.client.config.BOT.COLOUR)
                                    .setDescription(
                                        this.client.translate(
                                            "main.result.enter.invalid"
                                        )
                                    )
                                    .toJSON(),
                            ],
                            flags: Constants.MessageFlags.EPHEMERAL,
                        });
                    }

                    if (pageResult > this.embeds.length) {
                        return interaction.createMessage({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(this.client.config.BOT.COLOUR)
                                    .setDescription(
                                        this.client.translate(
                                            "main.result.enter.unknown",
                                            {
                                                index: pageResult.toLocaleString(),
                                            }
                                        )
                                    )
                                    .toJSON(),
                            ],
                            flags: Constants.MessageFlags.EPHEMERAL,
                        });
                    }

                    if (pageResult <= 0) {
                        return interaction.createMessage({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(this.client.config.BOT.COLOUR)
                                    .setDescription(
                                        this.client.translate(
                                            "main.result.enter.unknown",
                                            {
                                                index: pageResult.toLocaleString(),
                                            }
                                        )
                                    )
                                    .toJSON(),
                            ],
                            flags: Constants.MessageFlags.EPHEMERAL,
                        });
                    }

                    this.embed = pageResult;
                    this.updatePaginator();
                    interaction.deferUpdate();
                    break;
                case `jumpto_result_page_modal_${this.interaction.id}`:
                    /* eslint-disable-next-line */
                    const page = parseInt(
                        Util.getModalID(interaction, "result_page_number")
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

                    if (page > this.bookmarkChunks.length) {
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

                    this.page = page;
                    this.getBookmarkPage();
                    interaction.deferUpdate();
                    break;
            }
        }
    }

    /**
     * Run the paginator class
     */
    public runPaginator() {
        this.client.on("interactionCreate", this.onSearch);
        this.running = true;

        setTimeout(() => {
            this.client.off("interactionCreate", this.onSearch);
        }, 7200 * 1000);
    }

    /**
     * Stop the paginator class
     */
    public stopPaginator() {
        this.client.off("interactionCreate", this.onSearch);
        this.running = false;
    }

    /**
     * Update the paginator class
     */
    public updatePaginator() {
        const components = new ComponentBuilder<MessageActionRow>()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `first_result_${this.interaction.id}`,
                this.client.translate("main.result.first")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `previous_result_${this.interaction.id}`,
                this.client.translate("main.result.previous")
            )
            .addInteractionButton(
                Constants.ButtonStyles.DANGER,
                `stop_result_${this.interaction.id}`,
                this.client.translate("main.stop")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `next_result_${this.interaction.id}`,
                this.client.translate("main.result.next")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `last_result_${this.interaction.id}`,
                this.client.translate("main.result.last")
            )
            .addRow()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `first_result_page_${this.interaction.id}`,
                this.client.translate("main.page.first")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `previous_result_page_${this.interaction.id}`,
                this.client.translate("main.page.previous")
            )
            .addInteractionButton(
                Constants.ButtonStyles.SECONDARY,
                `next_result_page_${this.interaction.id}`,
                this.client.translate("main.page.next")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `last_result_page_${this.interaction.id}`,
                this.client.translate("main.page.last")
            )
            .addRow()
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `jumpto_result_${this.interaction.id}`,
                this.client.translate("main.result.enter")
            )
            .addInteractionButton(
                Constants.ButtonStyles.PRIMARY,
                `jumpto_result_page_${this.interaction.id}`,
                this.client.translate("main.page.enter")
            )
            .addRow()
            .addInteractionButton(
                Constants.ButtonStyles.SUCCESS,
                `read_result_${this.interaction.id}`,
                this.client.translate("main.read")
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

        this.client.stats.logActivities(
            this.interaction.user.id,
            "bookmark-paginator",
            this.user.id,
            this.page,
            this.embed,
            this.embeds[this.embed - 1].author.name
        );

        this.message.edit({
            components,
            embeds: [this.embeds[this.embed - 1]],
        });
    }
}

export async function createBookmarkPaginator(
    client: NReaderClient,
    galleries: Gallery[],
    interaction: CommandInteraction<TextChannel>,
    user: User
) {
    const paginator = new BookmarkPaginator(
        client,
        galleries,
        interaction,
        user
    );

    paginator.runPaginator();

    return Promise.resolve(paginator.message);
}
