"use strict";
/* Pure game logic for Simon Says BD. No DOM, no audio: unit-testable in Node.
   rng(max) must return an integer in [0, max). Default uses Math.random. */
var SimonLogic = (function () {
  var PAD_COUNT = 4;
  var BASE_STEP_MS = 600;
  var STEP_DECREASE_MS = 40;
  var DECREASE_EVERY_ROUNDS = 5;
  var MIN_STEP_MS = 250;

  // Playback step length shrinks as rounds grow: 600ms for rounds 1-5,
  // 560ms for 6-10, ... floored at 250ms.
  function speedForRound(round) {
    if (round < 1) round = 1;
    var drops = Math.floor((round - 1) / DECREASE_EVERY_ROUNDS);
    var ms = BASE_STEP_MS - drops * STEP_DECREASE_MS;
    return ms < MIN_STEP_MS ? MIN_STEP_MS : ms;
  }

  function SimonGame(rng) {
    this.rng = rng || function (max) { return Math.floor(Math.random() * max); };
    this.reset();
  }

  SimonGame.prototype.reset = function () {
    this.sequence = [];
    this.playerIndex = 0;
    this.score = 0;
    this.mistakes = 0;
    this.strict = false;
    this.state = "idle"; // idle | playing | input | over
  };

  SimonGame.prototype.round = function () { return this.sequence.length; };

  SimonGame.prototype.start = function (strict) {
    this.reset();
    this.strict = !!strict;
    this.sequence.push(this.rng(PAD_COUNT));
    this.state = "playing";
  };

  // Called by the UI after the computer finishes flashing the sequence.
  SimonGame.prototype.beginInput = function () {
    if (this.state !== "playing") return false;
    this.playerIndex = 0;
    this.state = "input";
    return true;
  };

  // Returns { result, state, ... }. Results:
  //   correct | roundComplete | wrongReplay (classic: same sequence replays)
  //   gameOver (strict) | ignored (pressed outside the input phase)
  SimonGame.prototype.press = function (pad) {
    if (this.state !== "input") {
      return { result: "ignored", state: this.state };
    }
    if (pad === this.sequence[this.playerIndex]) {
      this.playerIndex++;
      if (this.playerIndex >= this.sequence.length) {
        this.score++;
        this.sequence.push(this.rng(PAD_COUNT));
        this.state = "playing";
        return { result: "roundComplete", state: this.state, score: this.score };
      }
      return { result: "correct", state: this.state };
    }
    this.mistakes++;
    if (this.strict) {
      this.state = "over";
      return { result: "gameOver", state: this.state, mistakes: this.mistakes };
    }
    this.playerIndex = 0;
    this.state = "playing";
    return { result: "wrongReplay", state: this.state, mistakes: this.mistakes };
  };

  // Best-score helper: returns the stored best after considering this score.
  function bestFor(scores, mode, score) {
    var cur = (scores && scores[mode]) || 0;
    return score > cur ? score : cur;
  }

  return {
    SimonGame: SimonGame,
    speedForRound: speedForRound,
    bestFor: bestFor,
    PAD_COUNT: PAD_COUNT
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SimonLogic;
}
