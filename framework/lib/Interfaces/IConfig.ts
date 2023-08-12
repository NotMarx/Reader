export interface IConfigAPI {
    COOKIE: string;
    RESTRICTED_TAGS: string[];
    TEMPORARY_PREMIUM: boolean;
}

export interface IConfigBot {
    ADMIN: string[];
    COLOUR: number;
    DEBUG: boolean;
    GUILD: string;
    MONGODB: string;
    TOKEN: string;
}

export interface IConfigListAuth {
    AUTH: string;
}

export interface IConfigList {
    ENABLED: boolean;
    BHBOTLIST: IConfigListAuth;
    TOPGG: IConfigListAuth;
}

export interface IConfig {
    API: IConfigAPI;
    BOT: IConfigBot;
    LIST: IConfigList;
}
