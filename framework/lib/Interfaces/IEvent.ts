import { NReaderClient } from "../Client";
import { ClientEvents } from "eris";

export interface IEventRun {
    (client: NReaderClient, ...args: any);
}

export interface IEvent {
    name: keyof ClientEvents;
    run: IEventRun;
}
