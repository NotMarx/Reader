import { model, Model, Schema } from "mongoose";
import { IGuildSchema } from "../Interfaces";

const guildSchema = new Schema<IGuildSchema>({
    createdAt: {
        default: new Date(),
        required: true,
        type: Date
    },
    id: {
        required: true,
        type: String
    },
    settings: {
        locale: {
            default: "en",
            required: true,
            type: String
        }
    }
});

export const GuildModel: Model<IGuildSchema> = model("guilds", guildSchema);
