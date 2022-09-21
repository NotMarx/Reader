import { IRawGallery, IRawGalleryTitle } from "../../Constant";
import Endpoints from "../REST/Endpoints";
import { Image } from "./Image";
import { TagManager } from "./TagManager";

export class Gallery {
    /**
     * The cover of the gallery
     */
    readonly cover: Image;

    /**
     * The favourites count of the gallery
     */
    readonly favourites: number;

    /**
     * The ID of the gallery
     */
    readonly id: string;

    /**
     * The media ID of the gallery
     */
    readonly mediaID: string;

    /**
     * The page length of the gallery
     */
    readonly pages: Image[];

    /**
     * The scanlator of the gallery (null if none)
     */
    readonly scanlator: string | null;

    /**
     * The tags of the gallery
     */
    readonly tags: TagManager;

    /**
     * The thumbnail of the gallery
     */
    readonly thumbnail: Image;

    /**
     * The title of the gallery
     */
    readonly title: IRawGalleryTitle;

    /**
     * The upload date of the gallery
     */
    readonly uploadDate: Date;

    /**
     * The URL of the gallery
     */
    readonly url: string;

    constructor(data: IRawGallery) {
        this.favourites = data.num_favorites;
        this.mediaID =
            typeof data.media_id === "number"
                ? (data.media_id as number).toString()
                : data.media_id;
        this.id =
            typeof data.id === "number"
                ? (data.id as number).toString()
                : data.id;
        this.pages = data.images.pages.map(
            (page, index) => new Image(page, index + 1, this)
        );
        this.scanlator = data.scanlator || null;
        this.tags = new TagManager(data.tags);
        this.cover = new Image(data.images.cover, "cover", this);
        this.thumbnail = new Image(data.images.thumbnail, "thumb", this);
        this.title = data.title;
        this.uploadDate = new Date(data.upload_date * 1000);
        this.url = Endpoints.G(this.id);
    }

    /**
     * Check if the gallery has a tag by the ID
     * @param id The ID of the tag
     * @returns {boolean}
     */
    public hasTagByID(id: number): boolean {
        return !!this.tags.all.find((tag) => tag.id === id);
    }

    /**
     * Check if the gallery has a tag by the name
     * @param name The name of the tag
     * @returns {boolean}
     */
    public hasTagByName(name: string): boolean {
        return !!this.tags.all.find((tag) => tag.name === name);
    }
}
