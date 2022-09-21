import { IRawTag, TTagType } from "../../Constant";
import { Tag } from "./Tag";

export class TagManager {
    /**
     * All parsed tags
     */
    readonly all: Tag[];

    constructor(data: IRawTag[]) {
        this.all = data.map((tag) => new Tag(tag));
    }

    /**
     * Get the artists tag
     */
    get artists(): Tag[] {
        return this.getByType("artist");
    }

    /**
     * Get the categories tag
     */
    get categories(): Tag[] {
        return this.getByType("category");
    }

    /**
     * Get the characters tag
     */
    get characters(): Tag[] {
        return this.getByType("character");
    }

    /**
     * Get the groups tag
     */
    get groups(): Tag[] {
        return this.getByType("group");
    }

    /**
     * Get the languages tag
     */
    get languages(): Tag[] {
        return this.getByType("language");
    }

    /**
     * Get the parodies tag
     */
    get parodies(): Tag[] {
        return this.getByType("parody");
    }

    /**
     * Get the tags tag
     */
    get tags(): Tag[] {
        return this.getByType("tag");
    }

    /**
     * Get a tag by its ID
     * @param id The ID of the tag
     * @returns {Tag}
     */
    public getByID(id: number): Tag {
        return this.all.find((tag) => tag.id === id);
    }

    /**
     * Get tags by its type
     * @param type The type of the tag
     * @returns {Tag[]}
     */
    public getByType(type: TTagType): Tag[] {
        return this.all.filter((tag) => tag.type === type);
    }
}
