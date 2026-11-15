<div align="center">

# 🥜 Security Policy

**Keeping KeywordNotify and its users safe.**

RokNut Industries Development Team · a RokNut Academy company

[![Discord](https://img.shields.io/badge/Discord-RokNut%20Academy-5865F2?logo=discord&logoColor=white)](https://discord.gg/TNB7rG7EGv)

</div>

---

## Supported versions

Only the latest version on the `main` branch receives fixes. Please update before reporting a problem.

| Version | Supported |
| --- | --- |
| Latest (`main`) | ✅ |
| Older versions | ❌ |

## What counts as a security issue

Examples of things we want to hear about:

- The plugin leaking information (for example, sending your messages or keywords anywhere)
- The plugin making network requests it shouldn't, or bypassing its documented limits (such as the catch-up safeguards)
- Ways the plugin could be tricked into running unwanted code or opening malicious links
- Anything that could expose your Discord session or account data

KeywordNotify is designed to be local and read-only. By default it makes no network requests, and its optional catch-up feature only makes capped, read-only requests to Discord's own API. See the [API disclaimer](https://github.com/The-Roknut-Academy/keywordNotify/blob/main/DOCS.md#api-disclaimer).

## Reporting a vulnerability

**Please don't open a public issue for a security problem.** Report it privately so we can fix it before it's widely known:

1. Use GitHub's private reporting: go to the repository's **Security** tab and click **Report a vulnerability** (if it's available), or
2. Message a maintainer privately in the [RokNut Academy Discord](https://discord.gg/TNB7rG7EGv).

Please include:

- A clear description of the issue and why it matters
- Steps to reproduce it
- Your Vencord version and operating system
- Any suggested fix, if you have one

## What to expect

- We'll acknowledge your report as soon as we can.
- We'll look into it, keep you updated, and work on a fix.
- Once it's fixed, we'll credit you in the changelog if you'd like.

This is a community project maintained by volunteers, so response times can vary. Thank you for your patience and for helping keep the community safe.

## Out of scope

- Issues in Vencord or Discord themselves. Please report those to their own teams.
- Risks that come from using a client mod at all. Client mods are not endorsed by Discord, and you use them at your own risk.
- Problems that need physical access to your computer.

---

<div align="center">

Built by the **RokNut Industries Development Team**, a RokNut Academy company. 🥜

</div>
