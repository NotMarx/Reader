import {
    IRawGallerySearch,
    IRawGallerySearchParam,
    TSearchSort,
} from "../../Constant";
import { Gallery } from "./Gallery";

export class Search {
    /**
   * The total pages of the search
   */
    readonly numPages: number;

    /**
   * The current page of the search
   */
    readonly page: number;

    /**
   * The results length of the search per page
   */
    readonly perPage: number;

    /**
   * The query of the search
   */
    readonly query: string | null;

    /**
   * The results of the search
   */
    readonly result: Gallery[];

    /**
   * The sort of the search
   */
    readonly sort: TSearchSort | null;

    constructor(data: IRawGallerySearch, param?: IRawGallerySearchParam) {
        this.numPages = data.num_pages || 1;
        this.perPage = data.per_page || 5;
        this.result = data.result.map((gallery) => new Gallery(gallery));

        if (param) {
            this.page = param.page;
            this.query = param.query;
            this.sort = param.sort;
        } else {
            this.page = 1;
            this.query = null;
            this.sort = null;
        }
    }
}
