import { TReadState } from "../Types";

export interface IUserSchemaSettings {
    premium: boolean;
    readState: TReadState;
}

export interface IUserSchema {
    bookmark: string[];
    createdAt: Date;
    id: string;
    settings: IUserSchemaSettings;
}
