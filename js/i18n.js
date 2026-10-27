"use strict";
/* EN / BN strings for Simon Says BD. Bengali strings are converted to
   \uXXXX escapes at build time so every shipped source file stays pure ASCII
   (the GitHub push argv path corrupts raw non-ASCII text). */
var SimonI18n = (function () {
  var STR = {
    en: {
      title: "Simon Says BD",
      tagline: "Watch the lights. Repeat the pattern. How far can you go?",
      start: "Start Game",
      restart: "Restart",
      playAgain: "Play Again",
      round: "Round",
      score: "Score",
      best: "Best",
      speed: "Speed",
      modeLabel: "Mode",
      classic: "Classic",
      classicHint: "A mistake replays the pattern",
      strict: "Strict",
      strictHint: "One mistake ends the game",
      statusIdle: "Press Start and watch carefully!",
      statusWatch: "Watch...",
      statusTurn: "Your turn!",
      statusWrong: "Wrong! Watch again...",
      statusCorrect: "Correct! Next round...",
      statusOver: "Game over!",
      overTitle: "Game Over",
      finalScore: "Final score",
      finalRounds: "Rounds completed",
      finalMistakes: "Mistakes",
      padGreen: "Green",
      padRed: "Red",
      padYellow: "Yellow",
      padBlue: "Blue",
      howTitle: "How to play",
      how1: "Press Start. The pads light up in a pattern, one by one.",
      how2: "Repeat the pattern by tapping the pads in the same order.",
      how3: "Each round adds one more step, and the pattern gets faster.",
      how4: "Keys 1-4 also work. In Strict mode, one mistake ends the game.",
      soundOn: "Sound: On",
      soundOff: "Sound: Off",
      footer: "Offline game. Scores are stored only in your browser. No account, no tracking."
    },
    bn: {
      title: "\u09b8\u09be\u0987\u09ae\u09a8 \u09b8\u09c7\u099c \u09ac\u09bf\u09a1\u09bf",
      tagline: "\u0986\u09b2\u09cb \u09a6\u09c7\u0996\u09c1\u09a8\u0964 \u098f\u0995\u0987 \u09aa\u09cd\u09af\u09be\u099f\u09be\u09b0\u09cd\u09a8 \u09aa\u09c1\u09a8\u09b0\u09be\u09ac\u09c3\u09a4\u09cd\u09a4\u09bf \u0995\u09b0\u09c1\u09a8\u0964 \u0995\u09a4\u09a6\u09c2\u09b0 \u09af\u09c7\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7\u09a8?",
      start: "\u0996\u09c7\u09b2\u09be \u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09c1\u09a8",
      restart: "\u09aa\u09c1\u09a8\u09b0\u09be\u09af\u09bc \u09b6\u09c1\u09b0\u09c1",
      playAgain: "\u0986\u09ac\u09be\u09b0 \u0996\u09c7\u09b2\u09c1\u09a8",
      round: "\u09b0\u09be\u0989\u09a8\u09cd\u09a1",
      score: "\u09b8\u09cd\u0995\u09cb\u09b0",
      best: "\u09b8\u09c7\u09b0\u09be",
      speed: "\u0997\u09a4\u09bf",
      modeLabel: "\u09ae\u09cb\u09a1",
      classic: "\u0995\u09cd\u09b2\u09be\u09b8\u09bf\u0995",
      classicHint: "\u09ad\u09c1\u09b2 \u09b9\u09b2\u09c7 \u09aa\u09cd\u09af\u09be\u099f\u09be\u09b0\u09cd\u09a8\u099f\u09bf \u0986\u09ac\u09be\u09b0 \u09a6\u09c7\u0996\u09be\u09a8\u09cb \u09b9\u09ac\u09c7",
      strict: "\u09b8\u09cd\u099f\u09cd\u09b0\u09bf\u0995\u09cd\u099f",
      strictHint: "\u098f\u0995\u099f\u09bf \u09ad\u09c1\u09b2\u09c7\u0987 \u0996\u09c7\u09b2\u09be \u09b6\u09c7\u09b7",
      statusIdle: "\u09b6\u09c1\u09b0\u09c1 \u099a\u09be\u09aa\u09c1\u09a8 \u098f\u09ac\u0982 \u09ae\u09a8\u09cb\u09af\u09cb\u0997 \u09a6\u09bf\u09af\u09bc\u09c7 \u09a6\u09c7\u0996\u09c1\u09a8!",
      statusWatch: "\u09a6\u09c7\u0996\u09c1\u09a8...",
      statusTurn: "\u0986\u09aa\u09a8\u09be\u09b0 \u09aa\u09be\u09b2\u09be!",
      statusWrong: "\u09ad\u09c1\u09b2! \u0986\u09ac\u09be\u09b0 \u09a6\u09c7\u0996\u09c1\u09a8...",
      statusCorrect: "\u09b8\u09a0\u09bf\u0995! \u09aa\u09b0\u09c7\u09b0 \u09b0\u09be\u0989\u09a8\u09cd\u09a1...",
      statusOver: "\u0996\u09c7\u09b2\u09be \u09b6\u09c7\u09b7!",
      overTitle: "\u0996\u09c7\u09b2\u09be \u09b6\u09c7\u09b7",
      finalScore: "\u099a\u09c2\u09a1\u09bc\u09be\u09a8\u09cd\u09a4 \u09b8\u09cd\u0995\u09cb\u09b0",
      finalRounds: "\u09b8\u09ae\u09cd\u09aa\u09a8\u09cd\u09a8 \u09b0\u09be\u0989\u09a8\u09cd\u09a1",
      finalMistakes: "\u09ad\u09c1\u09b2",
      padGreen: "\u09b8\u09ac\u09c1\u099c",
      padRed: "\u09b2\u09be\u09b2",
      padYellow: "\u09b9\u09b2\u09c1\u09a6",
      padBlue: "\u09a8\u09c0\u09b2",
      howTitle: "\u0995\u09c0\u09ad\u09be\u09ac\u09c7 \u0996\u09c7\u09b2\u09ac\u09c7\u09a8",
      how1: "\u09b6\u09c1\u09b0\u09c1 \u099a\u09be\u09aa\u09c1\u09a8\u0964 \u09aa\u09cd\u09af\u09be\u09a1\u0997\u09c1\u09b2\u09cb \u098f\u0995\u09c7 \u098f\u0995\u09c7 \u098f\u0995\u099f\u09bf \u09aa\u09cd\u09af\u09be\u099f\u09be\u09b0\u09cd\u09a8\u09c7 \u099c\u09cd\u09ac\u09b2\u09c7 \u0989\u09a0\u09ac\u09c7\u0964",
      how2: "\u098f\u0995\u0987 \u0995\u09cd\u09b0\u09ae\u09c7 \u09aa\u09cd\u09af\u09be\u09a1\u0997\u09c1\u09b2\u09cb \u099a\u09c7\u09aa\u09c7 \u09aa\u09cd\u09af\u09be\u099f\u09be\u09b0\u09cd\u09a8\u099f\u09bf \u09aa\u09c1\u09a8\u09b0\u09be\u09ac\u09c3\u09a4\u09cd\u09a4\u09bf \u0995\u09b0\u09c1\u09a8\u0964",
      how3: "\u09aa\u09cd\u09b0\u09a4\u09bf \u09b0\u09be\u0989\u09a8\u09cd\u09a1\u09c7 \u098f\u0995\u099f\u09bf \u09a7\u09be\u09aa \u09ac\u09be\u09a1\u09bc\u09c7, \u0986\u09b0 \u09aa\u09cd\u09af\u09be\u099f\u09be\u09b0\u09cd\u09a8 \u09a6\u09cd\u09b0\u09c1\u09a4 \u09b9\u09af\u09bc\u0964",
      how4: "\u09e7-\u09ea \u0995\u09c0-\u0993 \u0995\u09be\u099c \u0995\u09b0\u09c7\u0964 \u09b8\u09cd\u099f\u09cd\u09b0\u09bf\u0995\u09cd\u099f \u09ae\u09cb\u09a1\u09c7 \u098f\u0995\u099f\u09bf \u09ad\u09c1\u09b2\u09c7\u0987 \u0996\u09c7\u09b2\u09be \u09b6\u09c7\u09b7\u0964",
      soundOn: "\u09b6\u09ac\u09cd\u09a6: \u099a\u09be\u09b2\u09c1",
      soundOff: "\u09b6\u09ac\u09cd\u09a6: \u09ac\u09a8\u09cd\u09a7",
      footer: "\u0985\u09ab\u09b2\u09be\u0987\u09a8 \u0996\u09c7\u09b2\u09be\u0964 \u09b8\u09cd\u0995\u09cb\u09b0 \u09b6\u09c1\u09a7\u09c1 \u0986\u09aa\u09a8\u09be\u09b0 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09af\u09bc\u0964 \u0995\u09cb\u09a8\u09cb \u0985\u09cd\u09af\u09be\u0995\u09be\u0989\u09a8\u09cd\u099f \u09ac\u09be \u099f\u09cd\u09b0\u09cd\u09af\u09be\u0995\u09bf\u0982 \u09a8\u09c7\u0987\u0964"
    }
  };

  var BN_DIGITS = ["\u09e6", "\u09e7", "\u09e8", "\u09e9", "\u09ea", "\u09eb", "\u09ec", "\u09ed", "\u09ee", "\u09ef"];
  function toBnDigits(value) {
    return String(value).replace(/[0-9]/g, function (d) { return BN_DIGITS[+d]; });
  }
  function fmt(value, lang) {
    return lang === "bn" ? toBnDigits(value) : String(value);
  }

  return { STR: STR, fmt: fmt, toBnDigits: toBnDigits };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SimonI18n;
}
