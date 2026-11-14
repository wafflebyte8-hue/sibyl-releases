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

  async function api(body, ms) {
    const ac = typeof AbortController !== 'undefined' ? new AbortController() : null, t = ac && setTimeout(() => ac.abort(), ms || 12000);
    try {
      const r = await fetch(SERVER, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ac ? ac.signal : undefined });
      return await r.json();
    } finally { if (t) clearTimeout(t); }
  }
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
  function nameOk() { return (($('netName').value || '').trim() || 'Player').slice(0, 16); }
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
  function waitSheet(quick) {
    if (quick) openSheet('<h2>Finding an opponent</h2><p class="netwait">Looking for someone to play ' + (last && last.base ? tcLabel({ base: last.base, inc: last.inc }) : 'with no clock') + '.<br><span class="netdots">Searching</span></p>' +
      '<div class="netbtns"><button class="ghost" id="nCancel">Cancel</button></div>');
    else openSheet('<h2>Your room is ready</h2><div class="netcode" id="netShowCode">' + E(rm.code) + '</div><p class="netwait">Send your friend the invite.<br>They tap the link, or type the code under <b>Online</b>.<br><span class="netdots">Waiting for them</span></p>' +
      '<div class="netbtns"><button class="cta" id="nShare">Invite a friend</button><button class="ghost" id="nCancel">Cancel</button></div>');
    if ($('nShare')) $('nShare').onclick = () => shareText('Play chess with me on Sibyl', 'Play chess with me on Sibyl! Tap to join my game: ' + LINK + rm.code + '\n(or open Sibyl, New Game, Online, and enter the code ' + rm.code + ')');
    $('nCancel').onclick = async () => { const r = rm; stop(); closeSheet(); if (r) { try { await api({ action: 'cancel', code: r.code, pid: r.pid }, 6000); } catch (e) {} } };
  }
  function stop() { tok++; rm = null; last = null; forget(); if (typeof netDraw === 'function') netDraw(); }

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
  async function loop(my) {
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
