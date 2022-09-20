export interface IConfigAPI {
  RESTRICTED_TAGS: string[];
}

export interface IConfigBot {
  ADMIN: string[];
  COLOUR: number;
  DEBUG: boolean;
  MONGODB: string;
  TOKEN: string;
}

export interface IConfigListAuth {
  AUTH: string;
}

export interface IConfigList {
  ENABLED: boolean;
  BHBOTLIST: IConfigListAuth;
  TOPGG: IConfigListAuth;
}

export interface IConfig {
  API: IConfigAPI;
  BOT: IConfigBot;
  LIST: IConfigList;
}
