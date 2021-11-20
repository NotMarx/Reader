"use strict";

import byteSize from "byte-size";
export default class Util {
    static bytes(size: number):  { value: number; unit: string; } {
        return byteSize(size);
    }

    static round(value: number, precision: number): number {
        const multi = Math.pow(10, precision || 0);
        return Math.round(value * multi) / multi;
    }
}