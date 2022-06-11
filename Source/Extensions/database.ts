import { ConnectOptions, connect, Model, model, Schema, connection } from "mongoose";
import { Logger } from "./logger";

export class MongoDatabase  {
    model: Model<any>;
    mongoDBURI: string;
    options: ConnectOptions;

    constructor(mongoDBURI: string, options?: ConnectOptions) {

        this.mongoDBURI = mongoDBURI;
        this.options = options;
    }

    init() {
        const schema = new Schema({
            GuildID: String,
            Settings: {
                Language: String,
                Prefix: String
            }
        });

        connection.on("error", new Logger().error.bind(console, "Error Connection:"));
        connection.on("open", () => new Logger().success({ message: "Successfully Connected to MongoDB", subTitle: "Reader::MongoDB", title: "DATABASE" }));

        connect(this.mongoDBURI, this.options);
        return this.model = model("reader", schema);

    }
}

/* export function connectMongoDB() {
    connect(MONGODB_URI);

    connection.on("error", Logger.error.bind(console, "Error Connection:"));
    connection.once("open", () => {
        Logger.success("DATABASE", `${connection.name} Successfully Connected To MongoDB`);
    });

    const schema = new Schema({
        Database: Object
    });

    return model("reader", schema);
} */
