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

    get artists(): Tag[] {
        return this.getByType("artist");
    }

    get categories(): Tag[] {
        return this.getByType("category");
    }

    get characters(): Tag[] {
        return this.getByType("character");
    }

    get groups(): Tag[] {
        return this.getByType("group");
    }

    get languages(): Tag[] {
        return this.getByType("language");
    }

    get parodies(): Tag[] {
        return this.getByType("parody");
    }

    get tags(): Tag[] {
        return this.getByType("tag");
    }

    public getByID(id: number): Tag {
        return this.all.find((tag) => tag.id === id);
    }

    public getByType(type: TTagType): Tag[] {
        return this.all.filter((tag) => tag.type === type);
    }
}
