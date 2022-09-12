// Use IP address to bypass Cloudflare protection
export const BASE_URL = "https://nhentai.net";
export const BASE_IP_URL = "http://138.2.77.198:3002";
export const IMAGE_URL = "http://i.nhentai.net";
export const THUMBNAIL_URL = "http://t.nhentai.net";

export type TTagType = "artist" | "category" | "character" | "group" | "language" | "parody" | "tag";
export type TExtension = "gif" | "jpg" | "png";
export type TRawExtension = "g" | "j" | "p";
export type TSearchSort = "" | "popular" | "popular-today" | "popular-week" | "popular-month";

export interface IImage {
    h: number;
    t: "g" | "j" | "p";
    w: number;
}

export interface IRawGallerySearch {
    num_pages: number;
    per_page: number;
    result: IRawGallery[];
}

export interface IRawGallerySearchParam {
    page?: number;
    query: string;
    sort?: TSearchSort;
}

export interface IRawGallery {
    id: string;
    media_id: string;
    title: IRawGalleryTitle;
    images: {
        pages: IImage[];
        cover: IImage;
        thumbnail: IImage;
    }
    scanlator: string;
    upload_date: number;
    tags: IRawTag[];
    num_pages: number;
    num_favorites: number;
}

export interface IRawGalleryTitle {
    english: string;
    japanese: string;
    pretty: string;
}

export interface IRawTag {
    id: number;
    type: TTagType;
    name: string;
    url: string;
    count: number;
}
