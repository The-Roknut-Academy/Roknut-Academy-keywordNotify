/*
 * KeywordNotify, a Vencord userplugin
 * Copyright (c) 2026 RokNut Industries Development Team
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * Additional terms under Section 7 of the GPL apply. See LICENSE.md.
 */

import { sendBotMessage } from "@api/Commands";
import { showNotification } from "@api/Notifications";
import { definePluginSettings } from "@api/Settings";
import { findStoreLazy } from "@webpack";
import definePlugin, { OptionType } from "@utils/types";
import {
    ChannelStore,
    GuildChannelStore,
    GuildStore,
    NavigationRouter,
    React,
    RelationshipStore,
    RestAPI,
    SelectedChannelStore,
    UserGuildSettingsStore,
    UserStore
} from "@webpack/common";

const ReadStateStore = findStoreLazy("ReadStateStore");

const INVITE_URL = "https://discord.gg/TNB7rG7EGv";
const BRAND = "RokNut Industries";

const DOCS_URL = "https://github.com/The-Roknut-Academy/Roknut-Academy-keywordNotify/blob/main/DOCS.md";

function openLink(url: string) {
    try {
        (globalThis as any).VencordNative?.native?.openExternal
            ? (globalThis as any).VencordNative.native.openExternal(url)
            : window.open(url, "_blank");
    } catch {
        window.open(url, "_blank");
    }
}

const buttonStyle = {
    border: "none",
    borderRadius: "4px",
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    color: "#fff"
} as const;

function BrandingPanel() {
    const h = React.createElement;
    return h("div", {
        style: {
            padding: "16px",
            marginBottom: "12px",
            borderRadius: "8px",
            background: "var(--background-secondary)",
            borderLeft: "4px solid #f59e0b"
        }
    },
        h("div", { style: { fontSize: "18px", fontWeight: 700, color: "var(--header-primary)" } }, "🥜 KeywordNotify"),
        h("div", { style: { margin: "4px 0 12px", color: "var(--text-muted)" } },
            `Built by the ${BRAND} Development Team • a RokNut Academy company`),
        h("div", { style: { margin: "0 0 12px", color: "var(--text-normal)", lineHeight: 1.5 } },
            h("strong", null, "How to add words:"),
            " scroll down to the ",
            h("em", null, "Keywords"),
            " box and type the words or phrases you want to be alerted on, separated by commas (example: ",
            h("code", null, "mynick, my name, helpme"),
            "). Matching ignores capital letters. Changes save automatically and apply instantly. No restart needed. Leave the box empty and nothing will trigger."
        ),
        h("div", { style: { margin: "0 0 12px", color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.4 } },
            h("strong", null, "API disclaimer:"),
            " the optional \"Catch up on startup\" feature makes read-only requests to Discord's own API from your client, using your own session. It is off by default and strictly capped. Everything else works locally with no requests. See the Docs for details and risks."
        ),
        h("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } },
            h("button", {
                type: "button",
                onClick: () => openLink(INVITE_URL),
                style: { ...buttonStyle, background: "#5865f2" }
            }, "Join the RokNut Academy Discord"),
            h("button", {
                type: "button",
                onClick: () => openLink(DOCS_URL),
                style: { ...buttonStyle, background: "#4f545c" }
            }, "Docs")
        )
    );
}

const CATCHUP_MAX_CHANNELS = 30;
const CATCHUP_MAX_MESSAGES = 50;
const CATCHUP_MAX_LOOKBACK_HOURS = 48;
const CATCHUP_MIN_DELAY_SECONDS = 1.5;
const CATCHUP_COOLDOWN_MS = 15 * 60 * 1000;
const CATCHUP_STARTUP_DELAY_MS = 20 * 1000;

