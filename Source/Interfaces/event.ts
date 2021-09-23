"use strict";

import Eris from "eris";
import Reader from "../Extensions/client";

interface ClientEvents {
    callCreate: [call: Eris.Call];
    callDelete: [call: Eris.Call];
    callRing: [call: Eris.Call];
    callUpdate: [call: Eris.Call, oldCall: Eris.OldCall];
    channelCreate: [channel: Eris.TextChannel | Eris.VoiceChannel | Eris.CategoryChannel | Eris.StoreChannel | Eris.NewsChannel | Eris.GuildChannel | Eris.PrivateChannel | Eris.StageChannel];
    channelDelete: [channel: Eris.TextChannel | Eris.PrivateChannel | Eris.NewsChannel | Eris.VoiceChannel | Eris.StageChannel];
    channelPinUpdate: [channel: Eris.TextChannel | Eris.PrivateChannel | Eris.NewsChannel, timestamp: number, oldTimestamp: number];
    channelRecipientAdd: [channel: Eris.GroupChannel, user: Eris.User];
    channelRecipientRemove: [channel: Eris.GroupChannel, user: Eris.User];
    channelUpdate: [channel: Eris.TextChannel | Eris.VoiceChannel | Eris.CategoryChannel | Eris.StoreChannel | Eris.NewsChannel | Eris.GuildChannel | Eris.PrivateChannel | Eris.StageChannel, oldChannel: Eris.OldGuildChannel];
    connect: [id: number];
    debug: [message: string, id: number];
    disconnect: [];
    error: [err: Error, id: number];
    friendSuggestionCreate: [user: Eris.User, reasons: Array<string>];
    friendSuggestionDelete: [user: Eris.User];
    guildAvailable: [guild: Eris.Guild];
    guildBanAdd: [guild: Eris.Guild, user: Eris.User];
    guildBanRemove: [guild: Eris.Guild, user: Eris.User];
    guildCreate: [guild: Eris.Guild];
    guildDelete: [guild: Eris.Guild];
    guildEmojisUpdate: [guild: Eris.Guild, emojis: Array<any>, oldEmojis: Array<any> | null];
    guildMemberAdd: [guild: Eris.Guild, member: Eris.Member];
    guildMemberChunk: [guild: Eris.Guild, members: Array<Eris.Member>];
    guildMemberRemove: [guild: Eris.Guild, member: Eris.Member | object];
    guildMemberUpdate: [guild: Eris.Guild, member: Eris.Member, oldMember: Eris.OldMember];
    guildRoleCreate: [guild: Eris.Guild, role: Eris.Role];
    guildRoleDelete: [guild: Eris.Guild, role: Eris.Role];
    guildRoleUpdate: [guild: Eris.Guild, role: Eris.Role, oldRole: Eris.OldRole];
    guildUnavailable: [guild: Eris.Guild];
    guildUpdate: [guild: Eris.Guild, oldGuild: Eris.OldGuild];
    hello: [trace: Array<string>, id: number];
    interactionCreate: [interaction: Eris.PingInteraction | Eris.ComponentInteraction<Eris.TextableChannel> | Eris.CommandInteraction<Eris.TextableChannel> | Eris.UnknownInteraction<Eris.TextableChannel>];
    inviteCreate: [guild: Eris.Guild, invite: Eris.Invite];
    inviteDelete: [guild: Eris.Guild, invite: Eris.Invite];
    messageCreate: [message: Eris.Message<Eris.PossiblyUncachedTextableChannel>];
    messageDelete: [message: Eris.Message<Eris.PossiblyUncachedTextableChannel> | object];
    messageDeleteBulk: [messages: Array<Eris.Message<Eris.PossiblyUncachedTextableChannel>> | Array<object>];
    messageReactionAdd: [message: Eris.Message<Eris.PossiblyUncachedTextableChannel> | object, emoji: Eris.Emoji, reactor: Eris.Member | object];
    messageReactionRemove: [message: Eris.Message<Eris.PossiblyUncachedTextableChannel> | object, emoji: Eris.Emoji, userID: string];
    messageReactionRemoveAll: [message: Eris.Message<Eris.PossiblyUncachedTextableChannel> | object];
    messageReactionRemoveEmoji: [message: Eris.Message<Eris.PossiblyUncachedTextableChannel> | object, emoji: Eris.Emoji];
    messageUpdate: [message: Eris.Message<Eris.PossiblyUncachedTextableChannel>, oldMessage: Eris.OldMessage | null];
    presenceUpdate: [other: Eris.Member | Eris.Relationship, oldPresence: Eris.Presence | null];
    rawREST: [request: Eris.RawRESTRequest];
    rawWS: [packet: Eris.RawPacket, id: number];
    ready: [];
    relationshipAdd: [relationship: Eris.Relationship];
    relationshipRemove: [relationship: Eris.Relationship];
    relationshipUpdate: [relationship: Eris.Relationship, oldRelationship: object];
    shardDisconnect: [error: Error | null, id: number];
    shardPreReady: [id: number];
    shardReady: [id: number];
    shardResume: [id: number];
    typingStart: [channel: Eris.TextChannel | Eris.PrivateChannel | Eris.NewsChannel | object, user: Eris.User | object, member: Eris.Member | null];
    unavailableGuildCreate: [guild: Eris.UnavailableGuild];
    unknown: [packet: Eris.RawPacket, id: number];
    userUpdate: [user: Eris.User, oldUser: object];
    voiceChannelJoin: [member: Eris.Member, newChannel: Eris.StageChannel | Eris.VoiceChannel];
    voiceChannelLeave: [member: Eris.Member, oldChannel: Eris.StageChannel | Eris.VoiceChannel];
    voiceChannelSwitch: [member: Eris.Member, newChannel: Eris.StageChannel | Eris.VoiceChannel, oldChannel: Eris.StageChannel | Eris.VoiceChannel];
    voiceStateUpdate: [member: Eris.Member, oldState: Eris.OldVoiceState];
    warn: [message: string, id: number];
    webhooksUpdate: [data: Eris.WebhookData];
}

export interface Event {
    name: keyof ClientEvents;
    run: Run;
}

interface Run {
    (client: Reader, ...args: any): Promise<any>;
}
