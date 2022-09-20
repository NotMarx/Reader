import { model, Model, Schema } from "mongoose";
import { IGuildSchema } from "../Interfaces";

const guildSchema = new Schema<IGuildSchema>({
    createdAt: {
        default: new Date(),
        required: true,
        type: Schema.Types.Date,
    },
    id: {
        required: true,
        type: Schema.Types.String,
    },
    settings: {
        blacklisted: {
            default: false,
            required: true,
            type: Schema.Types.Boolean,
        },
        locale: {
            default: "en",
            required: true,
            type: Schema.Types.String,
        },
        whitelisted: {
            default: false,
            required: true,
            type: Schema.Types.Boolean,
        },
    },
});

export const GuildModel: Model<IGuildSchema> = model("guilds", guildSchema);
