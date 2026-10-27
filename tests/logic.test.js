"use strict";
// Unit tests for js/logic.js - run with: node --test tests/logic.test.js
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { SimonGame, speedForRound, bestFor } = require("../js/logic.js");

// Deterministic rng: cycles 0,1,2,3,0,1,2,3...
function rngCycle() {
  let n = 0;
  return function (max) { const v = n % max; n++; return v; };
}
// rng that always returns the same pad
function rngFixed(v) { return function () { return v; }; }

describe("speedForRound", function () {
  it("rounds 1-5 use 600ms", function () {
    assert.equal(speedForRound(1), 600);
    assert.equal(speedForRound(5), 600);
  });
  it("drops 40ms every 5 rounds", function () {
    assert.equal(speedForRound(6), 560);
    assert.equal(speedForRound(10), 560);
    assert.equal(speedForRound(11), 520);
    assert.equal(speedForRound(26), 400);
  });
  it("floors at 250ms", function () {
    assert.equal(speedForRound(51), 250);
    assert.equal(speedForRound(200), 250);
  });
  it("clamps round < 1 to round 1", function () {
    assert.equal(speedForRound(0), 600);
  });
});

describe("SimonGame lifecycle", function () {
  it("starts idle with empty sequence", function () {
    const g = new SimonGame(rngCycle());
    assert.equal(g.state, "idle");
    assert.deepEqual(g.sequence, []);
    assert.equal(g.score, 0);
  });
  it("start(strict=false) creates a 1-pad sequence in playing state", function () {
    const g = new SimonGame(rngCycle());
    g.start(false);
    assert.deepEqual(g.sequence, [0]);
    assert.equal(g.state, "playing");
    assert.equal(g.strict, false);
  });
  it("start(strict=true) records strict mode", function () {
    const g = new SimonGame(rngCycle());
    g.start(true);
    assert.equal(g.strict, true);
  });
  it("beginInput only works from playing state", function () {
    const g = new SimonGame(rngCycle());
    assert.equal(g.beginInput(), false);
    g.start(false);
    assert.equal(g.beginInput(), true);
    assert.equal(g.state, "input");
    assert.equal(g.beginInput(), false);
  });
  it("press outside input phase is ignored", function () {
    const g = new SimonGame(rngCycle());
    g.start(false);
    const r = g.press(0);
    assert.equal(r.result, "ignored");
    assert.equal(g.state, "playing");
  });
  it("correct press advances playerIndex without scoring", function () {
    const g = new SimonGame(rngCycle());
    g.start(false); // sequence [0]
    g.sequence = [1, 2];
    g.state = "input";
    const r = g.press(1);
    assert.equal(r.result, "correct");
    assert.equal(g.playerIndex, 1);
    assert.equal(g.score, 0);
  });
  it("completing a round scores and extends the sequence", function () {
    const g = new SimonGame(rngCycle());
    g.start(false); // sequence [0], next rng value is 1
    g.beginInput();
    const r = g.press(0);
    assert.equal(r.result, "roundComplete");
    assert.equal(g.score, 1);
    assert.deepEqual(g.sequence, [0, 1]);
    assert.equal(g.state, "playing");
  });
  it("full 3-round game with fixed rng", function () {
    const g = new SimonGame(rngFixed(2));
    g.start(false);
    // Round 1: [2]
    g.beginInput();
    assert.equal(g.press(2).result, "roundComplete");
    // Round 2: [2,2]
    g.beginInput();
    assert.equal(g.press(2).result, "correct");
    assert.equal(g.press(2).result, "roundComplete");
    // Round 3: [2,2,2]
    g.beginInput();
    assert.equal(g.press(2).result, "correct");
    assert.equal(g.press(2).result, "correct");
    assert.equal(g.press(2).result, "roundComplete");
    assert.equal(g.score, 3);
    assert.equal(g.round(), 4); // next round already queued
  });
  it("classic wrong press replays the same sequence", function () {
    const g = new SimonGame(rngCycle());
    g.start(false); // [0]
    g.sequence = [1, 3];
    g.beginInput();
    g.press(1); // correct first step
    const r = g.press(0); // wrong second step
    assert.equal(r.result, "wrongReplay");
    assert.equal(r.mistakes, 1);
    assert.equal(g.state, "playing");
    assert.deepEqual(g.sequence, [1, 3]);
    assert.equal(g.playerIndex, 0);
    assert.equal(g.score, 0);
  });
  it("strict wrong press ends the game", function () {
    const g = new SimonGame(rngCycle());
    g.start(true);
    g.beginInput();
    const r = g.press(3); // sequence is [0]
    assert.equal(r.result, "gameOver");
    assert.equal(g.state, "over");
    assert.equal(g.mistakes, 1);
  });
  it("presses after game over are ignored", function () {
    const g = new SimonGame(rngCycle());
    g.start(true);
    g.beginInput();
    g.press(3);
    assert.equal(g.press(0).result, "ignored");
  });
  it("reset clears everything", function () {
    const g = new SimonGame(rngCycle());
    g.start(true);
    g.score = 5;
    g.reset();
    assert.equal(g.state, "idle");
    assert.deepEqual(g.sequence, []);
    assert.equal(g.score, 0);
    assert.equal(g.mistakes, 0);
    assert.equal(g.strict, false);
  });
  it("sequence pads are always in 0..3 over 200 draws", function () {
    const g = new SimonGame();
    for (let i = 0; i < 200; i++) {
      const v = g.rng(4);
      assert.ok(v >= 0 && v <= 3 && Number.isInteger(v));
    }
  });
});

describe("bestFor", function () {
  it("keeps the higher stored best", function () {
    assert.equal(bestFor({ classic: 7 }, "classic", 5), 7);
  });
  it("adopts a new higher score", function () {
    assert.equal(bestFor({ classic: 7 }, "classic", 9), 9);
  });
  it("handles missing mode entries", function () {
    assert.equal(bestFor({}, "strict", 3), 3);
    assert.equal(bestFor(null, "classic", 0), 0);
  });
});
