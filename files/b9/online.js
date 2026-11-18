/* Sibyl online play: two people, two phones. The server (Vercel, /online in the repo) checks every move and runs the clocks; this file is the
   client. It reaches into index.html's globals (game, me, tc, clk...) and is only active while `net` is set. */
(function () {
  'use strict';
  const SERVER = 'https://sibyl-online.vercel.app/api/game';
  const KEY = 'sibyl.net', NAME = 'sibyl.name';
  let rm = null;            // the room we are in: { code, pid, color, v, gen, base, inc, names, over, offerSeen }
  let tok = 0;              // bumps to cancel the running poll loop
  let last = null;          // last state from the server
  let shownErr = 0;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const stored = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const keep = () => { try { if (rm) localStorage.setItem(KEY, JSON.stringify({ code: rm.code, pid: rm.pid, color: rm.color })); } catch (e) {} };
  const forget = () => { try { localStorage.removeItem(KEY); } catch (e) {} };
  const myName = () => { try { return (localStorage.getItem(NAME) || '').trim(); } catch (e) { return ''; } };
  const opp = () => (rm && last && last.names && last.names[rm.color === 'w' ? 'b' : 'w']) || 'Opponent';
  const E = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // A room lives on one server (its code's first letter says which). New games go to the healthier server; joining by code tries both.
  // On a Cloudflare room the phone keeps one WebSocket: the server pushes every change (no polling), and moves, resigns and draw offers can go over it too.
  // The room sleeps between messages on the server, which is what keeps a long game almost free. If the socket will not open, everything falls back to plain requests.
  let sock = null;            // { code, ws, open, pending, n, ping }
  const WS_ACTIONS = ['move', 'resign', 'draw', 'rematch', 'cancel'];
  const wsOk = (code) => typeof WebSocket !== 'undefined' && window.Servers && Servers.second() && /^[S-Z]/i.test(String(code || ''));
  function wsSend(body) {
    const s = sock; if (!s || !s.open || s.code !== body.code || WS_ACTIONS.indexOf(body.action) < 0) return null;
    return new Promise((res) => { const id = ++s.n, t = setTimeout(() => { s.pending.delete(id); res(null); }, 8000); s.pending.set(id, (m) => { clearTimeout(t); res(m); }); try { s.ws.send(JSON.stringify(Object.assign({}, body, { id, code: undefined, pid: undefined }))); } catch (e) { s.pending.delete(id); clearTimeout(t); res(null); } });
  }
  async function api(body, ms) {
    const viaWs = wsSend(body); if (viaWs) { const m = await viaWs; if (m && m.ok !== undefined) { delete m.id; return m; } }      // (no answer in time: ask again over plain HTTP)
    const bases = window.Servers ? (await Servers.relayBases(body.code, body.action === 'join')).map((b) => b + '/api/game') : [SERVER];
    for (let i = 0; i < bases.length; i++) {
      const ac = typeof AbortController !== 'undefined' ? new AbortController() : null, t = ac && setTimeout(() => ac.abort(), ms || 12000), last = i === bases.length - 1;
      try {
        const r = await fetch(bases[i], { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ac ? ac.signal : undefined });
        const j = await r.json();
        if (!last && body.action === 'join' && j && j.ok === false && /No game with that code/i.test(j.error || '')) continue;      // not here: maybe on the other server
        if (!last && (body.action === 'create' || body.action === 'quick') && (!j || j.ok === false)) continue;                        // this server is full or over its limit: the other one takes the game
        return j;
      } catch (e) { if (last || !(body.action === 'create' || body.action === 'quick' || body.action === 'join')) throw e; }
      finally { if (t) clearTimeout(t); }
    }
  }
  window.sibylNetApi = api;          // (for tests)
  const offlineMsg = (e) => (/abort|timeout/i.test(String(e && e.name || e)) ? 'The server took too long to answer. Try again.' : 'No internet connection right now.');

  // ------------------------------------------------------------ styles
  const css = document.createElement('style');
  css.textContent = `
  .netbox { display: flex; flex-direction: column; gap: 10px; width: min(100%, 360px); margin: 0 auto 10px }
  .netbox label { display: flex; flex-direction: column; gap: 4px; font: 500 12px var(--sans); color: var(--muted) }
  .netbox input, .netin { height: 46px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); padding: 0 14px; font: 500 16px var(--sans); user-select: text; -webkit-user-select: text; min-width: 0 }
  .netbox input:focus { outline: 2px solid var(--accent); outline-offset: 1px }
  .netjoin { display: flex; gap: 8px } .netjoin input { flex: 1; text-transform: uppercase; letter-spacing: .3em; text-align: center; font: 600 18px var(--mono) }
  .netjoin button { padding: 0 20px; height: 46px; border-radius: 10px; background: var(--surface2); border: 1px solid var(--line); font: 600 15px var(--sans) }
  .netnote { margin: 0; font: 400 12px/1.5 var(--sans); color: var(--muted); text-align: center }
  .netcode { font: 700 44px var(--mono); letter-spacing: .22em; text-align: center; padding: 10px 0 6px; color: var(--ink); user-select: text; -webkit-user-select: text }
  .netwait { text-align: center; color: var(--muted); font: 400 13px var(--sans); margin: 0 0 12px }
  .netdots::after { content: ''; animation: netd 1.4s steps(4) infinite } @keyframes netd { 0% { content: '' } 25% { content: '.' } 50% { content: '..' } 75% { content: '...' } }
  .botav.netav { display: grid; place-items: center; font: 700 17px var(--sans); color: #fff }
  #sheet .netbtns { display: flex; flex-direction: column; gap: 8px; padding: 0 14px }
  `;
  document.head.appendChild(css);

  // ------------------------------------------------------------ setup screen
  const box = $('netBox');
  window.netDraw = function () {
    const n = $('netName'); if (n && !n.dataset.init) { n.dataset.init = '1'; n.value = myName(); n.addEventListener('input', () => { try { localStorage.setItem(NAME, n.value.trim().slice(0, 16)); } catch (e) {} }); }
    const s = stored(); $('netRejoin').hidden = !s; if (s) $('netRejoin').textContent = 'Rejoin game ' + s.code;
  };
  function nameOk() { return ((window.Acct && Acct.name && Acct.name()) || ($('netName').value || '').trim() || 'Player').slice(0, 16); }
  function tcNow() { const t = tcByLabel(S.tcl); return { base: t.base, inc: t.inc }; }
  async function quickGo(name) {
    const t = tcNow();
    try {
      const r = await api({ action: 'quick', name, base: t.base, inc: t.inc });
      if (!r.ok) throw new Error(r.error || 'failed');
      enter(r, !!r.waiting, true);
    } catch (e) { toast(offlineMsg(e)); }
  }
  window.netQuickStart = function () {          // Play Random: needs a name once, then searches for an opponent
    if (rm || net) { toast('Finish your current game first'); return; }
    const n = myName(); if (n) return quickGo(n.slice(0, 16));
    openSheet('<h2>Your name</h2><p class="netwait">Your opponent will see it.</p><div class="netbtns"><input class="netin" id="nName" maxlength="16" placeholder="Player" autocomplete="off" autocapitalize="words"><button class="cta" id="nNameGo">Play</button></div>');
    $('nNameGo').onclick = () => { const v = ($('nName').value || '').trim().slice(0, 16) || 'Player'; try { localStorage.setItem(NAME, v); } catch (e) {} closeSheet(); quickGo(v); };
  };
  $('netCreate').onclick = async () => {
    const b = $('netCreate'); b.disabled = true;
    try {
      const t = tcNow(), r = await api({ action: 'create', name: nameOk(), base: t.base, inc: t.inc, color: S.side === 'w' || S.side === 'b' ? S.side : undefined });
      if (!r.ok) throw new Error(r.error || 'failed');
      enter(r, true);
    } catch (e) { toast(offlineMsg(e)); } finally { b.disabled = false; }
  };
  $('netJoin').onclick = async () => {
    const code = ($('netCode').value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length < 5) return toast('Type the 5-letter code');
    const b = $('netJoin'); b.disabled = true;
    try {
      const r = await api({ action: 'join', code, name: nameOk() });
      if (!r.ok) { toast(r.error || 'Could not join'); return; }
      enter(r, false);
    } catch (e) { toast(offlineMsg(e)); } finally { b.disabled = false; }
  };
  $('netRejoin').onclick = async () => {
    const s = stored(); if (!s) return;
    try {
      const r = await api({ action: 'join', code: s.code, pid: s.pid, name: nameOk() });
      if (!r.ok) { forget(); netDraw(); toast('That game is gone'); return; }
      if (r.state.status === 'over') { forget(); netDraw(); toast('That game has finished'); return; }
      enter(r, r.state.status === 'waiting');
    } catch (e) { toast(offlineMsg(e)); }
  };
  $('netCode').addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5); });

  const LINK = 'https://sibyl-online.vercel.app/j/';
  function enter(r, waiting, quick) {
    rm = { code: r.state.code, pid: r.pid, color: r.color, v: -1, gen: r.state.gen, over: false, offerSeen: 0, quick: !!quick }; last = r.state; keep();
    tok++; loop(tok);
    if (r.state.status === 'waiting') return waitSheet(!!quick);
    startGame(r.state);
  }
  // how long finding a random opponent usually takes at this time control (the server keeps the last day's pairings)
  const secsText = (n) => (n < 60 ? n + (n === 1 ? ' second' : ' seconds') : Math.floor(n / 60) + ' min' + (n % 60 ? ' ' + (n % 60) + ' s' : ''));
  function queueText(q, searching) {
    if (!q || !q.ok) return '';
    if (q.waiting && !searching) return 'Someone is waiting for this right now: you should be matched in a moment.';
    if (q.n >= 3) return 'Players usually find a match in about ' + secsText(Math.max(1, q.median)) + (q.p80 > q.median + 4 ? ', most within ' + secsText(q.p80) : '') + '. (' + q.n + ' matches in the last day)';
    if (q.n > 0) return 'Few recent matches here; the last ' + (q.n === 1 ? 'one' : q.n) + ' took about ' + secsText(Math.max(1, q.median)) + '.';
    return 'No one has been matched here in the last day, so you may be first in line and wait a while.';
  }
  const qCache = {};
  async function queueInfo(t, mine) {
    const key = t.base + '+' + t.inc + (mine || ''), c = qCache[key]; if (c && Date.now() - c.at < 20000) return c.q;
    try { const q = await api({ action: 'qinfo', base: t.base, inc: t.inc, mine, code: mine || undefined }, 6000); qCache[key] = { at: Date.now(), q }; return q; } catch (e) { return null; }
  }
  window.netQueueInfo = async (t) => queueText(await queueInfo(t || tcNow(), ''), false);
  function waitSheet(quick) {
    if (quick) {
      const tcq = last && last.base ? { base: last.base, inc: last.inc } : tcNow(), code0 = rm && rm.code;
      openSheet('<h2>Finding an opponent</h2><p class="netwait">Looking for someone to play ' + (last && last.base ? tcLabel({ base: last.base, inc: last.inc }) : 'with no clock') + '.<br><span class="netdots">Searching</span> <b id="netEl">0:00</b></p>' +
        '<p class="netwait netq" id="netQ">Checking how long this usually takes…</p><div class="netbtns"><button class="ghost" id="nCancel">Cancel</button></div>');
      const t0 = Date.now(), tick = setInterval(() => { const el = $('netEl'); if (!el || !rm || rm.code !== code0) { clearInterval(tick); return; } const s = Math.floor((Date.now() - t0) / 1000); el.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }, 1000);
      queueInfo(tcq, code0).then((q) => { const el = $('netQ'); if (el) el.textContent = queueText(q, true) || ''; });
    }
    else openSheet('<h2>Your room is ready</h2><div class="netcode" id="netShowCode">' + E(rm.code) + '</div><p class="netwait">Send your friend the invite.<br>They tap the link, or type the code under <b>Online</b>.<br><span class="netdots">Waiting for them</span></p>' +
      '<div class="netbtns"><button class="cta" id="nShare">Invite a friend</button><button class="ghost" id="nCancel">Cancel</button></div>');
    if ($('nShare')) $('nShare').onclick = () => shareText('Play chess with me on Sibyl', 'Play chess with me on Sibyl! Tap to join my game: ' + LINK + rm.code + '\n(or open Sibyl, New Game, Online, and enter the code ' + rm.code + ')');
    $('nCancel').onclick = async () => { const r = rm; stop(); closeSheet(); if (r) { try { await api({ action: 'cancel', code: r.code, pid: r.pid }, 6000); } catch (e) {} } };
  }
  function stop() { tok++; rm = null; last = null; forget(); if (sock) { try { sock.ws.close(); } catch (e) {} sock = null; } if (typeof netDraw === 'function') netDraw(); }

  // ------------------------------------------------------------ the game
  function startGame(st) {
    closeSheet();
    netNext = { color: rm.color, tc: { name: 'Online', base: st.base, inc: st.inc }, state: st };
    newGame();
  }
  window.netBegun = function () {          // called by newGame once the board is set up for a net game
    const st = net.state, o = (st.names[rm.color === 'w' ? 'b' : 'w'] || 'Opponent');
    last = st;
    $('oppname').textContent = o; document.querySelector('#game .gtitle b').textContent = o;
    $('lvlname').textContent = 'Online · ' + (st.base ? tcLabel(net.tc) : 'no clock') + ' · casual';
    const tb = $('topbar'), orb = tb.querySelector('.orb'), old = tb.querySelector('.botav'); if (old) old.remove();
    orb.style.display = 'none';
    const f = document.createElement('span'); f.className = 'botav netav'; f.textContent = (o[0] || '?').toUpperCase();
    let h = 0; for (const ch of o) h = (h * 31 + ch.charCodeAt(0)) % 360; f.style.background = 'hsl(' + h + ' 45% 42%)'; orb.before(f);
    $('depth').textContent = ''; setSay(o + ' · ' + (rm.color === 'w' ? 'you have White' : 'you have Black'));
    rm.over = false; rm.offerSeen = 0; rm.gen = st.gen; rm.v = -1; rm.rem = false;
    apply(st);
  };
  window.netLive = () => !!(rm && last && last.status === 'playing' && !rm.over);       // a game is on (premoves are allowed while it is the other player's turn)
  function playPremove() {
    const pm = premoves.shift(), legal = game.moves({ square: pm.from, verbose: true }).filter((m) => m.to === pm.to);
    if (legal.length) setTimeout(() => { if (net && myTurn()) commitMove({ from: pm.from, to: pm.to, promotion: legal.some((m) => m.promotion) ? 'q' : undefined }); }, 90);
    else { const n = premoves.length + 1; premoves = []; drawMarks(); status((n > 1 ? n + ' premoves' : 'Premove') + ' cancelled: no longer legal.', true); buzz([10, 30, 10]); }
  }
  window.netMoved = function (mv) {        // you just moved on the board: tell the server
    status('Waiting for ' + opp() + '…', false);
    sendMove(mv, 0);
  };
  async function sendMove(mv, tries) {
    const my = tok;
    try {
      const r = await api({ action: 'move', code: rm.code, pid: rm.pid, from: mv.from, to: mv.to, promotion: mv.promotion });
      if (my !== tok || !rm) return;
      if (r.state) onState(r.state, true);
      if (!r.ok && !r.state) throw new Error(r.error || 'move failed');
    } catch (e) {
      if (my !== tok || !rm) return;
      if (tries < 6) { status('Connection lost. Retrying…', false); await sleep(1200 + tries * 600); if (my === tok && rm && !rm.over) return sendMove(mv, tries + 1); }
      else status('Connection lost. Check your internet.', false);
    }
  }
  // the socket for the room we are in; returns true when this loop is finished with (we left), false when the socket cannot be used (then the polling loop below takes over)
  async function wsLoop(my) {
    let fails = 0;
    while (my === tok && rm) {
      const opened = await new Promise((resolve) => {
        let ws, got = false;
        try { ws = new WebSocket(Servers.second().replace(/^http/, 'ws') + '/ws/' + rm.code + '?pid=' + encodeURIComponent(rm.pid)); } catch (e) { return resolve(false); }
        if (sock) { try { sock.ws.close(); } catch (e) {} }
        const s = { code: rm.code, ws, open: false, pending: new Map(), n: 0, ping: null }; sock = s;
        const guard = setTimeout(() => { if (!got) { try { ws.close(); } catch (e) {} } }, 7000);
        ws.onopen = () => { got = true; s.open = true; s.ping = setInterval(() => { try { ws.send('ping'); } catch (e) {} }, 30000); };
        ws.onmessage = (ev) => {
          if (ev.data === 'pong') return; let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
          if (m.id && s.pending.has(m.id)) { s.pending.get(m.id)(m); s.pending.delete(m.id); return; }
          if (my !== tok || !rm) return;
          if (m.error === 'gone' || m.error === 'not in this game') { gone(); return; }
          if (m.state) { if (fails) refreshStatus(); fails = 0; onState(m.state, false); }
        };
        ws.onclose = () => { clearTimeout(guard); clearInterval(s.ping); s.open = false; if (sock === s) sock = null; s.pending.forEach((f) => f(null)); resolve(got); };
        ws.onerror = () => {};
      });
      if (my !== tok || !rm) return true;
      if (!opened) { if (++fails >= 2) return false; await sleep(800); }
      else { fails = 1; if (net) status('Connection lost. Reconnecting…', false); await sleep(900); }
    }
    return true;
  }
  async function loop(my) {
    if (rm && wsOk(rm.code) && await wsLoop(my)) return;
    if (my !== tok || !rm) return;
    let fails = 0;
    while (my === tok && rm) {
      try {
        const r = await api({ action: 'state', code: rm.code, pid: rm.pid, v: rm.v }, 16000);
        if (my !== tok || !rm) return;
        if (!r.ok) { if (r.error === 'gone' || r.error === 'not in this game') { gone(); return; } await sleep(2000); continue; }
        if (fails >= 2) { fails = 0; refreshStatus(); }
        fails = 0; onState(r.state, false);
      } catch (e) {
        if (my !== tok || !rm) return;
        if (++fails === 2 && net) status('Connection lost. Reconnecting…', false);
        await sleep(Math.min(5000, 1000 + fails * 700));
      }
    }
  }
  function gone() {
    const was = !!net; stop();
    if (was && net) { net = null; flagged = true; running = null; drawClocks(); }
    closeSheetOnly(); toast('That game has ended'); if (was) show('home');
  }
  function onState(st, force) {
    if (!rm || st.code !== rm.code) return;
    if (!force && st.v === rm.v) return;                 // a poll that timed out with nothing new
    if (st.v < rm.v && st.gen === rm.gen) return;        // an older answer arriving late
    rm.v = Math.max(st.v, rm.v); last = st;
    if (st.gen !== rm.gen) { rm.gen = st.gen; rm.color = st.me; keep(); if (st.status === 'playing') startGame(st); return; }
    if (rm.color !== st.me) { rm.color = st.me; keep(); }
    if (st.status === 'waiting') return;
    if (!net && st.status === 'over' && st.result && st.result.how === 'cancelled') { stop(); closeSheetOnly(); return; }
    if (!net) { if (st.status === 'playing') startGame(st); else if (st.status === 'over' && !$('game').classList.contains('off')) {} return; }
    apply(st);
  }

  function replay(want) {
    game.reset();
    for (const u of want) if (!game.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] || undefined })) break;
  }
  function apply(st) {
    const hist = game.history({ verbose: true }).map((m) => m.from + m.to + (m.promotion || ''));
    const want = st.moves, prefix = hist.length <= want.length && hist.every((u, i) => want[i] === u);
    selected = null;
    if (!prefix) { replay(want); syncPieces(false); }
    else if (want.length > hist.length) {
      const fresh = want.slice(hist.length); let mv = null;
      if (premoves.length) syncPieces(false);          // show the real position before their move slides in
      for (const u of fresh) mv = game.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] || undefined });
      if (fresh.length === 1 && mv) animateMove(mv); else syncPieces(false);
      if (mv) { if (game.turn() === rm.color && !game.game_over()) buzz(12); }
    }
    const h = game.history({ verbose: true }); lastMove = h.length ? [h[h.length - 1].from, h[h.length - 1].to] : null;
    clearArrows(); drawMarks(); drawTrays(); drawMoves(); gameChrome();
    // clocks: the server's numbers are the truth; the side to move runs from now
    if (st.base > 0) {
      clk = { w: st.clk.w, b: st.clk.b };
      running = st.status === 'playing' ? st.turn : null; runFrom = performance.now(); paused = false; tickClocks();
    }
    if (st.status === 'over') return finish(st);
    refreshStatus();
    if (premoves.length && game.turn() === rm.color) playPremove();
    // draw offers
    const them = rm.color === 'w' ? 'b' : 'w';
    if (st.drawOffer === them && rm.offerSeen !== st.v) { rm.offerSeen = st.v; drawOfferSheet(); }
    else if (!st.drawOffer && rm.mineOffered) { rm.mineOffered = false; toast(opp() + ' declined the draw'); }
    else if (st.drawOffer === rm.color) rm.mineOffered = true;
  }
  function refreshStatus() {
    if (!net || !rm || !last || last.status !== 'playing') return;
    const mine = game.turn() === rm.color;
    status(mine ? (game.in_check() ? 'Check! Your move.' : 'Your move.') : 'Waiting for ' + opp() + '…', mine);
  }

  // ------------------------------------------------------------ draw / resign
  function drawOfferSheet() {
    openSheet('<h2>' + E(opp()) + ' offers a draw</h2><div class="netbtns"><button class="cta" id="nAcc">Accept draw</button><button class="ghost" id="nDec">Decline</button></div>');
    $('nAcc').onclick = async () => { closeSheet(); await act({ action: 'draw', what: 'accept' }); };
    $('nDec').onclick = async () => { closeSheet(); await act({ action: 'draw', what: 'decline' }); };
  }
  async function act(body) {
    if (!rm) return;
    try { const r = await api(Object.assign({ code: rm.code, pid: rm.pid }, body)); if (r.state) onState(r.state, true); else if (!r.ok) toast(r.error || 'Failed'); }
    catch (e) { toast(offlineMsg(e)); }
  }
  window.netMenu = function () {
    if (!rm || rm.over) return;
    const o = last && last.drawOffer, them = rm.color === 'w' ? 'b' : 'w';
    if (o === them) return drawOfferSheet();
    openSheet('<h2>Game options</h2><div class="netbtns">' + (o === rm.color ? '<button class="ghost" disabled>Draw offered, waiting…</button>' : '<button class="ghost" id="nDraw">Offer a draw</button>') +
      '<button class="ghost" id="nRes">Resign</button><button class="cta" id="nNo">Keep playing</button></div>');
    $('nNo').onclick = closeSheet;
    if ($('nDraw')) $('nDraw').onclick = async () => { closeSheet(); toast('Draw offered'); rm.mineOffered = true; await act({ action: 'draw', what: 'offer' }); };
    $('nRes').onclick = () => {
      openSheet('<h2>Resign this game?</h2><div class="netbtns"><button class="cta" id="nYes">Yes, resign</button><button class="ghost" id="nNo2">Keep playing</button></div>');
      $('nNo2').onclick = closeSheet; $('nYes').onclick = async () => { closeSheet(); await act({ action: 'resign' }); };
    };
  };
  window.netLeave = function () { net = null; stop(); };

  // ------------------------------------------------------------ the end
  const HOW = { checkmate: 'by Checkmate', resignation: 'by Resignation', timeout: 'on Time', stalemate: 'by Stalemate', 'insufficient material': 'Not enough material', repetition: 'by Repetition', 'fifty-move rule': 'by the Fifty-move rule', agreement: 'by Agreement' };
  function finish(st) {
    premoves = [];
    if (rm.over) { if (st.rematch) endUpdate(st); return; }
    rm.over = true; forget();
    flagged = true; running = null; drawClocks(); gid++; thinking = false;
    const w = st.result && st.result.winner, how = st.result && st.result.how, won = w === rm.color, drew = !w;
    const kind = drew ? 'draw' : won ? 'win' : 'lose';
    const by = HOW[how] || how || '';
    status(drew ? 'Draw ' + by.toLowerCase() + '.' : (won ? 'You win ' : opp() + ' wins ') + by.toLowerCase() + '.', true);
    sfx[kind](); buzz([30, 60, 30]); if (won) confetti();
    if (!drew && how !== 'timeout' && how !== 'resignation') toppleKing(won ? (rm.color === 'w' ? 'b' : 'w') : rm.color);
    // keep it in the games list (online games do not change your rating)
    let rec = null;
    try {
      if (st.moves.length >= 2) {
        const hs = loadHistory(); rec = { id: Date.now(), date: new Date().toISOString(), me: rm.color, opp: opp(), elo: '', tcl: st.base ? tcLabel(net ? net.tc : { base: st.base, inc: st.inc }) : '∞', result: drew ? 'draw' : won ? 'win' : 'loss', how: String(how || ''), moves: st.moves.slice(), online: true };
        hs.unshift(rec); saveHistory(hs); lastGameId = rec.id;
      }
    } catch (e) {}
    setTimeout(() => endSheet(st, rec, won, drew, by), 900);
  }
  function endSheet(st, rec, won, drew, by) {
    if (!rm) return;
    $('sheet').classList.add('endcard');
    openSheet('<div class="ehead"><h2>' + (drew ? 'Draw' : won ? 'You won!' : E(opp()) + ' won') + '</h2><div class="eby">' + E(by) + '</div></div>' +
      '<div class="ecounts"><p>' + Math.ceil(st.moves.length / 2) + ' moves · casual game, no rating change</p></div>' +
      (rec ? '<button class="cta big" id="nReview">Game Review</button>' : '') +
      '<div class="erow"><button id="nNew">Leave</button><button id="nRe">Rematch</button></div>');
    if (rec) $('nReview').onclick = () => { closeSheetOnly(); const g = loadHistory().find((x) => x.id === rec.id) || rec; startReview(g); };
    $('nNew').onclick = () => { closeSheet(); netLeave(); show('home'); };
    $('nRe').onclick = async () => { $('nRe').disabled = true; $('nRe').textContent = 'Waiting…'; await act({ action: 'rematch' }); };
    endUpdate(st);
  }
  function endUpdate(st) {
    const b = $('nRe'); if (!b || !rm) return;
    const them = rm.color === 'w' ? 'b' : 'w';
    if (st.rematch && st.rematch.includes(them) && !st.rematch.includes(rm.color)) b.textContent = 'Accept rematch';
  }

  // ------------------------------------------------------------ invite links: sibyl://join/CODE opens the app and joins that room
  async function joinCode(code) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    if (code.length < 5) return;
    if (rm || net || (typeof gameLocked === 'function' && gameLocked())) { toast('Finish your current game first'); return; }
    openSetup('friend');
    toast('Joining room ' + code + '…');
    try {
      const r = await api({ action: 'join', code, name: nameOk() });
      if (!r.ok) { toast(r.error || 'Could not join'); return; }
      enter(r, false);
    } catch (e) { toast(offlineMsg(e)); }
  }
  window.sibylInvite = joinCode;
  const askInvite = () => {            // a link opened Sibyl from cold: the app stored the code for us
    try { if ($('title').classList.contains('off') && window.SibylShare && SibylShare.takeInvite) { const c = SibylShare.takeInvite(); if (c) joinCode(c); } } catch (e) {}
  };
  setInterval(askInvite, 1000);

  document.addEventListener('visibilitychange', () => {   // back from another app: ask the server right away instead of waiting out a stalled request
    if (document.visibilityState === 'visible' && rm) { tok++; loop(tok); }
  });
  window.addEventListener('online', () => { if (rm) { tok++; loop(tok); } });
})();