const settings = definePluginSettings({
    branding: {
        type: OptionType.COMPONENT,
        component: BrandingPanel
    },
    enabled: {
        type: OptionType.BOOLEAN,
        description: "Notifications on/off (quick toggle, no restart needed)",
        default: true
    },
    keywords: {
        type: OptionType.STRING,
        description: "Words to notify on, separated by commas (e.g. mynick, my name, helpme). Saved automatically.",
        placeholder: "word1, word2, another phrase",
        default: ""
    },
    wholeWord: {
        type: OptionType.BOOLEAN,
        description: "Only match whole words (so \"ronin\" won't match \"baronins\")",
        default: true
    },
    includeOwnMessages: {
        type: OptionType.BOOLEAN,
        description: "Also notify when YOU say a keyword (handy for testing)",
        default: true
    },
    sendFakeDm: {
        type: OptionType.BOOLEAN,
        description: "Also drop a local-only \"system\" message in a DM with a jump link to the message",
        default: true
    },
    dmChannelId: {
        type: OptionType.STRING,
        description: "Channel ID of the DM to post the fake system message in (blank = the DM at the top of your DM list). Tip: DM yourself or a spare account and paste that channel ID here",
        default: ""
    },
    serversOnly: {
        type: OptionType.BOOLEAN,
        description: "Only notify for servers (ignore DMs / group DMs)",
        default: true
    },
    ignoreMutedChannels: {
        type: OptionType.BOOLEAN,
        description: "Don't notify from muted servers or channels (also applies to catch-up)",
        default: true
    },
    ignoreFocusedChannel: {
        type: OptionType.BOOLEAN,
        description: "Don't notify if you're already looking at that channel",
        default: false
    },
    ignoreBots: {
        type: OptionType.BOOLEAN,
        description: "Ignore messages from bots",
        default: false
    },
    catchUpOnStartup: {
        type: OptionType.BOOLEAN,
        description: "Catch up on startup: after Discord connects, check a few unread channels for keywords you missed while offline. Makes read-only requests to Discord's API (see the API disclaimer above). OFF by default",
        default: false
    },
    catchUpLookbackHours: {
        type: OptionType.NUMBER,
        description: `Catch-up: how far back to look, in hours (1 to ${CATCHUP_MAX_LOOKBACK_HOURS})`,
        default: 12
    },
    catchUpMaxChannels: {
        type: OptionType.NUMBER,
        description: `Catch-up: maximum number of unread channels to check (1 to ${CATCHUP_MAX_CHANNELS}). One request is made per channel`,
        default: 15
    },
    catchUpMessagesPerChannel: {
        type: OptionType.NUMBER,
        description: `Catch-up: messages to check per channel (1 to ${CATCHUP_MAX_MESSAGES})`,
        default: 50
    },
    catchUpDelaySeconds: {
        type: OptionType.NUMBER,
        description: `Catch-up: seconds to wait between requests (minimum ${CATCHUP_MIN_DELAY_SECONDS})`,
        default: 2
    }
});

const FOOTER = `-# Built by the ${BRAND} Development Team • [Join RokNut Academy](${INVITE_URL})`;

