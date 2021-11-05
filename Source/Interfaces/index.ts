"use strict";

export interface GuildLanguage {
    ADMIN: {
        CONFIG: {
            META: {
                DESC: string;
                CATEGORY: string;
            }
            PREFIX_TOO_LONG: string;
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
            META: {
                DESC: string;
                CATEGORY: string;
            }
            TEXT: string;
        }
        HELP: {
            META: {
                DESC: string;
                CATEGORY: string;
            }
            CATEGORIES: {
                ADMIN: string;
                GENERAL: string;
                MAIN: string;
            }
            TITLE: string;
            DESC: string;
            TRUE: string;
            FALSE: string;
            ALIASES: string;
            CATEGORY: string;
            USAGE: string;
            ADMIN_ONLY: string;
            NSFW_ONLY: string
        }
        STATS: {
            META: {
                DESC: string;
                CATEGORY: string;
            }
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
            FOOTER: string;
        }
    }
    MAIN: {
        BOOKMARK: {
            META: {
                DESC: string;
                CATEGORY: string;
            }
            MEMBER: {
                DESC: string;
                LOADING_STATE: string;
            }
            TITLE: string;
            DESC: string;
            BOOKMARKED: string;
            NONE: string;
            LOADING_STATE: string;
        }
        READ: {
            META: {
                DESC: string;
                CATEGORY: string;
            }
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
        SEARCH: {
            META: {
                DESC: string;
                CATEGORY: string;
            }
            NOT_FOUND: string;
            NO_QUERY: string;
            INVALID_PAGE: string;
            PAGE: string;
            TITLES: string;
            DETAIL: string;
        }
    }
}

export { Command } from "./command";
export { Config } from "./config";
export { Event } from "./event";
