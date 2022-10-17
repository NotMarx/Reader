import { UserModel } from "../Models";
import { NReaderClient } from "../Client";
import {
    TUserActivity,
    TUserBookmarkAction,
    TUserHistory,
    TUserHistorySearched,
} from "../Types/THistory";

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
     * Log user activities
     * @param userID The ID of the user who performed the action
     * @param query The query of the action
     * @param type The type of the activity
     * @param page The page of the query
     * @returns {Promise<void>}
     */
    public async logActivities(
        userID: string,
        type: "bookmark-paginator" | "read-paginator" | "search-paginator",
        query: string,
        page: number,
        result: number,
        queryID: string
    ): Promise<void>;

    /**
     * Log user activities
     * @param userID The ID of the user who performed the action
     * @param query The query of the action
     * @param type The type of the activity
     * @returns {Promise<void>}
     */
    public async logActivities(
        userID: string,
        type: "bookmark" | "read" | "search" | "search-similar",
        query: string
    ): Promise<void>;

    /**
     * Log user activities
     * @param userID The ID of the user who performed the action
     * @param query The query of the action
     * @param type The type of the activity
     * @param page The page of the query
     * @param action The action when user bookmarked
     * @returns {Promise<void>}
     */
    public async logActivities(
        userID: string,
        type: "bookmarked",
        query: string,
        page: number | undefined,
        result: number | undefined,
        queryID: string | undefined,
        action: "added" | "removed"
    ): Promise<void>;

    /**
     * Log user activities
     * @param userID The ID of the user who performed the action
     * @param query The query of the action
     * @param type The type of the activity
     * @param page The page of the query
     * @param result The result page of the query
     * @param queryID The ID of the current query
     * @param action The action when user bookmarked
     * @returns {Promise<void>}
     */
    public async logActivities(
        userID: string,
        type: TUserActivity,
        query: string,
        page?: number,
        result?: number,
        queryID?: string,
        action?: TUserBookmarkAction
    ): Promise<void> {
        const user = this.client.users.get(userID);

        if (type === "bookmarked") {
            this.client.logger.log({
                color: "#CC8899",
                message: `${user.tag} (${user.id}) ${
                    action.charAt(0).toUpperCase() + action.slice(1)
                } "${query}" ${
                    action === "added" ? "To" : "From"
                } Their Library`,
                subTitle: "NReaderFramework::Logging::Activities",
                title: type.toUpperCase(),
                type: "ACTIVITIES",
            });
        }

        if (
            type === "bookmark" ||
            type === "read" ||
            type === "search" ||
            type === "search-similar"
        ) {
            this.client.logger.log({
                color: "#CC8899",
                message:
                    typeof query !== "undefined"
                        ? `${user.tag} (${user.id}): "${query}"`
                        : `${user.tag} (${user.id})`,
                subTitle: "NReaderFramework::Logging::Activities",
                title: type.toUpperCase(),
                type: "ACTIVITIES",
            });
        }

        if (
            type === "bookmark-paginator" ||
            type === "read-paginator" ||
            type === "search-paginator"
        ) {
            this.client.logger.log({
                color: "#CC8899",
                message: `${user.tag} (${user.id}): "${query}" | ${
                    type === "bookmark-paginator" || type === "search-paginator"
                        ? `Page: ${page} | Result: ${result} | ID: ${queryID}`
                        : `Page: ${page}`
                }`,
                subTitle: "NReaderFramework::Logging::Activities",
                title: type.toUpperCase(),
                type: "ACTIVITIES",
            });
        }
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
