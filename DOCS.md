<div align="center">

# 🥜 KeywordNotify Documentation

**The complete guide to KeywordNotify**

Built by the **RokNut Industries Development Team** · a RokNut Academy company

[![Discord](https://img.shields.io/badge/Discord-RokNut%20Academy-5865F2?logo=discord&logoColor=white)](https://discord.gg/TNB7rG7EGv)
[![License](https://img.shields.io/badge/license-GPL--3.0--or--later-blue)](LICENSE.md)

</div>

---

## Table of contents

1. [Overview](#1-overview)
2. [How it works](#2-how-it-works)
3. [Requirements](#3-requirements)
4. [Installation](#4-installation)
5. [First-time setup](#5-first-time-setup)
6. [Adding and managing keywords](#6-adding-and-managing-keywords)
7. [How matching works](#7-how-matching-works)
8. [Settings reference](#8-settings-reference)
9. [Desktop notifications in detail](#9-desktop-notifications-in-detail)
10. [The jump-link DM message in detail](#10-the-jump-link-dm-message-in-detail)
    - [Catch-up on startup (optional)](#10a-catch-up-on-startup-optional)
    - [API disclaimer](#api-disclaimer)
11. [Turning the plugin on and off](#11-turning-the-plugin-on-and-off)
12. [Recipes: common setups](#12-recipes-common-setups)
13. [Testing your setup](#13-testing-your-setup)
14. [Privacy and security](#14-privacy-and-security)
15. [Limitations](#15-limitations)
16. [Troubleshooting](#16-troubleshooting)
17. [FAQ](#17-faq)
18. [Updating](#18-updating)
19. [Uninstalling](#19-uninstalling)
20. [For developers](#20-for-developers)
21. [Glossary](#21-glossary)
22. [Changelog](#22-changelog)
23. [Support and community](#23-support-and-community)

---

## 1. Overview

KeywordNotify is a **Vencord userplugin**. It watches the messages Discord delivers to your client and, whenever a message in a server you're in contains one of your keywords, it alerts you in up to three ways:

| Alert | What it is | Can be turned off? |
| --- | --- | --- |
| **Desktop notification** | A notification with the author, server, channel and message text. Click it to jump to the message. | Use the on/off toggle to disable everything |
| **Jump-link DM message** | A local-only "RokNut Alert" message in a DM, with a **Jump to message** link. | Yes, with **Send fake DM** |
| **Settings panel branding** | A RokNut banner with help text, an invite button and a Docs button. | No (it's part of the settings page) |

Typical uses:

- Get alerted when someone says your name, nickname or handle.
- Watch for a topic, project name, event or product across many servers.
- Catch "help" or "support" style words in servers you moderate.
- Track mentions of a game, a clan or a community name.

KeywordNotify is **read-only**. It never sends messages as you, never edits or deletes anything, and never contacts any third-party service. Its only network activity is the optional, off-by-default [catch-up feature](#10a-catch-up-on-startup-optional), which makes read-only requests to Discord's own API. See the [API disclaimer](#api-disclaimer).

---

## 2. How it works

### 2.1 The big picture

```
Discord delivers a new message to your client
                    │
                    ▼
   Vencord fires a MESSAGE_CREATE event
                    │
                    ▼
   KeywordNotify runs its checks (see 2.2)
                    │
          ┌─────────┴─────────┐
      any check fails     all checks pass
          │                   │
       do nothing             ▼
                      ┌───────────────────┐
                      │ Desktop           │
                      │ notification      │
                      └───────────────────┘
                              │
                              ▼
                      ┌───────────────────┐
                      │ Jump-link DM      │  (only if Send fake DM is on)
                      │ message           │
                      └───────────────────┘
```

### 2.2 The order of checks

Every incoming message goes through these checks in order. The first one that fails stops processing, and no alert is made.

1. **Notifications on/off** is on.
2. The message is a real incoming message (not a temporary "optimistic" copy Discord shows while sending) and has **text content**.
3. Your own account is loaded.
4. If the author is **you**, **Also notify on your own messages** must be on.
5. If the author is a **bot**, **Ignore bots** must be off.
6. The author is **not blocked** by you.
7. The channel is known to your client.
8. If **Servers only** is on, the message must be in a server (not a DM or group DM).
9. If **Ignore muted channels** is on, the server, category and channel must not be muted.
10. If **Ignore the channel you're viewing** is on, you must not be looking at that channel in a focused Discord window.
11. The message text must **match one of your keywords** (see [How matching works](#7-how-matching-works)).

If all eleven pass, the alerts are made.

### 2.3 Where the data comes from

KeywordNotify listens to events that **your Discord client already receives**. In its normal mode it makes no requests to Discord's servers or anyone else's. The only exception is the optional [catch-up feature](#10a-catch-up-on-startup-optional), which is off by default. If your client never received a message and catch-up is off, KeywordNotify can't see it (see [Limitations](#15-limitations)).

---

## 3. Requirements

| Requirement | Details |
| --- | --- |
| **Vencord from source** | The stock Vencord installer does **not** support userplugins. You must install Vencord from its source code. See the [official custom plugin guide](https://docs.vencord.dev/installing/custom-plugins/). |
| **Node.js** | A current LTS version. |
| **pnpm** | Used to build and inject. A version warning (for example "project is configured to use X, you have Y") is harmless. |
| **Git** | Recommended, for cloning and updating. |
| **OS notification permission** | Discord must be allowed to show desktop notifications in Windows, macOS or Linux settings. |
| **Do Not Disturb / Focus off** | Your OS may hide notifications while Do Not Disturb or Focus mode is on. |

---

## 4. Installation

### 4.0 Don't have a `userplugins` folder? Start here

If you can't find `src/userplugins`, you most likely installed Vencord with the **regular installer** (the `.exe` or app from the Vencord website). That version has no source code and **cannot load userplugins**. You need Vencord's **source code** instead. It takes a few minutes.

> A fresh Vencord source download does not include a `userplugins` folder. That is normal. You create it yourself in step 7.

**What you need first:** [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org/) (LTS version) and pnpm. After installing Node, install pnpm by opening a terminal and running:

```bash
npm install -g pnpm
```

**Step by step:**

1. **Close Discord completely**, including the tray icon.
2. *(Recommended)* If you installed Vencord with the regular installer, open it and **uninstall** Vencord from your Discord first, so the two installs don't conflict.
3. Open a terminal (PowerShell on Windows) and go to a folder where you keep projects. Avoid OneDrive folders. A path like `C:\` is best.
4. Download Vencord's source code:
   ```bash
   git clone https://github.com/Vendicated/Vencord.git
   cd Vencord
   ```
5. Install its dependencies:
   ```bash
   pnpm install --frozen-lockfile
   ```
6. Check that the folder `src` exists inside `Vencord`.
7. **Create the `userplugins` folder** inside `src`:
   - Windows PowerShell: `mkdir src\userplugins`
   - macOS / Linux: `mkdir -p src/userplugins`
8. Put KeywordNotify in it:
   ```bash
   cd src/userplugins
   git clone https://github.com/The-Roknut-Academy/Roknut-Academy-keywordNotify.git keywordNotify
   cd ../..
   ```
   The result must be `src/userplugins/keywordNotify/index.ts`.
9. Build and inject, from the Vencord root folder:
   ```bash
   pnpm build
   pnpm inject
   ```
   Pick your Discord install when asked.
10. Start Discord and enable **KeywordNotify** in Settings → Vencord → Plugins, then restart when prompted. Follow [First-time setup](#5-first-time-setup) next.

**Good to know:**
- This is now your Vencord install. Keep the `Vencord` folder. You'll rebuild from it whenever you update.
- For Vencord's own up-to-date instructions, see the [official custom plugin guide](https://docs.vencord.dev/installing/custom-plugins/).
- Already have the Vencord source but just no `userplugins` folder? Skip to step 7.

### 4.1 Folder layout

The plugin **must be inside its own folder** in `userplugins`:

```
Vencord/
└── src/
    └── userplugins/
        └── keywordNotify/        ← the repo folder
            ├── index.ts          ← the plugin (must be in the folder root)
            ├── README.md
            ├── DOCS.md
            ├── LICENSE.md
            ├── CONTRIBUTING.md
            └── .gitignore
```

> ⚠️ **Do not** drop `index.ts` loose in `src/userplugins/`. The Vencord build will fail with an error like `glob-plugins ... Cannot read properties of undefined (reading 'replace')`.

### 4.2 Option A: clone with Git (recommended)

```bash
cd path/to/Vencord/src/userplugins
git clone https://github.com/The-Roknut-Academy/Roknut-Academy-keywordNotify.git keywordNotify
```

### 4.3 Option B: download manually

1. Download the repo as a ZIP from GitHub (Code → Download ZIP).
2. Extract it.
3. Make sure the result is the `keywordNotify` folder shown above, with `index.ts` directly inside it.

### 4.4 Build and inject

From the **root of your Vencord folder**:

```bash
pnpm build
pnpm inject
```

- Close Discord completely first. Quit it from the system tray too, not just the window.
- `pnpm inject` asks which Discord install to patch. Pick the one you use.
- You must run `pnpm build` again any time `index.ts` changes.

### 4.5 Enable the plugin

1. Start Discord.
2. Open **Settings → Vencord → Plugins**.
3. Search for **KeywordNotify** and turn it on.
4. Discord will ask you to **restart**. Do it. This is required each time you switch the plugin on or off in this list.

### 4.6 Tip for Windows and OneDrive

If your Vencord folder lives inside OneDrive (for example `Documents`), sync can lock files mid-build and cause odd errors. Moving the folder to something like `C:\Vencord` avoids this.

---

## 5. First-time setup

After enabling the plugin:

1. Open **Settings → Vencord → Plugins → KeywordNotify** and click the **gear icon**.
2. At the top you'll see the **RokNut banner**, a short "How to add words" explanation, and two buttons.
3. Scroll to the **Keywords** box and add your words (see the next section).
4. Review the other settings. The defaults are sensible, and each is explained in [Settings reference](#8-settings-reference).
5. Run a quick test (see [Testing your setup](#13-testing-your-setup)).

> The plugin ships with **no keywords**. Until you add some, nothing will trigger.

---

## 6. Adding and managing keywords

### 6.1 Adding keywords

Type your words or phrases into the **Keywords** box, separated by commas:

```
mynick, my name, helpme
```

That creates three keywords: `mynick`, `my name` and `helpme`.

### 6.2 Saving

There is no Save button. Vencord saves plugin settings automatically as you type, and the plugin reads your latest keywords with every message, so **changes apply instantly without a restart**. Your keywords are kept when you restart Discord, rebuild, or update the plugin.

### 6.3 Rules for the keyword box

| Rule | Example |
| --- | --- |
| Separate keywords with **commas** | `one, two, three` |
| Spaces around commas are **ignored** | `one ,  two` works the same as `one,two` |
| **Phrases** with spaces are allowed | `good morning` |
| Capital letters **don't matter** | `RoRo` matches `roro`, `RORO` and `Roro` |
| **Empty entries** are ignored | `one,,two,` is just `one` and `two` |
| An **empty box** means nothing triggers | The plugin stays quiet |
| **Special characters** are matched literally | `c++` or `what?` match exactly that text |
| **New lines** are not separators | Use commas, not Enter |

### 6.4 Editing and removing keywords

Just edit the box. To remove a keyword, delete it and its comma. To remove all of them, clear the box.

### 6.5 How many keywords can I add?

There's no hard limit in the plugin. Hundreds of short keywords work fine. Very long lists make the box harder to manage, so keep it tidy.

### 6.6 Good keyword choices

- **Be specific.** Very common words (`the`, `help`) will fire constantly.
- **Use phrases** to cut noise (`need a mod` instead of `mod`).
- **Add variations** you care about (`roknut, rok nut`).
- **Start with whole-word matching on.** Turn it off only if you need partial matches.

---

## 7. How matching works

### 7.1 What gets checked

Matching runs on the **text content** of the message exactly as Discord stores it (the raw text, including markdown symbols). Only the message text is checked. See [Limitations](#15-limitations) for what that excludes.

### 7.2 Case

Matching is **case-insensitive**.

### 7.3 Whole-word matching (default: on)

With **Match whole words only** on, a keyword only counts when it isn't glued to other letters, numbers or underscores.

| Keyword | Message | Whole-word **on** | Whole-word **off** |
| --- | --- | --- | --- |
| `ron` | `ron is here` | ✅ match | ✅ match |
| `ron` | `baron` | ❌ no match | ✅ match |
| `ron` | `ron's turn` | ✅ match | ✅ match |
| `ron` | `iron` | ❌ no match | ✅ match |
| `ron` | `ron_ronin` | ❌ no match | ✅ match |
| `my name` | `what is my name?` | ✅ match | ✅ match |
| `help` | `helpful` | ❌ no match | ✅ match |
| `help` | `help!` | ✅ match | ✅ match |

Punctuation, spaces and the start or end of the message count as word boundaries.

### 7.4 A note on non-English letters

Whole-word matching treats only basic letters (A-Z), digits and the underscore as "word characters". Accented or non-Latin letters next to a keyword are treated like punctuation. For example, with whole-word on, the keyword `cafe` would still match inside `cafeé` because `é` isn't counted as a word character. If you rely on accented or non-Latin keywords, test them, and consider turning whole-word off for those cases.

### 7.5 Where matches can occur

A keyword matches anywhere in the raw text, including:

- Inside **code blocks** and **inline code**
- Inside **links** (the URL text)
- Inside **quoted** and **reply** text that's part of the message content
- Inside **spoiler** text (`||like this||`). The notification would then show the raw spoiler text, see [Privacy and security](#14-privacy-and-security).

Mentions are stored as IDs (like `<@1234567890>`), so a person's display name inside an `@mention` is **not** matched. Only the ID text is in the raw message.

---

## 8. Settings reference

Open them at **Settings → Vencord → Plugins → KeywordNotify → gear icon**.

### 8.1 Summary table

| Setting | Default | Needs restart? |
| --- | --- | --- |
| Notifications on/off | On | No |
| Keywords | *(empty)* | No |
| Match whole words only | On | No |
| Also notify on your own messages | On | No |
| Send fake DM | On | No |
| DM channel ID | *(blank)* | No |
| Servers only | On | No |
| Ignore muted channels | On | No |
| Ignore the channel you're viewing | Off | No |
| Ignore bots | Off | No |
| Catch up on startup | **Off** | No |
| Catch-up: lookback hours | 12 | No |
| Catch-up: max channels | 15 | No |
| Catch-up: messages per channel | 50 | No |
| Catch-up: seconds between requests | 2 | No |

### 8.2 Each setting in detail

#### Notifications on/off
- **What it does:** The master switch. When off, the plugin ignores every message.
- **Use it when:** You need a quiet period without disabling the plugin (which would require a restart).
- **Notes:** Takes effect instantly. It is separate from the plugin's enable switch in the Plugins list.

#### Keywords
- **What it does:** The list of words or phrases to alert on.
- **Format:** Comma-separated. See [Adding and managing keywords](#6-adding-and-managing-keywords).
- **Notes:** Empty by default. Saved automatically.

#### Match whole words only
- **What it does:** Requires a keyword to stand alone as a word.
- **Turn it off when:** You want partial matches, like catching `roknut` inside `roknutacademy`.
- **Turn it on when:** You want fewer false alarms (the default).

#### Also notify on your own messages
- **What it does:** Lets your own messages trigger alerts.
- **Why it's on by default:** So you can test the plugin yourself.
- **Turn it off when:** You're done testing and don't want to be alerted about your own words.

#### Send fake DM
- **What it does:** Adds the local jump-link message to a DM for each alert.
- **Turn it off when:** You only want desktop notifications.
- **Details:** See [The jump-link DM message in detail](#10-the-jump-link-dm-message-in-detail).

#### DM channel ID
- **What it does:** Chooses which DM receives the jump-link message.
- **Blank:** Uses the DM at the **top of your DM list** (the most recently active conversation), which can change over time.
- **Set to an ID:** Always uses that exact channel.
- **How to get an ID:** Settings → Advanced → turn on **Developer Mode**, then right-click the DM → **Copy Channel ID**.
- **Best practice:** DM yourself or a spare account and use that channel so alerts always land in one place.

#### Servers only
- **What it does:** Limits alerts to messages in servers.
- **Turn it off when:** You also want keywords in DMs and group DMs.
- **Note:** If a keyword appears in the same DM the jump-link would go to, the jump-link message is skipped for that alert (the desktop notification still fires).

#### Ignore muted channels
- **What it does:** Skips messages in servers, categories or channels you've muted.
- **Turn it off when:** You want alerts even from places you've muted. This is a good way to keep an eye on noisy servers for just your keywords.

#### Ignore the channel you're viewing
- **What it does:** Skips alerts for the channel that's currently open, but only while the Discord window is focused.
- **Why it's off by default:** So testing in the open channel works.
- **Turn it on when:** You don't want to be alerted about things you're already reading.

#### Ignore bots
- **What it does:** Skips messages sent by bot accounts.
- **Turn it on when:** Bots in your servers repeat your keywords (for example, logs or announcement bots).

#### Catch up on startup
- **What it does:** After Discord connects, checks a limited number of unread channels for keywords you missed while offline.
- **Default:** **Off.** It's the only feature that makes network requests.
- **Details and risks:** See [Catch-up on startup](#10a-catch-up-on-startup-optional) and the [API disclaimer](#api-disclaimer).

#### Catch-up: lookback hours
- **What it does:** How far back catch-up looks, in hours. Hard limit: 48. Default: 12.
- **Note:** Catch-up never looks further back than your last read position in a channel, whichever is more recent.

#### Catch-up: max channels
- **What it does:** The most unread channels catch-up will check per run. One request is made per channel. Hard limit: 30. Default: 15.

#### Catch-up: messages per channel
- **What it does:** How many messages are checked in each channel. Hard limit: 50. Default: 50.

#### Catch-up: seconds between requests
- **What it does:** The pause between requests. Minimum: 1.5 seconds. Default: 2.
- **Tip:** Higher is safer. Lower values are not allowed below the minimum.

Values outside the allowed ranges are automatically clamped to the nearest limit.

### 8.3 Settings you may see in the panel header

At the top of the settings page, KeywordNotify shows a **branding panel** containing:

- The plugin name and RokNut Industries Development Team credit
- A **How to add words** explanation
- A short **API disclaimer** about the optional catch-up feature
- **Join the RokNut Academy Discord** button, which opens the invite link in your browser
- **Docs** button, which opens this documentation page in your browser

---

## 9. Desktop notifications in detail

### 9.1 What's in a notification

| Part | Content |
| --- | --- |
| **Title** | `🥜 RokNut Alert — <name> mentioned a keyword` |
| **Body line 1** | Where it happened: `<server> • #<channel>`, or `Direct Message` |
| **Body line 2+** | The message text, **cut off after 200 characters** |
| **Icon** | The author's avatar |

The `<name>` shown is the author's **server nickname** if they have one, otherwise their **display name**, otherwise their **username**.

### 9.2 Clicking a notification

Clicking jumps to the exact message in Discord. It opens the right server and channel and scrolls to the message.

### 9.3 Notification style and delivery

How the notification appears (a native OS notification, or a Vencord in-app popup) is controlled by **Vencord's own notification settings**, not by KeywordNotify. Look under **Settings → Vencord → Notifications** (the options and wording can vary by Vencord version). Common options include:

- Whether to use native desktop notifications
- Whether native notifications are used only when Discord isn't focused
- Where in-app popups appear and how long they stay

If you get no popups at all, check those settings and your operating system's notification settings.

### 9.4 One notification per message

Each matching message produces **one** alert, no matter how many of your keywords it contains.

---

## 10. The jump-link DM message in detail

### 10.1 What you see

For each alert, a message appears in your chosen DM that looks like this:

```
🥜 RokNut Alert — Alex said a keyword in My Server • #general
> the text of the message goes here,
> shown as a quote (up to 300 characters)
Jump to message   ← clickable link
Built by the RokNut Industries Development Team • Join RokNut Academy
```

Clicking **Jump to message** takes you to the original message. The footer links to the RokNut Academy Discord.

### 10.2 It is local only

This message is created by Vencord **on your own client**. It is **not** sent through Discord.

- ✅ Nobody else can see it.
- ✅ The person whose DM it appears in **never** sees it and **never** gets a notification.
- ✅ It doesn't count as you sending anything.
- ⚠️ It looks like a bot-style message, not a real Discord system message.
- ⚠️ It **disappears** when you reload or restart Discord.
- ⚠️ It may not show an unread badge or play a sound. Treat the desktop notification as the main alert.

### 10.3 Which DM it goes to

| **DM channel ID** setting | Behavior |
| --- | --- |
| Blank | Uses the DM at the **top of your DM list** at that moment (the one with the most recent activity). This can change as your DM list reorders. |
| A valid channel ID | Always uses that channel. |

If no DM can be found, or the chosen DM is the same channel the keyword was said in, the jump-link message is **skipped** for that alert. The desktop notification still fires.

### 10.4 Recommended setup

1. Enable **Developer Mode** (Settings → Advanced).
2. Open a DM with yourself or a spare account.
3. Right-click the DM → **Copy Channel ID**.
4. Paste it into **DM channel ID**.

Now every alert lands in that one chat, and it never looks like it's in a friend's conversation.

### 10.5 Why the quote is formatted that way

Every line of the quoted message is prefixed with `> ` so long or multi-line messages stay inside a quote block and don't mix with the rest of the alert text.

---

## 10a. Catch-up on startup (optional)

### What it does

Normally KeywordNotify only sees messages Discord pushes to your client live, so anything said while Discord was closed or offline is missed. **Catch up on startup** can look for those missed messages. About 20 seconds after Discord connects, it:

1. Finds channels with **unread** messages that match your settings (servers you're in, not muted if **Ignore muted channels** is on, and channels you can view).
2. Picks the most recently active ones, up to your **max channels** setting.
3. For each, makes one **read-only** request for recent messages since your last read position (and no older than your **lookback** window).
4. Runs your keywords over those messages using the same matching rules as live messages.
5. If anything matched, shows **one summary notification** ("N keyword hits while you were away") and, if **Send fake DM** is on, one local jump-link message listing up to 10 hits with links.

### Safeguards

Catch-up is built to be conservative. All of these are enforced in code, and the limits cannot be raised by settings:

| Safeguard | Value |
| --- | --- |
| Off by default | Yes, you must turn it on |
| Hard cap on channels per run | 30 (default 15) |
| Hard cap on messages per channel | 50 (default 50) |
| Hard cap on lookback | 48 hours (default 12) |
| Minimum delay between requests | 1.5 seconds (default 2) |
| Cooldown between runs | 15 minutes, so reconnects can't trigger repeated scans |
| Startup delay | About 20 seconds after connecting, so it doesn't compete with Discord loading |
| Only unread channels | Read channels are never requested |
| Skips muted channels | When **Ignore muted channels** is on |
| Only channels you can already view | Hidden or no-access channels are skipped |
| Stops on rate limiting | If Discord says "slow down" (HTTP 429), catch-up stops immediately for that run |
| Stops when you turn it off | Switching the plugin or the setting off cancels a run in progress |
| No duplicates | Messages already alerted on live are not alerted again |
| Your own messages are skipped | Catch-up never alerts on messages you sent |
| One summary, not a flood | A single notification and a single DM message per run |
| Needs keywords | If your keyword box is empty, catch-up does nothing and makes no requests |

### What requests it makes

For each checked channel, a single `GET` to Discord's `/channels/{id}/messages` endpoint with an `after` position and a `limit`. These are the same kind of read requests your Discord client makes when you open a channel. They are sent from your own client using your own session. Nothing is sent to anyone but Discord.

### Limitations of catch-up

- Only **unread** channels are checked, within your caps. In a very busy period, messages beyond the cap are not seen.
- Within a channel, the most recent messages may be skipped if more than the per-channel cap arrived after your last read position, because Discord returns the oldest messages after that point first.
- Edited, deleted or attachment-only messages aren't checked.
- It depends on Discord's internal read-state data. If Vencord or Discord changes how that works, catch-up may stop finding channels until the plugin is updated.
- Alerts are summaries, not one notification per message.

### Recommended settings

Leave the defaults. If you're in a very large number of servers, lower **max channels** rather than raising it, and consider raising the delay.

### API disclaimer

<a id="api-disclaimer"></a>

> **API disclaimer.** KeywordNotify's normal operation uses only events your Discord client already receives and makes no network requests. The optional **Catch up on startup** feature makes **read-only requests to Discord's own API** (the message history endpoint) from your own client, using your own logged-in session. No third-party or external services are used, and nothing is sent anywhere except to Discord.
>
> The feature is **off by default**, is strictly capped (see the safeguards above), and stops when rate limited. Even so, automated requests from a client mod are not endorsed by Discord and may conflict with Discord's Terms of Service or be treated as unusual activity, especially if misused or combined with other tools. Client mods are used **at your own risk**. The authors are not responsible for any rate limits, restrictions or action taken against your account. Only enable catch-up if you understand and accept this, and keep the limits low.

---

## 11. Turning the plugin on and off

There are two separate switches:

| Switch | Where | Effect | Restart? |
| --- | --- | --- | --- |
| **Notifications on/off** | Plugin settings (gear icon) | Pauses or resumes all alerts | **No**, instant |
| **Plugin enable** | Settings → Vencord → Plugins | Loads or unloads the plugin | **Yes**, Discord asks for a restart |

Use the first for quick pauses. Use the second to fully enable or disable the plugin. Because the plugin is marked as requiring a reload, Discord prompts you to restart whenever you flip the second switch.

---

## 12. Recipes: common setups

### 12.1 Get alerted when someone says my name

- **Keywords:** `mynick, my full name`
- **Match whole words only:** On
- **Also notify on your own messages:** Off
- **Ignore muted channels:** Off (so you're alerted even in muted servers)

### 12.2 Quiet watcher for noisy servers

- **Ignore muted channels:** Off. Mute the noisy servers so they stay silent, but still get your keyword alerts.
- **Keywords:** only a few specific words.

### 12.3 Moderator helper

- **Keywords:** `help, need a mod, report`
- **Ignore bots:** On
- **Servers only:** On

### 12.4 Watch DMs and group chats too

- **Servers only:** Off
- **DM channel ID:** a dedicated alerts DM (so DM alerts don't try to post in the same chat)

### 12.5 Desktop notifications only

- **Send fake DM:** Off

### 12.6 Testing mode

- **Also notify on your own messages:** On
- **Ignore the channel you're viewing:** Off
- Type your keyword in any channel and watch the alert appear.

### 12.7 Focus mode

- Use **Notifications on/off** to pause alerts during meetings or streams, then turn it back on.

---

## 13. Testing your setup

1. Confirm the plugin is enabled and **Notifications on/off** is on.
2. Add a test keyword, for example `roknuttest`.
3. Make sure **Also notify on your own messages** is on and **Ignore the channel you're viewing** is off.
4. In any server channel, type a message containing `roknuttest` and send it.
5. You should see a desktop notification within a second or so.
6. If **Send fake DM** is on, check the DM you chose for the jump-link message.
7. Click the notification and confirm it jumps to your message.
8. Try a message from a second account, if you have one, to test without the own-message option.
9. When finished, turn **Also notify on your own messages** off if you don't want self-alerts.

If something doesn't work, go to [Troubleshooting](#16-troubleshooting).

---

## 14. Privacy and security

| Topic | Details |
| --- | --- |
| **Network access** | By default, **none**. With the optional **Catch up on startup** feature on, it makes capped, read-only requests to **Discord's own API** only. No analytics, telemetry or third-party services, ever. See the [API disclaimer](#api-disclaimer). |
| **What it reads** | Only messages your client already received. |
| **What it stores** | Only its own settings (like your keywords) in Vencord's normal settings storage on your computer. It does not keep a log of matched messages. |
| **What it sends** | Nothing. The jump-link message is local only. |
| **Browser links** | The Discord invite and Docs buttons just open links in your browser when you click them. |
| **Spoilers and sensitive text** | Notifications show the **raw** message text, so spoiler content (`\|\|like this\|\|`) is shown as typed. Anyone looking at your screen or lock screen could read the notification. |
| **Notification previews** | Consider your OS's notification privacy settings if you share your screen or stream. |
| **Discord's rules** | Client mods like Vencord are not endorsed by Discord and can conflict with its Terms of Service. KeywordNotify only reads and displays information locally and performs no automation, but you use all client mods at your own risk. |

---

## 15. Limitations

KeywordNotify can only react to what your client receives. It does **not**:

- **Match non-text content.** Attachments, image text, stickers and embed contents are not checked. Only the message text is.
- **Alert on edits.** If someone edits a message to add a keyword, no alert is made. Only new messages are checked.
- **Catch every missed message, even with catch-up on.** Catch-up only checks a limited number of unread channels and recent messages (see [Catch-up on startup](#10a-catch-up-on-startup-optional)). Anything beyond those caps, or in channels it doesn't check, is missed. With catch-up off, messages sent while Discord was closed or offline aren't processed at all.
- **See channels you can't see.** No access, no event.
- **Ping people.** Notifications and the jump-link message are local to you.
- **Create real unread badges.** The jump-link message is not a real unread message.
- **Keep alerts after a reload.** Jump-link messages vanish on restart. Desktop notifications follow your OS and Vencord notification behavior.
- **Replace real mentions.** Normal Discord mentions and notifications are unaffected and still work as usual.
- **Match inside the mention names.** `@mentions` are stored as IDs in the message text, so a person's name in a mention is not matched.
- **Understand every language perfectly in whole-word mode.** See [A note on non-English letters](#74-a-note-on-non-english-letters).

---

## 16. Troubleshooting

### 16.1 Build and install problems

| Problem | Cause | Fix |
| --- | --- | --- |
| `glob-plugins ... Cannot read properties of undefined (reading 'replace')` | The plugin file isn't inside its own folder | Put it at `src/userplugins/keywordNotify/index.ts` |
| `No matching export in "src/webpack/common/index.ts" for import ...` | Your Vencord version doesn't export something the plugin imports | Update Vencord (`git pull`, then `pnpm install`) and rebuild. If it persists, report it with the full error. |
| pnpm version warning | Your pnpm version differs from the project's | Safe to ignore, or run `corepack use pnpm@<version it asks for>` |
| `pnpm inject` fails | Discord is still running | Quit Discord fully, including the tray icon, and retry |
| Odd file errors during build | OneDrive or antivirus locking files | Move Vencord to a plain folder like `C:\Vencord` |
| Plugin missing from the list | Build or inject didn't finish, or it's in the wrong folder | Rebuild, re-inject, restart Discord, and check the folder layout |
| Changes don't appear | You forgot to rebuild | Run `pnpm build` after every file change, then restart Discord |

### 16.2 It's installed but nothing happens

Work down this checklist:

1. **Do you have keywords?** The box is empty by default.
2. **Is the plugin enabled** in Settings → Vencord → Plugins, and did you restart Discord afterward?
3. **Is Notifications on/off set to on?**
4. **Is the channel muted** while **Ignore muted channels** is on?
5. **Are you viewing the channel** while **Ignore the channel you're viewing** is on?
6. **Is the author a bot** while **Ignore bots** is on?
7. **Is it a DM** while **Servers only** is on?
8. **Is the author you** while **Also notify on your own messages** is off?
9. **Is the author blocked?**
10. **Does the message really contain the keyword as text?** It won't match text inside images or attachments.
11. **Whole-word mode:** is the keyword stuck to other letters (`baron` vs `ron`)?
12. **Does Windows/macOS/Linux allow Discord notifications**, and is Do Not Disturb off?
13. **Check Vencord's notification settings** (Settings → Vencord → Notifications).

### 16.3 Notifications work but the DM message doesn't appear

- Check that **Send fake DM** is on.
- If **DM channel ID** is set, confirm the ID is correct. It must be a DM channel ID, not a user or server ID.
- If the ID is blank, the plugin uses the top DM in your list. If you have no DMs, there is nowhere to post. Set a channel ID.
- The jump-link message is skipped if the keyword was said in that same DM.
- Remember the message vanishes when Discord reloads.
- Look in the DM channel itself. The message won't create an unread badge.

### 16.4 Too many alerts

- Turn **Match whole words only** on.
- Use more specific keywords or phrases.
- Turn on **Ignore bots**.
- Turn on **Ignore muted channels** and mute noisy places.
- Turn on **Ignore the channel you're viewing**.
- Turn off **Also notify on your own messages** after testing.

### 16.5 Too few alerts

- Turn **Match whole words only** off for partial matches.
- Turn **Ignore muted channels** off.
- Add keyword variations.
- Remember attachments, embeds and edits aren't checked.

### 16.6 It triggers on my own messages and I don't want that

Turn off **Also notify on your own messages**.

### 16.7 The jump link doesn't scroll to the message

Very old messages may need to load first. Click again after the channel finishes loading. If the message was deleted, there's nothing to jump to.

### 16.8 Still stuck?

Collect this and ask in the [RokNut Academy Discord](https://discord.gg/TNB7rG7EGv):

- Your Vencord version and operating system
- Your plugin settings (you can leave out private keywords)
- The exact steps to reproduce the problem
- The full build error, or the Discord console output if there is any (open it with Ctrl+Shift+I on desktop)

---

## 17. FAQ

**Does the other person get notified if the alert appears in their DM?**
No. The jump-link message exists only on your computer and is never sent. They can't see it.

**Does it work on mobile?**
No. Vencord userplugins run on the desktop client.

**Can I use more than one keyword?**
Yes. Separate them with commas.

**Can I use phrases?**
Yes, phrases with spaces work (`good morning`).

**Do I need to restart after changing keywords?**
No. Keywords apply instantly.

**Do I need to restart after changing other settings?**
No. Only turning the plugin on or off in the Plugins list needs a restart.

**Does it work in every server I'm in?**
Yes, in all servers your client receives messages from, subject to your settings (such as muted channels).

**Can it read messages from servers I've left?**
No.

**Will it catch messages from while I was offline?**
Only if you turn on the optional **Catch up on startup** setting, and only within its caps (a limited number of unread channels and recent messages). By default it reacts only to messages your client receives live. See [Catch-up on startup](#10a-catch-up-on-startup-optional).

**Will it alert me about edited messages?**
No, only new messages.

**Are keywords case sensitive?**
No.

**Can I use regular expressions?**
No. Keywords are matched as literal text. Special characters are treated as plain characters.

**Does it slow Discord down?**
No noticeable impact. It does a quick text check on each incoming message.

**Where are my settings stored?**
In Vencord's normal settings storage on your computer, alongside your other Vencord plugin settings. Updating the plugin keeps them.

**Is it safe?**
By default it makes no network requests and never sends anything. It reads messages your client already has and shows you local alerts. If you turn on the optional catch-up feature, it makes capped, read-only requests to Discord's own API. Read the source in `index.ts` to see for yourself, and read the [API disclaimer](#api-disclaimer).

**Can I change the branding or text?**
The plugin is GPL-3.0-or-later, so you can modify and share it under the same license. See [LICENSE.md](LICENSE.md). Keep the license and copyright notices intact.

**Why does the plugin need a restart to enable?**
It's marked as requiring a reload so Vencord prompts you to restart whenever the plugin is switched on or off, ensuring a clean load.

**Why was it built?**
To give the RokNut community and friends an easy way to catch their name or topics across many servers.

---

## 18. Updating

### With Git

```bash
cd path/to/Vencord/src/userplugins/keywordNotify
git pull
cd ../../..          # back to the Vencord root
pnpm build
```

### Manually

1. Download the new `index.ts`.
2. Replace the old one in `src/userplugins/keywordNotify/`.
3. Run `pnpm build` from the Vencord root.

Then **restart Discord**. Your saved keywords and settings are kept.

If you update Vencord itself (`git pull`, `pnpm install`, `pnpm build`), the plugin may need a rebuild or small fixes if Vencord changed something internally. See the build errors table in [Troubleshooting](#161-build-and-install-problems).

---

## 19. Uninstalling

### Remove just the plugin

1. Turn KeywordNotify off in Settings → Vencord → Plugins and restart Discord.
2. Delete the `src/userplugins/keywordNotify` folder.
3. Run `pnpm build` from the Vencord root.

### Remove Vencord entirely

Quit Discord, then from the Vencord root run:

```bash
pnpm uninject
```

---

## 20. For developers

### 20.1 Files

| File | Purpose |
| --- | --- |
| `index.ts` | The whole plugin. It must be in the repo root. |
| `README.md` | Short repo description |
| `DOCS.md` | This document |
| `LICENSE.md` | GPL-3.0 license with RokNut branding |
| `CONTRIBUTING.md` | How to report bugs and contribute |
| `.gitignore` | Files Git should ignore |

### 20.2 Structure of `index.ts`

| Part | What it does |
| --- | --- |
| License header | GPL-3.0-or-later notice |
| Imports | Vencord APIs: notifications, settings, bot messages, stores, `RestAPI`, `React` |
| Constants | Invite URL, docs URL and brand name |
| `openLink` | Opens a URL in the browser (uses Vencord's native helper when available, otherwise `window.open`) |
| `BrandingPanel` | The settings-page banner, built with `React.createElement` (no JSX, so the file can stay `.ts`) |
| `definePluginSettings` | All settings and their defaults |
| `buildRegex` | Turns your keyword list into a case-insensitive regex, with optional whole-word boundaries |
| `isMuted` | Checks mute state for the server, category and channel |
| `definePlugin` | Plugin metadata, `reloadRequired`, and the `MESSAGE_CREATE` event handler |

### 20.3 Vencord APIs used

- `definePlugin`, `definePluginSettings`, `OptionType` for the plugin and its settings
- `showNotification` from the Notifications API for desktop notifications
- `sendBotMessage` from the Commands API for the local jump-link message
- `RestAPI` (Discord's own API client) for the optional catch-up feature only
- `ReadStateStore` (via `findStoreLazy`) to find unread channels for catch-up
- Webpack common stores such as `ChannelStore`, `GuildStore`, `UserStore`, `RelationshipStore`, `SelectedChannelStore`, `UserGuildSettingsStore` and `NavigationRouter`
- The `flux` hook to listen for `MESSAGE_CREATE`

### 20.4 Changing things safely

- **Change the default keywords:** edit the `default` value of the `keywords` setting.
- **Change the notification text:** edit the `title` and `body` passed to `showNotification`.
- **Change the DM message layout:** edit the `content` string passed to `sendBotMessage`.
- **Change the branding or links:** edit the constants at the top of `index.ts` and the `BrandingPanel` function.
- **Add a setting:** add an entry in `definePluginSettings`, then read it via `settings.store.<name>`.

Rebuild with `pnpm build` and restart Discord after every change.

### 20.5 Vencord plugin rules

If you contribute or submit anywhere, follow the Vencord community's plugin rules: no raw DOM manipulation (use patches and React), no selfbot or API-spam behavior, no FakeDeafen/FakeMute/StereoMic, and disclose any external API use. KeywordNotify uses no third-party or external APIs. Its optional catch-up feature calls Discord's own API, which is disclosed in the [API disclaimer](#api-disclaimer), is off by default and is strictly capped.

### 20.6 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 21. Glossary

| Term | Meaning |
| --- | --- |
| **Vencord** | A Discord client modification that adds plugins and features. |
| **Userplugin** | A custom plugin you add yourself to Vencord's `src/userplugins` folder. |
| **Inject** | Patch your Discord install so it loads Vencord. |
| **Flux event** | An internal Discord client event, like "a new message arrived". |
| **`MESSAGE_CREATE`** | The event fired when a new message arrives. |
| **Keyword** | A word or phrase you want to be alerted on. |
| **Whole-word matching** | Only matching a keyword when it isn't part of a longer word. |
| **Channel ID** | A unique number that identifies a channel or DM. |
| **Developer Mode** | A Discord setting that lets you copy IDs. |
| **Local-only message** | A message created and shown only on your client, never sent to Discord. |
| **Optimistic message** | A temporary copy of a message Discord shows instantly while it's still sending. |
| **Muted** | A server, category or channel you've silenced in Discord. |

---

## 22. Changelog

### v1.1.0
- New optional **Catch up on startup** feature, off by default, that checks a limited number of unread channels for keywords missed while offline
- Safeguards: hard caps on channels, messages and lookback, minimum delay between requests, 15-minute cooldown, stop on rate limit, unread and non-muted channels only
- Single summary notification and single DM message per catch-up run
- API disclaimer added to the settings panel, README and docs
- Messages already alerted live are never alerted twice

### v1.0.0
- Desktop notifications when a message contains one of your keywords
- Click a notification to jump to the message
- Optional local "RokNut Alert" jump-link message in a DM, with a configurable DM channel
- Empty keyword list by default, with automatic saving
- Settings: on/off toggle, whole-word matching, own-message alerts, servers only, muted-channel filter, current-channel filter and bot filter
- RokNut-branded settings panel with how-to text, a Discord invite button and a Docs button
- Plugin marked as requiring a restart when switched on or off

---

## 23. Support and community

Questions, ideas, bug reports or just want to say hi?

👉 **[Join the RokNut Academy Discord](https://discord.gg/TNB7rG7EGv)**

---

<div align="center">

Built by the **RokNut Industries Development Team**, a RokNut Academy company.

Licensed GPL-3.0-or-later. See [LICENSE.md](LICENSE.md).

</div>
