export type TUserActivity =
    | "bookmarked"
    | "bookmark"
    | "bookmark-paginator"
    | "read"
    | "read-paginator"
    | "search"
    | "search-paginator"
    | "search-similar";
export type TUserBookmarkAction = "added" | "removed";
export type TUserHistory = "read" | "searched";
export type TUserHistorySearched =
    | "bookmark"
    | "read"
    | "search"
    | "search-similar";
