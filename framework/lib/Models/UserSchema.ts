import { model, Model, Schema } from "mongoose";
import { IUserSchema } from "../Interfaces";

const userSchema = new Schema<IUserSchema>({
    bookmark: {
        default: [],
        required: true,
        type: [String]
    },
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
        premium: {
            default: false,
            required: true,
            type: Boolean
        },
        readState: {
            default: "new",
            required: true,
            type: String
        }
    }
});

export const UserModel: Model<IUserSchema> = model("users", userSchema);
