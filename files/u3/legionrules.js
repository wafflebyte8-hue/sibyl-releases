/* Legion rules (Sibyl 5.4): chess where the pieces of a player with a LONG STREAK move differently.
   Each player has a LEVEL 0..5 (from the streak's strength, see levelOf). Every level unlocks one more change, for ALL pieces of that type of that player:
     level 1 Bronze  : pawns also step one square sideways (never a capture)
     level 2 Silver  : knights and bishops also step one square straight (a move or a capture)
     level 3 Gold    : rooks also step one square diagonally (a move or a capture)
     level 4 Aurora  : queens also jump like a knight
     level 5 Legend  : kings also leap two squares straight up or down, or diagonally, onto empty squares (never a capture)
   At level 0 it is exactly normal chess (checked against chess.js move for move in tools/test_legion_rules.js).
   Everything else (check, checkmate, stalemate, en passant, promotion) works as in chess. Castling works when the king is on d or e of its back row and a rook is on the corner: the king moves two squares towards it and the rook hops over.
   LegionGame has the same methods as a chess.js game that the app uses (move, moves, undo, history, fen, load, reset, turn, board, in_check, in_checkmate, in_stalemate, in_draw,
   insufficient_material, in_threefold_repetition, game_over), so the rest of the app does not need to know the difference.
   This file is used by the phone, by the Cloudflare worker and by the Vercel server: keep www/legionrules.js identical (tools/sync_legion.sh, checked by the test). */
