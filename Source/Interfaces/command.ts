"use strict";

import Reader from "../Extensions/client";
import { Message, TextableChannel } from "eris";

type CategoryOptions = "General" | "Admin" | "Main";

interface Run {
    (client: Reader, message: Message<TextableChannel>, args: string[]);
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
