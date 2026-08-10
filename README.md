# Personal Workbench

A self-contained personal daily workbench app that runs in any browser — no build step, no backend, data lives in `localStorage`.

## Features

- **Dashboard** — greeting, today's progress rings, module grid, quick-record shortcuts
- **Todo** — daily checkable tasks with priority levels
- **Check-in** — habit tracker with streak counter, auto-resets daily
- **Ledger** — income/expense entries with monthly totals and breakdown chart
- **Goals** — long-term progress bars with +1 increment
- **Notes** — free-text cards with optional tags

## Files

| File | Description |
|---|---|
| `workbench-desktop.html` | Desktop version — sidebar navigation, multi-column layout |
| `workbench-mobile.html` | Mobile version — drawer + bottom tab bar + floating add button |
| `assets/` | Shared image assets (avatar, greet banner) |
| `SKILL.md` | Full documentation and customization guide |

## Quick Start

1. Open `workbench-desktop.html` in a browser on your computer.
2. Open `workbench-mobile.html` on your phone.
3. Edit the `CONFIG` object at the top of the `<script>` block to customize modules, profile, and seed data.

## Customization

All visual style is controlled by CSS variables under `:root` — edit the token values to re-skin the entire app. See `SKILL.md` for the full customization guide including:

- Module types and configuration
- Theme tokens and color palettes
- Icon system (Lucide-compatible SVG paths)
- Layout variants for record cards

## Data Storage

> All data is stored locally in your browser's `localStorage`. Switching devices, changing browsers, or clearing browsing data will lose previous entries. Desktop and mobile versions do not sync with each other.

## License

MIT
