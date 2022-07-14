import { model, Model, Schema } from "mongoose";
import { Book } from "nhentai-api";
import { IUserSchema } from "../Interfaces";

const userSchema = new Schema<IUserSchema>({
    bookmark: {
        default: [],
        required: true,
        type: [Book]
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
            default: "current",
            required: true,
            type: String
        }
    }
});

export const UserModel: Model<IUserSchema> = model("users", userSchema);
