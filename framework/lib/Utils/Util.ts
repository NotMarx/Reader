import { TLocale } from "../Types";

export class Util {
    public static convertLocale(locale: TLocale) {
        let output: string;

        switch (locale) {
            case "en":
                output = "English";
                break;
            case "ja":
                output = "日本語";
                break;
            default:
                output = "Unknown";
                break;

        }

        return output;
    }
}
