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
            default: false,
            required: true,
            type: Schema.Types.Boolean,
        },
    },
});

export const UserModel: Model<IUserSchema> = model("users", userSchema);
