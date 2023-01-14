import { RequestHandler } from "../index";
import { Logger } from "../../Utils/Logger";

export function galleryTest(client: RequestHandler, logger: Logger) {
    client
        .getGallery("410457")
        .then(() => {
            logger.success({
                message: "Gallery Test Passed",
                subTitle: "NReaderFramework::API::Tests",
                title: "TESTS",
            });
        })
        .catch((err) => {
            logger.error({
                message: `Gallery Test Failed: ${err.message}`,
                subTitle: "NReaderFramework::API::Tests",
                title: "TESTS",
            });
        });
}
