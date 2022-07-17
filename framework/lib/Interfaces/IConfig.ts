export interface IConfigBot {
    COLOUR: number;
    DEBUG: boolean;
    MONGODB: string;
    TOKEN: string;
}

export interface IConfig {
    BOT: IConfigBot;
}
