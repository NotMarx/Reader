export interface IUserSchemaSettings {
    premium: boolean;
    temporaryPremium: boolean;
}

export interface IUserSchema {
    bookmark: string[];
    createdAt: Date;
    id: string;
    settings: IUserSchemaSettings;
}
