"use strict";

import { get } from "superagent";
import { load } from "cheerio";

export interface Details {
    artists: string[];
    categories: string[];
    groups: string[];
    languages: string[];
    parodies: string[];
    pages: string[]
    tags: string[];
    uploaded: string[];
}

interface Payload {
    title: string;
    nativeTitle: string;
    details: object;
    pages: string[];
    thumbnails: string[];
    url: string;
}

export default class API {
    static getCode(code: string): Promise<Payload> {
        // Misc
        const tagSpacerPatternn: RegExp = /(\([0-9,]+\))([a-zA-Z])/g;
        const tagSplitPattern: RegExp = /(?<=\))\s(?=[a-zA-Z])/;

        const urlToID: RegExp = /(https?:\/\/nhentai\.net\/g\/)(\d+)\/?.*/;

        const ID: string = code.replace(urlToID, '$2');
        return new Promise((resolve, reject) => {
            get(`https://nhentai.net/g/${ID}/`).then((res) => {
            const $ = load(res.text);
            let details = {};
            $('.tag-container.field-name').find('.count').each(function () {
                const el = $(this);
                el.text(` (${el.text()}) `);
            });
            $('.tag-container.field-name').text().split('\n').map(string => string.trim()).filter(u => u).map((tag, i, tags) => {
                if (tag.endsWith(':') && !tags[i + 1].endsWith(':')) {
                    details[tag.substring(0, tag.length - 1).toLowerCase()] = tags[i + 1].replace(tagSpacerPatternn, '$1 $2').split(tagSplitPattern);
                }
            });
            const title: string = $('#info').find('h1').text();
            const nativeTitle: string = $('#info').find('h2').text();
            const thumbnails: string[] = Object.entries($('.gallerythumb').find('img')).map(image => {
                return image[1].attribs
                    ? image[1].attribs['data-src']
                    : null;
            }).filter(link => link);
            const images: string[] = Object.entries($('.gallerythumb').find('img')).map(image => {
                return image[1].attribs
                    ? image[1].attribs['data-src'].replace(/t(\.(jpg|png|gif))/, '$1').replace('t.nhentai', 'i.nhentai')
                    : null;
            }).filter(link => link);
            const url: string = `https://nhentai.net/g/${ID}/`;
            resolve({ title, nativeTitle, details, pages: images, thumbnails, url });
        })
        .catch(reject);
        });
    }
}
