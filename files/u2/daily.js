// Daily: the streak, its strength, the daily puzzle, the bot of the day (Sibyl 5.4).
//
// A DAY counts when you finish a game or solve a puzzle. The streak number only goes up: if you miss days it stays,
// but its STRENGTH (the number that Legion mode turns into upgrades) falls by 1 for every missed day, slowly, and
// comes back by 1 for every day you play again. A lost Legion game also takes 1 strength. Strength can never be higher than the streak.
// Everything is kept on the phone (localStorage 'sibyl.daily'); nothing is sent anywhere.
'use strict';
(() => {
  const KEY = 'sibyl.daily', LINK = 'https://github.com/wafflebyte8-hue/sibyl-releases/tree/dist', MAXP = 40;
  const pad = (n) => String(n).padStart(2, '0');
  const dayKey = (d) => { if (!d && window.__dayOverride) return window.__dayOverride;          // (tests set a fake today)
    d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const utc = (k) => { const p = k.split('-').map(Number); return Date.UTC(p[0], p[1] - 1, p[2]); };
  const gap = (a, b) => Math.round((utc(b) - utc(a)) / 86400000);          // days from a to b
  const addDays = (k, n) => { const t = new Date(utc(k) + n * 86400000); return t.getUTCFullYear() + '-' + pad(t.getUTCMonth() + 1) + '-' + pad(t.getUTCDate()); };
  const hash = (s) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  const weekday = (k) => (new Date(utc(k)).getUTCDay() + 6) % 7;          // Monday 0 ... Sunday 6
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function read() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function write(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { } }
  function fresh() {          // first run: keep the streak the app already showed (days with a finished game)
    const st = { streak: 0, power: 0, last: '', through: '', puz: '', bot: '', both: '', best: 0 };
    try {
      const days = new Set((typeof loadHistory === 'function' ? loadHistory() : []).map((g) => dayKey(new Date(g.date))));
      let k = dayKey(); if (!days.has(k)) k = addDays(k, -1);
      if (days.has(k)) { st.last = k; let n = 0; while (days.has(k)) { n++; k = addDays(k, -1); } st.streak = st.power = st.best = n; st.through = st.last; }
    } catch (e) { }
    return st;
  }
  let ST = read() || fresh();
  function sync() {          // the days that were missed take 1 strength each
    const t = dayKey();
    if (ST.last) {
      const from = addDays(ST.through && ST.through > ST.last ? ST.through : ST.last, 1), yest = addDays(t, -1);
      if (from <= yest) { const miss = gap(from, yest) + 1; ST.power = Math.max(0, ST.power - miss); ST.through = yest; }
    }
    ST.power = Math.min(ST.power, ST.streak, MAXP); write(ST); return ST;
  }
  // an active day: the first thing done today raises the streak by 1 and the strength by 1 (never above the streak)
  function active() {
    sync(); const t = dayKey(); if (ST.last === t) return false;
    ST.streak += 1; ST.power = Math.min(ST.streak, MAXP, ST.power + 1); ST.last = t; ST.through = t; ST.best = Math.max(ST.best || 0, ST.streak); write(ST); return true;
  }
  function state() {
    sync(); const t = dayKey();
    return { streak: ST.streak, power: Math.min(ST.power, MAXP), cooling: ST.power < ST.streak, today: ST.last === t, puz: ST.puz === t, bot: ST.bot === t, best: ST.best || ST.streak };
  }
  // something was done: 'game' (a finished game, with its record), 'puzzle' (any puzzle), 'dailyPuzzle'
  function hit(kind, rec) {
    sync(); const tier0 = tier(ST.power).i;
    const first = active(), t = dayKey();
    if (kind === 'dailyPuzzle') ST.puz = t;
    if (kind === 'game' && rec && !rec.local && rec.bot != null && botOfDay() && rec.bot === botOfDay().id) ST.bot = t;
    let bonus = false;
    if (ST.puz === t && ST.bot === t && ST.both !== t) { ST.both = t; ST.power = Math.min(ST.streak, MAXP, ST.power + 1); bonus = true; }          // both dailies on one day: 1 extra strength
    write(ST); pushReminder();
    const tier1 = tier(ST.power);
    if (tier1.i > tier0) { try { if (typeof toast === 'function') toast(T('Your Legion pieces are now {0}: they move differently!', T(tier1.name))); if (typeof confetti === 'function') confetti(); } catch (e) { } }
    else if (first && typeof toast === 'function') toast('Day ' + ST.streak + ' of your streak · strength ' + Math.min(ST.power, MAXP));
    else if (bonus && typeof toast === 'function') toast('Both dailies done: +1 strength');
    try { if (typeof drawHome === 'function' && !document.getElementById('home').classList.contains('off')) drawHome(); } catch (e) { }
    return first;
  }
  // the glow tiers of Legion mode: the stronger the streak, the cooler your pieces look (the effects are in army.js)
  const TIERS = [{ i: 0, name: 'Plain', min: 0 }, { i: 1, name: 'Bronze', min: 3 }, { i: 2, name: 'Silver', min: 6 }, { i: 3, name: 'Gold', min: 10 }, { i: 4, name: 'Aurora', min: 16 }, { i: 5, name: 'Legend', min: 24 }];
  const tier = (p) => { let t = TIERS[0]; for (const x of TIERS) if (p >= x.min) t = x; return t; };
  const nextTier = (p) => TIERS.find((x) => x.min > p) || null;
  function lose() { sync(); ST.power = Math.max(0, ST.power - 1); write(ST); return ST.power; }          // a lost Legion game

  // ------------------------------------------------------------------ what today's dailies are (the same for everybody on the same date)
  function puzzleItem() {
    if (typeof PZ === 'undefined' || !PZ || !PZ.ladder) return null;
    const k = dayKey(), n = PZ.ladder.length, i = Math.min(n - 1, Math.floor(weekday(k) / 7 * n) + hash('puz' + k) % Math.max(1, Math.floor(n / 7)));          // easier early in the week, harder at the weekend
    return PZ.ladder[i];
  }
  function botOfDay() {
    if (typeof BOTS === 'undefined' || !BOTS.length) return null;
    const k = dayKey(), wd = weekday(k), band = [1000, 1150, 1300, 1500, 1700, 1900, 2150][wd];
    let pool = wd >= 5 ? BOTS.filter((b) => b.group && typeof b.elo === 'number' && b.elo <= 2600) : BOTS.filter((b) => !b.group && typeof b.elo === 'number' && Math.abs(b.elo - band) <= 120);          // the weekend: a legend or a creator
    if (!pool.length) pool = BOTS.filter((b) => typeof b.elo === 'number');
    return pool[hash('bot' + k) % pool.length];
  }
  function playPuzzle() {
    const it = puzzleItem(); if (!it) { if (typeof toast === 'function') toast('The puzzles are still loading'); return; }
    customList = [it]; startPuzzle('daily', 0);
  }
  function playBot() {
    const b = botOfDay(); if (!b) return;
    const keep = { bot: S.bot, elo: S.elo, side: S.side, local: S.local, teach: S.teach, v960: S.v960, variant: S.variant };
    S.bot = b.id; S.elo = b.elo === 'hustle' ? HUSTLE_ELO : b.elo; S.side = 'r'; S.local = false; S.teach = false; S.v960 = false; S.variant = '';
    try { saveSettings(); newGame(); } finally { Object.assign(S, keep); try { saveSettings(); } catch (e) { } }
  }

  function shareStreak() {
    const s = state();
    const txt = 'I am on a ' + s.streak + '-day streak in Sibyl, a free chess app with a chess AI, bots and daily puzzles. My streak strength is ' + s.power + '. Try it: ' + LINK;
    if (typeof shareText === 'function') shareText('Sibyl', txt);
  }
  function invite() {
    const txt = 'Come play chess with me in Sibyl, a free chess app with bots, daily puzzles and a streak. Download: ' + LINK;
    if (typeof shareText === 'function') shareText('Sibyl', txt);
  }

  // ------------------------------------------------------------------ the daily reminder (the Android app only: window.SibylReminder, see Reminder.java)
  const REM = () => window.SibylReminder || null;
  function T(s) { const a = [].slice.call(arguments, 1); if (window.I18N && I18N.T) return I18N.T.apply(null, [s].concat(a)); return s.replace(/\{(\d)\}/g, (_, i) => (a[+i] == null ? '' : a[+i])); }          // (a translated sentence with {0} {1} filled in)
  function remText() {
    const s = state();
    if (!s.streak) return T("Solve today's puzzle to start your streak.");
    if (s.cooling) return T('Your {0}-day streak is cooling (strength {1} of {0}). Play today to bring it back.', s.streak, s.power);
    return T("Keep your {0}-day streak going: today's puzzle and the bot of the day are waiting.", s.streak);
  }
  function pushReminder() { try { const r = REM(); if (r) r.update(remText(), ST.last || ''); } catch (e) { } }          // (what to say, and the last day played: no reminder on a day you already played)
  const TIMES = [[8, 0], [12, 0], [16, 0], [18, 0], [19, 0], [20, 0], [21, 0]];
  const hm = (h, m) => h + ':' + pad(m);
  function setReminder(on, h, m) {
    const r = REM(); if (!r) return; r.set(on, h, m); pushReminder();
    if (on && typeof toast === 'function') toast(r.canNotify() ? 'Daily reminder at ' + hm(h, m) : 'Allow notifications for Sibyl when Android asks');
    drawReminderRow(); draw();
  }
  function drawReminderRow() {          // the Daily reminder switch and its time, in Settings
    const r = REM(), box = document.getElementById('remBox'); if (!r || !box) return;
    const on = r.enabled(), h = r.hour(), m = r.minute();
    box.hidden = false; document.getElementById('tRem').classList.toggle('on', on);
    const sel = document.getElementById('remTime'); sel.hidden = !on;
    sel.innerHTML = TIMES.map((x) => '<option value="' + x[0] + ':' + x[1] + '"' + (x[0] === h && x[1] === m ? ' selected' : '') + '>' + hm(x[0], x[1]) + '</option>').join('') + (TIMES.some((x) => x[0] === h && x[1] === m) ? '' : '<option selected value="' + h + ':' + m + '">' + hm(h, m) + '</option>');
  }
  function mountReminderRow() {
    const r = REM(); if (!r) return; const anchor = document.querySelector('#settings .tog[data-k="showOnline"]'); if (!anchor || document.getElementById('remBox')) return;
    const box = document.createElement('div'); box.id = 'remBox'; box.hidden = true;
    box.innerHTML = '<button class="tog" id="tRem"><i></i><span><b>Daily reminder</b><small>A notification once a day, at the time you pick, to keep your streak. None on a day you already played</small></span></button><div class="setrow" id="remRow"><select id="remTime" aria-label="Reminder time" hidden></select></div>';
    anchor.after(box);
    document.getElementById('tRem').onclick = () => { const on = !r.enabled(); setReminder(on, r.hour(), r.minute()); };
    document.getElementById('remTime').onchange = (e) => { const p = e.target.value.split(':').map(Number); setReminder(true, p[0], p[1]); };
    drawReminderRow();
  }

  // ------------------------------------------------------------------ the card on the home screen
  const FLAME = '<svg class="ic" viewBox="0 0 24 24"><path d="M12 3c.5 3.5 5 5.2 5 10.2A5 5 0 0 1 7 13.2c0-2.4 1.4-3.6 2-5.2.9 1.2 1.6 2 1.6 3.4C11.8 9 12.4 6 12 3z"/></svg>';
  function draw() {
    const el = document.getElementById('hDaily'); if (!el) return;
    try { const hs = document.querySelector('.hrow .streak'); if (hs) hs.style.display = 'none'; } catch (e) { }          // the card shows the streak, so the little flame in the top bar would only repeat it
    const s = state(), it = puzzleItem(), b = botOfDay(), pct = s.streak ? Math.round(100 * s.power / s.streak) : 0, tr = tier(s.power);
    let mini = '', face = '';
    try { if (it && typeof miniBoard === 'function') { const fen = puzzleStartFen(it); mini = miniBoard(fen, new Chess(fen).turn() === 'b', 'lg'); } } catch (e) { }
    try { if (b && typeof faceHTML === 'function') face = faceHTML(b, 'bav'); } catch (e) { }
    el.innerHTML = '<div class="dcard" data-fx="' + tr.i + '"><div class="dtop"><div class="dst">' + FLAME + '<b>' + s.streak + '</b><small>day streak</small>' + (tr.i ? '<b class="tierbadge" data-fx="' + tr.i + '">' + tr.name + '</b>' : '') + '</div>' +
      '<div class="dpw"><span><b>' + s.power + '</b><small> / ' + s.streak + ' strength</small></span><span class="dbar"><i style="width:' + pct + '%"></i></span></div></div>' +
      (s.cooling && s.streak ? '<p class="dnote">Your streak is cooling down. Play today and its strength comes back, 1 a day.</p>' : s.streak ? '<p class="dnote">' + (tr.i ? 'In Legion your pieces move differently.' : 'Reach strength 3 and your pieces start to move differently in Legion.') + '</p>' : '<p class="dnote">Finish a game or solve a puzzle each day to build a streak.</p>') +
      '<button class="drow" id="dPuz"><span class="dpic">' + mini + '</span><span class="dtx"><b>Daily puzzle</b><small>' + (it ? 'rated ' + it[2] : 'loading…') + '</small></span><span class="dgo ' + (s.puz ? 'done' : '') + '">' + (s.puz ? 'Done ✓' : 'Play') + '</span></button>' +
      '<button class="drow" id="dBot"><span class="dpic dface">' + face + '</span><span class="dtx"><b>Bot of the day</b><small>' + (b ? esc(b.name) + ' · ' + (b.elo === 'hustle' ? 1 : b.elo) : '') + '</small></span><span class="dgo ' + (s.bot ? 'done' : '') + '">' + (s.bot ? 'Done ✓' : 'Play') + '</span></button>' +
      '<button class="drow" id="dArmy"><span class="dpic dsw">♞</span><span class="dtx"><b>Legion</b><small>Play people near your strength, with pieces that move differently</small></span><span class="dgo">Play</span></button>' +
      '<div class="dfoot"><button class="ghost" id="dShare">Share my streak</button><button class="ghost" id="dInvite">Invite a friend</button></div>' + (REM() && !REM().enabled() ? '<button class="ghost" id="dRem">Remind me every day</button>' : '') + '</div>';
    const $$ = (id) => document.getElementById(id);
    if ($$('dRem')) $$('dRem').onclick = () => setReminder(true, REM().hour(), REM().minute());
    $$('dPuz').onclick = playPuzzle; $$('dBot').onclick = playBot; $$('dShare').onclick = shareStreak; $$('dInvite').onclick = invite;
    $$('dArmy').onclick = () => { if (window.Army) Army.open(); else if (typeof toast === 'function') toast('Legion mode is not ready yet'); };
  }
  const css = document.createElement('style');
  window.__dailyTierCss = '.dcard[data-fx="1"] .dst .ic,.dcard[data-fx="2"] .dst .ic,.dcard[data-fx="3"] .dst .ic,.dcard[data-fx="4"] .dst .ic,.dcard[data-fx="5"] .dst .ic{filter:drop-shadow(0 0 5px var(--fxc))}.dcard[data-fx="3"] .dst .ic,.dcard[data-fx="4"] .dst .ic,.dcard[data-fx="5"] .dst .ic{animation:fxpulse 2s ease-in-out infinite}.dcard[data-fx="1"] .dst>b:first-of-type,.dcard[data-fx="2"] .dst>b:first-of-type,.dcard[data-fx="3"] .dst>b:first-of-type,.dcard[data-fx="4"] .dst>b:first-of-type,.dcard[data-fx="5"] .dst>b:first-of-type{text-shadow:0 0 10px var(--fxc)}.dst .tierbadge{align-self:center;margin-left:4px}';
  css.textContent = '.dcard{margin:10px 0;padding:14px;border-radius:18px;background:var(--surface2,rgba(255,255,255,.05));display:grid;grid-template-columns:minmax(0,1fr);gap:8px;box-sizing:border-box;max-width:100%}.dcard *{min-width:0;overflow-wrap:anywhere}' +
    '.dtop{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 12px}.dst{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 6px}.dst>b{white-space:nowrap;overflow-wrap:normal}.dst .ic{width:22px;height:22px;align-self:center;color:var(--accent,#e0a030);fill:currentColor}.dst b{font:800 30px var(--sans)}.dst small,.dpw small{opacity:.7;font:600 12px var(--sans)}' +
    '.dpw{text-align:right;display:grid;gap:4px}.dpw b{font:800 18px var(--sans)}.dbar{display:block;height:6px;width:120px;border-radius:3px;background:rgba(127,127,127,.25);overflow:hidden;margin-left:auto}.dbar i{display:block;height:100%;background:var(--accent,#e0a030)}' +
    '.dnote{margin:0;font:500 13px var(--sans);opacity:.75}.drow{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:8px;border-radius:14px;background:rgba(127,127,127,.1);color:inherit;border:0;font:inherit}' +
    '.dpic{width:52px;height:52px;flex:none;border-radius:10px;overflow:hidden;display:grid;place-items:center}.dpic .mbd{width:52px;height:52px}.dface .bav{width:52px;height:52px}.dsw{font-size:34px;background:rgba(127,127,127,.15)}' +
    '.dtx{flex:1 1 0;min-width:0;display:grid;gap:2px}.dtx b{font:700 16px var(--sans)}.dtx small{opacity:.7;font:500 13px var(--sans)}.dgo{flex:none;white-space:nowrap;font:800 14px var(--sans);padding:7px 12px;border-radius:999px;background:var(--accent,#e0a030);color:#111}.dgo.done{background:transparent;color:inherit;opacity:.7}' +
    window.__dailyTierCss + '.dfoot{display:flex;flex-wrap:wrap;gap:8px}.dfoot .ghost{flex:1 1 120px}' +
    '@media(max-width:340px){.dcard{padding:10px}.drow{gap:8px}.dpic,.dpic .mbd,.dface .bav{width:40px;height:40px}.dsw{font-size:26px}.dgo{padding:6px 8px;font-size:12px}.dtx b{font-size:15px}}';
  document.head.appendChild(css);
  const boot = () => { try { mountReminderRow(); pushReminder(); } catch (e) { } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  setInterval(pushReminder, 600000);
  window.Daily = { state, hit, lose, tier, nextTier, TIERS, draw, puzzleItem, botOfDay, playPuzzle, playBot, shareStreak, invite, dayKey, _reset: () => { ST = fresh(); write(ST); }, _set: (o) => { Object.assign(ST, o); write(ST); } };
})();
