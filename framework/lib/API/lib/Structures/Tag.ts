import { BASE_URL, IRawTag, TTagType } from "../../Constant";

export class Tag {

    /**
     * The count of the tag
     */
    readonly count: number;

    /**
     * The ID of the tag
     */
    readonly id: number;

    /**
     * The name of the tag
     */
    readonly name: string;

    /**
     * The type of the tag
     */
    readonly type: TTagType;

    /**
     * The URL of the tag
     */
    readonly url: string;

    constructor(data: IRawTag) {
        this.count = data.count;
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.url = `${BASE_URL}${data.url}`;
    }
}
