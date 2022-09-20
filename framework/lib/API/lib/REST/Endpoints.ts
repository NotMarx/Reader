import {
    BASE_IP_URL,
    BASE_URL,
    IMAGE_URL,
    TExtension,
    THUMBNAIL_URL,
    TSearchSort,
} from "../../Constant";

const API_URL = `${BASE_IP_URL}/api`;

const G = (id: string) => `${BASE_URL}/g/${id}`;
const GALLERIES_MEDIA = (
    mediaID: string,
    name: string | number,
    extension: TExtension
) =>
    `${
        isNaN(name as number) ? THUMBNAIL_URL : IMAGE_URL
    }/galleries/${mediaID}/${name}.${extension}`;
const GALLERIES_SEARCH = (query: string, page?: number, sort?: TSearchSort) =>
    `${API_URL}/galleries/search?query=${query}&page=${page || 1}&sort=${
        sort || ""
    }`;
const GALLERY = (id: string) => `${API_URL}/gallery/${id}`;
const GALLERY_RELATED = (id: string) => `${API_URL}/gallery/${id}/related`;

export default {
    API_URL,
    G,
    GALLERIES_MEDIA,
    GALLERIES_SEARCH,
    GALLERY,
    GALLERY_RELATED,
};
