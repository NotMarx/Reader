import { UserModel } from "../Models";
import { NReaderClient } from "../Client";
import { TUserHistory, TUserHistorySearched } from "../Types/THistory";

export class StatsManager {
    /**
     * NReader Client
     *
     */
    private client: NReaderClient;

    /**
     * Manage the database stats
     * @param client NReader Client
     */
    constructor(client: NReaderClient) {
        this.client = client;
    }

    /**
     * Update the history of the user
     * @param userID The ID of the user
     * @param history History type
     * @param query History query
     * @returns {Promise<void>}
     */
    public async updateUserHistory(
        userID: string,
        history: "read",
        query: string
    ): Promise<void>;

    /**
     * Update the history of the user
     * @param userID The ID of the user
     * @param history History type
     * @param query History query
     * @param searched Searched type
     * @returns {Promise<void>}
     */
    public async updateUserHistory(
        userID: string,
        history: "searched",
        query: string,
        searched: TUserHistorySearched
    ): Promise<void>;

    public async updateUserHistory(
        userID: string,
        history: TUserHistory,
        query: string,
        searched?: TUserHistorySearched
    ): Promise<void> {
        const user = await UserModel.findOne({ id: userID });

        if (!user) {
            return this.client.logger.error({
                message: `User ${userID} Not Found`,
                subTitle: "NReaderFramework::StatsManager",
                title: "ERROR",
            });
        }

        // Ignore if the user has disabled the history
        if (!user.settings.history) return;

        switch (history) {
            case "read":
                UserModel.findOneAndUpdate(
                    { id: userID },
                    {
                        $push: {
                            "stats.history.read": {
                                date: new Date(),
                                id: query,
                            },
                        },
                    }
                ).exec();
                break;
            case "searched":
                UserModel.findOneAndUpdate(
                    { id: userID },
                    {
                        $push: {
                            "stats.history.searched": {
                                date: new Date(),
                                query: `${query} - ${searched.toUpperCase()}`,
                            },
                        },
                    }
                ).exec();
                break;
            default:
                break;
        }
    }
}
