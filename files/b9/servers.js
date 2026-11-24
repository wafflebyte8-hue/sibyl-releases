/* Sibyl's servers. The app can use more than one: the Vercel server (accounts, friends, AI chat, and a copy of everything else) and a second server
   (online-game relay with rooms in memory, and game review at depth 16). No load balancer sits in between: the phone looks at both servers' health and talks to the better
   one directly, and falls back to the other when one does not answer. An online room's code starts with a letter that says where the room lives (Vercel A-R, the second server S-Z).
   Set SECOND (or localStorage 'sibyl.server2', for tests) to turn the second server on; with none set everything goes to Vercel as before. */
(function () {
  'use strict';
  const VERCEL = 'https://sibyl-online.vercel.app', SECOND = 'https://sibyl-relay.sibylchess.workers.dev';
  const strip = (u) => String(u || '').replace(/\/+$/, '');
  const base1 = () => { try { return strip(localStorage.getItem('sibyl.coachServer') || VERCEL); } catch (e) { return VERCEL; } };
  const base2 = () => { try { return strip(localStorage.getItem('sibyl.server2') || SECOND); } catch (e) { return strip(SECOND); } };
  const SECOND_FIRST = 'STUVWXYZ';
  let health = { at: 0, v: null, s: null }, pending = null;

  async function ping(base, path) {
    if (!base) return null;
    const ac = typeof AbortController !== 'undefined' ? new AbortController() : null, t0 = Date.now(), tm = ac && setTimeout(() => ac.abort(), 3500);
    try { const r = await fetch(base + path, { signal: ac ? ac.signal : undefined }); const j = await r.json(); return r.ok && j && j.ok ? Object.assign({ ms: Date.now() - t0 }, j) : null; }
    catch (e) { return null; } finally { if (tm) clearTimeout(tm); }
  }
  // both servers' health, kept for 45 seconds
  function refresh(force) {
    if (!force && Date.now() - health.at < 45000) return Promise.resolve(health);
    if (pending) return pending;
    // both are asked at once; once one of them has answered the other gets one more second (a server that is blocked or slow must not hold the app up for its whole timeout),
    // and a late answer still updates the picture
    pending = new Promise((resolve) => {
      const h = { at: Date.now(), v: null, s: null }; let nv = false, ns = false, fin = false;
      const finish = () => { if (fin) return; fin = true; health = h; pending = null; resolve(h); };
      const got = (key, x) => { h[key] = x; if (key === 'v') nv = true; else ns = true; if (nv && ns) finish(); else if (x) setTimeout(finish, 1000); };
      ping(base1(), '/api/health').then((x) => got('v', x)); ping(base2(), '/health').then((x) => got('s', x));
      setTimeout(finish, 3800);
    });
    return pending;
  }
  const secondUp = (h) => !!(base2() && h.s);
  const busy = (s) => !!(s && s.load && s.load.queued >= 6);
  window.Servers = {
    vercel: base1, second: base2, refresh, health: () => health,
    authBase: () => base2() || base1(),            // accounts and friends live on the second server
    // where to look for a room, in order (a room lives on one server; only joining by code tries both)
    async relayBases(code, joining) {
      const h = await refresh(), first = (code || '')[0] ? (SECOND_FIRST.includes(String(code)[0].toUpperCase()) ? 's' : 'v') : (secondUp(h) ? 's' : 'v');
      const order = first === 's' ? [base2(), base1()] : [base1(), base2()];
      const list = order.filter(Boolean);
      return code && !joining ? [list[0]] : list;
    },
    // where to send a game for review, best first
    async reviewBases() {
      const h = await refresh(), list = [];
      if (secondUp(h) && h.s.review && !busy(h.s)) list.push(base2());
      list.push(base1()); if (secondUp(h) && h.s.review && !list.includes(base2())) list.push(base2());
      return list;
    },
    anyReview: async () => { const h = await refresh(); return !!((h.v && h.v.review) || (h.s && h.s.review)); },
    depthOn: (base) => (health.s && base === base2() ? health.s.depth || 16 : 13),
  };
  refresh(false);
})();
