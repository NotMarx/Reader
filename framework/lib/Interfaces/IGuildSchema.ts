import { TLocale } from "../Types";

export interface IGuildSchemaSettings {
    blacklisted: boolean;
    emojiText: boolean;
    locale: TLocale;
    whitelisted: boolean;
}

export interface IGuildSchema {
    createdAt: Date;
    id: string;
    settings: IGuildSchemaSettings;
}
