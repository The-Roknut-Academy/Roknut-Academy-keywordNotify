<div align="center">

# 🥜 Contributing to KeywordNotify

**Help us make KeywordNotify better.**

Maintained by the **RokNut Industries Development Team** · a RokNut Academy company

[![Discord](https://img.shields.io/badge/Discord-RokNut%20Academy-5865F2?logo=discord&logoColor=white)](https://discord.gg/TNB7rG7EGv)
[![Docs](https://img.shields.io/badge/docs-DOCS.md-f59e0b)](https://github.com/The-Roknut-Academy/keywordNotify/blob/main/DOCS.md)
[![License](https://img.shields.io/badge/license-GPL--3.0--or--later-blue)](LICENSE.md)

</div>

---

Thanks for wanting to pitch in! Whether you found a bug, have an idea, or want to send code, you're welcome here. This page explains how to help in a way that keeps things smooth for everyone.

## 🧭 Ways to help

| I want to... | Do this |
| --- | --- |
| 🐛 Report a bug | [Open an issue](https://github.com/The-Roknut-Academy/keywordNotify/issues/new) |
| 💡 Suggest a feature | [Open an issue](https://github.com/The-Roknut-Academy/keywordNotify/issues/new) and describe the idea |
| ❓ Ask a question | Ask in the [RokNut Academy Discord](https://discord.gg/TNB7rG7EGv) |
| 📖 Improve the docs | Send a pull request editing `README.md` or `DOCS.md` |
| 🛠️ Fix or add something in the code | Follow the pull request steps below |

## 🐛 Reporting a bug

A good report gets fixed faster. Please include:

- **What you expected** to happen
- **What actually happened**
- **Steps to reproduce** it, as exact as you can
- Your **Vencord version** and **operating system**
- Your **plugin settings** (leave out any private keywords)
- The **full build error** or **console output**, if there is any (open the console with `Ctrl+Shift+I` in Discord)

Before you post, check the [Troubleshooting section of the docs](https://github.com/The-Roknut-Academy/keywordNotify/blob/main/DOCS.md#16-troubleshooting). Your answer may already be there.

## 💡 Suggesting a feature

Tell us:

1. **What** you'd like KeywordNotify to do
2. **Why** it would help (a real example is great)
3. Any **ideas for how** it could work

Keep in mind that the plugin follows Vencord's community rules, so we can't add things like selfbot behavior, auto-replies or anything that spams Discord's API.

## 🛠️ Sending a pull request

1. **Fork** the repo and create a branch with a clear name, like `fix-whole-word-matching` or `add-sound-option`.
2. **Make one focused change.** One fix or feature per pull request is much easier to review.
3. **Write clean, readable code** in the style already used in `index.ts`.
4. **Test it for real.** Build it in a Vencord source install and try it in Discord:
   ```
   pnpm build
   pnpm inject
   ```
   Then restart Discord and check that your change works and nothing else broke.
5. **Update the docs** if you changed or added a setting or behavior (`DOCS.md`, and `README.md` if it's a headline feature), and add a line to the changelog in `DOCS.md`.
6. **Open the pull request** and describe what you changed, why, and how you tested it.

### ✅ Pull request checklist

- [ ] The plugin still builds with `pnpm build`
- [ ] I tested the change in Discord
- [ ] `index.ts` is still in the repo root (one plugin per repo)
- [ ] I updated the docs and changelog if needed
- [ ] I kept the license header and credits intact
- [ ] I followed the plugin rules below

## 📏 Plugin rules

KeywordNotify follows the Vencord community's plugin rules. Contributions must not:

- ❌ Manipulate the DOM directly. Use proper patches and React instead.
- ❌ Add selfbot behavior or API spam (auto-reply, message pruners, animated status, nitro snipers and similar).
- ❌ Add FakeDeafen, FakeMute or StereoMic.
- ❌ Be "vibecoded". If you used AI tools, make sure you understand and can explain every line you submit, and say so in your pull request.
- ❌ Use any external API without a clear disclaimer in the docs.

Any feature that makes requests to Discord's API must be **optional, off by default and strictly capped**, like the catch-up feature. Explain the safeguards in your pull request.

## 🥜 Code style

- Keep `index.ts` as the single plugin file in the repo root.
- Use clear names and keep functions small.
- Don't add JSX. The file stays `.ts`, so build UI with `React.createElement`.
- Avoid unnecessary dependencies. The plugin should only use Vencord's own APIs.
- Comment only where something isn't obvious.

## 📜 License and credits

KeywordNotify is licensed under **GPL-3.0-or-later with RokNut additional terms** (credit, marking changes and branding use). See [LICENSE.md](LICENSE.md).

By contributing, you agree that your work is released under the same license. Please **don't remove** the license header or the RokNut credits from any file. You're welcome to add your own name alongside ours.

## 🤝 Be kind

We're a community first. Be respectful, patient and constructive in issues, pull requests and our Discord. Disagreements are fine. Rudeness isn't.

## 💬 Need help contributing?

Stuck on a build error, unsure where something belongs, or just want to talk it through before you start? Come say hi:

👉 **[Join the RokNut Academy Discord](https://discord.gg/TNB7rG7EGv)**

---

<div align="center">

Built by the **RokNut Industries Development Team**, a RokNut Academy company. 🥜
This page is ai generated with gemini
</div>
