import Endpoints from "./Endpoints";
import fetch from "node-fetch";
import { Gallery } from "../Structures/Gallery";
import { IRawGallerySearch, IRawGallery, TSearchSort } from "../../Constant";
import { Search } from "../Structures/Search";

export class RequestHandler {
    constructor() {}

    /**
     * Request a HTTP request
     * @param url The URL path to request
     * @returns {Promise<T>}
     */
    private request<T>(url: string): Promise<T> {
        return fetch(url).then((res) => res.json()).then((json) => {
            return json;
        });
    }

    /**
     * Get related galleries by the ID
     * @param id The ID of the gallery
     * @returns {Promise<Search>}
     */
    public getGalleryRelated(id: string): Promise<Search> {
        return this.request<IRawGallerySearch>(Endpoints.GALLERY_RELATED(id)).then((galleries) => new Search(galleries));
    }

    /**
     * Get a gallery by the ID
     * @param id The ID of the gallery
     * @returns {Promise<Gallery>}
     */
    public getGallery(id: string): Promise<Gallery> {
        return this.request<IRawGallery>(Endpoints.GALLERY(id)).then((gallery) => new Gallery(gallery));
    }

    public searchGalleries(query: string, page?: number, sort?: TSearchSort): Promise<Search> {
        return this.request<IRawGallerySearch>(Endpoints.GALLERIES_SEARCH(query, page, sort)).then((galleries) => new Search(galleries, { page, query, sort }));
    }
}