function escapeRegex(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildRegex(): RegExp | null {
    const words = settings.store.keywords
        .split(",")
        .map(w => w.trim())
        .filter(Boolean)
        .map(escapeRegex);

    if (!words.length) return null;

    const body = words.join("|");
    return new RegExp(settings.store.wholeWord ? `(?<![\\w])(?:${body})(?![\\w])` : `(?:${body})`, "i");
}

function isMuted(guildId: string | undefined, channelId: string) {
    try {
        if (!guildId) return false;
        return (
            UserGuildSettingsStore.isGuildOrCategoryOrChannelMuted?.(guildId, channelId) ??
            UserGuildSettingsStore.isChannelMuted(guildId, channelId)
        );
    } catch {
        return false;
    }
}

const notified = new Set<string>();

function markNotified(id: string) {
    notified.add(id);
    if (notified.size > 500) {
        const oldest = notified.values().next().value;
        if (oldest !== undefined) notified.delete(oldest);
    }
}

function matches(message: any, channel: any, live: boolean): boolean {
    if (!message?.content) return false;

    const me = UserStore.getCurrentUser();
    if (!me) return false;
    if (message.author?.id === me.id && (!live || !settings.store.includeOwnMessages)) return false;
    if (settings.store.ignoreBots && message.author?.bot) return false;
    if (message.author?.id && RelationshipStore.isBlocked(message.author.id)) return false;

    const guildId: string | undefined = channel.guild_id;
    if (settings.store.serversOnly && !guildId) return false;
    if (settings.store.ignoreMutedChannels && isMuted(guildId, channel.id)) return false;

    if (
        live &&
        settings.store.ignoreFocusedChannel &&
        document.hasFocus() &&
        SelectedChannelStore.getChannelId() === channel.id
    ) return false;

    const regex = buildRegex();
    return !!regex && regex.test(message.content);
}

function authorName(message: any): string {
    const user = UserStore.getUser(message.author?.id);
    return message.member?.nick ?? user?.globalName ?? message.author?.global_name ?? message.author?.username ?? "Someone";
}

function whereOf(channel: any): string {
    const guild = channel.guild_id ? GuildStore.getGuild(channel.guild_id) : null;
    return guild ? `${guild.name} • #${channel.name}` : "Direct Message";
}

function messageLink(message: any, channel: any): string {
    return `https://discord.com/channels/${channel.guild_id ?? "@me"}/${channel.id}/${message.id}`;
}

function jumpTo(message: any, channel: any) {
    NavigationRouter.transitionTo(`/channels/${channel.guild_id ?? "@me"}/${channel.id}/${message.id}`);
}

function postDm(content: string, excludeChannelId?: string) {
    if (!settings.store.sendFakeDm) return;
    let dmId = settings.store.dmChannelId.trim();
    if (!dmId) {
        dmId = (ChannelStore as any).getSortedPrivateChannels?.()?.[0]?.id ?? "";
    }
    if (!dmId || dmId === excludeChannelId) return;
    sendBotMessage(dmId, { content });
}

function notifyLive(message: any, channel: any) {
    const name = authorName(message);
    const where = whereOf(channel);
    const author = UserStore.getUser(message.author?.id);

    showNotification({
        title: `🥜 RokNut Alert — ${name} mentioned a keyword`,
        body: `${where}\n${message.content.slice(0, 200)}`,
        icon: author?.getAvatarURL?.(channel.guild_id, 128, false),
        onClick() {
            jumpTo(message, channel);
        }
    });

    const quoted = message.content.slice(0, 300).split("\n").map((l: string) => `> ${l}`).join("\n");
    postDm(
        `🥜 **RokNut Alert** — **${name}** said a keyword in **${where}**\n${quoted}\n[Jump to message](${messageLink(message, channel)})\n${FOOTER}`,
        channel.id
    );
}

/* ---------------------------- catch-up on startup ---------------------------- */

let catchUpTimer: ReturnType<typeof setTimeout> | undefined;
let catchUpRunning = false;
let lastCatchUp = 0;
let runToken = 0;

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.floor(n))) : fallback;
}

function snowflakeFromTime(ms: number): string {
    return ((BigInt(ms) - 1420070400000n) << 22n).toString();
}

function snowflakeGreater(a: string, b: string): boolean {
    try {
        return BigInt(a) > BigInt(b);
    } catch {
        return false;
    }
}

function getCatchUpChannels(max: number): any[] {
    const found: any[] = [];
    const guilds = Object.values((GuildStore as any).getGuilds?.() ?? {}) as any[];

    for (const guild of guilds) {
        const selectable = (GuildChannelStore as any).getChannels?.(guild.id)?.SELECTABLE ?? [];
        for (const entry of selectable) {
            const channel = entry?.channel;
            if (!channel || (channel.type !== 0 && channel.type !== 5)) continue;
            if (settings.store.ignoreMutedChannels && isMuted(guild.id, channel.id)) continue;
            if (!ReadStateStore.hasUnread?.(channel.id)) continue;
            found.push(channel);
        }
    }

    found.sort((a, b) => {
        const la = a.lastMessageId ?? "0";
        const lb = b.lastMessageId ?? "0";
        return snowflakeGreater(lb, la) ? 1 : snowflakeGreater(la, lb) ? -1 : 0;
    });

    return found.slice(0, max);
}

function stillAllowed(token: number) {
    return token === runToken && settings.store.enabled && settings.store.catchUpOnStartup;
}

