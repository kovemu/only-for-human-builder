# Only for Human Builder

Human leftovers before a fictional AI apocalypse. English first, Korean available.

This is a **Figma desktop design builder**, not a deployed website. The designs contain clearly labeled image slots, not real user submissions. No AI images are bundled.

## First installation

1. Extract the repository ZIP and keep the whole `plugin` directory.
2. In Figma Desktop: Plugins → Development → Import plugin from manifest.
3. Select `plugin/manifest.json` and run **Only for Human Builder**.
4. Select English, 한국어, or both, then generate the screens.

The package works offline immediately. GitHub sync requires the public `kovemu/only-for-human-builder` repository to exist with these files on `main`.

## Routine updates

ChatGPT edits and commits `screens/*.json`, `design/tokens.json`, `locales/*.json`, or `config/countdown.json` and bumps `version.json`.

In the plugin click **GitHub 최신 버전 불러오기**, then **불러온 버전으로 전체 화면 다시 생성**. Fetch is pinned to one commit to prevent mixed-version screens. A failed fetch keeps the previous data. Generation replaces only this builder's frames for the selected languages, after staging succeeds.

Ordinary screen/text/color/layout changes need no new ZIP. Renderer code or schema changes require reinstalling the updated local plugin code. Do not store tokens or secrets in this public repo.

## Files

- `screens/`: home, upload, detail, saved, profile; node geometry and copy keys.
- `locales/en.json`, `locales/ko.json`: matching interface translation keys; English is default.
- `design/tokens.json`: colors, fonts and frame spacing.
- `config/countdown.json`: shared fixed UTC deadline. Never derive it from each visitor's arrival.
- `plugin/renderer.js`: editable renderer source; `plugin/code.js` is its built installer.
- `lib/core.js`: countdown and bundle validation.

Caption examples are translated only as design copy. Real user captions should remain in their original language.

## Countdown

Started: 2026-09-17 17:51 UTC. Deadline: 2031-09-17 17:51 UTC, five calendar years later. The pixel counter changes at minute boundaries while the plugin remains open, and stops at zero. Closing the plugin leaves static Figma layers. A future live website must run its own client countdown and provide upload, accounts and storage separately.

## Development

No dependencies. Node 20 or newer:

```sh
node scripts/build.js
node --test tests/*.test.js
```

Tests cover expiry/minute boundaries, invalid bundles, bilingual generation and rollback through a minimal Figma API adapter. They are not a substitute for a live Figma Desktop check. Install Inter and Noto Sans KR if Figma cannot find the selected fonts.

Images may be added as `image` nodes with HTTPS URLs under this repository's raw.githubusercontent.com path. Use photographs or drawings supplied by their creators. The current colored slots are intentional wireframe placeholders.
