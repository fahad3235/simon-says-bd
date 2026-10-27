// Headless-Chrome smoke test via raw CDP (no puppeteer dependency).
// Usage: node tests/smoke.js
// Exits non-zero on any failed assertion; fails on page console errors.
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const PORT = 9341;
const FILE = 'file://' + path.resolve(__dirname, '..', 'index.html') + '?test=1';
let failures = 0;
const pageErrors = [];
function check(name, cond, extra) {
  console.log((cond ? 'ok - ' : 'FAIL - ') + name + (cond ? '' : ' :: ' + (extra || '')));
  if (!cond) failures++;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function poll(fn, timeoutMs, label) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try { if (await fn()) return true; } catch (e) { /* retry */ }
    await wait(200);
  }
  return false;
}

(async () => {
  const chrome = spawn('/opt/meta-chromium/chrome', [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    '--remote-debugging-port=' + PORT, '--user-data-dir=/tmp/simon-smoke-' + process.pid,
    'about:blank',
  ], { stdio: 'ignore' });
  let targets = [];
  for (let i = 0; i < 50 && targets.length === 0; i++) {
    await wait(200);
    try {
      targets = JSON.parse(await new Promise((res, rej) => {
        http.get('http://127.0.0.1:' + PORT + '/json/list', (r) => {
          let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(d));
        }).on('error', rej);
      }));
    } catch (e) { /* retry */ }
  }
  if (!targets.length) { console.log('FAIL - chrome did not start'); process.exit(2); }
  const wsUrl = targets[0].webSocketDebuggerUrl;
  const ws = new WebSocket(wsUrl);
  await new Promise((res) => { ws.onopen = res; });
  let seq = 0; const pending = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      pageErrors.push(JSON.stringify(msg.params.args));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      pageErrors.push(JSON.stringify(msg.params.exceptionDetails).slice(0, 300));
    }
  };
  const send = (method, params) => new Promise((res) => {
    const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params }));
  });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate', { url: FILE });
  await wait(1500);
  const ev = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (r.result && r.result.exceptionDetails) return { error: JSON.stringify(r.result.exceptionDetails).slice(0, 300) };
    return r.result ? r.result.result.value : undefined;
  };

  check('page title contains Simon', (await ev('document.title'))?.includes('Simon'));
  check('4 pads rendered', (await ev(`document.querySelectorAll('.pad').length`)) === 4);
  check('start button visible', (await ev(`!!document.getElementById('startBtn')`)) === true);

  // Classic game: start, wait for input phase, repeat the shown pad.
  await ev(`document.getElementById('startBtn').click()`);
  check('input phase reached (round 1)', await poll(async () =>
    (await ev(`window.__simon.getState()`)) === 'input', 6000, 'input'));
  const seq1 = await ev(`window.__simon.getSequence()`);
  check('round-1 sequence has 1 pad', Array.isArray(seq1) && seq1.length === 1, JSON.stringify(seq1));
  await ev(`window.__simon.press(${seq1[0]})`);
  check('score becomes 1 after correct repeat', await poll(async () =>
    (await ev(`window.__simon.getScore()`)) === 1, 3000, 'score'));
  check('start button now reads Restart', (await ev(`document.getElementById('startBtn').textContent`)) === 'Restart');

  // Round 2: wait for input, then press a WRONG pad -> classic replays.
  check('round-2 input phase reached', await poll(async () =>
    (await ev(`window.__simon.getState()`)) === 'input', 6000, 'input2'));
  const seq2 = await ev(`window.__simon.getSequence()`);
  check('round-2 sequence has 2 pads', Array.isArray(seq2) && seq2.length === 2, JSON.stringify(seq2));
  const wrong = (seq2[0] + 1) % 4;
  await ev(`window.__simon.press(${wrong})`);
  check('wrong pad shows "Wrong! Watch again..."', await poll(async () =>
    (await ev(`document.getElementById('statusText').textContent`)) === 'Wrong! Watch again...', 3000, 'wrong-status'));

  // Strict mode: switch mode (restarts game), complete one round so the
  // game-over score is 1 (a 0 score legitimately writes no best), then a
  // wrong pad ends it.
  await ev(`document.getElementById('modeStrict').click()`);
  check('strict input phase reached', await poll(async () =>
    (await ev(`window.__simon.getState()`)) === 'input', 6000, 'strict-input'));
  const seqS = await ev(`window.__simon.getSequence()`);
  await ev(`window.__simon.press(${seqS[0]})`);
  check('strict round-2 input phase reached', await poll(async () =>
    (await ev(`window.__simon.getState()`)) === 'input', 6000, 'strict-input2'));
  const seqS2 = await ev(`window.__simon.getSequence()`);
  const wrongS = (seqS2[0] + 1) % 4;
  await ev(`window.__simon.press(${wrongS})`);
  check('strict wrong pad shows game-over panel', await poll(async () =>
    (await ev(`document.getElementById('gameOver').hidden`)) === false, 3000, 'gameover'));

  // Language toggle + Bengali digits.
  await ev(`document.getElementById('langBtn').click()`);
  check('html lang switches to bn', (await ev(`document.documentElement.lang`)) === 'bn');
  check('lang button now reads English', (await ev(`document.getElementById('langBtn').textContent`)) === 'English');
  check('round stat uses Bengali digits', /[\u09e6-\u09ef]/.test(String(await ev(`document.getElementById('statRound').textContent`))), String(await ev(`document.getElementById('statRound').textContent`)));
  check('best persists in localStorage', typeof (await ev(`localStorage.getItem('simon-says-bd-best')`)) === 'string');

  // 390px mobile check via emulation.
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await wait(600);
  const overflow = await ev(`document.documentElement.scrollWidth > 390 + 5`);
  check('390px viewport: no horizontal overflow', overflow === false, 'scrollWidth exceeded');
  check('no page console/exception errors', pageErrors.length === 0, pageErrors.join(' | '));

  ws.close(); chrome.kill();
  console.log(failures === 0 ? 'SMOKE GREEN' : 'SMOKE FAILURES: ' + failures);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error('SMOKE HARNESS ERROR', e); process.exit(2); });
