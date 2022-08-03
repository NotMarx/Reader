export interface IConfigAPI {
    COOKIE: string;
}

export interface IConfigBot {
    ADMIN: string[];
    COLOUR: number;
    DEBUG: boolean;
    MONGODB: string;
    TOKEN: string;
}

export interface IConfig {
    API: IConfigAPI;
    BOT: IConfigBot;
}
