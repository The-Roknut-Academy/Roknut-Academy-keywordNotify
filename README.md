# 🥜 KeywordNotify

A Vencord userplugin by the **RokNut Industries Development Team**.

Get a desktop notification the moment someone says one of your keywords in any server you're in. Click it to jump straight to the message. KeywordNotify can also drop a local "RokNut Alert" in a DM of your choice with a jump link.

[![Discord](https://img.shields.io/badge/Discord-RokNut%20Academy-5865F2?logo=discord&logoColor=white)](https://discord.gg/TNB7rG7EGv)
[![License](https://img.shields.io/badge/license-GPL--3.0--or--later-blue)](LICENSE.md)

## Highlights

- Desktop notifications with author, server, channel and message text
- Click to jump to the exact message
- Your own keyword list, saved automatically
- Instant on/off toggle
- Filters for muted channels, bots, DMs and the channel you're viewing
- Optional, capped catch-up for keywords missed while offline (off by default)

## Quick start

1. Clone this repo into your Vencord source at `src/userplugins/keywordNotify/`:
   ```
   git clone https://github.com/The-Roknut-Academy/Roknut-Academy-keywordNotify.git keywordNotify
   ```
2. Run `pnpm build` and `pnpm inject`
3. Restart Discord and enable **KeywordNotify** in Settings → Vencord → Plugins
4. Open the plugin's settings and add your keywords

Requires Vencord installed from source. See the [custom plugin install guide](https://docs.vencord.dev/installing/custom-plugins/).

## Catch up on startup (optional)

Normally KeywordNotify only sees messages Discord delivers live, so anything said while you were offline is missed. The optional **Catch up on startup** setting checks a limited number of unread channels after Discord connects and sends one summary alert for any hits.

It is **off by default** and heavily limited: at most 30 channels (default 15), 50 messages per channel, a 48-hour lookback, at least 1.5 seconds between requests, a 15-minute cooldown, unread and non-muted channels only, and an immediate stop if Discord rate limits you. See [DOCS.md](DOCS.md) for every safeguard.

> **API disclaimer:** Normal operation makes no network requests. The optional catch-up feature makes **read-only requests to Discord's own API** from your own client, using your own session. No third-party services are used, and nothing is sent anywhere except to Discord. Client mods and automated requests are not endorsed by Discord and may conflict with its Terms of Service, so you use this feature at your own risk. Keep the limits low.

## How the DM alerts work

When a keyword is spotted, KeywordNotify can also drop a "RokNut Alert" message into a DM so you have a clickable record of it. It shows who said it, where, a quote of the message, and a **Jump to message** link.

This message is **local only**. Vencord creates it on your own client, nothing is sent to Discord's servers, and it is not a real message:

- Nobody else can see it. The person whose DM it appears in is never notified and never sees it.
- It looks like a bot-style message, not a real Discord system message.
- It disappears when you reload or restart Discord.
- It may not show an unread badge or play a sound, so the desktop notification is still your main alert.

By default (when **DM channel ID** is blank) the alert always appears in the DM at the **top of your DM list**, which is the conversation with the most recent activity. That is usually the person you last messaged or who last messaged you, so it can look like a message in that person's chat. Each new alert goes to whichever DM is on top at that moment, so it can move to a different chat when your DM list reorders. If the plugin can't find a DM to use, it skips the DM alert and still sends the desktop notification. To keep alerts in one place, DM yourself or a spare account, copy that DM's channel ID (turn on Developer Mode in Settings → Advanced, then right-click the DM → Copy Channel ID) and paste it into the **DM channel ID** setting. You can switch the feature off with **Send fake DM**.

## Documentation

Full install steps, settings, troubleshooting and more are in **[DOCS.md](DOCS.md)**.

## Community

Questions, ideas or bugs? Join the [RokNut Academy Discord](https://discord.gg/TNB7rG7EGv).

## License

GPL-3.0-or-later, as required for Vencord plugins. See [LICENSE.md](LICENSE.md).

Built by the RokNut Industries Development Team, a RokNut Academy company.
