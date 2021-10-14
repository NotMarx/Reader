"use strict";

export interface LanguageOptions {
    ADMIN: {
        CONFIG: {
            NO_PERMS: string;
            NO_OPT: string;
            NO_PREFIX: string;
            PREFIX_SUCCESS: string;
            NO_LANG: string;
            INVALID_LANG: string;
            LANG_SUCCESS: string
        }
    }
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
        READ: {
            TITLE: string;
            PAGES: string;
            DATE: string;
            LANGUAGE: string;
            LANGUAGES: string;
            ARTIST: string;
            ARTISTS: string;
            CHARACTER: string;
            CHARACTERS: string;
            PARODY: string;
            TAG: string;
            TAGS: string;
            NONE: string;
            NOT_PROVIDED: string;
            READ: string;
            DISMISS: string;
            BOOKMARK: string;
        }
    }
}

export { Command } from "./command";
export { Config } from "./config";
export { Event } from "./event";
