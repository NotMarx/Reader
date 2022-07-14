import { Book } from "nhentai-api";
import { TReadState } from "../Types";

export interface IUserSchemaSettings {
    premium: boolean;
    readState: TReadState;
}

export interface IUserSchema {
    bookmark: Book[];
    createdAt: Date;
    id: string;
    settings: IUserSchemaSettings;
}
