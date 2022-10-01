import { model, Model, Schema } from "mongoose";
import { IUserSchema } from "../Interfaces";
const userSchema = new Schema<IUserSchema>({
    bookmark: {
        default: [],
        required: true,
        type: Schema.Types.Mixed,
    },
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
        premium: {
            default: false,
            required: true,
            type: Schema.Types.Boolean,
        },
        temporaryPremium: {
            required: true,
            type: Schema.Types.Boolean,
        },
    },
    stats: {
        commands: {
            default: 0,
            required: true,
            type: Schema.Types.Number,
        },
        history: {
            read: {
                default: [],
                required: true,
                type: Schema.Types.Mixed,
            },
            searched: {
                default: [],
                required: true,
                type: Schema.Types.Mixed,
            },
        },
    },
});

export const UserModel: Model<IUserSchema> = model("users", userSchema);
