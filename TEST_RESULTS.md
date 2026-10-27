# Simon Says BD — Test Results (2026-10-27)

## Unit tests — 20/20 pass

`node --test tests/logic.test.js`

- `speedForRound`: 600 ms for rounds 1–5; 560 ms at round 6; 520 ms at 11;
  400 ms at 26; floored at 250 ms (rounds 51, 200); round < 1 clamps to 1.
- Lifecycle: idle start, `start()` builds a 1-pad sequence in `playing` state,
  strict flag recorded, `beginInput()` only from `playing`, presses outside
  `input` ignored.
- Gameplay: correct press advances `playerIndex` without scoring; completing
  a round scores +1 and extends the sequence; a fixed-rng 3-round game ends
  at score 3 with the next round queued (length 4).
- Classic wrong press: `wrongReplay`, mistakes 1, same sequence, playerIndex
  reset, score unchanged.
- Strict wrong press: `gameOver`, mistakes 1; later presses ignored.
- `reset()` clears sequence/score/mistakes/strict/state.
- 200 draws from the production rng are all integers in 0..3.
- `bestFor`: keeps a higher stored best, adopts a higher new score, handles
  missing entries.

## Headless-Chrome smoke tests — 19/19 pass

`node tests/smoke.js` (raw CDP, real Chromium, `file://...?test=1`)

- Title contains "Simon"; 4 pads render; Start button visible.
- Round 1: input phase reached; sequence length 1; repeating the shown pad
  makes score 1; Start button label becomes "Restart".
- Round 2: input phase reached; sequence length 2; a wrong pad shows
  "Wrong! Watch again..." (classic replay path).
- Strict mode: mode switch restarts the game; round 1 completed; round-2
  wrong pad shows the game-over panel.
- Language: `lang` attribute switches to `bn`; lang button reads "English";
  round stat renders Bengali digits.
- Best score persists in `localStorage` after a scoring game over.
- 390 px viewport: no horizontal overflow.
- Zero page console errors and zero uncaught exceptions.

## Fixes found by testing (all test-side, 0 app-logic bugs)

1. Smoke expectation used "Wrong! Watch again" but the real status string is
   "Wrong! Watch again..." (trailing ellipsis) — expectation corrected.
2. Smoke expected a `localStorage` best after a 0-score game over, but the
   app legitimately skips saving when the new best equals the stored best
   (0) — the strict scenario now completes a round first (score 1) before
   the game-ending mistake.
3. Smoke reused one Chrome profile across runs, risking stale persisted
   language/best state — each run now uses a fresh `user-data-dir`.
4. The Bengali-digit regex range in the smoke test was corrupted in transit
   (the literal range became U+2028–U+2060 instead of U+09E6–U+09EF) and
   failed against a real Bengali digit — fixed by constructing the range
   from numeric codepoints, and the shipped file now contains only the
   ASCII form `[\u09e6-\u09ef]`.

## Pre-test design fix (from playability review)

Mode buttons and Start originally disabled mid-game, leaving Classic games
(which never end on their own) with no way to switch modes. Mode buttons now
stay enabled and switch + restart mid-game; Start doubles as Restart while
a game runs. Implemented before the smoke run above.
