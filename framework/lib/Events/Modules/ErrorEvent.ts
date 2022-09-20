import { NReaderClient } from "../../Client";
import { Logger } from "../../Utils/Logger";

export function errorEvent(client: NReaderClient, err: string, id: number) {
  client.logger.error({
    message: err,
    subTitle: "NReaderFramework::Events::Error",
    title: `SHARD ${id}`,
  });
}

export function tsError(err: string) {
  new Logger().error({
    message: err,
    subTitle: "TypeScript::Error",
    title: "UNHANDLED REJECTION",
  });
}
