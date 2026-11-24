/* Reviewer 2: a small learned judge that reads how Stockfish lite's opinion of a move moved as the search went deeper (a move whose score keeps shifting is
   less certain than one that stays put) and says how much the move threw away: best / excellent / good / inaccuracy / mistake / blunder.
   Trained on 30,000 human moves labelled by Stockfish 18 at depth 18; measured on 6,000 separate ones (see results/reviewer_v2_progress.md).
   One model per search depth (16 and 14 on the phone, 13 on the server): reviewer2_d16.json, reviewer2_d14.json, reviewer2_d13.json.
   Works in the browser and in Node (the server). The feature recipe (featvec) must stay identical to tools/rv2_train.py. */
(function (root, make) { if (typeof module === 'object' && module.exports) module.exports = make(); else root.Reviewer2 = make(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const winP = (cp) => 1 / (1 + Math.exp(-0.00368208 * Math.max(-3000, Math.min(3000, cp))));
  const CLASS = ['best', 'exc', 'good', 'inacc', 'mistake', 'blunder'];
  const LOSS_MID = [0, 0.01, 0.035, 0.075, 0.15, 0.3];          // a representative win-chance loss for each class (for the rank code that wants a number)
  // top: { depth: { multipv: [score, firstMove, nodes] } } for the best two lines; played: { depth: [score, firstMove, nodes] } for the move that was played
  function features(top, played, elo, ply, dm) {
    const f = [elo, ply], ls = [], bs = [];
    for (let d = 4; d <= dm; d++) {
      const v = top[d], p = played[d]; if (!v || !p) return null;
      const keys = Object.keys(v).map(Number).sort((a, b) => a - b), lines = keys.map((k) => v[k]);
      const sc = lines.map((e) => e[0]).sort((a, b) => b - a); let tp = lines[0]; lines.forEach((e) => { if (e[0] > tp[0]) tp = e; });
      const best = sc[0], loss = Math.max(0, winP(best) - winP(p[0]));
      f.push(loss, best / 100, p[0] / 100, sc.length > 1 ? (sc[0] - sc[1]) / 100 : 20, p[1] === tp[1] ? 1 : 0, Math.log10(p[2] + 1), Math.log10(tp[2] + 1));
      ls.push(loss); bs.push(best);
    }
    const n = ls.length, last = (a, k) => a.slice(a.length - k), mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    const l4 = last(ls, 4), l5 = last(ls, 5), m5 = mean(l5);
    let flips = 0; for (let i = 0; i + 1 < n; i++) if ((ls[i] > 0.05) !== (ls[i + 1] > 0.05)) flips++;
    f.push(Math.max(...l4) - Math.min(...l4), ls[n - 1] - ls[n - 3], mean(last(ls, 3)), Math.sqrt(mean(l5.map((x) => (x - m5) * (x - m5)))), flips, bs[n - 1] - bs[n - 3], bs[n - 1] - bs[n - 6], ls[n - 1]);
    return f;
  }
  function predict(model, x) {
    const K = model.k, raw = model.base.slice(), T = model.trees;
    for (let i = 0; i < T.length; i++) {
      const t = T[i]; let n = 0;
      for (;;) { const nd = t[n]; if (nd.length === 1) { raw[i % K] += nd[0]; break; } const v = x[nd[0]]; n = (v !== v) ? (nd[4] ? nd[2] : nd[3]) : (v <= nd[1] ? nd[2] : nd[3]); }
    }
    let best = 0; for (let k = 1; k < K; k++) if (raw[k] > raw[best]) best = k;
    return { cls: model.classes[best], raw };
  }
  // ---- helpers shared by the app and the server -------------------------------------------------------------------------------------------------------------
  // record one engine "info" line: store[depth][multipv] = [score, firstMove, nodes]. Mate scores use 10000 - n (the same as the training data).
  function note(store, line) {
    if (!line.startsWith('info depth') || line.indexOf(' pv ') < 0) return;
    const d = +(/ depth (\d+)/.exec(line) || [])[1], k = +((/ multipv (\d+)/.exec(line) || [0, 1])[1]), cp = / score cp (-?\d+)/.exec(line), mt = / score mate (-?\d+)/.exec(line), nd = / nodes (\d+)/.exec(line);
    const v = cp ? +cp[1] : mt ? (+mt[1] > 0 ? 10000 - +mt[1] : -10000 - +mt[1]) : null; if (v === null || !d) return;
    (store[d] || (store[d] = {}))[k] = [v, line.split(' pv ')[1].split(' ')[0], nd ? +nd[1] : 0];
  }
  // is the played move one of the top two lines at the final depth? (if not, the caller runs a separate search restricted to that move)
  function inTop(top, move, dm) { const t = top[dm]; return !!t && Object.keys(t).some((k) => t[k][1] === move); }
  // the played move's line at every depth: follow its multipv slot if it is in the top two, else the separate search (playedLines: { depth: { 1: [..] } })
  function playedFrom(top, playedLines, move, dm) {
    const t = top[dm], out = {};
    if (t) for (const k of Object.keys(t)) if (t[k][1] === move) { for (let d = 4; d <= dm; d++) if (top[d] && top[d][k]) out[d] = top[d][k]; return out; }
    if (playedLines) for (const d of Object.keys(playedLines)) if (+d <= dm && playedLines[d][1]) out[d] = playedLines[d][1];
    return out;
  }
  // the class (0 best .. 5 blunder) or null when the search did not reach depth dm (then the caller keeps the plain grade)
  function grade(model, top, playedLines, move, elo, ply, dm) {
    const f = features(top, playedFrom(top, playedLines, move, dm), Math.max(500, Math.min(3000, elo || 1500)), ply, dm);
    return f ? predict(model, f).cls : null;
  }
  const cache = {};
  function load(url) { return cache[url] || (cache[url] = fetch(url).then((r) => { if (!r.ok) throw new Error('model ' + r.status); return r.json(); }).catch((e) => { delete cache[url]; throw e; })); }
  return { features, predict, load, note, inTop, playedFrom, grade, CLASS, LOSS_MID, winP };
});
