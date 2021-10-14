"use strict";

import Reader from "../Extensions/client";
import { LanguageOptions } from "./index";
import { Message, TextableChannel } from "eris";

type CategoryOptions = "General" | "Admin" | "Main";

interface Run {
    (client: Reader, message: Message<TextableChannel>, args: string[], guildLanguage?: LanguageOptions);
}

export interface Command {
    adminOnly?: boolean;
    aliases: string[];
    category?: CategoryOptions;
    description?: string;
    name: string;
    nsfwOnly?: boolean;
    usage?: string;
    run: Run;
}