(function (root) {
  'use strict';
  const FILES = 'abcdefgh', NAMES = ['Plain', 'Bronze', 'Silver', 'Gold', 'Aurora', 'Legend'], THRESH = [3, 6, 10, 16, 24];
  const UNLOCK = { p: 1, n: 2, b: 2, r: 3, q: 4, k: 5 };          // the first level at which a piece type changes
  const levelOf = (strength) => { let l = 0; for (let i = 0; i < THRESH.length; i++) if (strength >= THRESH[i]) l = i + 1; return l; };
  const has = (level, t) => level >= UNLOCK[t];
  const TEXT = {
    p: 'Pawns also step one square sideways (no capture).', n: 'Knights also step one square straight (move or capture).', b: 'Bishops also step one square straight (move or capture).',
    r: 'Rooks also step one square diagonally (move or capture).', q: 'Queens also jump like a knight.', k: 'Kings also leap two squares up, down or diagonally onto empty squares (no capture).',
  };
  const describe = (level) => ['p', 'n', 'b', 'r', 'q', 'k'].filter((t) => has(level, t)).map((t) => ({ piece: t, level: UNLOCK[t], text: TEXT[t] }));
  const STD_ROW = 'rnbqkbnr';
  const validRow = (r) => typeof r === 'string' && r.length === 8 && r.toLowerCase().split('').sort().join('') === STD_ROW.split('').sort().join('');
  // the start position: each player's back row is their own arrangement (white row, black row as 8 letters a..h), pawns on the second rows, no castling
  // Castling in Legion: only with the king on d or e of the back row and a rook on the corner (a or h) on that side. The king moves two squares towards that rook
  // and the rook hops over it to the square the king crossed (with the king on e this is ordinary castling). So the start position gives a right for each corner rook.
  const rights = (row, upper) => { const k = row.indexOf('k'); if (k !== 3 && k !== 4) return ''; const o = (row[7] === 'r' ? 'k' : '') + (row[0] === 'r' ? 'q' : ''); return upper ? o.toUpperCase() : o; };
  const startFen = (wRow, bRow) => {
    const b = (validRow(bRow || STD_ROW) ? (bRow || STD_ROW) : STD_ROW).toLowerCase(), w = (validRow(wRow || STD_ROW) ? (wRow || STD_ROW) : STD_ROW).toLowerCase();
    return b + '/pppppppp/8/8/8/8/PPPPPPPP/' + w.toUpperCase() + ' w ' + ((rights(w, true) + rights(b, false)) || '-') + ' - 0 1';
  };

  const sq = (f, r) => r * 8 + f, nm = (s) => FILES[s & 7] + ((s >> 3) + 1), ix = (s) => s.charCodeAt(0) - 97 + (s.charCodeAt(1) - 49) * 8;
  const KN = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]], ORTH = [[1, 0], [-1, 0], [0, 1], [0, -1]], DIAG = [[1, 1], [1, -1], [-1, 1], [-1, -1]], ALL8 = ORTH.concat(DIAG);
  const other = (c) => (c === 'w' ? 'b' : 'w');
  const P = (t, c) => ({ type: t, color: c });

  // the squares a piece attacks (where it could capture), given the board and the owner's level
  function attackSquares(board, from, p, level, out) {
    const f = from & 7, r = from >> 3, t = p.type, c = p.color;
    const step = (dirs) => { for (const d of dirs) { const nf = f + d[0], nr = r + d[1]; if (nf >= 0 && nf < 8 && nr >= 0 && nr < 8) out.push(sq(nf, nr)); } };
    const slide = (dirs) => { for (const d of dirs) { let nf = f + d[0], nr = r + d[1]; while (nf >= 0 && nf < 8 && nr >= 0 && nr < 8) { const s = sq(nf, nr); out.push(s); if (board[s]) break; nf += d[0]; nr += d[1]; } } };
    if (t === 'p') { const dr = c === 'w' ? 1 : -1; for (const df of [-1, 1]) { const nf = f + df, nr = r + dr; if (nf >= 0 && nf < 8 && nr >= 0 && nr < 8) out.push(sq(nf, nr)); } }
    else if (t === 'n') { step(KN); if (has(level, 'n')) step(ORTH); }
    else if (t === 'b') { slide(DIAG); if (has(level, 'b')) step(ORTH); }
    else if (t === 'r') { slide(ORTH); if (has(level, 'r')) step(DIAG); }
    else if (t === 'q') { slide(ALL8); if (has(level, 'q')) step(KN); }
    else if (t === 'k') step(ALL8);
    return out;
  }
  function attacked(board, target, by, level) {
    const buf = [];
    for (let s = 0; s < 64; s++) { const p = board[s]; if (!p || p.color !== by) continue; buf.length = 0; attackSquares(board, s, p, level, buf); if (buf.indexOf(target) >= 0) return true; }
    return false;
  }
  const kingSq = (board, c) => { for (let s = 0; s < 64; s++) { const p = board[s]; if (p && p.type === 'k' && p.color === c) return s; } return -1; };

  // pseudo-legal moves of one colour (they may leave the own king in check: legality is checked afterwards)
  function pseudo(state, c, levels) {
    const { board, ep, castling } = state, lv = levels[c], out = [], buf = [];
    const add = (from, to, p, extra) => { const cap = board[to]; const m = { from, to, piece: p.type, color: c, captured: cap ? cap.type : undefined, flags: cap ? 'c' : 'n' }; if (extra) Object.assign(m, extra); out.push(m); };
    for (let s = 0; s < 64; s++) {
      const p = board[s]; if (!p || p.color !== c) continue; const f = s & 7, r = s >> 3;
      if (p.type === 'p') {
        const dr = c === 'w' ? 1 : -1, start = c === 'w' ? 1 : 6, last = c === 'w' ? 7 : 0, promo = (from, to, cap, flags) => { for (const pr of ['q', 'r', 'b', 'n']) out.push({ from, to, piece: 'p', color: c, captured: cap, promotion: pr, flags: (flags || 'n') + 'p' }); };
        const nr = r + dr;
        if (nr >= 0 && nr < 8 && !board[sq(f, nr)]) {
          if (nr === last) promo(s, sq(f, nr), undefined, 'n'); else { out.push({ from: s, to: sq(f, nr), piece: 'p', color: c, flags: 'n' }); if (r === start && !board[sq(f, r + 2 * dr)]) out.push({ from: s, to: sq(f, r + 2 * dr), piece: 'p', color: c, flags: 'nb' }); }
        }
        for (const df of [-1, 1]) {
          const nf = f + df; if (nf < 0 || nf > 7 || nr < 0 || nr > 7) continue; const to = sq(nf, nr), tp = board[to];
          if (tp && tp.color !== c) { if (nr === last) promo(s, to, tp.type, 'c'); else out.push({ from: s, to, piece: 'p', color: c, captured: tp.type, flags: 'c' }); }
          else if (!tp && ep === to) out.push({ from: s, to, piece: 'p', color: c, captured: 'p', flags: 'e' });
        }
        if (has(lv, 'p')) for (const df of [-1, 1]) { const nf = f + df; if (nf >= 0 && nf < 8 && !board[sq(nf, r)]) out.push({ from: s, to: sq(nf, r), piece: 'p', color: c, flags: 'n', side: true }); }
        continue;
      }
      buf.length = 0; attackSquares(board, s, p, lv, buf);
      for (const to of buf) { const tp = board[to]; if (!tp || tp.color !== c) add(s, to, p); }
      if (p.type === 'k') {
        // castling: the king on d or e of its back row, the rook on the corner, nothing between them (see rights() above)
        const home = c === 'w' ? 0 : 7, kr = c === 'w' ? 'K' : 'k', qr = c === 'w' ? 'Q' : 'q', rk = (file) => board[sq(file, home)] && board[sq(file, home)].type === 'r' && board[sq(file, home)].color === c;
        if (r === home && (f === 3 || f === 4)) {
          let free = true; for (let x = f + 1; x < 7; x++) if (board[sq(x, home)]) free = false;
          if (free && castling.indexOf(kr) >= 0 && rk(7)) out.push({ from: s, to: sq(f + 2, home), piece: 'k', color: c, flags: 'k' });
          free = true; for (let x = 1; x < f; x++) if (board[sq(x, home)]) free = false;
          if (free && castling.indexOf(qr) >= 0 && rk(0)) out.push({ from: s, to: sq(f - 2, home), piece: 'k', color: c, flags: 'q' });
        }
        if (has(lv, 'k')) for (const d of ORTH.slice(2).concat(DIAG)) {          // the leap: two squares up/down or diagonally, both squares empty
          const m1f = f + d[0], m1r = r + d[1], m2f = f + 2 * d[0], m2r = r + 2 * d[1];
          if (m2f >= 0 && m2f < 8 && m2r >= 0 && m2r < 8 && !board[sq(m1f, m1r)] && !board[sq(m2f, m2r)]) out.push({ from: s, to: sq(m2f, m2r), piece: 'k', color: c, flags: 'n', leap: true });
        }
      }
    }
    return out;
  }
  // play a move on a copy of the state
  function apply(state, m) {
    const board = state.board.slice(), c = m.color, e = other(c);
    const p = board[m.from]; board[m.from] = null;
    if (m.flags.indexOf('e') >= 0) board[sq(m.to & 7, m.from >> 3)] = null;
    board[m.to] = m.promotion ? P(m.promotion, c) : p;
    let castling = state.castling;
    if (m.flags === 'k') { const h = c === 'w' ? 0 : 7; board[sq((m.to & 7) - 1, h)] = board[sq(7, h)]; board[sq(7, h)] = null; }
    if (m.flags === 'q') { const h = c === 'w' ? 0 : 7; board[sq((m.to & 7) + 1, h)] = board[sq(0, h)]; board[sq(0, h)] = null; }
    if (castling !== '-') {
      let x = castling;
      if (p.type === 'k') x = x.replace(c === 'w' ? /[KQ]/g : /[kq]/g, '');
      const touch = (s) => { if (s === 0) x = x.replace('Q', ''); if (s === 7) x = x.replace('K', ''); if (s === 56) x = x.replace('q', ''); if (s === 63) x = x.replace('k', ''); };
      touch(m.from); touch(m.to); castling = x || '-';
    }
    const ep = m.flags.indexOf('b') >= 0 ? sq(m.from & 7, (m.from >> 3) + (c === 'w' ? 1 : -1)) : -1;
    return { board, turn: e, castling, ep, half: m.piece === 'p' || m.captured ? 0 : state.half + 1, full: state.full + (c === 'b' ? 1 : 0) };
  }
  function legal(state, levels) {
    const c = state.turn, e = other(c), out = [];
    for (const m of pseudo(state, c, levels)) {
      if (m.flags === 'k' || m.flags === 'q') {          // not out of, through or into check
        const h = c === 'w' ? 0 : 7, ks = m.from;
        if (attacked(state.board, ks, e, levels[e])) continue;
        const mid = sq((m.from & 7) + (m.flags === 'k' ? 1 : -1), h); const tmp = state.board.slice(); tmp[mid] = tmp[ks]; tmp[ks] = null; if (attacked(tmp, mid, e, levels[e])) continue;
      }
      const ns = apply(state, m), ks = kingSq(ns.board, c);
      if (ks >= 0 && attacked(ns.board, ks, e, levels[e])) continue;
      out.push(m);
    }
    return out;
  }
  function parseFen(fen) {
    const parts = String(fen).trim().split(/\s+/); if (parts.length < 2) return null;
    const rows = parts[0].split('/'); if (rows.length !== 8) return null;
    const board = new Array(64).fill(null);
    for (let i = 0; i < 8; i++) { let f = 0; for (const ch of rows[i]) { if (/\d/.test(ch)) f += +ch; else { const lo = ch.toLowerCase(); if (!'pnbrqk'.includes(lo)) return null; if (f > 7) return null; board[sq(f, 7 - i)] = P(lo, ch === lo ? 'b' : 'w'); f++; } } if (f !== 8) return null; }
    return { board, turn: parts[1] === 'b' ? 'b' : 'w', castling: parts[2] && parts[2] !== '-' ? parts[2] : '-', ep: parts[3] && parts[3] !== '-' ? ix(parts[3]) : -1, half: +parts[4] || 0, full: +parts[5] || 1 };
  }
  function toFen(s) {
    let o = []; for (let r = 7; r >= 0; r--) { let row = '', n = 0; for (let f = 0; f < 8; f++) { const p = s.board[sq(f, r)]; if (!p) { n++; continue; } if (n) { row += n; n = 0; } row += p.color === 'w' ? p.type.toUpperCase() : p.type; } if (n) row += n; o.push(row); }
    return o.join('/') + ' ' + s.turn + ' ' + (s.castling || '-') + ' ' + (s.ep >= 0 ? nm(s.ep) : '-') + ' ' + s.half + ' ' + s.full;
  }
  const fen4 = (s) => toFen(s).split(' ').slice(0, 4).join(' ');

  class LegionGame {
    constructor(fen, levels) { this.levels = { w: 0, b: 0 }; if (levels) { this.levels.w = levels.w | 0; this.levels.b = levels.b | 0; } this.kind = 'legion'; this._start = fen || startFen(); this.load(this._start); }
    load(fen) { const s = parseFen(fen); if (!s) return false; this.s = s; this.h = []; this._cache = null; return true; }
    reset() { this.load(this._start); }
    setLevels(l) { this.levels = { w: l.w | 0, b: l.b | 0 }; this._cache = null; }
    fen() { return toFen(this.s); }
    turn() { return this.s.turn; }
    get(square) { const p = this.s.board[ix(square)]; return p ? { type: p.type, color: p.color } : null; }
    board() { const out = []; for (let r = 7; r >= 0; r--) { const row = []; for (let f = 0; f < 8; f++) { const p = this.s.board[sq(f, r)]; row.push(p ? { type: p.type, color: p.color } : null); } out.push(row); } return out; }
    _legal() { if (!this._cache) this._cache = this._withSan(legal(this.s, this.levels)); return this._cache; }
    _withSan(list) {
      const c = this.s.turn, e = other(c);
      for (const m of list) {
        let san = '';
        if (m.flags === 'k') san = 'O-O'; else if (m.flags === 'q') san = 'O-O-O';
        else {
          const to = nm(m.to), cap = m.flags.indexOf('c') >= 0 || m.flags.indexOf('e') >= 0;
          if (m.piece === 'p') san = (cap ? FILES[m.from & 7] + 'x' : '') + to;
          else {
            let dis = ''; const rivals = list.filter((o) => o !== m && o.piece === m.piece && o.to === m.to);
            if (rivals.length) { const sameFile = rivals.some((o) => (o.from & 7) === (m.from & 7)), sameRank = rivals.some((o) => (o.from >> 3) === (m.from >> 3)); dis = !sameFile ? FILES[m.from & 7] : !sameRank ? String((m.from >> 3) + 1) : nm(m.from); }
            san = m.piece.toUpperCase() + dis + (cap ? 'x' : '') + to;
          }
          if (m.promotion) san += '=' + m.promotion.toUpperCase();
        }
        const ns = apply(this.s, m), ks = kingSq(ns.board, e);
        if (ks >= 0 && attacked(ns.board, ks, c, this.levels[c])) san += legal(ns, this.levels).length ? '+' : '#';
        m.san = san;
      }
      return list;
    }
    _verbose(m) { const o = { color: m.color, from: nm(m.from), to: nm(m.to), flags: m.flags, piece: m.piece, san: m.san }; if (m.captured) o.captured = m.captured; if (m.promotion) o.promotion = m.promotion; return o; }
    moves(opt) {
      let list = this._legal(); if (opt && opt.square) { const f = ix(opt.square); list = list.filter((m) => m.from === f); }
      return opt && opt.verbose ? list.map((m) => this._verbose(m)) : list.map((m) => m.san);
    }
    move(x) {
      let m = null; const list = this._legal();
      if (typeof x === 'string') m = list.find((o) => o.san === x || o.san.replace(/[+#]/g, '') === x.replace(/[+#]/g, ''));
      else if (x && x.from && x.to) { const f = ix(x.from), t = ix(x.to), pr = x.promotion ? String(x.promotion).toLowerCase() : 'q'; m = list.find((o) => o.from === f && o.to === t && (!o.promotion || o.promotion === pr)); }
      if (!m) return null;
      this.h.push({ prev: this.s, move: m, levels: this.levels }); this.s = apply(this.s, m); this._cache = null; return this._verbose(m);
    }
    undo() { const e = this.h.pop(); if (!e) return null; this.s = e.prev; this._cache = null; return this._verbose(e.move); }
    history(opt) { return opt && opt.verbose ? this.h.map((e) => this._verbose(e.move)) : this.h.map((e) => e.move.san); }
    in_check() { const c = this.s.turn, ks = kingSq(this.s.board, c); return ks >= 0 && attacked(this.s.board, ks, other(c), this.levels[other(c)]); }
    in_checkmate() { return this.in_check() && this._legal().length === 0; }
    in_stalemate() { return !this.in_check() && this._legal().length === 0; }
    insufficient_material() {
      const ps = []; for (const p of this.s.board) if (p) ps.push(p); if (ps.length === 2) return true;
      if (this.levels.w || this.levels.b) return false;
      const minor = ps.filter((p) => p.type !== 'k'); if (ps.length === 3 && (minor[0].type === 'n' || minor[0].type === 'b')) return true;
      // only bishops, all on squares of one colour (as chess.js does)
      let sum = 0, count = 0; for (let s = 0; s < 64; s++) { const p = this.s.board[s]; if (!p || p.type === 'k') continue; if (p.type !== 'b') return false; sum += ((s & 7) + (s >> 3)) % 2; count++; }
      return count > 0 && (sum === 0 || sum === count);
    }
    in_threefold_repetition() { const key = fen4(this.s); let n = 1; for (const e of this.h) if (fen4(e.prev) === key) n++; return n >= 3; }
    in_draw() { return this.s.half >= 100 || this.in_stalemate() || this.insufficient_material() || this.in_threefold_repetition(); }
    game_over() { return this.in_draw() || this._legal().length === 0; }
    pgn() { const out = []; this.h.forEach((e, i) => { if (i % 2 === 0) out.push((i / 2 + 1) + '.'); out.push(e.move.san); }); return out.join(' '); }
  }
  const api = { LegionGame, levelOf, has, describe, startFen, validRow, NAMES, THRESH, UNLOCK, TEXT, STD_ROW, parseFen, toFen, legal, perft: null };
  api.perft = function perft(fen, depth, levels) { const lv = levels || { w: 0, b: 0 }; const go = (s, d) => { if (d === 0) return 1; const ms = legal(s, lv); if (d === 1) return ms.length; let n = 0; for (const m of ms) n += go(apply(s, m), d - 1); return n; }; return go(parseFen(fen), depth); };
  root.LegionRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
