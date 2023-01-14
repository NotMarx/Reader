import { RequestHandler } from "../index";
import { Logger } from "../../Utils/Logger";

export function searchTest(client: RequestHandler, logger: Logger) {
    client
        .searchGalleries("yuri full color")
        .then(() => {
            logger.success({
                message: "Search Galleries Test Passed",
                subTitle: "NReaderFramework::API::Tests",
                title: "TESTS",
            });
        })
        .catch((err) => {
            logger.error({
                message: `Search Galleries Test Failed: ${err.message}`,
                subTitle: "NReaderFramework::API::Tests",
                title: "TESTS",
            });
        });
}
