export interface IUserSchemaSettings {
    premium: boolean;
}

export interface IUserSchema {
    bookmark: string[];
    createdAt: Date;
    id: string;
    settings: IUserSchemaSettings;
}
