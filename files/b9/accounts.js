/* Sibyl accounts and friends (Settings > More > Account). A guest account keeps your name and a friend code; signing in with Google makes it yours on any phone.
   What the server keeps: the name you chose, a friend code, your friend list, and Google's anonymous account id (never your email). Delete account removes all of it.
   Google sign-in opens the browser and comes back through sibyl://auth/CODE; the phone proves it started the sign-in with a secret it never sends anywhere else. */
(function () {
  'use strict';
  const DEFAULT_SERVER = 'https://sibyl-online.vercel.app', KEY = 'sibyl.acct', PEND = 'sibyl.gpend';
  const server = () => { try { return (window.Servers ? Servers.authBase() : (localStorage.getItem('sibyl.coachServer') || DEFAULT_SERVER)).replace(/\/+$/, ''); } catch (e) { return DEFAULT_SERVER; } };      // accounts live on the second server (Cloudflare)
  const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const write = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  let A = read(KEY), lists = { friends: [], incoming: [], outgoing: [] }, busy = false, notice = '', mode = 'login';
  const bridge = () => (typeof window !== 'undefined' && window.SibylShare) || null;
  const canBrowser = () => !!(bridge() && bridge().openUrl) || !bridge();       // an old app (no openUrl) cannot open the browser; a plain browser can

  async function api(body, ms) {
    const ac = typeof AbortController !== 'undefined' ? new AbortController() : null, t = ac && setTimeout(() => ac.abort(), ms || 12000);
    try {
      const r = await fetch(server() + '/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ token: A && A.token }, body)), signal: ac ? ac.signal : undefined });
      const j = await r.json().catch(() => ({ ok: false, error: 'server error' }));
      if (r.status === 401 && j.error === 'signed out') { A = null; write(KEY, null); }
      return j;
    } catch (e) { return { ok: false, error: 'No connection' }; } finally { if (t) clearTimeout(t); }
  }
  const setLists = (j) => { if (j && j.friends) lists = { friends: j.friends, incoming: j.incoming || [], outgoing: j.outgoing || [] }; };
  async function refresh() { if (!A || !A.token) return; const j = await api({ a: 'me' }); if (j.ok) { A.user = j.user; write(KEY, A); setLists(j); } }
  const randomState = () => { const b = new Uint8Array(24); (self.crypto || window.crypto).getRandomValues(b); return btoa(String.fromCharCode.apply(null, b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };

  // ---------------------------------------------------------------- sign in
  const val = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
  async function enter(j, fallback) {
    if (!j.ok) { notice = j.error || fallback; return false; }
    A = { token: j.token, user: j.user }; write(KEY, A); notice = ''; await refresh(); return true;
  }
  async function register() {
    const pw = val('acPass'); if (pw !== val('acPass2')) { notice = 'The two passwords are different.'; return; }
    await enter(await api({ a: 'register', username: val('acUser').trim(), password: pw }), 'Could not create the account');
  }
  async function login() { await enter(await api({ a: 'login', username: val('acUser').trim(), password: val('acPass') }), 'Could not log in'); }
  async function setCreds() {
    const u = A.user, j = await api({ a: 'setcreds', username: val('acUser').trim(), password: val('acPass'), old: val('acOld') });
    if (j.ok) { A.user = j.user; write(KEY, A); notice = u.password ? 'Password changed.' : 'Username and password saved.'; } else notice = j.error || 'Could not save';
  }
  async function google() {
    const state = randomState(), j = await api({ a: 'gstart', state });
    if (!j.ok) { notice = j.error || 'Could not start Google sign-in'; return; }
    write(PEND, { state, t: Date.now() });
    notice = 'Finish signing in in the browser, then come back to Sibyl.';
    try { if (bridge() && bridge().openUrl) bridge().openUrl(j.url); else window.open(j.url, '_blank'); } catch (e) { notice = 'Could not open the browser.'; }
  }
  async function redeem(code) {
    const p = read(PEND); if (!p || Date.now() - p.t > 10 * 60 * 1000) return false;
    const j = await api({ a: 'redeem', code, state: p.state });
    write(PEND, null);
    if (!j.ok) { notice = j.error || 'Google sign-in failed'; if (typeof toast === 'function') toast(notice); draw(); return false; }
    A = { token: j.token, user: j.user }; write(KEY, A); await refresh(); notice = '';
    if (typeof toast === 'function') toast('Signed in as ' + A.user.name);
    draw(); return true;
  }
  // the browser sends the person back with sibyl://auth/CODE; the app hands the code over (see Bridge.takeAuth)
  setInterval(() => { try { if (read(PEND) && bridge() && bridge().takeAuth) { const c = bridge().takeAuth(); if (c) redeem(c); } } catch (e) {} }, 1000);
  window.sibylAuthCode = redeem;

  // ---------------------------------------------------------------- the sheet
  const E = (t) => (typeof esc === 'function' ? esc(t) : String(t).replace(/[&<>"]/g, ''));
  const row = (u, btns) => '<div class="acrow"><b>' + E(u.name) + '</b><span>' + btns + '</span></div>';
  function draw() {
    if (typeof openSheet !== 'function') return;
    let h = '<h2>Account</h2>';
    if (!A || !A.user) {
      const create = mode === 'create';
      h += '<div class="seg" id="acMode"><button data-m="login" class="' + (create ? '' : 'on') + '">Log in</button><button data-m="create" class="' + (create ? 'on' : '') + '">Create account</button></div>' +
        '<p class="sheetnote">' + (create ? 'Pick a username and a password (8 or more characters). Your friends, name and friend code stay with the account on any phone. We never ask for your email.' : 'Welcome back.') + '</p>' +
        '<label class="aclab">Username<input id="acUser" maxlength="20" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false"></label>' +
        '<label class="aclab">Password<input id="acPass" type="password" maxlength="128" autocomplete="' + (create ? 'new-password' : 'current-password') + '"></label>' +
        (create ? '<label class="aclab">Repeat password<input id="acPass2" type="password" maxlength="128" autocomplete="new-password"></label>' : '') +
        '<div class="stk"><button class="cta" id="' + (create ? 'acCreate' : 'acLogin') + '">' + (create ? 'Create account' : 'Log in') + '</button>' +
        '<button class="ghost" id="acGoogle"' + (canBrowser() ? '' : ' disabled') + '>' + (canBrowser() ? 'Continue with Google' : 'Google sign-in needs the newer app') + '</button><button class="ghost" id="acClose">Not now</button></div>';
    } else {
      const u = A.user;
      h += '<p class="sheetnote">' + (u.username ? 'Signed in as <b>' + E(u.username) + '</b>' + (u.google ? ' · Google linked' : '') + '.' : 'Signed in with Google. Add a username and password to log in without it.') + '</p>' +
        '<label class="aclab">Your name<input id="acName" maxlength="20" value="' + E(u.name) + '" autocomplete="off" autocapitalize="words"></label>' +
        '<div class="accode"><span>Friend code</span><b>' + E(u.code) + '</b><button class="ghost" id="acShare">Share</button></div>' +
        '<div class="aclab">Add a friend<span class="acadd"><input id="acCode" maxlength="6" placeholder="Their code" autocomplete="off" autocapitalize="characters"><button class="ghost" id="acAdd">Add</button></span></div>';
      if (lists.incoming.length) h += '<p class="coachhead">Requests</p>' + lists.incoming.map((f) => row(f, '<button class="ghost" data-fa="faccept" data-u="' + f.uid + '">Accept</button><button class="ghost" data-fa="fdecline" data-u="' + f.uid + '">Decline</button>')).join('');
      h += '<p class="coachhead">Friends' + (lists.friends.length ? ' (' + lists.friends.length + ')' : '') + '</p>' +
        (lists.friends.length ? lists.friends.map((f) => row(f, '<button class="ghost" data-fa="fremove" data-u="' + f.uid + '">Remove</button>')).join('') : '<p class="sheetnote">No friends yet. Share your code, or add theirs.</p>');
      if (lists.outgoing.length) h += '<p class="coachhead">Sent</p>' + lists.outgoing.map((f) => row(f, '<button class="ghost" data-fa="fcancel" data-u="' + f.uid + '">Cancel</button>')).join('');
      h += '<p class="coachhead">Login</p>' +
        (u.password ? '' : '<label class="aclab">Username<input id="acUser" maxlength="20" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false"></label>') +
        (u.password ? '<label class="aclab">Current password<input id="acOld" type="password" maxlength="128" autocomplete="current-password"></label>' : '') +
        '<label class="aclab">' + (u.password ? 'New password' : 'Password') + '<input id="acPass" type="password" maxlength="128" autocomplete="new-password"></label>' +
        '<div class="stk"><button class="ghost" id="acCreds">' + (u.password ? 'Change password' : 'Save username and password') + '</button></div>';
      h += '<div class="acsmall">' + (!u.google ? '<button class="ghost" id="acGoogle"' + (canBrowser() ? '' : ' disabled') + '>' + (canBrowser() ? 'Link Google' : 'Needs app update') + '</button>' : '') +
        '<button class="ghost" id="acOut">Sign out</button><button class="ghost" id="acDel">Delete account</button></div><div class="stk"><button class="cta" id="acClose">Done</button></div>';
    }
    if (notice) h += '<p class="sheetnote acnote">' + E(notice) + '</p>';
    openSheet(h); wire();
  }
  const go = async (fn) => { if (busy) return; busy = true; try { await fn(); } finally { busy = false; draw(); } };
  function wire() {
    const $$ = (id) => document.getElementById(id), on = (id, fn) => { const el = $$(id); if (el) el.onclick = fn; };
    on('acClose', () => { notice = ''; if (typeof closeSheet === 'function') closeSheet(); });
    on('acCreate', () => go(register)); on('acLogin', () => go(login)); on('acGoogle', () => go(google)); on('acCreds', () => go(setCreds));
    document.querySelectorAll('#acMode button').forEach((b) => b.onclick = () => { mode = b.dataset.m; notice = ''; draw(); });
    ['acUser', 'acPass', 'acPass2'].forEach((id) => { const el = $$(id); if (el && !A) el.onkeydown = (e) => { if (e.key === 'Enter') { const go2 = $$(mode === 'create' ? 'acCreate' : 'acLogin'); if (go2) go2.click(); } }; });
    on('acShare', () => { const t = 'Add me on Sibyl: friend code ' + A.user.code; try { if (bridge() && bridge().share) bridge().share('Sibyl', t); else navigator.clipboard.writeText(t).then(() => toast('Copied')); } catch (e) {} });
    on('acAdd', () => go(async () => { const c = ($$('acCode').value || '').trim(); if (!c) return; const j = await api({ a: 'fadd', code: c }); if (j.ok) { setLists(j); notice = j.became ? 'You and ' + j.became + ' are friends.' : 'Request sent to ' + j.sent + '.'; } else notice = j.error || 'Could not add'; }));
    on('acOut', () => go(async () => { await api({ a: 'signout' }); A = null; write(KEY, null); lists = { friends: [], incoming: [], outgoing: [] }; notice = ''; mode = 'login'; }));
    on('acDel', () => { const el = $$('acDel'); if (!el.dataset.armed) { el.dataset.armed = '1'; el.textContent = 'Tap again to delete everything'; setTimeout(() => { if (el.isConnected) { delete el.dataset.armed; el.textContent = 'Delete account'; } }, 5000); return; } go(async () => { const j = await api({ a: 'delete' }); if (j.ok) { A = null; write(KEY, null); lists = { friends: [], incoming: [], outgoing: [] }; notice = 'Account deleted.'; } else notice = j.error || 'Could not delete'; }); });
    const nm = $$('acName'); if (nm) nm.onchange = () => go(async () => { const j = await api({ a: 'rename', name: nm.value }); if (j.ok) { A.user = j.user; write(KEY, A); notice = ''; } else notice = j.error || 'Could not rename'; });
    document.querySelectorAll('#sheet [data-fa]').forEach((b) => b.onclick = () => go(async () => { const j = await api({ a: b.dataset.fa, uid: b.dataset.u }); if (j.ok) setLists(j); else notice = j.error || 'Could not do that'; }));
  }
  async function open() { notice = ''; draw(); if (A && A.token) { await refresh(); draw(); } }

  const css = document.createElement('style');
  css.textContent = `.acrow { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 12px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); margin: 6px 14px }
  .acrow span { display: flex; gap: 6px } .acrow button { padding: 6px 10px; min-height: 36px } .aclab { display: grid; gap: 6px; margin: 10px 14px; font: 500 13px var(--sans); color: var(--muted) }
  .aclab input, .acadd input { padding: 10px 12px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); font: 16px var(--sans); min-width: 0; width: 100% }
  .acadd { display: flex; gap: 8px } .accode { display: flex; align-items: center; gap: 10px; margin: 10px 14px; padding: 10px 12px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line) }
  .accode span { color: var(--muted); font: 500 13px var(--sans) } .accode b { font: 600 22px var(--mono); letter-spacing: .12em; flex: 1 } .acnote { color: var(--brass) } .acsmall { display: flex; gap: 8px; margin: 14px 14px 4px } .acsmall button { flex: 1; min-height: 44px; padding: 8px 6px; font-size: 14px }`;
  document.head.appendChild(css);
  window.Acct = { api, open, refresh, user: () => (A && A.user) || null, token: () => (A && A.token) || null, signedIn: () => !!(A && A.token), name: () => (A && A.user && A.user.name) || '', friends: () => lists, redeem };
  setTimeout(refresh, 2500);
})();
