"use strict";
/* Simon Says BD \u2014 DOM wiring, Web Audio tones, playback, persistence.
   Depends on SimonLogic (js/logic.js) and SimonI18n (js/i18n.js). */
(function () {
  var LS_BEST = "simon-says-bd-best";
  var LS_LANG = "simon-says-bd-lang";
  var LS_SOUND = "simon-says-bd-sound";
  var PAD_TONES = [329.63, 261.63, 220.0, 164.81]; // E4 C4 A3 E3

  var lang = "en";
  var soundOn = true;
  var strict = false;
  var game = null;
  var playToken = 0;
  var audioCtx = null;

  try { lang = localStorage.getItem(LS_LANG) || "en"; } catch (e) {}
  if (lang !== "en" && lang !== "bn") lang = "en";
  try { soundOn = localStorage.getItem(LS_SOUND) !== "off"; } catch (e) {}

  function loadBest() {
    try {
      var raw = localStorage.getItem(LS_BEST);
      if (!raw) return { classic: 0, strict: 0 };
      var parsed = JSON.parse(raw);
      return { classic: +parsed.classic || 0, strict: +parsed.strict || 0 };
    } catch (e) { return { classic: 0, strict: 0 }; }
  }
  function saveBest(best) {
    try { localStorage.setItem(LS_BEST, JSON.stringify(best)); } catch (e) {}
  }
  var best = loadBest();

  function t(key) {
    var dict = SimonI18n.STR[lang] || SimonI18n.STR.en;
    return dict[key] !== undefined ? dict[key] : SimonI18n.STR.en[key];
  }
  function fmt(value) { return SimonI18n.fmt(value, lang); }
  function $(id) { return document.getElementById(id); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function ensureAudio() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  function tone(pad, ms) {
    if (!soundOn) return;
    var ctx = ensureAudio();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = PAD_TONES[pad];
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + ms / 1000 + 0.05);
  }
  function buzz(ms) {
    if (!soundOn) return;
    var ctx = ensureAudio();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = 110;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + ms / 1000 + 0.05);
  }

  function flash(pad, ms) {
    var el = document.querySelector('.pad[data-pad="' + pad + '"]');
    if (!el) return;
    el.classList.add("lit");
    setTimeout(function () { el.classList.remove("lit"); }, ms);
  }

  function setStatus(key) { $("statusText").textContent = t(key); }

  function renderStats() {
    var round = game ? game.round() : 0;
    var score = game ? game.score : 0;
    $("statRound").textContent = fmt(round);
    $("statScore").textContent = fmt(score);
    $("statBest").textContent = fmt(best[strict ? "strict" : "classic"]);
    var speed = game ? SimonLogic.speedForRound(game.round()) : SimonLogic.speedForRound(1);
    $("statSpeed").textContent = fmt(speed) + " ms";
    updateStartLabel();
  }

  function applyLang() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll(".pad").forEach(function (el) {
      var key = el.getAttribute("data-label");
      var num = el.getAttribute("data-pad");
      el.querySelector(".pad-label").textContent = t(key) + " (" + fmt(+num + 1) + ")";
    });
    $("modeHint").textContent = t(strict ? "strictHint" : "classicHint");
    $("langBtn").textContent = lang === "en" ? "\u09ac\u09be\u0982\u09b2\u09be" : "English";
    $("soundBtn").textContent = t(soundOn ? "soundOn" : "soundOff");
    document.documentElement.lang = lang === "bn" ? "bn" : "en";
    renderStats();
  }

  // Start doubles as Restart while a game is running; mode buttons stay
  // enabled so the player can switch modes mid-game (which restarts).
  function updateStartLabel() {
    var active = game && (game.state === "playing" || game.state === "input");
    $("startBtn").textContent = active ? t("restart") : t("start");
  }

  async function playSequence() {
    var token = ++playToken;
    var seq = game.sequence.slice();
    var step = SimonLogic.speedForRound(game.round());
    setStatus("statusWatch");
    await sleep(500);
    for (var i = 0; i < seq.length; i++) {
      if (token !== playToken) return;
      flash(seq[i], Math.round(step * 0.7));
      tone(seq[i], Math.round(step * 0.7));
      await sleep(step);
    }
    if (token !== playToken) return;
    game.beginInput();
    setStatus("statusTurn");
    renderStats();
  }

  function showGameOver() {
    var mode = strict ? "strict" : "classic";
    var newBest = SimonLogic.bestFor(best, mode, game.score);
    if (newBest !== best[mode]) {
      best[mode] = newBest;
      saveBest(best);
    }
    $("overScore").textContent = t("finalScore") + ": " + fmt(game.score);
    $("overRounds").textContent = t("finalRounds") + ": " + fmt(game.score);
    $("overMistakes").textContent = t("finalMistakes") + ": " + fmt(game.mistakes);
    $("overBest").textContent = t("best") + ": " + fmt(best[mode]);
    $("gameOver").hidden = false;
    setStatus("statusOver");
    renderStats();
  }

  function startGame() {
    ensureAudio();
    playToken++;
    $("gameOver").hidden = true;
    game = new SimonLogic.SimonGame();
    game.start(strict);
    renderStats();
    playSequence();
  }

  function onPad(pad) {
    if (!game || game.state !== "input") {
      // Tapping during playback still lights + sounds the pad (feedback only).
      if (game && game.state === "playing") { flash(pad, 200); tone(pad, 200); }
      return;
    }
    ensureAudio();
    flash(pad, 250);
    tone(pad, 250);
    var res = game.press(pad);
    if (res.result === "correct") {
      renderStats();
    } else if (res.result === "roundComplete") {
      setStatus("statusCorrect");
      renderStats();
      setTimeout(function () { if (game && game.state === "playing") playSequence(); }, 800);
    } else if (res.result === "wrongReplay") {
      buzz(300);
      setStatus("statusWrong");
      renderStats();
      setTimeout(function () { if (game && game.state === "playing") playSequence(); }, 1000);
    } else if (res.result === "gameOver") {
      buzz(500);
      showGameOver();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".pad").forEach(function (el) {
      el.addEventListener("click", function () { onPad(+el.getAttribute("data-pad")); });
    });
    document.addEventListener("keydown", function (e) {
      var map = { 1: 0, 2: 1, 3: 2, 4: 3 };
      if (map[e.key] !== undefined) onPad(map[e.key]);
    });
    $("startBtn").addEventListener("click", startGame);
    $("playAgainBtn").addEventListener("click", startGame);
    $("modeClassic").addEventListener("click", function () {
      strict = false;
      $("modeClassic").classList.add("selected");
      $("modeStrict").classList.remove("selected");
      if (game && (game.state === "playing" || game.state === "input")) startGame();
      else renderStats();
    });
    $("modeStrict").addEventListener("click", function () {
      strict = true;
      $("modeStrict").classList.add("selected");
      $("modeClassic").classList.remove("selected");
      if (game && (game.state === "playing" || game.state === "input")) startGame();
      else renderStats();
    });
    $("langBtn").addEventListener("click", function () {
      lang = lang === "en" ? "bn" : "en";
      try { localStorage.setItem(LS_LANG, lang); } catch (e) {}
      applyLang();
    });
    $("soundBtn").addEventListener("click", function () {
      soundOn = !soundOn;
      try { localStorage.setItem(LS_SOUND, soundOn ? "on" : "off"); } catch (e) {}
      applyLang();
    });
    applyLang();
    setStatus("statusIdle");
    // Test hook: only when ?test=1, so automated smoke tests can drive the game.
    if (window.location.search.indexOf("test=1") !== -1) {
      window.__simon = {
        getState: function () { return game ? game.state : "idle"; },
        getSequence: function () { return game ? game.sequence.slice() : []; },
        getScore: function () { return game ? game.score : 0; },
        press: function (pad) { onPad(pad); }
      };
    }
  });
})();