async function runCatchUp() {
    if (catchUpRunning || !stillAllowed(runToken)) return;
    if (!buildRegex()) return;

    catchUpRunning = true;
    lastCatchUp = Date.now();
    const token = runToken;

    try {
        const maxChannels = clampNumber(settings.store.catchUpMaxChannels, 1, CATCHUP_MAX_CHANNELS, 15);
        const perChannel = clampNumber(settings.store.catchUpMessagesPerChannel, 1, CATCHUP_MAX_MESSAGES, 50);
        const hours = clampNumber(settings.store.catchUpLookbackHours, 1, CATCHUP_MAX_LOOKBACK_HOURS, 12);
        const delayMs = clampNumber(settings.store.catchUpDelaySeconds, CATCHUP_MIN_DELAY_SECONDS, 60, 2) * 1000;
        const floor = snowflakeFromTime(Date.now() - hours * 3600 * 1000);

        const channels = getCatchUpChannels(maxChannels);
        const hits: { message: any; channel: any; }[] = [];

        for (let i = 0; i < channels.length; i++) {
            if (!stillAllowed(token)) break;
            if (i > 0) await sleep(delayMs);
            if (!stillAllowed(token)) break;

            const channel = channels[i];
            const ack: string | null = ReadStateStore.ackMessageId?.(channel.id) ?? null;
            const after = ack && snowflakeGreater(ack, floor) ? ack : floor;

            try {
                const res = await RestAPI.get({
                    url: `/channels/${channel.id}/messages`,
                    query: { after, limit: perChannel }
                });
                const messages: any[] = Array.isArray(res?.body) ? res.body : [];
                for (const message of messages) {
                    if (notified.has(message.id)) continue;
                    if (matches(message, channel, false)) hits.push({ message, channel });
                }
            } catch (e: any) {
                if (e?.status === 429) {
                    console.warn("[KeywordNotify] Rate limited by Discord, stopping catch-up");
                    break;
                }
                // 403/404 and other per-channel errors: skip this channel
            }
        }

        if (!hits.length || !stillAllowed(token)) return;

        hits.forEach(h => markNotified(h.message.id));

        const preview = hits.slice(0, 5).map(h =>
            `${whereOf(h.channel)} — ${authorName(h.message)}: ${h.message.content.slice(0, 60)}`
        ).join("\n");

        showNotification({
            title: `🥜 RokNut Alert — ${hits.length} keyword hit${hits.length === 1 ? "" : "s"} while you were away`,
            body: preview,
            onClick() {
                jumpTo(hits[0].message, hits[0].channel);
            }
        });

        const lines = hits.slice(0, 10).map(h => {
            const snippet = h.message.content.replace(/\s+/g, " ").slice(0, 80);
            return `• **${authorName(h.message)}** in **${whereOf(h.channel)}**: ${snippet} — [Jump](${messageLink(h.message, h.channel)})`;
        });
        const more = hits.length > 10 ? `\n…and ${hits.length - 10} more` : "";

        postDm(`🥜 **RokNut Alert** — ${hits.length} keyword hit${hits.length === 1 ? "" : "s"} while you were away\n${lines.join("\n")}${more}\n${FOOTER}`);
    } catch (e) {
        console.error("[KeywordNotify] catch-up failed", e);
    } finally {
        catchUpRunning = false;
    }
}

function scheduleCatchUp() {
    if (!settings.store.enabled || !settings.store.catchUpOnStartup) return;
    if (Date.now() - lastCatchUp < CATCHUP_COOLDOWN_MS) return;
    if (catchUpTimer) clearTimeout(catchUpTimer);
    catchUpTimer = setTimeout(runCatchUp, CATCHUP_STARTUP_DELAY_MS);
}

export default definePlugin({
    name: "KeywordNotify",
    description: "🥜 RokNut Industries — shows a desktop notification (plus a jump-link DM) when someone says one of your keywords in any server you're in",
    authors: [{ name: "RokNut Industries Development Team", id: 1513101694236495919n }],
    settings,
    reloadRequired: true,

    start() {
        if (UserStore.getCurrentUser()) scheduleCatchUp();
    },

    stop() {
        runToken++;
        if (catchUpTimer) clearTimeout(catchUpTimer);
    },

    flux: {
        CONNECTION_OPEN() {
            scheduleCatchUp();
        },

        MESSAGE_CREATE({ message, optimistic }: any) {
            try {
                if (!settings.store.enabled) return;
                if (optimistic || !message?.content) return;

                const channel = ChannelStore.getChannel(message.channel_id);
                if (!channel) return;
                if (!matches(message, channel, true)) return;

                markNotified(message.id);
                notifyLive(message, channel);
            } catch (e) {
                console.error("[KeywordNotify]", e);
            }
        }
    }
});
