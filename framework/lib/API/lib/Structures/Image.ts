import { IImage, TExtension, TRawExtension } from "../../Constant";
import Endpoints from "../REST/Endpoints";
import { Gallery } from "./Gallery";

export class Image {
    /**
     * The file extension
     */
    readonly extension: TExtension;

    /**
     * The height of the image (in pixels)
     */
    readonly height: number;

    /**
     * The page number. Returns null if it represents a cover/thumbnail
     */
    readonly page: number | null;

    /**
     * The URL of the image
     */
    readonly url: string;

    /**
     * The width of the image (in pixels)
     */
    readonly width: number;

    constructor(image: IImage, name: string | number, gallery: Gallery) {
        this.extension = this.parse(image.t);
        this.height = image.h;
        this.page = isNaN(name as number) ? null : Number(name);
        this.url = Endpoints.GALLERIES_MEDIA(
            gallery.mediaID,
            name,
            this.extension
        );
        this.width = image.w;
    }

    private parse(extension: TRawExtension): TExtension {
        switch (extension) {
            case "g":
                return "gif";
            case "j":
                return "jpg";
            case "p":
                return "png";
            default:
                throw new Error("Unknown extension");
        }
    }
}
