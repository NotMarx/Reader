"use strict";

export interface LanguageOptions {
    GENERAL: {
        PING: {
            TEXT: string;
        }
        STATS: {
            TITLE: string;
            DESC: string;
            FIELDS: {
                MEMORY_USAGE: {
                    NAME: string;
                    VALUE: string;
                }
                CPU_USAGE: {
                    NAME: string;
                    VALUE: string;
                }
                DATABASE_SIZE: {
                    NAME: string;
                    VALUE: string;
                }
                NODEJS: {
                    NAME: string;
                    VALUE: string;
                }
                ERIS: {
                    NAME: string;
                    VALUE: string;
                }
                PLATFORM: {
                    NAME: string;
                    VALUE: string;
                }
            }
        }
    }
    MAIN: {
        BOOKMARK: {
            TITLE: string;
            DESC: string;
            BOOKMARKED: string;
            NONE: string;
            LOADING_STATE: string;
        }
    }
}

export { Command } from "./command";
export { Config } from "./config";
export { Event } from "./event";
