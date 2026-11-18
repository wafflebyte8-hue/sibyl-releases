/* Sibyl online review: when the phone is online and the server answers, a finished game is analysed there (Stockfish) and the coach's comments are
   flavoured there (a small language model). Only the moves are sent: no name, no account. Anything that goes wrong falls back to the review on the phone.
   The server is chosen in one place (DEFAULT_SERVER); the localStorage key 'sibyl.coachServer' overrides it for testing. */
(function () {
  'use strict';
  const DEFAULT_SERVER = 'https://sibyl-online.vercel.app';
  const server = () => { try { return (localStorage.getItem('sibyl.coachServer') || DEFAULT_SERVER).replace(/\/+$/, ''); } catch (e) { return DEFAULT_SERVER; } };
  const wanted = () => (typeof CFG === 'undefined' || CFG.onlineReview !== false) && !!server() && navigator.onLine !== false;
  let okAt = 0, okVal = false, hasComments = false;
  async function fetchJson(url, opt, ms) {
    const ac = typeof AbortController !== 'undefined' ? new AbortController() : null, t = ac && setTimeout(() => ac.abort(), ms || 8000);
    try { const r = await fetch(url, Object.assign({ signal: ac ? ac.signal : undefined }, opt)); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'http ' + r.status); return j; }
    finally { if (t) clearTimeout(t); }
  }
  async function ready() {                          // online, switched on, and the server answers (cached for a minute)
    if (!wanted()) return false;
    if (Date.now() - okAt < 60000) return okVal;
    okAt = Date.now();
    try { const h = await fetchJson(server() + '/api/health', {}, 3500); okVal = !!(h.ok && h.review); hasComments = !!h.comments; } catch (e) { okVal = false; }
    if (!okVal && window.Servers) { try { okVal = await Servers.anyReview(); } catch (e) {} }      // the second server can review even when Vercel is down
    return okVal;
  }
  async function post(path, body, ms, base) { return fetchJson((base || server()) + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, ms); }
  // every position of the game: the same numbers the on-phone judge() gives (best move, second best, score before and after, her best reply).
  // The game is cut into slices that the server reviews in parallel.
  window.remoteAnalyse = async function (moves, onProgress, alive, elos) {
    const SLICE = 12, PAR = 3, n = moves.length, out = new Array(n); let next = 0, done = 0, failed = null;
    const bases = window.Servers ? await Servers.reviewBases() : [server()];          // best first: the second server (depth 16) when it is healthy, else Vercel (depth 13)
    async function worker() {
      while (!failed) {
        const from = next; if (from >= n) return; next += SLICE; const to = Math.min(n, from + SLICE);
        let r, tries = 0;
        for (;;) { try { r = await post('/api/analyse', { moves, from, to, elos: Array.isArray(elos) ? elos.slice(from, to) : undefined }, 35000, bases[Math.min(tries, bases.length - 1)]); break; } catch (e) { if (++tries >= 2 + (bases.length > 1 ? 1 : 0) || /too many|bad|illegal/.test(String(e.message)) && bases.length < 2) { failed = e; return; } } }
        if (alive && !alive()) { failed = new Error('left'); return; }
        r.j.forEach((x, k) => { out[from + k] = Object.assign({ eng: '', by: 'server' }, x); }); done += to - from; if (onProgress) onProgress(done, n, 0);
      }
    }
    await Promise.all(Array.from({ length: Math.min(PAR, Math.ceil(n / SLICE)) }, worker));
    if (failed) throw failed; return out;
  };
  // flavour for the coach's key comments: { id: { open, close } }; any of them may be missing (then the app uses its own hand-written line)
  window.remoteComments = async function (coach, style, moments, alive) {
    if (!hasComments) return {};                                    // the server has no language model: the app keeps its hand-written lines
    const res = await post('/api/comments', { coach, style, moments }, 60000); return res.comments || {};
  };
  // live bot chat: the line streams in as the model writes it. info = { name, desc, examples[], recent[] }. Returns the finished line, or null (then the app uses its own).
  let liveDownUntil = 0;
  window.liveChat = async function (info, kind, ctx, onText, alive) {
    if (!wanted() || Date.now() < liveDownUntil) return null;
    const ac = typeof AbortController !== 'undefined' ? new AbortController() : null;
    try {
      const res = await fetch(server() + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ac ? ac.signal : undefined,
        body: JSON.stringify({ name: info.name, desc: info.desc, kind, ctx, examples: info.examples, recent: info.recent }) });
      if (!res.ok) throw new Error('http ' + res.status);
      let fin = null, buf = '';
      const eat = (chunk) => { buf += chunk; let i; while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (!l.startsWith('data:')) continue; let j; try { j = JSON.parse(l.slice(5)); } catch (e) { continue; }
        if (j.t === 'text' && onText) onText(j.s); else if (j.t === 'done') fin = j.s; else if (j.t === 'reject') fin = null; } };
      if (res.body && res.body.getReader) {
        const rd = res.body.getReader(), dec = new TextDecoder();
        for (;;) { const { value, done } = await rd.read(); if (done) break; eat(dec.decode(value, { stream: true })); if (alive && !alive()) { if (ac) ac.abort(); return null; } }
      } else eat(await res.text());
      return fin;
    } catch (e) { if (alive && alive()) liveDownUntil = Date.now() + 60000; return null; }     // the server is not answering: the usual lines for a minute
  };
  window.remoteReady = ready;
  window.remoteWanted = wanted;
})();
