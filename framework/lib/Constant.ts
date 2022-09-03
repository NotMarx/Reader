const BHBotList = {
    API: "https://api.bhbotlist.tech",
    BASE: "https://bhbotlist.tech",
    STATS: () => `${BHBotList.API}/bots/stats`,
    VOTE: (id: string) => `${BHBotList.BASE}/bot/${id}/vote`,
};

const Source = {
    BASE: "https://nhentai.net",
    ID: (id: string) => `https://nhentai.net/g/${id}`,
    TAGS: "https://nhentai.net/tags/",
};

export const NReaderConstant = {
    BHBotList,
    Source
};
