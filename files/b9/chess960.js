/* Chess960 (Fischer Random) rules for Sibyl, written from scratch because chess.js only knows ordinary castling.
   Same shape as chess.js where the app needs it: new Chess960(fen), fen(), turn(), moves({verbose}), move(...), undo(), history({verbose}), get(sq), in_check(),
   in_checkmate(), in_stalemate(), insufficient_material(), in_threefold_repetition(), in_draw(), game_over(), board(), load(fen), reset().
   Castling is written the Chess960 way: the king takes its own rook (e1h1). A move to the usual castling square (g1/c1) is accepted too when it is unambiguous.
   FEN uses Shredder letters for the castling rights (HAha: the files of the rooks), the form Stockfish expects with UCI_Chess960. Works in the browser and in Node. */
(function (root, make) { if (typeof module === 'object' && module.exports) module.exports = make(); else root.Chess960 = make(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const FILES = 'abcdefgh', START960 = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
  const sqName = (i) => FILES[i & 7] + (1 + (i >> 3)), sqIdx = (s) => (s.charCodeAt(0) - 97) + 8 * (+s[1] - 1);
  const isW = (p) => p !== '.' && p === p.toUpperCase(), colorOf = (p) => (isW(p) ? 'w' : 'b');
  const KN = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]], KG = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  const BD = [[1, 1], [1, -1], [-1, 1], [-1, -1]], RD = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  // the standard way to pick a start position: number 0..959 -> back rank (the Scharnagl numbering)
  function backRank(n) {
    const r = Array(8).fill(null); let x = n % 4; n = (n - x) / 4; r[2 * x + 1] = 'b';
    x = n % 4; n = (n - x) / 4; r[2 * x] = 'b';
    x = n % 6; n = (n - x) / 6; let free = r.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0); r[free[x]] = 'q';
    free = r.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    const pairs = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]][n];
    r[free[pairs[0]]] = 'n'; r[free[pairs[1]]] = 'n';
    free = r.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0); r[free[0]] = 'r'; r[free[1]] = 'k'; r[free[2]] = 'r';
    return r.join('');
  }
  function startFen(n) { const b = backRank(n == null ? Math.floor(Math.random() * 960) : n), rk = b.split(''); const rooks = []; rk.forEach((c, i) => { if (c === 'r') rooks.push(FILES[i]); });
    return b + '/pppppppp/8/8/8/8/PPPPPPPP/' + b.toUpperCase() + ' w ' + (rooks[1] + rooks[0]).toUpperCase() + rooks[1] + rooks[0] + ' - 0 1'; }

  class Chess960 {
    constructor(fen) { this.init = fen || startFen(518); this.load(this.init); }
    reset() { this.load(this.init); }
    load(fen) {
      const [pl, tm, ca, ep, hm, fm] = String(fen).trim().split(/\s+/);
      this.b = Array(64).fill('.'); const rows = pl.split('/');
      if (rows.length !== 8) throw new Error('bad fen'); rows.forEach((row, ri) => { let f = 0; for (const ch of row) { if (/\d/.test(ch)) f += +ch; else this.b[(7 - ri) * 8 + f++] = ch; } });
      this.t = tm === 'b' ? 'b' : 'w'; this.cr = { w: [], b: [] };       // castling rights: the files of the rooks that may still castle
      if (ca && ca !== '-') for (const ch of ca) {
        const up = ch === ch.toUpperCase(), c = up ? 'w' : 'b', row = up ? 0 : 7, kf = this.b.findIndex((p, i) => i >> 3 === row && p === (up ? 'K' : 'k')) & 7;
        let f;
        if (/[a-h]/i.test(ch) && !/[kq]/i.test(ch)) f = ch.toLowerCase().charCodeAt(0) - 97;
        else { const rk = up ? 'R' : 'r', cand = []; for (let x = 0; x < 8; x++) if (this.b[row * 8 + x] === rk) cand.push(x); f = /k/i.test(ch) ? Math.max(...cand.filter((x) => x > kf)) : Math.min(...cand.filter((x) => x < kf)); }
        if (isFinite(f)) this.cr[c].push(f);
      }
      this.ep = ep && ep !== '-' ? sqIdx(ep) : -1; this.hm = +hm || 0; this.fmn = +fm || 1; this.hist = []; this.keys = [this._key()];
      return true;
    }
    _key() { return this.b.join('') + this.t + this.cr.w.join('') + '|' + this.cr.b.join('') + (this.epCapturable() ? this.ep : -1); }
    epCapturable() { if (this.ep < 0) return false; const c = this.t, pw = c === 'w' ? 'P' : 'p', r = this.ep >> 3, f = this.ep & 7, rr = c === 'w' ? r - 1 : r + 1; return [f - 1, f + 1].some((x) => x >= 0 && x < 8 && this.b[rr * 8 + x] === pw); }
    turn() { return this.t; }
    fen() {
      let s = ''; for (let r = 7; r >= 0; r--) { let e = 0; for (let f = 0; f < 8; f++) { const p = this.b[r * 8 + f]; if (p === '.') e++; else { if (e) { s += e; e = 0; } s += p; } } if (e) s += e; if (r) s += '/'; }
      const ca = this.cr.w.slice().sort().map((f) => FILES[f].toUpperCase()).join('') + this.cr.b.slice().sort().map((f) => FILES[f]).join('');
      return s + ' ' + this.t + ' ' + (ca || '-') + ' ' + (this.epCapturable() ? sqName(this.ep) : '-') + ' ' + this.hm + ' ' + this.fmn;
    }
    get(sq) { const p = this.b[sqIdx(sq)]; return p === '.' ? null : { type: p.toLowerCase(), color: colorOf(p) }; }
    board() { const out = []; for (let r = 7; r >= 0; r--) { const row = []; for (let f = 0; f < 8; f++) { const p = this.b[r * 8 + f]; row.push(p === '.' ? null : { type: p.toLowerCase(), color: colorOf(p), square: sqName(r * 8 + f) }); } out.push(row); } return out; }
    kingSq(c) { return this.b.indexOf(c === 'w' ? 'K' : 'k'); }
    attacked(sq, by) {     // is square sq attacked by colour `by`?
      const f = sq & 7, r = sq >> 3, P = by === 'w' ? 'P' : 'p', N = by === 'w' ? 'N' : 'n', B = by === 'w' ? 'B' : 'b', R = by === 'w' ? 'R' : 'r', Q = by === 'w' ? 'Q' : 'q', K = by === 'w' ? 'K' : 'k';
      const pr = by === 'w' ? r - 1 : r + 1; if (pr >= 0 && pr < 8) for (const df of [-1, 1]) { const x = f + df; if (x >= 0 && x < 8 && this.b[pr * 8 + x] === P) return true; }
      for (const [df, dr] of KN) { const x = f + df, y = r + dr; if (x >= 0 && x < 8 && y >= 0 && y < 8 && this.b[y * 8 + x] === N) return true; }
      for (const [df, dr] of KG) { const x = f + df, y = r + dr; if (x >= 0 && x < 8 && y >= 0 && y < 8 && this.b[y * 8 + x] === K) return true; }
      for (const [df, dr] of BD) { let x = f + df, y = r + dr; while (x >= 0 && x < 8 && y >= 0 && y < 8) { const p = this.b[y * 8 + x]; if (p !== '.') { if (p === B || p === Q) return true; break; } x += df; y += dr; } }
      for (const [df, dr] of RD) { let x = f + df, y = r + dr; while (x >= 0 && x < 8 && y >= 0 && y < 8) { const p = this.b[y * 8 + x]; if (p !== '.') { if (p === R || p === Q) return true; break; } x += df; y += dr; } }
      return false;
    }
    in_check() { return this.attacked(this.kingSq(this.t), this.t === 'w' ? 'b' : 'w'); }
    // pseudo-legal moves of the side to move: { from, to, piece, captured, promo, flag: 'n' normal | 'd' double push | 'e' en passant | 'c' castle }
    pseudo() {
      const out = [], c = this.t, us = c === 'w', dir = us ? 1 : -1, last = us ? 7 : 0, startR = us ? 1 : 6;
      const mine = (p) => p !== '.' && isW(p) === us, theirs = (p) => p !== '.' && isW(p) !== us;
      for (let i = 0; i < 64; i++) {
        const p = this.b[i]; if (!mine(p)) continue; const f = i & 7, r = i >> 3, t = p.toLowerCase();
        const add = (to, flag, promo) => out.push({ from: i, to, piece: t, captured: flag === 'e' ? 'p' : this.b[to] === '.' ? null : this.b[to].toLowerCase(), promo: promo || null, flag: flag || 'n' });
        if (t === 'p') {
          const r1 = r + dir; if (r1 < 0 || r1 > 7) continue;
          const push = (to, flag) => { if ((to >> 3) === last) for (const q of 'qrbn') add(to, flag, q); else add(to, flag); };
          if (this.b[r1 * 8 + f] === '.') { push(r1 * 8 + f); if (r === startR && this.b[(r + 2 * dir) * 8 + f] === '.') add((r + 2 * dir) * 8 + f, 'd'); }
          for (const df of [-1, 1]) { const x = f + df; if (x < 0 || x > 7) continue; const to = r1 * 8 + x; if (theirs(this.b[to])) push(to); else if (to === this.ep && this.b[to] === '.') add(to, 'e'); }
        } else if (t === 'n' || t === 'k') {
          for (const [df, dr] of t === 'n' ? KN : KG) { const x = f + df, y = r + dr; if (x < 0 || x > 7 || y < 0 || y > 7) continue; const to = y * 8 + x; if (!mine(this.b[to])) add(to); }
        } else {
          const dirs = t === 'b' ? BD : t === 'r' ? RD : BD.concat(RD);
          for (const [df, dr] of dirs) { let x = f + df, y = r + dr; while (x >= 0 && x < 8 && y >= 0 && y < 8) { const to = y * 8 + x; if (mine(this.b[to])) break; add(to); if (theirs(this.b[to])) break; x += df; y += dr; } }
        }
      }
      // castling: the king goes to the g or c file, the rook to the f or d file; every square either of them crosses (or lands on) must be empty apart from the two
      // of them, and the king may not start in, cross or land on an attacked square
      const row = us ? 0 : 7, ks = this.kingSq(c), kf = ks & 7;
      if (ks >> 3 === row && this.cr[c].length && !this.attacked(ks, us ? 'b' : 'w')) {
        for (const rf of this.cr[c]) {
          const rs = row * 8 + rf, rk = us ? 'R' : 'r'; if (this.b[rs] !== rk) continue;
          const side = rf > kf ? 'k' : 'q', kt = side === 'k' ? 6 : 2, rt = side === 'k' ? 5 : 3;
          let ok = true; const lo = Math.min(kf, kt, rf, rt), hi = Math.max(kf, kt, rf, rt);
          for (let x = lo; x <= hi; x++) { const q = this.b[row * 8 + x]; if (x !== kf && x !== rf && q !== '.') { ok = false; break; } }
          if (ok) { const a = Math.min(kf, kt), z = Math.max(kf, kt); for (let x = a; x <= z; x++) if (this.attacked(row * 8 + x, us ? 'b' : 'w') && x !== kf) { ok = false; break; } }
          if (ok) out.push({ from: ks, to: rs, piece: 'k', captured: null, promo: null, flag: 'c', kt: row * 8 + kt, rt: row * 8 + rt, side });
        }
      }
      return out;
    }
    _apply(m) {     // returns an undo record
      const u = { b: this.b.slice(), t: this.t, cr: { w: this.cr.w.slice(), b: this.cr.b.slice() }, ep: this.ep, hm: this.hm, fmn: this.fmn }, c = this.t, us = c === 'w';
      const P = this.b[m.from];
      if (m.flag === 'c') { const rk = this.b[m.to]; this.b[m.from] = '.'; this.b[m.to] = '.'; this.b[m.kt] = P; this.b[m.rt] = rk; this.cr[c] = []; }
      else {
        this.b[m.from] = '.';
        if (m.flag === 'e') this.b[m.to + (us ? -8 : 8)] = '.';
        this.b[m.to] = m.promo ? (us ? m.promo.toUpperCase() : m.promo) : P;
        if (m.piece === 'k') this.cr[c] = [];
        const row = us ? 0 : 7; if (m.piece === 'r' && m.from >> 3 === row) this.cr[c] = this.cr[c].filter((f) => f !== (m.from & 7));
        const oc = us ? 'b' : 'w', orow = us ? 7 : 0; if (m.captured && m.to >> 3 === orow) this.cr[oc] = this.cr[oc].filter((f) => f !== (m.to & 7));
      }
      this.ep = m.flag === 'd' ? (m.from + m.to) / 2 : -1;
      this.hm = m.piece === 'p' || m.captured ? 0 : this.hm + 1; if (c === 'b') this.fmn++; this.t = us ? 'b' : 'w';
      return u;
    }
    _undo(u) { this.b = u.b; this.t = u.t; this.cr = u.cr; this.ep = u.ep; this.hm = u.hm; this.fmn = u.fmn; }
    _legal() {
      const c = this.t, out = [];
      for (const m of this.pseudo()) { const u = this._apply(m), bad = this.attacked(this.kingSq(c), this.t); this._undo(u); if (!bad) out.push(m); }
      return out;
    }
    _san(m, legal) {
      if (m.flag === 'c') return (m.side === 'k' ? 'O-O' : 'O-O-O') + this._suffix(m);
      let s = '';
      if (m.piece === 'p') { if (m.captured) s += FILES[m.from & 7] + 'x'; s += sqName(m.to); if (m.promo) s += '=' + m.promo.toUpperCase(); }
      else {
        s += m.piece.toUpperCase();
        const same = legal.filter((o) => o !== m && o.piece === m.piece && o.to === m.to && o.flag !== 'c');
        if (same.length) { const sf = same.some((o) => (o.from & 7) === (m.from & 7)), sr = same.some((o) => (o.from >> 3) === (m.from >> 3)); s += !sf ? FILES[m.from & 7] : !sr ? (1 + (m.from >> 3)) : sqName(m.from); }
        if (m.captured) s += 'x'; s += sqName(m.to);
      }
      return s + this._suffix(m);
    }
    _suffix(m) { const u = this._apply(m), chk = this.in_check(), n = chk ? this._legal().length : 1; this._undo(u); return chk ? (n === 0 ? '#' : '+') : ''; }
    _verbose(m, legal) {
      const c = this.t, flags = m.flag === 'c' ? (m.side === 'k' ? 'k' : 'q') : (m.captured ? 'c' : 'n') + (m.flag === 'd' ? 'b' : '') + (m.flag === 'e' ? 'e' : '') + (m.promo ? 'p' : '');
      return { color: c, from: sqName(m.from), to: m.flag === 'c' ? sqName(m.to) : sqName(m.to), piece: m.piece, captured: m.captured || undefined, promotion: m.promo || undefined, flags, san: this._san(m, legal),
        castle: m.flag === 'c' ? { king: sqName(m.kt), rook: sqName(m.rt), side: m.side } : undefined };
    }
    moves(opt) {
      const legal = this._legal(); let list = legal;
      if (opt && opt.square) { const s = sqIdx(opt.square); list = legal.filter((m) => m.from === s); }
      return opt && opt.verbose ? list.map((m) => this._verbose(m, legal)) : list.map((m) => this._san(m, legal));
    }
    // m: a SAN string, or { from, to, promotion }. Castling: king onto its own rook (e1h1) or onto the g/c square (e1g1).
    move(m) {
      const legal = this._legal(); let found = null;
      if (typeof m === 'string') found = legal.find((x) => this._san(x, legal) === m || this._san(x, legal).replace(/[+#]/g, '') === m.replace(/[+#]/g, ''));
      else if (m) {
        const from = sqIdx(m.from), to = sqIdx(m.to), cand = legal.filter((x) => x.from === from && (x.to === to || (x.flag === 'c' && x.kt === to)));
        found = cand.find((x) => x.flag === 'c' && x.to === to) || cand.find((x) => (x.promo || 'q') === (m.promotion || 'q') && x.flag !== 'c') || cand.find((x) => x.flag === 'c') || null;
        if (found && found.flag !== 'c' && found.promo && !m.promotion) found = cand.find((x) => x.promo === 'q') || found;
      }
      if (!found) return null;
      const v = this._verbose(found, legal), u = this._apply(found); u.m = v; this.hist.push(u); this.keys.push(this._key()); return v;
    }
    undo() { const u = this.hist.pop(); if (!u) return null; this.keys.pop(); const m = u.m; this._undo(u); return m; }
    history(opt) { return opt && opt.verbose ? this.hist.map((u) => u.m) : this.hist.map((u) => u.m.san); }
    in_checkmate() { return this.in_check() && this._legal().length === 0; }
    in_stalemate() { return !this.in_check() && this._legal().length === 0; }
    insufficient_material() {
      const ps = this.b.filter((p) => p !== '.' && p.toLowerCase() !== 'k').map((p) => p.toLowerCase()); if (!ps.length) return true;
      if (ps.every((p) => p === 'b' || p === 'n') && ps.length === 1) return true;
      if (ps.every((p) => p === 'b')) { const sq = this.b.map((p, i) => (p !== '.' && p.toLowerCase() === 'b' ? ((i >> 3) + (i & 7)) % 2 : -1)).filter((x) => x >= 0); return sq.every((x) => x === sq[0]); }
      return false;
    }
    in_threefold_repetition() { const k = this.keys[this.keys.length - 1]; return this.keys.filter((x) => x === k).length >= 3; }
    in_draw() { return this.hm >= 100 || this.in_stalemate() || this.insufficient_material() || this.in_threefold_repetition(); }
    game_over() { return this.in_draw() || this.in_checkmate(); }
    perft(d) { if (d === 0) return 1; const L = this._legal(); if (d === 1) return L.length; let n = 0; for (const m of L) { const u = this._apply(m); n += this.perft(d - 1); this._undo(u); } return n; }
  }
  Chess960.startFen = startFen; Chess960.backRank = backRank;
  return Chess960;
});
