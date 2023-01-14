import { RequestHandler } from "../index";
import { Logger } from "../../Utils/Logger";
import { galleryTest } from "./GalleryTest";
import { searchTest } from "./SearchTest";

const client = new RequestHandler();
const logger = new Logger();

galleryTest(client, logger);
searchTest(client, logger);
