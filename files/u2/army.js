// Legion (Sibyl 5.4): online games where a long streak changes how your pieces MOVE.
//
//  * Your streak's strength gives you a level 0..5 (Plain, Bronze, Silver, Gold, Aurora, Legend; see TIERS in daily.js). Every level changes one more kind of piece for you
//    (the rules are in legionrules.js, which the server uses too to check every move).
//  * You can only play other people: "near my strength" (a player whose strength is at most 3 away) or "random opponent" (anyone). Friends can challenge each other in Legion too.
//  * The other side sees exactly how your pieces differ: the pieces that move differently glow in your level's colour and carry a "+", a card at the start lists the changes of both
//    players, and the Abilities button in the game shows it again.
//  * You arrange your own back row (the same 8 pieces in any order); pawns stay where they are. Casual: not rated; a lost game takes 1 strength, never the streak.
'use strict';
(() => {
  const LR = window.LegionRules, KEY = 'sibyl.army';
  const NAME = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King' };
  const TIMES = ['3+2', '5+3', '10+5', '15+10'];
  const TC = { 1: ['#e0903a', '#f6c48a'], 2: ['#cfe3ff', '#ffffff'], 3: ['#ffd24a', '#fff2a8'], 4: ['#5ef0ff', '#b07cff'], 5: ['#ff7a2e', '#ffd24a'] };
  const STD = 'RNBQKBNR';
  let st = null;

  function T(s) { return window.I18N && I18N.T ? I18N.T.apply(null, arguments) : s.replace(/\{(\d)\}/g, (_, i) => (arguments[+i + 1] == null ? '' : arguments[+i + 1])); }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const el = (id) => document.getElementById(id);
  const power = () => (window.Daily ? Daily.state().power : 0);
  const level = () => LR.levelOf(power());
  const tierName = (lv) => LR.NAMES[lv];
  function saved() { try { const x = JSON.parse(localStorage.getItem(KEY) || 'null'); return x && LR.validRow(x.row) ? x : null; } catch (e) { return null; } }
  const rowNow = () => { const s = saved(); return s ? s.row.toUpperCase() : STD; };
  // what the phone sends when it creates, joins or searches for a Legion game: its strength (the server turns it into a level) and its own back row
  function payload() { return { legion: { strength: power(), row: rowNow() }, mode: st && st.mode ? st.mode : 'near' }; }
  const piece = (t, color) => { try { return pieceSVG(t, color, 'sibyl'); } catch (e) { return t; } };

  // ---- the list of what a level changes, for one side
  function listHtml(lv, color) {
    const d = LR.describe(lv);
    if (!d.length) return '<p class="anote">' + esc(T('Plain chess: no piece moves differently yet.')) + '</p>';
    return '<ul class="ablist">' + d.map((x) => '<li><span class="abpc" data-lv' + color + '="' + lv + '">' + piece(x.piece, color) + '</span><span>' + esc(T(x.text)) + '</span></li>').join('') + '</ul>';
  }
  function sideCard(label, lv, str, color) {
    return '<div class="abcard" data-lv="' + lv + '"><div class="abhead"><b>' + esc(label) + '</b><b class="tierbadge" data-fx="' + lv + '">' + esc(T(tierName(lv))) + '</b><small>' + esc(T('strength {0}', str)) + '</small></div>' + listHtml(lv, color) + '</div>';
  }
  // ---- the card that shows how both sides' pieces differ (at the start of a game, and from the Abilities button)
  function sheet(title, withPlay) {
    const info = typeof army !== 'undefined' && army, n = typeof net !== 'undefined' && net;
    if (!info || !n) { return; }
    const mine = n.color, them = mine === 'w' ? 'b' : 'w', names = (n.state && n.state.names) || {};
    openSheet('<h2>' + esc(T(title)) + '</h2><div class="abwrap">' + sideCard(T('You'), info.lv[mine], info.str[mine], mine) + sideCard(names[them] || T('Opponent'), info.lv[them], info.str[them], them) +
      '</div><p class="anote">' + esc(T('The pieces that move differently glow and carry a +.')) + '</p><div class="stk"><button class="cta" id="abOk">' + esc(withPlay ? T('Play') : T('Close')) + '</button></div>');
    el('abOk').onclick = () => closeSheet();
  }
  const abilities = () => sheet('How the pieces differ', false);
  const matchup = () => sheet('Legion match', true);

  // ---- the Legion screen: your level, your back row, and two ways to find an opponent
  function draw() {
    const pw = window.Daily ? Daily.state() : { power: 0, streak: 0, cooling: false }, lv = level(), nxt = window.Daily ? Daily.nextTier(pw.power) : null;
    const row = st.row.split(''), cur = TIMES.includes(S.tcl) ? S.tcl : '10+5';
    let cells = '';
    for (let i = 0; i < 8; i++) cells += '<span class="acell pawnrow ' + ((i % 2) ? 'dk' : 'lt') + '" data-t="p">' + piece('p', 'w') + '</span>';
    for (let i = 0; i < 8; i++) { const t = row[i].toLowerCase(); cells += '<button class="acell ' + (((i + 1) % 2) ? 'dk' : 'lt') + (st.sel === i ? ' sel' : '') + '" data-i="' + i + '" data-t="' + t + '" aria-label="' + NAME[t] + '">' + piece(t, 'w') + '</button>'; }
    el('armyBody').innerHTML = '<div class="abox">' +
      '<div class="afx"><b class="tierbadge" data-fx="' + lv + '">' + esc(T(tierName(lv))) + '</b><span>' + esc(T('Strength {0}', pw.power)) + ' · ' + esc(T('{0} days', pw.streak)) + '</span></div>' +
      (pw.cooling ? '<p class="anote"><em>' + esc(T('Your streak is cooling, so some strength is missing. Play every day to get it back.')) + '</em></p>' : '') +
      '<h3 class="abh">' + esc(T('Your pieces')) + '</h3>' + listHtml(lv, 'w') +
      (nxt ? '<p class="anote">' + esc(T('Next: {0} at strength {1}.', T(nxt.name), nxt.min)) + '</p>' + listNext(nxt.i) : '') +
      '<h3 class="abh">' + esc(T('Your back row')) + '</h3><div class="agrid" data-lv="' + lv + '">' + cells + '</div>' +
      '<p class="anote">' + esc(T('Tap two pieces on the back row to swap them. Pawns stay where they are.')) + '</p>' +
      '<div class="arow"><button class="ghost" id="aStd">' + esc(T('Normal order')) + '</button><button class="ghost" id="aShuf">' + esc(T('Shuffle')) + '</button></div>' +
      '<h3 class="abh">' + esc(T('Time')) + '</h3><div class="aseg" id="aTime">' + TIMES.map((t) => '<button data-t="' + t + '" class="' + (t === cur ? 'on' : '') + '">' + t + '</button>').join('') + '</div>' +
      '<button class="cta big" id="aNear">' + esc(T('Find someone near my strength')) + '</button>' +
      '<button class="ghost big" id="aAny">' + esc(T('Random opponent')) + '</button>' +
      '<p class="anote">' + esc(T('You play other people. Casual: not rated. A lost game takes 1 strength, never the streak. Castling works when your king is on d or e and your rooks are in the corners. To play a friend, pick Legion when you challenge them.')) + '</p></div>';
    el('armyBody').querySelectorAll('.acell[data-i]').forEach((b) => { b.onclick = () => tap(+b.dataset.i); });
    el('aStd').onclick = () => { st.row = STD; st.sel = null; persist(); draw(); };
    el('aShuf').onclick = () => { const a = STD.split(''); for (let i = 7; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } st.row = a.join(''); st.sel = null; persist(); draw(); };
    el('aTime').querySelectorAll('button').forEach((b) => { b.onclick = () => { S.tcl = b.dataset.t; try { saveSettings(); } catch (e) { } draw(); }; });
    el('aNear').onclick = () => go('near'); el('aAny').onclick = () => go('any');
  }
  function listNext(i) { const d = LR.describe(i).filter((x) => x.level === i); return d.length ? '<ul class="ablist">' + d.map((x) => '<li><span class="abpc">' + piece(x.piece, 'w') + '</span><span>' + esc(T(x.text)) + '</span></li>').join('') + '</ul>' : ''; }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify({ row: st.row, mode: st.mode })); } catch (e) { } }
  function tap(i) {
    if (st.sel == null) { st.sel = i; draw(); return; }
    if (st.sel !== i) { const a = st.row.split(''); [a[st.sel], a[i]] = [a[i], a[st.sel]]; st.row = a.join(''); persist(); }
    st.sel = null; draw();
  }
  function go(mode) {
    st.mode = mode; persist();
    if (typeof netQuickStart !== 'function') { if (typeof toast === 'function') toast('Online play is not ready'); return; }
    netQuickStart({ variant: 'legion', mode });
  }
  function open() {
    const s = saved(); st = { row: s ? s.row.toUpperCase() : STD, mode: s && s.mode ? s.mode : 'near', sel: null };
    show('army'); draw();
  }

  // ------------------------------------------------------------------ the effects: the pieces that move differently glow in their owner's level colour and carry a +
  // #game gets data-lvw and data-lvb (each side's level) during a Legion game; only the pieces a level has changed are marked (UNLOCK in legionrules.js).
  function applyFx() {
    const g = document.getElementById('game'); if (!g) return;
    if (typeof army !== 'undefined' && army && army.lv) { g.dataset.lvw = String(army.lv.w); g.dataset.lvb = String(army.lv.b); }
    else { delete g.dataset.lvw; delete g.dataset.lvb; }
  }
  function burst(sq) {          // sparks where you captured something
    try {
      const layer = document.getElementById('pieces'), g = document.getElementById('game'), n = typeof net !== 'undefined' && net; if (!layer || !g || !n || typeof place !== 'function') return;
      const lv = +g.dataset['lv' + n.color] || 0; if (lv < 1) return;
      const cnt = 6 + 3 * lv, b = document.createElement('div'); b.className = 'fxburst'; b.style.setProperty('--fxc', TC[lv][0]); b.style.setProperty('--fxd', TC[lv][1]); place(b, sq);
      for (let i = 0; i < cnt; i++) { const s = document.createElement('i'), a = (i / cnt) * 6.283 + Math.random() * .5, d = 22 + Math.random() * 26; s.style.setProperty('--dx', Math.round(Math.cos(a) * d) + '%'); s.style.setProperty('--dy', Math.round(Math.sin(a) * d) + '%'); s.style.animationDelay = Math.round(Math.random() * 60) + 'ms'; b.appendChild(s); }
      layer.appendChild(b); setTimeout(() => b.remove(), 800);
    } catch (e) { }
  }
  const both = (f) => ['w', 'b'].map(f).join(',');
  const typesAt = (k) => Object.keys(LR.UNLOCK).filter((t) => LR.UNLOCK[t] <= k);
  let fx = '';
  for (const c of ['w', 'b']) for (const k of [1, 2, 3, 4, 5]) {
    const base = typesAt(k).map((t) => '#game[data-lv' + c + '="' + k + '"] .pc[data-c="' + c + '"][data-t="' + t + '"]'), svgSel = base.map((s) => s + ' svg').join(','), col = TC[k];
    const glow = k === 1 ? 'drop-shadow(0 0 2px ' + col[0] + ') drop-shadow(0 0 4px ' + col[0] + ')' : k === 2 ? 'drop-shadow(0 0 2px ' + col[0] + ') drop-shadow(0 0 6px ' + col[0] + ')' : 'drop-shadow(0 0 2px ' + col[1] + ') drop-shadow(0 0 7px ' + col[0] + ')';
    fx += svgSel + '{--fxc:' + col[0] + ';--fxd:' + col[1] + ';filter:' + glow + ' drop-shadow(0 3px 2px #0006)!important;' + (k === 2 ? 'animation:fxpulse 3s ease-in-out infinite' : k === 3 ? 'animation:fxpulse 2s ease-in-out infinite' : k === 4 ? 'animation:fxaur 5s linear infinite' : k === 5 ? 'animation:fxfire 1.4s ease-in-out infinite' : '') + '}';
    fx += base.map((s) => s + '::before').join(',') + '{content:"+";position:absolute;left:4%;top:4%;width:30%;height:30%;border-radius:50%;background:' + col[0] + ';color:#111;font:900 .9em/1 var(--sans);display:grid;place-items:center;box-shadow:0 0 5px ' + col[0] + ';z-index:3;pointer-events:none}';
    if (k >= 3) fx += base.map((s) => s + '::after').join(',') + '{content:"";position:absolute;right:14%;top:12%;width:14%;height:14%;border-radius:50%;background:radial-gradient(circle,#fff 0,' + col[1] + ' 40%,transparent 70%);pointer-events:none;opacity:0;animation:' + (k === 5 ? 'fxember 1.8s ease-out infinite' : 'fxspark 2.6s ease-in-out infinite') + '}';
  }
  // the same glow on the Legion screen (your back row) and in the card
  for (const k of [1, 2, 3, 4, 5]) fx += typesAt(k).map((t) => '.agrid[data-lv="' + k + '"] .acell[data-t="' + t + '"] svg,.abpc[data-lvw="' + k + '"] svg,.abpc[data-lvb="' + k + '"] svg').join(',') + '{filter:drop-shadow(0 0 2px ' + TC[k][1] + ') drop-shadow(0 0 5px ' + TC[k][0] + ')}';
  fx += '@keyframes fxpulse{0%,100%{filter:drop-shadow(0 0 2px var(--fxc)) drop-shadow(0 0 4px var(--fxc)) drop-shadow(0 3px 2px #0006)}50%{filter:drop-shadow(0 0 3px var(--fxd)) drop-shadow(0 0 10px var(--fxc)) drop-shadow(0 3px 2px #0006)}}' +
    '@keyframes fxaur{0%,100%{filter:drop-shadow(0 0 2px #fff) drop-shadow(0 0 8px #5ef0ff) drop-shadow(0 3px 2px #0006)}33%{filter:drop-shadow(0 0 2px #fff) drop-shadow(0 0 9px #b07cff) drop-shadow(0 3px 2px #0006)}66%{filter:drop-shadow(0 0 2px #fff) drop-shadow(0 0 9px #6dffa0) drop-shadow(0 3px 2px #0006)}}' +
    '@keyframes fxfire{0%,100%{filter:drop-shadow(0 0 2px #ffd24a) drop-shadow(0 0 8px #ff7a2e) drop-shadow(0 3px 2px #0006)}50%{filter:drop-shadow(0 0 3px #fff2a8) drop-shadow(0 -2px 12px #ff4a1c) drop-shadow(0 3px 2px #0006)}}' +
    '@keyframes fxspark{0%,60%,100%{opacity:0;transform:scale(.3)}75%{opacity:1;transform:scale(1.1)}85%{opacity:.8;transform:scale(.7)}}' +
    '@keyframes fxember{0%{opacity:0;transform:translate(0,40%) scale(.5)}20%{opacity:1}100%{opacity:0;transform:translate(10%,-170%) scale(.2)}}' +
    '.fxburst{position:absolute;width:12.5%;height:12.5%;left:0;top:0;pointer-events:none;z-index:5}.fxburst i{position:absolute;left:50%;top:50%;width:9%;height:9%;margin:-4.5% 0 0 -4.5%;border-radius:50%;background:var(--fxd,#ffd24a);box-shadow:0 0 6px var(--fxc,#ffd24a);animation:fxbang .7s ease-out forwards}' +
    '@keyframes fxbang{0%{opacity:1;transform:translate(0,0) scale(1.3)}100%{opacity:0;transform:translate(calc(var(--dx) * 3),calc(var(--dy) * 3)) scale(.2)}}' +
    [1, 2, 3, 4, 5].map((k) => '[data-fx="' + k + '"]{--fxc:' + TC[k][0] + ';--fxd:' + TC[k][1] + '}').join('');
  const css = document.createElement('style');
  css.textContent = fx + '.abox{padding:4px 16px 24px;display:grid;grid-template-columns:minmax(0,1fr);gap:10px}.abox *{overflow-wrap:anywhere}@media(max-width:360px){.abox{padding:4px 0 24px}.agrid{gap:1px!important;margin:0 -8px}}.anote{margin:0;font:500 13px var(--sans);opacity:.75}.anote em{color:var(--accent,#e0a030);font-style:normal}.abh{margin:6px 0 0;font:800 15px var(--sans)}' +
    '.afx{display:flex;align-items:center;gap:10px;font:600 14px var(--sans)}.tierbadge{padding:3px 10px;border-radius:999px;font:800 12px var(--sans);background:var(--fxc,#555);color:#111}.tierbadge[data-fx="0"]{background:rgba(127,127,127,.3);color:inherit}.tierbadge.tierbadge{white-space:nowrap;overflow-wrap:normal;word-break:keep-all}' +
    '.ablist{list-style:none;margin:0;padding:0;display:grid;gap:6px}.ablist li{display:flex;align-items:center;gap:10px;font:500 13.5px/1.35 var(--sans)}.abpc{width:34px;height:34px;flex:none;display:block}.abpc svg{width:100%;height:100%;display:block}' +
    '.abwrap{display:grid;gap:10px;max-height:60vh;overflow:auto}.abcard{padding:10px;border-radius:14px;background:rgba(127,127,127,.12);display:grid;gap:8px}.abhead{display:flex;align-items:center;flex-wrap:wrap;gap:8px}.abhead small{opacity:.7;font:600 12px var(--sans)}' +
    '.agrid{display:grid;grid-template-columns:repeat(8,1fr);gap:2px;border-radius:10px;overflow:hidden}.acell{aspect-ratio:1;padding:0;border:0;position:relative;display:block}.acell.lt{background:#e8dcc0}.acell.dk{background:#7a9a6a}.acell svg{width:100%;height:100%;display:block}.acell.pawnrow{opacity:.55}.acell.sel{outline:3px solid var(--accent,#e0a030);outline-offset:-3px}' +
    '.arow{display:flex;gap:8px}.arow .ghost{flex:1}.aseg{display:flex;gap:6px}.aseg button{flex:1 1 auto;min-width:48px;padding:9px 6px;border-radius:10px;border:1px solid rgba(127,127,127,.3);background:transparent;color:inherit;font:700 14px var(--sans)}.aseg button.on{background:var(--accent,#e0a030);color:#111;border-color:transparent}' +
    '.ghost.big{padding:14px;border-radius:14px;font:700 16px var(--sans)}';
  document.head.appendChild(css);
  window.Army = { open, payload, applyFx, burst, abilities, matchup, _state: () => st };
})();
