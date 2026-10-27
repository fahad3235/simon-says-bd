# Simon Says BD

An offline Simon Says memory game: watch the pads light up, repeat the
pattern, and see how far you can go. Fully static — no server, no account,
no tracking. Scores live only in your browser.

## Features

- **Classic mode** — a mistake replays the same pattern so you can try again.
- **Strict mode** — one mistake ends the game, just like the original.
- **Speed ramp** — the pattern plays faster as rounds grow (600 ms steps for
  rounds 1–5, shrinking 40 ms every 5 rounds, floored at 250 ms).
- **Web Audio tones** — each pad plays its own tone (E4/C4/A3/E3); no audio
  files. Sound can be toggled off.
- **Best scores** — best score per mode, stored in `localStorage`.
- **English / বাংলা toggle** — persisted, with Bengali digits.
- **Keyboard play** — keys 1–4 mirror the four pads.
- **Mobile friendly** — tested at 390 px width with no horizontal overflow.

## Stack

Vanilla HTML, CSS, and JavaScript. No build step, no dependencies, no network
requests at runtime.

## Run locally

Just open `index.html` in a browser, or serve the folder:

```sh
npx serve .
# or
python3 -m http.server 8000
```

## Tests

```sh
node --test tests/logic.test.js   # pure-logic unit tests (20 checks)
node tests/smoke.js               # headless-Chrome smoke tests (19 checks)
```

The smoke test drives the real game in headless Chromium via raw CDP
(`?test=1` exposes a `window.__simon` test hook; it is inert otherwise).
It needs `/opt/meta-chromium/chrome` or an equivalent Chromium binary —
edit the path at the top of `tests/smoke.js` if yours lives elsewhere.

## Project structure

| Path | What it is |
|---|---|
| `index.html` | Page structure, pads, stats, game-over panel |
| `css/styles.css` | Dark theme, pad grid, lit animation |
| `js/logic.js` | Pure game state machine (unit-tested) |
| `js/i18n.js` | English / Bangla strings, Bengali digits |
| `js/app.js` | DOM wiring, Web Audio, playback, persistence |
| `tests/logic.test.js` | Node unit tests |
| `tests/smoke.js` | Headless-Chrome smoke tests |

## Limitations

- Best scores are per-browser only; clearing site data erases them.
- Audio requires a user gesture first (browser autoplay policy) — the first
  Start click unlocks it.
- This is a memory game, not a clinical cognitive test; scores measure
  pattern recall in this game only.

## Status

MVP complete. See `TEST_RESULTS.md` for the verified test report.
