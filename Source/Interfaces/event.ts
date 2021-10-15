"use strict";

import { ClientEvents } from "eris";
import Reader from "../Extensions/client";

export interface Event {
    name: keyof ClientEvents;
    run: Run;
}

interface Run {
    (client: Reader, ...args: any): Promise<any>;
}
