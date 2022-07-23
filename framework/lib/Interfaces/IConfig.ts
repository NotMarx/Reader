export interface IConfigAPI {
    COOKIE: string;
}

export interface IConfigBot {
    COLOUR: number;
    DEBUG: boolean;
    MONGODB: string;
    TOKEN: string;
}

export interface IConfig {
    API: IConfigAPI;
    BOT: IConfigBot;
}
