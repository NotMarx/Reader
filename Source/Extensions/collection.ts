"use strict";

export default class Collection<T> extends Map<string, T> {
    constructor() {
        super();
    }

    public filter(func: (i: T) => boolean): T[] {
        const arr: any[] = [];

        for (const item of this.values()) {
            if (func(item)) {
                arr.push(item);
            }
        }
        return arr;
    }
}
