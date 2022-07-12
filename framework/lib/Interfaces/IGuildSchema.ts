import { TLocale } from "../Types";

export interface IGuildSchemaSettings {
    locale: TLocale;
}

export interface IGuildSchema {
    createdAt: Date;
    id: string;
    settings: IGuildSchemaSettings;
}
