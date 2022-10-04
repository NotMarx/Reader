export interface IUserSchemaHistoryRead {
    date: Date;
    id: string;
}

export interface IUserSchemaHistorySearched {
    date: Date;
    query: string;
}

export interface IUserSchemaHistory {
    read: IUserSchemaHistoryRead[];
    searched: IUserSchemaHistorySearched[];
}

export interface IUserSchemaSettings {
    history: boolean;
    premium: boolean;
    temporaryPremium: boolean;
}

export interface IUserSchemaStats {
    commands: number;
    history: IUserSchemaHistory;
}

export interface IUserSchema {
    bookmark: string[];
    createdAt: Date;
    id: string;
    settings: IUserSchemaSettings;
    stats: IUserSchemaStats;
}
