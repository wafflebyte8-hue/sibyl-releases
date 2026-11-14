// Sibyl bots: a roster of hundreds of opponents with generated faces, names, ratings and playing styles.
// Procedural cartoon faces, version 3. A face comes from a seed (random bots) or from a hand-written spec (the legends and creators, drawn
// from their well-known features: hair, beard, glasses, age, clothes). Nothing here is a photograph or a traced portrait.
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const AV = {
  skin: ['#f8d9c0', '#f1c7a3', '#e3ab7f', '#cb8d5f', '#a96b41', '#80502f', '#5d3822'],
  hair: [['#1b1410', '#3a2b22'], ['#3b2716', '#5e432b'], ['#6b4425', '#94673c'], ['#a9742f', '#d29a4e'], ['#d6b263', '#f0d58f'], ['#a9482a', '#d9703f'], ['#8a8a92', '#c4c4cc'], ['#dcd7cd', '#f7f4ee'], ['#5b3a85', '#8a5fc0'], ['#2c6a8a', '#4c9bc0']],
  iris: ['#4a2f1c', '#6b4a2b', '#2f5f8a', '#3f7a52', '#7a6a3a', '#3a3a44'],
  bg: [['#4f7a8c', '#2c4656'], ['#8a5e49', '#523428'], ['#5f8a63', '#34503a'], ['#8a4f70', '#54304a'], ['#6e6fa8', '#40406e'], ['#a98638', '#6e5222'], ['#3f8a8a', '#245555'], ['#a85a49', '#6e3328'], ['#6a6a76', '#3a3a44'], ['#4f86a8', '#2c5270']],
  cloth: ['#d2563f', '#2f6fb5', '#3fa37a', '#e0a33a', '#8e5bc4', '#e6e6e0', '#2b2b32', '#c4568a', '#5a8f9e', '#7a8a3f', '#b06a3a', '#4a5fbf'],
};
const pick = (r, a) => a[Math.floor(r() * a.length)];
function shade(hex, amt) { const n = parseInt(hex.slice(1), 16); const f = (c) => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt))); return '#' + [n >> 16, n >> 8 & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join(''); }
const T = (n) => +n.toFixed(2);
function botFace(seed, gender, plain, spec) {
  const r = mulberry32(seed * 2654435761 >>> 0), id = 'f' + seed, S = spec || {}, has = (k) => S[k] !== undefined;
  const fem = has('fem') ? S.fem : gender === 'f';
  // ---- parameters: random unless the spec says otherwise (every random draw happens either way, so a seed always gives the same face)
  const rSkin = pick(r, AV.skin), rHair = pick(r, plain ? AV.hair.slice(0, 8) : AV.hair), rBg = pick(r, AV.bg), rCloth = pick(r, AV.cloth), rIris = pick(r, AV.iris);
  const rHs = pick(r, plain ? (fem ? [3, 3, 4, 4, 9, 9, 1, 0, 13] : [0, 0, 1, 1, 2, 10, 12, 12, 13, 13]) : fem ? [3, 3, 4, 4, 4, 5, 6, 7, 8, 8, 9, 9, 1, 1, 0, 13] : [0, 0, 0, 1, 1, 2, 6, 7, 10, 10, 11, 12, 12, 13, 13, 5, 8]);
  const rEye = Math.floor(r() * 4), rBrow = Math.floor(r() * 4), rMouth = pick(r, [0, 0, 0, 1, 1, 2, 2, 3, 4]), rNose = Math.floor(r() * 3), rCloth2 = Math.floor(r() * 5);
  const rGlasses = r() < .22 ? Math.floor(r() * 3) : -1, beardRoll = r(), rHat = r() < .1 ? Math.floor(r() * 3) : -1, earring0 = r() < .14, rRound = fem ? .87 + r() * .12 : .97 + r() * .13, rChin = r(), freckles0 = r() < .12, rHh = 22.5 + r() * 2.5;
  const earring = !spec && earring0, freckles = !spec && freckles0;
  const skin = S.skin || rSkin, [h1, h2] = S.hair || rHair, bg = S.bg === 'sepia' ? ['#8a7a62', '#4e4333'] : S.bg === 'bw' ? ['#8f8f8f', '#4a4a4a'] : S.bg || rBg;
  const skinD = shade(skin, -.2), skinL = shade(skin, .12), cloth = S.cloth && S.cloth.col || rCloth, clothD = shade(cloth, -.22), iris = S.iris || rIris, age = S.age || 0;
  const eyeS = has('eye') ? S.eye : spec ? 0 : rEye, browS = has('brow') ? S.brow : spec ? 0 : rBrow, mouthS = has('mouth') ? S.mouth : spec ? 0 : rMouth, noseS = rNose;
  const hw = 18.5 * (S.w || rRound), hh = (S.h || 0) + rHh, cy = 46, top = cy - hh, natural = !['#5b3a85', '#2c6a8a'].includes(h1), browC = S.browC || (natural ? shade(h1, -.1) : '#2a1c14');
  const L = 50 - hw, R = 50 + hw, cw = S.jaw !== undefined ? S.jaw : fem ? 2.6 + rChin * 3 : 5 + rChin * 4;
  const hairStyle = S.hs || rHs, hairy = typeof hairStyle === 'string', HAIR = `url(#hr${id})`;
  let s = `<defs><linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient>` +
    `<radialGradient id="sk${id}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="${skinL}"/><stop offset=".55" stop-color="${skin}"/><stop offset="1" stop-color="${skinD}"/></radialGradient>` +
    `<linearGradient id="hr${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${h2}"/><stop offset=".6" stop-color="${h1}"/></linearGradient>` +
    `<linearGradient id="cl${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cloth}"/><stop offset="1" stop-color="${clothD}"/></linearGradient>` +
    `<linearGradient id="ft${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".2"/><stop offset=".35" stop-color="#000" stop-opacity="0"/></linearGradient></defs>` +
    `<rect x="-10" y="-10" width="120" height="120" fill="url(#bg${id})"/><circle cx="50" cy="40" r="38" fill="#ffffff" opacity=".07"/>`;
  let clipN = 0;
  // a hair shape with strands drawn inside it
  const hairShape = (d, o) => { o = o || {}; const cid = `hc${id}_${clipN++}`; let g = `<clipPath id="${cid}"><path d="${d}"/></clipPath><path d="${d}" fill="${HAIR}"/><g clip-path="url(#${cid})" fill="none" stroke-linecap="round">`;
    const rr = mulberry32(seed + clipN * 7), cx = o.cx !== undefined ? o.cx : 50, cyy = o.cy !== undefined ? o.cy : top + 16;
    for (let i = 0; i < (o.n || 9); i++) { const a = (-70 + i * (140 / ((o.n || 9) - 1)) + (rr() - .5) * 10) * Math.PI / 180, r0 = 6 + rr() * 6, r1 = 22 + rr() * 16, x0 = cx + Math.sin(a) * r0, y0 = cyy - Math.cos(a) * r0 * .6, x1 = cx + Math.sin(a) * r1, y1 = cyy - Math.cos(a) * r1 * .62;
      g += `<path d="M${T(x0)} ${T(y0)} Q${T((x0 + x1) / 2 + (rr() - .5) * 5)} ${T((y0 + y1) / 2 - 3)} ${T(x1)} ${T(y1)}" stroke="${i % 3 === 0 ? shade(h2, .18) : shade(h1, -.28)}" stroke-width=".9" opacity="${i % 3 === 0 ? .3 : .35}"/>`; }
    return g + '</g>'; };
  const mirror = (str) => `<g transform="translate(100 0) scale(-1 1)">${str}</g>`;
  // ---------- hair behind the head
  const longB = { longs: 1, longw: 1, fringe: 1 }[hairStyle] || (!hairy && (hairStyle === 3 || hairStyle === 4 || hairStyle === 9));
  const lenBack = S.hlen || ((hairStyle === 9) ? 21 : hairStyle === 3 ? 29 : 40);
  if (hairy ? (hairStyle === 'longs' || hairStyle === 'fringe') : hairStyle === 4) s += `<path d="M${T(L - 3)} ${cy - 2} C${T(L - 6)} ${T(top - 8)} ${T(R + 6)} ${T(top - 8)} ${T(R + 3)} ${cy - 2} C${T(R + 7)} ${cy + 16} ${T(R + 6)} ${cy + lenBack - 6} ${T(R + 2)} ${cy + lenBack} L${T(L - 2)} ${cy + lenBack} C${T(L - 6)} ${cy + lenBack - 6} ${T(L - 7)} ${cy + 16} ${T(L - 3)} ${cy - 2}Z" fill="${HAIR}"/>`;
  if (hairy && hairStyle === 'longw') s += `<path d="M${T(L - 4)} ${cy - 2} C${T(L - 7)} ${T(top - 8)} ${T(R + 7)} ${T(top - 8)} ${T(R + 4)} ${cy - 2} C${T(R + 9)} ${cy + 10} ${T(R + 4)} ${cy + 20} ${T(R + 8)} ${cy + 28} Q${T(R + 2)} ${cy + 36} ${T(R - 4)} ${cy + 31} Q50 ${cy + 36} ${T(L + 4)} ${cy + 31} Q${T(L - 2)} ${cy + 36} ${T(L - 8)} ${cy + 28} C${T(L - 4)} ${cy + 20} ${T(L - 9)} ${cy + 10} ${T(L - 4)} ${cy - 2}Z" fill="${HAIR}"/>`;
  if (!hairy && hairStyle === 3) s += `<path d="M${T(L - 4)} ${cy} C${T(L - 7)} ${T(top - 8)} ${T(R + 7)} ${T(top - 8)} ${T(R + 4)} ${cy} C${T(R + 8)} ${cy + 14} ${T(R + 5)} ${cy + 26} ${T(R - 1)} ${cy + 29} L${T(L + 1)} ${cy + 29} C${T(L - 5)} ${cy + 26} ${T(L - 8)} ${cy + 14} ${T(L - 4)} ${cy}Z" fill="${HAIR}"/>`;
  if (!hairy && hairStyle === 9) s += `<path d="M${T(L - 4)} ${cy + 2} C${T(L - 7)} ${T(top - 8)} ${T(R + 7)} ${T(top - 8)} ${T(R + 4)} ${cy + 2} C${T(R + 6)} ${cy + 14} ${T(R + 3)} ${cy + 19} ${T(R - 2)} ${cy + 21} L${T(L + 2)} ${cy + 21} C${T(L - 3)} ${cy + 19} ${T(L - 6)} ${cy + 14} ${T(L - 4)} ${cy + 2}Z" fill="${HAIR}"/>`;
  if (!hairy && hairStyle === 8) s += `<path d="M${T(R - 2)} ${T(top + 8)} C${T(R + 14)} ${T(top + 6)} ${T(R + 16)} ${cy + 10} ${T(R + 8)} ${cy + 22} C${T(R + 10)} ${cy + 10} ${T(R + 6)} ${cy} ${T(R - 4)} ${cy - 4}Z" fill="${HAIR}"/>`;
  if (!hairy && hairStyle === 7) s += `<ellipse cx="50" cy="${T(cy - 6)}" rx="${T(hw + 11)}" ry="${T(hh + 8)}" fill="${HAIR}"/>`;
  const curlPts = [[-12, -6, 9], [12, -6, 9], [-17, 6, 8], [17, 6, 8], [0, -15, 10], [-8, -13, 8], [8, -13, 8], [-18, -4, 7], [18, -4, 7]];
  if (!hairy && hairStyle === 6) for (const [x, y, rr] of curlPts) s += `<circle cx="${T(50 + x * hw / 19)}" cy="${T(top + 8 + y)}" r="${rr}" fill="${HAIR}"/>`;
  if (hairy && hairStyle === 'curly') for (const [x, y, rr] of [[-14, -8, 10], [14, -8, 10], [-19, 4, 9], [19, 4, 9], [0, -17, 11], [-8, -15, 9], [8, -15, 9], [-20, -5, 8], [20, -5, 8], [-4, -20, 9], [6, -19, 9]]) s += `<circle cx="${T(50 + x * hw / 19 * (S.curlW || 1))}" cy="${T(top + 10 + y * (S.curl || 1))}" r="${T(rr * (S.curl || 1))}" fill="${HAIR}"/>`;
  if (!hairy && hairStyle === 5) s += `<circle cx="50" cy="${T(top - 3)}" r="8.5" fill="${HAIR}"/>`;
  // ---------- body and clothes
  const C = S.cloth || {}, ctype = C.type || ['crew', 'v', 'hood', 'turtle', 'shirt'][rCloth2], shirt = C.shirt || '#f2efe8', tie = C.tie;
  if (ctype === 'suit') {
    s += `<path d="M0 100 C4 80 26 71 50 71 S96 80 100 100Z" fill="${cloth}"/>`;
    s += `<path d="M37 72 L50 97 L63 72 L57 70 L50 78 L43 70Z" fill="${shirt}"/>`;
    s += `<path d="M37 72 L47 98 L28 100 L24 82Z" fill="${shade(cloth, .12)}"/><path d="M63 72 L53 98 L72 100 L76 82Z" fill="${shade(cloth, .12)}"/>`;
    if (C.bow) s += `<path d="M50 75 L41 71 L41 79Z M50 75 L59 71 L59 79Z" fill="${tie || '#1c1c20'}"/><rect x="48" y="73" width="4" height="4.5" rx="1" fill="${shade(tie || '#1c1c20', .15)}"/>`;
    else if (tie) s += `<path d="M47 75 L53 75 L54.500 80 L50 100 L45.500 80Z" fill="${tie}"/><path d="M46.500 75 L53.500 75 L52.500 79 L47.500 79Z" fill="${shade(tie, -.2)}"/>` + (C.stripe ? `<path d="M46 86 L54 82 M46 91 L53.500 87 M47 96 L52 93" stroke="${C.stripe}" stroke-width="1.600" opacity=".8"/>` : '');
  } else {
    s += `<path d="M2 100 C6 80 26 72 50 72 S94 80 98 100Z" fill="url(#cl${id})"/>`;
    if (ctype === 'crew') s += `<path d="M37 73 Q50 85 63 73" fill="none" stroke="${clothD}" stroke-width="3.200" stroke-linecap="round"/>`;
    if (ctype === 'v') s += `<path d="M37 73 L50 90 L63 73Z" fill="${skin}"/><path d="M37 73 L50 90 L63 73" fill="none" stroke="${clothD}" stroke-width="2" stroke-linejoin="round"/>`;
    if (ctype === 'hood') s += `<path d="M33 78 C33 66 67 66 67 78 L70 88 L30 88Z" fill="${clothD}"/><path d="M45 82v12M55 82v12" stroke="#ffffffaa" stroke-width="1.600" stroke-linecap="round"/>`;
    if (ctype === 'turtle') s += `<rect x="36" y="66" width="28" height="12" rx="5" fill="${clothD}"/>`;
    if (ctype === 'shirt' || ctype === 'polo') s += `<path d="M38 72 L50 85 L62 72 L57 69 L50 76 L43 69Z" fill="${ctype === 'polo' ? shade(cloth, .2) : '#f4f1ea'}"/>` + (ctype === 'shirt' ? `<path d="M50 85 L47 98 L53 98Z" fill="#c23b3b"/>` : `<path d="M50 76 L50 86" stroke="${clothD}" stroke-width="1.200"/>`);
  }
  s += `<path d="M43 ${cy + 12} h14 v${ctype === 'turtle' ? 12 : 17} q-7 5 -14 0Z" fill="${skinD}"/>`;
  // ears
  const ear = 3.6 + age * .8;
  s += `<ellipse cx="${T(L + .5)}" cy="${cy + 3}" rx="${ear}" ry="5.2" fill="${skin}"/><ellipse cx="${T(R - .5)}" cy="${cy + 3}" rx="${ear}" ry="5.2" fill="${skin}"/><ellipse cx="${T(L + .8)}" cy="${cy + 3.5}" rx="1.6" ry="3" fill="${skinD}" opacity=".35"/><ellipse cx="${T(R - .8)}" cy="${cy + 3.5}" rx="1.6" ry="3" fill="${skinD}" opacity=".35"/>`;
  if (earring) s += `<circle cx="${T(L + .5)}" cy="${cy + 9}" r="1.9" fill="#f2c24f"/>`;
  // ---------- head, with shading
  const headD = `M${T(L)} ${cy - 3} C${T(L)} ${T(top - 2)} ${T(R)} ${T(top - 2)} ${T(R)} ${cy - 3} C${T(R)} ${T(cy + hh * .68)} ${T(50 + cw)} ${T(cy + hh + 1)} 50 ${T(cy + hh + 1)} C${T(50 - cw)} ${T(cy + hh + 1)} ${T(L)} ${T(cy + hh * .68)} ${T(L)} ${cy - 3}Z`;
  s += `<path d="${headD}" fill="url(#sk${id})"/><path d="${headD}" fill="url(#ft${id})"/>`;
  if (freckles) for (const [x, y] of [[-8, 6], [-5, 8], [-11, 8], [8, 6], [5, 8], [11, 8]]) s += `<circle cx="${50 + x}" cy="${cy + y}" r=".7" fill="${skinD}" opacity=".7"/>`;
  s += `<ellipse cx="${T(50 - hw * .56)}" cy="${cy + 9}" rx="4.2" ry="2.6" fill="#ee7f68" opacity="${fem ? .3 : .15}"/><ellipse cx="${T(50 + hw * .56)}" cy="${cy + 9}" rx="4.2" ry="2.6" fill="#ee7f68" opacity="${fem ? .3 : .15}"/>`;
  // ---------- ageing
  const ex = hw * .44, ey = cy + 1;
  if (age > .15) {
    const o = Math.min(.5, age * .5);
    s += `<g fill="none" stroke="${skinD}" stroke-linecap="round" opacity="${T(o)}" stroke-width="1">` +
      `<path d="M${T(50 - 9)} ${cy - 14} q9 -2 18 0"/>` + (age > .35 ? `<path d="M${T(50 - 8)} ${cy - 11} q8 -1.600 16 0"/>` : '') +
      `<path d="M${T(50 - ex - 6)} ${ey + 1} l-2.400 -1 M${T(50 - ex - 6)} ${ey + 3} l-2.600 .6 M${T(50 + ex + 6)} ${ey + 1} l2.400 -1 M${T(50 + ex + 6)} ${ey + 3} l2.600 .6"/>` +
      `<path d="M${T(50 - ex + 1)} ${ey + 5.500} q4 2 7 .2 M${T(50 + ex - 1)} ${ey + 5.500} q-4 2 -7 .2"/>` +
      (age > .45 ? `<path d="M${T(50 - 5.500)} ${cy + 8} q-1 6 .6 11 M${T(50 + 5.500)} ${cy + 8} q1 6 -.6 11"/>` : '') + `</g>`;
  }
  // ---------- eyes
  const dk = '#1d1713', sleepy = S.serious ? 1.2 : 0;
  const eye = (x, side) => {
    if (eyeS === 2) return `<path d="M${T(x - 4)} ${ey} Q${x} ${T(ey + 3.8)} ${T(x + 4)} ${ey}" fill="none" stroke="${dk}" stroke-width="2" stroke-linecap="round"/>`;
    const wide = eyeS === 1 ? 1.12 : 1, up = (5.2 * wide - sleepy) * (S.narrow || 1);
    return `<path d="M${T(x - 4.2 * wide)} ${ey} Q${x} ${T(ey - up)} ${T(x + 4.2 * wide)} ${ey} Q${x} ${T(ey + 4 * (S.narrow || 1))} ${T(x - 4.2 * wide)} ${ey}Z" fill="#fff"/>` +
      `<circle cx="${T(x + side * .5)}" cy="${T(ey - .2 + sleepy * .2)}" r="${T(2.5 * wide)}" fill="${iris}"/><circle cx="${T(x + side * .5)}" cy="${T(ey - .2 + sleepy * .2)}" r="1.2" fill="${dk}"/><circle cx="${T(x + side * .5 + .9)}" cy="${T(ey - 1.1)}" r=".8" fill="#fff"/>` +
      `<path d="M${T(x - 4.4 * wide)} ${T(ey + .2)} Q${x} ${T(ey - up - .4)} ${T(x + 4.4 * wide)} ${T(ey + .2)}" fill="none" stroke="${dk}" stroke-width="${fem ? 1.7 : 1.4}" stroke-linecap="round"/>` +
      (fem ? `<path d="M${T(x + side * 4.2)} ${T(ey - .4)} l${side * 1.6} -1.4" stroke="${dk}" stroke-width="1.1" stroke-linecap="round"/>` : '');
  };
  s += eye(50 - ex, -1) + eye(50 + ex, 1);
  const by = ey - (fem ? 8 : 7.5) + (S.browLow || 0), bw = (fem ? 1.4 : 2.5) * (S.browW || 1);
  const brow = (x, side) => browS === 0 ? `<path d="M${T(x - 4.2)} ${T(by + 1)} Q${x} ${T(by - 2)} ${T(x + 4.2)} ${T(by + 1)}" fill="none" stroke="${browC}" stroke-width="${bw}" stroke-linecap="round"/>`
    : browS === 1 ? `<path d="M${T(x - 4.2)} ${T(by + 1.4)} L${T(x + 4.2)} ${T(by - .8)}" stroke="${browC}" stroke-width="${bw}" stroke-linecap="round" transform="${side < 0 ? `translate(${T(2 * x)} 0) scale(-1 1)` : ''}"/>`
    : browS === 2 ? `<path d="M${T(x - 4.2)} ${T(by + .4)} Q${x} ${T(by - 1.4)} ${T(x + 4.2)} ${T(by + .4)}" fill="none" stroke="${browC}" stroke-width="${bw + .4}" stroke-linecap="round"/>`
    : `<path d="M${T(x - 4.2)} ${T(by)} L${T(x + 4.2)} ${T(by)}" stroke="${browC}" stroke-width="${bw + .3}" stroke-linecap="round"/>`;
  s += brow(50 - ex, -1) + brow(50 + ex, 1);
  // nose
  if (noseS === 0) s += `<path d="M50 ${cy + 3} q-2.4 5 -.6 7" fill="none" stroke="${skinD}" stroke-width="1.5" stroke-linecap="round"/><path d="M47.600 ${cy + 9.500} q2.400 1.800 4.800 0" fill="none" stroke="${skinD}" stroke-width="1.4" stroke-linecap="round"/>`;
  else if (noseS === 1) s += `<ellipse cx="50" cy="${cy + 8.500}" rx="2.800" ry="2" fill="${skinD}" opacity=".7"/><ellipse cx="50" cy="${cy + 7.800}" rx="1.700" ry="1" fill="${skinL}" opacity=".6"/>`;
  else s += `<path d="M47.800 ${cy + 8.500} q2.200 2.200 4.400 0" fill="none" stroke="${skinD}" stroke-width="1.5" stroke-linecap="round"/><path d="M50 ${cy + 3.500} v4" stroke="${skinD}" stroke-width="1" opacity=".5"/>`;
  // mouth
  const my = cy + 15, lip = fem ? '#c4505a' : shade(skin, -.28), lipD = shade(fem ? '#c4505a' : skin, -.4);
  if (mouthS === 0) s += `<path d="M${T(50 - 6.500)} ${my} Q50 ${T(my + 6)} ${T(50 + 6.500)} ${my}" fill="none" stroke="${lipD}" stroke-width="1.8" stroke-linecap="round"/><path d="M${T(50 - 4)} ${T(my + 2.100)} Q50 ${T(my + 5.600)} ${T(50 + 4)} ${T(my + 2.100)}" fill="${lip}" opacity=".85"/>`;
  else if (mouthS === 1) s += `<path d="M${T(50 - 7)} ${T(my - .5)} Q50 ${T(my + 10)} ${T(50 + 7)} ${T(my - .5)}Z" fill="#6a2a2c"/><path d="M${T(50 - 5.500)} ${T(my + .2)} Q50 ${T(my + 2.800)} ${T(50 + 5.500)} ${T(my + .2)}Z" fill="#fff"/><path d="M${T(50 - 3.200)} ${T(my + 5.800)} Q50 ${T(my + 3.800)} ${T(50 + 3.200)} ${T(my + 5.800)}" fill="${lip}" opacity=".8"/>`;
  else if (mouthS === 2) s += `<path d="M${T(50 - 5.500)} ${T(my + 1)} Q${T(50 + 1)} ${T(my + 3)} ${T(50 + 6.500)} ${T(my - 1.800)}" fill="none" stroke="${lipD}" stroke-width="1.8" stroke-linecap="round"/>`;
  else if (mouthS === 3) s += `<path d="M${T(50 - 5)} ${my} Q50 ${T(my + 1)} ${T(50 + 5)} ${my}" fill="none" stroke="${lipD}" stroke-width="1.9" stroke-linecap="round"/><path d="M${T(50 - 3.500)} ${T(my + 1.200)} Q50 ${T(my + 3.600)} ${T(50 + 3.500)} ${T(my + 1.200)}" fill="${lip}" opacity=".7"/>`;
  else s += `<path d="M${T(50 - 6)} ${my} Q50 ${T(my + 4.600)} ${T(50 + 6)} ${my}" fill="${lip}" stroke="${lipD}" stroke-width="1.200" stroke-linejoin="round"/>`;
  // ---------- facial hair
  const bc = S.beardCol || h1, BH = `url(#hr${id})`, beard = S.beard || (spec ? 'none' : !fem && beardRoll < .52 ? (beardRoll < .18 ? 'full' : beardRoll < .32 ? 'mous' : beardRoll < .42 ? 'goatee' : 'stubble') : 'none');
  const mous = (k) => `<path d="M${T(50 - 9.500 * k)} ${T(my - 3)} Q${T(50 - 4)} ${T(my - 6.500)} 50 ${T(my - 4.500)} Q${T(50 + 4)} ${T(my - 6.500)} ${T(50 + 9.500 * k)} ${T(my - 3)} Q${T(50 + 5)} ${T(my - 1)} 50 ${T(my - 2.500)} Q${T(50 - 5)} ${T(my - 1)} ${T(50 - 9.500 * k)} ${T(my - 3)}Z" fill="${BH}"/>`;
  const fullBeard = (len) => `<path d="M${T(L + 3)} ${cy + 7} C${T(L + 2)} ${T(cy + hh + 6 + len)} ${T(R - 2)} ${T(cy + hh + 6 + len)} ${T(R - 3)} ${cy + 7} C${T(R - 5)} ${cy + 13} ${T(50 + 9)} ${T(cy + 11.5)} 50 ${T(cy + 11.5)} C${T(50 - 9)} ${T(cy + 11.5)} ${T(L + 5)} ${cy + 13} ${T(L + 3)} ${cy + 7}Z" fill="${BH}"/>`;
  if (beard === 'full') s += fullBeard(0) + mous(1);
  else if (beard === 'long') s += fullBeard(10) + mous(1.1);
  else if (beard === 'mous') s += mous(1);
  else if (beard === 'walrus') s += mous(1.45) + `<path d="M${T(50 - 12)} ${T(my - 2)} q-1 6 2 8 M${T(50 + 12)} ${T(my - 2)} q1 6 -2 8" stroke="${bc}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  else if (beard === 'pencil') s += `<path d="M${T(50 - 8)} ${T(my - 3.600)} Q50 ${T(my - 5.600)} ${T(50 + 8)} ${T(my - 3.600)}" stroke="${bc}" stroke-width="1.500" fill="none" stroke-linecap="round"/>`;
  else if (beard === 'goatee') s += `<path d="M${T(50 - 5.500)} ${T(my + 5)} Q50 ${T(my + 15)} ${T(50 + 5.500)} ${T(my + 5)} Q50 ${T(my + 8)} ${T(50 - 5.500)} ${T(my + 5)}Z" fill="${BH}"/>` + mous(.9);
  else if (beard === 'stubble') s += `<path d="M${T(L + 2)} ${cy + 6} C${T(L + 2)} ${T(cy + hh)} ${T(R - 2)} ${T(cy + hh)} ${T(R - 2)} ${cy + 6}" fill="none" stroke="${h1}" stroke-width="3.400" opacity=".28"/><path d="M${T(50 - 8)} ${T(my - 3)} Q50 ${T(my - 5.500)} ${T(50 + 8)} ${T(my - 3)}" fill="none" stroke="${h1}" stroke-width="2.400" opacity=".22"/>`;
  else if (beard === 'short') s += `<path d="M${T(L + 4)} ${cy + 8} C${T(L + 4)} ${T(cy + hh - 1)} ${T(R - 4)} ${T(cy + hh - 1)} ${T(R - 4)} ${cy + 8} C${T(R - 6)} ${cy + 13} ${T(50 + 9)} ${T(cy + 11.500)} 50 ${T(cy + 11.500)} C${T(50 - 9)} ${T(cy + 11.500)} ${T(L + 6)} ${cy + 13} ${T(L + 4)} ${cy + 8}Z" fill="${BH}" opacity=".9"/>` + mous(.95);
  // ---------- front hair
  const fx = T;
  const cap = (hl, vol, sd) => `M${fx(L - 1.5)} ${fx(cy + sd)} C${fx(L - 3.500)} ${fx(top - vol - 2)} ${fx(R + 3.500)} ${fx(top - vol - 2)} ${fx(R + 1.500)} ${fx(cy + sd)} C${fx(R - 1)} ${fx(cy - hl)} ${fx(R - 6)} ${fx(top + hl * .55)} 50 ${fx(top + hl * .75)} C${fx(L + 6)} ${fx(top + hl * .55)} ${fx(L + 1)} ${fx(cy - hl)} ${fx(L - 1.500)} ${fx(cy + sd)}Z`;
  const gloss = `<path d="M${fx(50 - hw * .5)} ${fx(top + 3.500)} Q50 ${fx(top - 1.500)} ${fx(50 + hw * .35)} ${fx(top + 3)}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".16"/>`;
  if (hairy) {
    const flip = S.part < 0;
    const doFlip = (str) => flip ? mirror(str) : str;
    switch (hairStyle) {
      case 'crop': s += hairShape(cap(12, 3, -2)) + gloss; break;
      case 'side': s += doFlip(hairShape(`M${fx(L - 1.5)} ${fx(cy - 1)} C${fx(L - 4)} ${fx(top - 7)} ${fx(R + 4)} ${fx(top - 7)} ${fx(R + 1.5)} ${fx(cy - 1)} C${fx(R - 1)} ${fx(top + 8)} ${fx(55)} ${fx(top + 5)} ${fx(41)} ${fx(top + 12.5)} C${fx(L + 4)} ${fx(top + 10)} ${fx(L - .5)} ${fx(cy - 4)} ${fx(L - 1.5)} ${fx(cy - 1)}Z`)) + gloss; break;
      case 'slick': s += hairShape(cap(15, 6, -1)) + `<path d="M${fx(L + 3)} ${fx(top + 7)} Q50 ${fx(top - 2)} ${fx(R - 3)} ${fx(top + 7)}" fill="none" stroke="#fff" stroke-width="1.6" opacity=".25" stroke-linecap="round"/>`; break;
      case 'recede': s += hairShape(`M${fx(L - 1.5)} ${fx(cy - 2)} C${fx(L - 4)} ${fx(top - 6)} ${fx(R + 4)} ${fx(top - 6)} ${fx(R + 1.5)} ${fx(cy - 2)} L${fx(R - 1)} ${fx(cy - 12)} C${fx(R - 3)} ${fx(top + 20)} ${fx(R - 9)} ${fx(top + 12)} 50 ${fx(top + 10)} C${fx(L + 9)} ${fx(top + 12)} ${fx(L + 3)} ${fx(top + 20)} ${fx(L + 1)} ${fx(cy - 12)}Z`, { cy: top + 14 }) + gloss; break;
      case 'balds': s += `<path d="M${fx(L - 1.5)} ${fx(cy + 3)} C${fx(L - 5)} ${fx(cy - 6)} ${fx(L - 3)} ${fx(cy - 16)} ${fx(L + 3)} ${fx(cy - 19)} C${fx(L + 3.5)} ${fx(cy - 10)} ${fx(L + 3.5)} ${fx(cy - 2)} ${fx(L + 1.5)} ${fx(cy + 4)}Z M${fx(R + 1.5)} ${fx(cy + 3)} C${fx(R + 5)} ${fx(cy - 6)} ${fx(R + 3)} ${fx(cy - 16)} ${fx(R - 3)} ${fx(cy - 19)} C${fx(R - 3.5)} ${fx(cy - 10)} ${fx(R - 3.5)} ${fx(cy - 2)} ${fx(R - 1.5)} ${fx(cy + 4)}Z" fill="${HAIR}"/><ellipse cx="${fx(50 - hw * .25)}" cy="${fx(top + 6)}" rx="5" ry="2.200" fill="#fff" opacity=".22" transform="rotate(-18 ${fx(50 - hw * .25)} ${fx(top + 6)})"/>`; break;
      case 'bald': s += `<ellipse cx="${fx(50 - hw * .25)}" cy="${fx(top + 6)}" rx="5" ry="2.200" fill="#fff" opacity=".22" transform="rotate(-18 ${fx(50 - hw * .25)} ${fx(top + 6)})"/>`; break;
      case 'wild': { let d = `M${fx(L - 3)} ${fx(cy + 2)}`; const pts = []; for (let i = 0; i <= 14; i++) { const a = Math.PI + i * Math.PI / 14, rad = (hw + 5 + (i % 2 ? 4 : -1)) , x = 50 + Math.cos(a) * rad * 1.02, y = (cy - 4) + Math.sin(a) * (hh + 6 + (i % 2 ? 5 : 0)); pts.push([x, y]); } for (const [x, y] of pts) d += ` L${fx(x)} ${fx(y)}`; d += ` L${fx(R + 3)} ${fx(cy + 2)} C${fx(R - 1)} ${fx(top + 8)} ${fx(R - 6)} ${fx(top + 11)} 50 ${fx(top + 12)} C${fx(L + 6)} ${fx(top + 11)} ${fx(L + 1)} ${fx(top + 8)} ${fx(L - 3)} ${fx(cy + 2)}Z`; s += hairShape(d, { n: 12, cy: top + 10 }); break; }
      case 'curly': s += `<path d="M${fx(L + 1)} ${fx(cy - 8)} C${fx(L + 4)} ${fx(top - 2)} ${fx(R - 4)} ${fx(top - 2)} ${fx(R - 1)} ${fx(cy - 8)} C${fx(R - 6)} ${fx(top + 7)} ${fx(L + 6)} ${fx(top + 7)} ${fx(L + 1)} ${fx(cy - 8)}Z" fill="${HAIR}"/>`; break;
      case 'spiky': { let d = `M${fx(L - 1.5)} ${fx(cy - 2)} C${fx(L - 3)} ${fx(top + 2)} ${fx(L + 2)} ${fx(top - 2)} ${fx(L + 3)} ${fx(top - 3)}`; for (let i = 0; i < 7; i++) { const x0 = L + 4 + i * (2 * hw - 8) / 7, x1 = x0 + (2 * hw - 8) / 14; d += ` L${fx(x1)} ${fx(top - 9 - (i % 2) * 2)} L${fx(x0 + (2 * hw - 8) / 7)} ${fx(top - 3)}`; } d += ` C${fx(R - 2)} ${fx(top + 2)} ${fx(R + 3)} ${fx(top - 2)} ${fx(R + 1.5)} ${fx(cy - 2)} C${fx(R - 1)} ${fx(cy - 12)} ${fx(R - 6)} ${fx(top + 9)} 50 ${fx(top + 12)} C${fx(L + 6)} ${fx(top + 9)} ${fx(L + 1)} ${fx(cy - 12)} ${fx(L - 1.5)} ${fx(cy - 2)}Z`; s += hairShape(d, { cy: top + 18 }); break; }
      case 'quiff': s += doFlip(hairShape(`M${fx(L - 1.5)} ${fx(cy - 3)} C${fx(L - 5)} ${fx(top - 4)} ${fx(L + 6)} ${fx(top - 15)} 50 ${fx(top - 13)} C${fx(R - 6)} ${fx(top - 13)} ${fx(R + 5)} ${fx(top - 3)} ${fx(R + 1.5)} ${fx(cy - 3)} C${fx(R - 2)} ${fx(cy - 10)} ${fx(R - 6)} ${fx(top + 12)} ${fx(52)} ${fx(top + 10)} C${fx(L + 8)} ${fx(top + 9)} ${fx(L - 1)} ${fx(cy - 8)} ${fx(L - 1.5)} ${fx(cy - 3)}Z`, { cy: top + 6 })) + gloss; break;
      case 'longs': s += hairShape(`M${fx(L - 2)} ${fx(cy + 20)} C${fx(L - 5)} ${fx(top - 8)} ${fx(R + 5)} ${fx(top - 8)} ${fx(R + 2)} ${fx(cy + 20)} L${fx(R - 2.5)} ${fx(cy + 3)} C${fx(R - 3)} ${fx(top + 14)} ${fx(50 + 8)} ${fx(top + 9)} ${fx(46)} ${fx(top + 10)} C${fx(L + 4)} ${fx(top + 12)} ${fx(L + 2.5)} ${fx(cy - 2)} ${fx(L + 2.5)} ${fx(cy + 3)}Z`) + gloss; break;
      case 'fringe': s += hairShape(`M${fx(L - 2)} ${fx(cy + 20)} C${fx(L - 5)} ${fx(top - 8)} ${fx(R + 5)} ${fx(top - 8)} ${fx(R + 2)} ${fx(cy + 20)} L${fx(R - 2.5)} ${fx(cy + 3)} L${fx(R - 3)} ${fx(cy - 9)} Q50 ${fx(cy - 7)} ${fx(L + 3)} ${fx(cy - 9)} L${fx(L + 2.5)} ${fx(cy + 3)}Z`) + gloss; break;
      case 'longw': s += hairShape(`M${fx(L - 3)} ${fx(cy + 14)} C${fx(L - 6)} ${fx(top - 9)} ${fx(R + 6)} ${fx(top - 9)} ${fx(R + 3)} ${fx(cy + 14)} Q${fx(R + 1)} ${fx(cy + 8)} ${fx(R - 2.5)} ${fx(cy + 3)} C${fx(R - 3)} ${fx(top + 9)} ${fx(50 + 4)} ${fx(top + 5)} ${fx(50 - 6)} ${fx(top + 8)} C${fx(L + 3)} ${fx(top + 10)} ${fx(L + 2.5)} ${fx(cy - 2)} ${fx(L + 2.5)} ${fx(cy + 3)} Q${fx(L - 1)} ${fx(cy + 8)} ${fx(L - 3)} ${fx(cy + 14)}Z`) + gloss; break;
    }
  } else switch (hairStyle) {
    case 0: s += hairShape(cap(12, 3, -2)) + gloss + `<path d="M${fx(50 + 4)} ${fx(top + 1.5)} q-6 5 -8 12" stroke="${shade(h1, -.3)}" stroke-width="1" fill="none" opacity=".5"/>`; break;
    case 1: s += hairShape(`M${fx(L - 1.5)} ${fx(cy - 1)} C${fx(L - 4)} ${fx(top - 7)} ${fx(R + 4)} ${fx(top - 7)} ${fx(R + 1.5)} ${fx(cy - 1)} C${fx(R - 1)} ${fx(top + 8)} ${fx(55)} ${fx(top + 5)} ${fx(41)} ${fx(top + 12.5)} C${fx(L + 4)} ${fx(top + 10)} ${fx(L - .5)} ${fx(cy - 4)} ${fx(L - 1.5)} ${fx(cy - 1)}Z`) + gloss; break;
    case 2: s += `<path d="M${fx(L)} ${fx(cy - 6)} C${fx(L - 1)} ${fx(top - 2)} ${fx(R + 1)} ${fx(top - 2)} ${fx(R)} ${fx(cy - 6)} C${fx(R - 3)} ${fx(top + 4)} ${fx(L + 3)} ${fx(top + 4)} ${fx(L)} ${fx(cy - 6)}Z" fill="${h1}" opacity=".8"/>`; break;
    case 3: s += hairShape(`M${fx(L - 2)} ${fx(cy + 4)} C${fx(L - 5)} ${fx(top - 8)} ${fx(R + 5)} ${fx(top - 8)} ${fx(R + 2)} ${fx(cy + 4)} C${fx(R - 1)} ${fx(top + 12)} ${fx(53)} ${fx(top + 6)} 50 ${fx(top + 5)} C${fx(47)} ${fx(top + 6)} ${fx(L + 1)} ${fx(top + 12)} ${fx(L - 2)} ${fx(cy + 4)}Z`) + gloss; break;
    case 4: s += hairShape(`M${fx(L - 2)} ${fx(cy + 2)} C${fx(L - 5)} ${fx(top - 8)} ${fx(R + 5)} ${fx(top - 8)} ${fx(R + 2)} ${fx(cy + 2)} C${fx(R - 2)} ${fx(top + 10)} ${fx(52)} ${fx(top + 5)} ${fx(47)} ${fx(top + 6)} C${fx(L + 6)} ${fx(top + 9)} ${fx(L - 1)} ${fx(cy - 2)} ${fx(L - 2)} ${fx(cy + 2)}Z`) + gloss; break;
    case 5: s += hairShape(cap(11, 3, -2)) + gloss; break;
    case 6: s += `<path d="M${fx(L + 1)} ${fx(cy - 8)} C${fx(L + 4)} ${fx(top - 2)} ${fx(R - 4)} ${fx(top - 2)} ${fx(R - 1)} ${fx(cy - 8)} C${fx(R - 6)} ${fx(top + 7)} ${fx(L + 6)} ${fx(top + 7)} ${fx(L + 1)} ${fx(cy - 8)}Z" fill="${HAIR}"/>`; break;
    case 7: s += `<path d="M${fx(L)} ${fx(cy - 7)} C${fx(L + 2)} ${fx(top - 3)} ${fx(R - 2)} ${fx(top - 3)} ${fx(R)} ${fx(cy - 7)} C${fx(R - 5)} ${fx(top + 7)} ${fx(L + 5)} ${fx(top + 7)} ${fx(L)} ${fx(cy - 7)}Z" fill="${HAIR}"/>`; break;
    case 8: s += hairShape(cap(11, 3, -2)) + gloss; break;
    case 9: s += hairShape(`M${fx(L - 2)} ${fx(cy + 6)} C${fx(L - 5)} ${fx(top - 8)} ${fx(R + 5)} ${fx(top - 8)} ${fx(R + 2)} ${fx(cy + 6)} L${fx(R - 1)} ${fx(cy + 1)} C${fx(R - 2)} ${fx(top + 9)} ${fx(L + 2)} ${fx(top + 9)} ${fx(L + 1)} ${fx(cy + 1)}Z`) + gloss; break;
    case 10: s += `<ellipse cx="${fx(50 - hw * .3)}" cy="${fx(top + 5)}" rx="4.500" ry="2" fill="#fff" opacity=".2" transform="rotate(-20 ${fx(50 - hw * .3)} ${fx(top + 5)})"/>`; break;
    case 11: s += `<path d="M${fx(50 - 4.500)} ${fx(top - 9)} L${fx(50 + 4.500)} ${fx(top - 9)} L${fx(50 + 5.500)} ${fx(cy - 12)} L${fx(50 - 5.500)} ${fx(cy - 12)}Z" fill="${HAIR}"/><path d="M${fx(L + 1)} ${fx(cy - 6)} C${fx(L + 3)} ${fx(top)} ${fx(R - 3)} ${fx(top)} ${fx(R - 1)} ${fx(cy - 6)}" fill="none" stroke="${h1}" stroke-width="2" opacity=".35"/>`; break;
    case 12: s += hairShape(cap(14, 3, -2)) + gloss; break;
    case 13: s += hairShape(`M${fx(L - 1.5)} ${fx(cy - 3)} C${fx(L - 4)} ${fx(top - 8)} ${fx(R + 4)} ${fx(top - 8)} ${fx(R + 1.5)} ${fx(cy - 3)} C${fx(R - 3)} ${fx(top + 2)} ${fx(L + 3)} ${fx(top + 2)} ${fx(L - 1.5)} ${fx(cy - 3)}Z`) + gloss; break;
  }
  // ---------- glasses
  const gk = S.glasses !== undefined ? S.glasses : spec ? null : rGlasses >= 0 ? ['round', 'thinrect', 'sun'][rGlasses] : null, gc = S.gcol || (gk === 'sun' ? '#1d1713' : '#2b2b33');
  if (gk) {
    if (gk === 'sun') s += `<rect x="${fx(50 - ex - 7)}" y="${fx(ey - 4)}" width="14" height="8" rx="3" fill="${gc}"/><rect x="${fx(50 + ex - 7)}" y="${fx(ey - 4)}" width="14" height="8" rx="3" fill="${gc}"/><path d="M${fx(50 - ex + 7)} ${fx(ey - 1.5)} h${fx(2 * ex - 14)}" stroke="${gc}" stroke-width="1.800"/><path d="M${fx(50 - ex - 5)} ${fx(ey - 2.5)} l4 -.8" stroke="#fff" stroke-width="1" opacity=".35"/>`;
    else if (gk === 'round' || gk === 'thickround' || gk === 'pince') { const rad = gk === 'pince' ? 5.2 : 6.5, sw = gk === 'thickround' ? 2.8 : gk === 'pince' ? 1 : 1.7; s += `<circle cx="${fx(50 - ex)}" cy="${ey}" r="${rad}" fill="#ffffff1f" stroke="${gc}" stroke-width="${sw}"/><circle cx="${fx(50 + ex)}" cy="${ey}" r="${rad}" fill="#ffffff1f" stroke="${gc}" stroke-width="${sw}"/><path d="M${fx(50 - ex + rad)} ${ey} h${fx(2 * ex - 2 * rad)}" stroke="${gc}" stroke-width="${sw}"/>`; if (gk !== 'pince') s += `<path d="M${fx(L + .5)} ${ey - 1} l${fx(ex - 6.5 + 2)} 0" stroke="${gc}" stroke-width="1" opacity=".0"/>`; }
    else { const sw = gk === 'thickrect' ? 2.8 : gk === 'thin' ? 1.1 : 1.7, hgt = gk === 'thickrect' ? 10 : 9.6; s += `<rect x="${fx(50 - ex - 7)}" y="${fx(ey - hgt / 2)}" width="14" height="${hgt}" rx="2" fill="#ffffff1f" stroke="${gc}" stroke-width="${sw}"/><rect x="${fx(50 + ex - 7)}" y="${fx(ey - hgt / 2)}" width="14" height="${hgt}" rx="2" fill="#ffffff1f" stroke="${gc}" stroke-width="${sw}"/><path d="M${fx(50 - ex + 7)} ${fx(ey - 1.5)} h${fx(2 * ex - 14)}" stroke="${gc}" stroke-width="${sw}"/>`; }
  }
  // ---------- hats (random bots only)
  if (!hairy && rHat >= 0 && !S.nohat) {
    if (rHat === 0) s += `<path d="M${fx(L - 1)} ${fx(cy - 9)} C${fx(L)} ${fx(top - 9)} ${fx(R)} ${fx(top - 9)} ${fx(R + 1)} ${fx(cy - 9)}Z" fill="${clothD}"/><path d="M${fx(L - 1)} ${fx(cy - 9)} h${fx(2 * hw + 2)} v3.800 h-${fx(2 * hw + 2)}z" fill="${cloth}"/>`;
    else if (rHat === 1) s += `<path d="M${fx(L - 1)} ${fx(cy - 8)} C${fx(L - 2)} ${fx(top - 13)} ${fx(R + 2)} ${fx(top - 13)} ${fx(R + 1)} ${fx(cy - 8)}Z" fill="${cloth}"/><path d="M${fx(L - 3)} ${fx(cy - 8)} h${fx(2 * hw + 6)}" stroke="${clothD}" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="${fx(top - 9)}" r="3.200" fill="${shade(cloth, .25)}"/>`;
    else s += `<path d="M${fx(L - .5)} ${fx(cy - 10)} h${fx(2 * hw + 1)} v4.500 h-${fx(2 * hw + 1)}z" fill="${cloth}"/><path d="M${fx(L + 2)} ${fx(cy - 10)} C${fx(L + 4)} ${fx(top - 3)} ${fx(R - 4)} ${fx(top - 3)} ${fx(R - 2)} ${fx(cy - 10)}Z" fill="${clothD}"/>`;
  }
  if (S.filter === 'bw') s = s.replace('</defs>', '</defs>') ;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="11 4 78 78">${s}</svg>`;
}

// ============================================================ the bots: hundreds of opponents, each with a name, a face, a rating and a way of playing
const BOT_FIRST = ['Aarav', 'Abena', 'Adaeze', 'Adrian', 'Agnes', 'Aiko', 'Aisha', 'Akira', 'Alba', 'Alma', 'Amara', 'Amir', 'Anders', 'Anika', 'Anton', 'Aria', 'Arlo', 'Asha', 'Astrid', 'Atlas', 'Aurelio', 'Ayla', 'Beatriz', 'Benno', 'Bianca', 'Bodhi', 'Bram', 'Bruno', 'Cai', 'Calla', 'Camille', 'Caspar', 'Cecilia', 'Cedric', 'Chiara', 'Chidi', 'Clara', 'Cosmo', 'Dalia', 'Dario', 'Dax', 'Delphine', 'Dmitri', 'Dora', 'Dylan', 'Eamon', 'Edda', 'Eero', 'Elio', 'Elodie', 'Emil', 'Enzo', 'Esme', 'Eva', 'Ezra', 'Fabian', 'Farah', 'Felix', 'Fiona', 'Florian', 'Freya', 'Gael', 'Gaia', 'Gideon', 'Greta', 'Gus', 'Hana', 'Hector', 'Helga', 'Hugo', 'Ida', 'Idris', 'Ignacio', 'Ilse', 'Imani', 'Ines', 'Ingrid', 'Ivo', 'Jada', 'Jakob', 'Jasper', 'Joaquin', 'Jonas', 'Juno', 'Kai', 'Kaito', 'Kamal', 'Karin', 'Kasim', 'Keiko', 'Kiran', 'Klara', 'Kofi', 'Lars', 'Leila', 'Leo', 'Liesel', 'Linus', 'Lior', 'Lola', 'Luca', 'Lucia', 'Lukas', 'Mabel', 'Magnus', 'Maia', 'Malik', 'Marek', 'Marta', 'Mateo', 'Maya', 'Mina', 'Mirela', 'Nadia', 'Nico', 'Nia', 'Niklas', 'Noor', 'Nuno', 'Odessa', 'Olga', 'Omar', 'Oona', 'Orla', 'Oscar', 'Otis', 'Paloma', 'Pavel', 'Petra', 'Pilar', 'Priya', 'Quinn', 'Rafael', 'Rania', 'Remy', 'Rhea', 'Rocco', 'Rosa', 'Rune', 'Sami', 'Sana', 'Sasha', 'Selma', 'Sergio', 'Siena', 'Sigrid', 'Soren', 'Stella', 'Tamar', 'Tariq', 'Tess', 'Theo', 'Thora', 'Tilda', 'Tobias', 'Ulla', 'Uma', 'Vera', 'Viggo', 'Vika', 'Wanda', 'Wren', 'Xavi', 'Yara', 'Yusuf', 'Zara', 'Zeno', 'Zoe', 'Zola'];
const BOT_F = new Set(['Abena', 'Adaeze', 'Agnes', 'Aiko', 'Aisha', 'Alba', 'Alma', 'Amara', 'Anika', 'Aria', 'Asha', 'Astrid', 'Ayla', 'Beatriz', 'Bianca', 'Calla', 'Camille', 'Cecilia', 'Chiara', 'Clara', 'Dalia', 'Delphine', 'Dora', 'Edda', 'Elodie', 'Esme', 'Eva', 'Farah', 'Fiona', 'Freya', 'Gaia', 'Greta', 'Hana', 'Helga', 'Ida', 'Ilse', 'Imani', 'Ines', 'Ingrid', 'Jada', 'Karin', 'Keiko', 'Klara', 'Leila', 'Liesel', 'Lola', 'Lucia', 'Mabel', 'Maia', 'Marta', 'Maya', 'Mina', 'Mirela', 'Nadia', 'Nia', 'Noor', 'Odessa', 'Olga', 'Oona', 'Orla', 'Paloma', 'Petra', 'Pilar', 'Priya', 'Rania', 'Rhea', 'Rosa', 'Sana', 'Selma', 'Siena', 'Sigrid', 'Stella', 'Tess', 'Thora', 'Tilda', 'Ulla', 'Uma', 'Vera', 'Vika', 'Wanda', 'Yara', 'Zara', 'Zoe', 'Zola']), BOT_M = new Set(['Aarav', 'Adrian', 'Akira', 'Amir', 'Anders', 'Anton', 'Arlo', 'Atlas', 'Aurelio', 'Benno', 'Bodhi', 'Bram', 'Bruno', 'Cai', 'Caspar', 'Cedric', 'Chidi', 'Cosmo', 'Dario', 'Dax', 'Dmitri', 'Dylan', 'Eamon', 'Eero', 'Elio', 'Emil', 'Enzo', 'Ezra', 'Fabian', 'Felix', 'Florian', 'Gael', 'Gideon', 'Gus', 'Hector', 'Hugo', 'Idris', 'Ignacio', 'Ivo', 'Jakob', 'Jasper', 'Joaquin', 'Jonas', 'Kai', 'Kaito', 'Kamal', 'Kasim', 'Kiran', 'Kofi', 'Lars', 'Leo', 'Linus', 'Lior', 'Luca', 'Lukas', 'Magnus', 'Malik', 'Marek', 'Mateo', 'Nico', 'Niklas', 'Nuno', 'Omar', 'Oscar', 'Otis', 'Pavel', 'Rafael', 'Remy', 'Rocco', 'Rune', 'Sami', 'Sergio', 'Soren', 'Theo', 'Tariq', 'Tobias', 'Viggo', 'Xavi', 'Yusuf', 'Zeno']);
const BOT_LAST = ['Abara', 'Adeyemi', 'Alder', 'Amsel', 'Andersen', 'Aoki', 'Arden', 'Ashby', 'Bakker', 'Barros', 'Bell', 'Benedek', 'Bergman', 'Blanc', 'Boone', 'Brandt', 'Brook', 'Bruun', 'Calder', 'Castell', 'Chandra', 'Cho', 'Clary', 'Costa', 'Cruz', 'Dahl', 'Dalton', 'Dane', 'Dietz', 'Dunn', 'Eklund', 'Ellery', 'Faber', 'Falk', 'Farrow', 'Fenn', 'Flores', 'Fox', 'Frey', 'Gale', 'Garnier', 'Gold', 'Grau', 'Hale', 'Hart', 'Hayes', 'Hess', 'Holm', 'Hoyt', 'Ibarra', 'Ito', 'Jansen', 'Jovanovic', 'Kade', 'Kaya', 'Keane', 'Kern', 'Klein', 'Koval', 'Lang', 'Lark', 'Laurent', 'Lemos', 'Lind', 'Lorne', 'Lund', 'Maddox', 'Mallory', 'Marsh', 'Mercer', 'Moreau', 'Nakamura', 'Nash', 'Navarro', 'Neal', 'Nova', 'Oduya', 'Okafor', 'Ono', 'Orlov', 'Ostrom', 'Pace', 'Park', 'Pell', 'Petrov', 'Quill', 'Rao', 'Reyes', 'Rhodes', 'Rios', 'Roy', 'Rune', 'Ryder', 'Sable', 'Saito', 'Sandoval', 'Santos', 'Shaw', 'Silva', 'Sloane', 'Soto', 'Stark', 'Stein', 'Sutter', 'Tanaka', 'Thorne', 'Tran', 'Ueda', 'Vale', 'Varga', 'Voss', 'Wade', 'Wells', 'West', 'Wilde', 'Wolfe', 'Yamada', 'Yoon', 'Zhao', 'Zimmer', 'Zorn'];
const TEMPERS = {
  aggressive: { nick: ['the Attacker', 'Full Throttle', 'Charge'], blurb: 'Goes straight for your king.', w: 3 },
  solid: { nick: ['the Wall', 'Rock Solid', 'Steady'], blurb: 'Rarely gives you anything. Patient and safe.', w: 3 },
  tricky: { nick: ['the Trapper', 'Sneaky', 'Tricks'], blurb: 'Loves a trap and a surprise knight.', w: 2 },
  gambiteer: { nick: ['the Gambiteer', 'Sacrifice', 'Gambit'], blurb: 'Gives up material to get the attack.', w: 2 },
  trader: { nick: ['the Trader', 'Swap Shop', 'Even Steven'], blurb: 'Swaps pieces whenever it can.', w: 2 },
  pusher: { nick: ['Pawn Storm', 'the Pusher', 'Forward!'], blurb: 'Marches the pawns up the board.', w: 2 },
  positional: { nick: ['the Strategist', 'Slow Burn', 'Long Game'], blurb: 'Plays for squares and slow squeezes.', w: 2 },
  balanced: { nick: ['', '', ''], blurb: 'No favourite style: plays what the position asks.', w: 3 },
};
const OPENINGS = {
  e4: 'Starts with 1.e4', d4: 'Starts with 1.d4', c4: 'Prefers the English', nf3: 'Likes 1.Nf3', flank: 'Plays the flanks: b3, f4 or g3', any: '',
};
const LINES = {
  aggressive: { hi: ["Let's see how well you defend.", 'I hope you like attacks.', 'Ready? I am not going to be gentle.'], check: ['Check!', 'Your king looks nervous.', 'Check. Keep running.'], take: ['Mine now.', 'Thank you very much.', 'That was a gift.'], win: ['Told you. No mercy.', 'Good game. That was fun!'], lose: ['Ouch. Well attacked, you.', 'Wow, you held on. Nicely done.'], draw: ['A draw? I was going for more.'] },
  solid: { hi: ['Take your time. I will.', 'Good luck. No rush.', 'Let us have a calm game.'], check: ['Check.', 'Just a check.', 'Check, if you do not mind.'], take: ['I will take that, thanks.', 'Tidy.', 'Kept it simple.'], win: ['Patience wins again.', 'Good game.'], lose: ['Well played. I could not crack you.', 'You earned that one.'], draw: ['A fair draw.'] },
  tricky: { hi: ['Careful where you step.', 'Do not trust my knights.', 'Nothing up my sleeve...'], check: ['Check! Did you see that coming?', 'Check!', 'Surprise.'], take: ['Oops, was that a trap?', 'Thanks!', 'Too easy.'], win: ['Got you with the old trick!', 'Good game. Watch the knights next time.'], lose: ['You saw through it. Impressive.', 'Dang. You did not fall for it.'], draw: ['A draw. I will get you next time.'] },
  gambiteer: { hi: ['I will give you a pawn. Take it if you dare.', 'Gambits are free chess. Let us play!', 'Hope you like open files.'], check: ['Check! That was the point.', 'Check!', 'And here comes the attack.'], take: ['Fine, I will take it back.', 'Material is just a number.', 'Got it back, with interest.'], win: ['The sacrifice was sound!', 'Good game. Worth every pawn.'], lose: ['Maybe that gambit was a bit much.', 'Well defended. I will think about that.'], draw: ['A draw, after all that?'] },
  trader: { hi: ['I hope you like an endgame.', 'Shall we swap a few pieces?', 'Simplify, simplify.'], check: ['Check.', 'Check, and I am happy to trade.', 'Check!'], take: ['A fair swap.', 'Trade accepted.', 'One down, more to go.'], win: ['The endgame is where games are won.', 'Good game.'], lose: ['You out-endgamed me. Respect.', 'Well done.'], draw: ['A drawn ending. Classic.'] },
  pusher: { hi: ['Pawns forward!', 'My pawns are already moving.', 'Get ready for a storm.'], check: ['Check!', 'Check, the pawns are coming.', 'Check!'], take: ['Gotcha!', 'Pawn power!', 'Nom.'], win: ['The pawns did it!', 'Good game. Pawn storm complete.'], lose: ['Stopped my storm. Nicely done.', 'Okay, okay. You win.'], draw: ['A draw. My pawns are tired.'] },
  positional: { hi: ['Let us see who understands the position better.', 'A quiet game, I hope.', 'Good luck. Mind the weak squares.'], check: ['Check.', 'A small check.', 'Check, with a plan behind it.'], take: ['Structure matters.', 'Taken. It improves my position.', 'Noted.'], win: ['A slow squeeze. Good game.', 'Well played, thank you.'], lose: ['You outplayed me positionally.', 'Great technique.'], draw: ['A balanced result.'] },
  balanced: { hi: ['Hi! Good luck, have fun.', 'Ready when you are.', 'Let us play some chess.'], check: ['Check.', 'Check!', 'Check, watch out.'], take: ['Thanks!', 'I will take that.', 'Captured.'], win: ['Good game!', 'That was a good one, thanks.'], lose: ['Well played!', 'Nice game. You got me.'], draw: ['A draw. Good game.'] },
};
function botTags(b) { if (b.blurb) return b.blurb + (b.open !== 'any' && OPENINGS[b.open] ? ' ' + OPENINGS[b.open] + '.' : ''); const t = [TEMPERS[b.temper].blurb]; if (b.open !== 'any' && OPENINGS[b.open]) t.push(OPENINGS[b.open] + '.'); return t.join(' '); }
const BOT_BANDS = [   // [first rating, last rating, how many bots]
  [200, 550, 60], [600, 950, 50], [1000, 1250, 45], [1300, 1450, 40], [1500, 1750, 45], [1800, 2050, 40], [2100, 2350, 35], [2400, 2550, 20], [2600, 2800, 15], [2850, 3050, 10]];
function makeBots() {
  const r = mulberry32(20261113), out = [], used = new Set();
  const temperBag = []; for (const [k, v] of Object.entries(TEMPERS)) for (let i = 0; i < v.w; i++) temperBag.push(k);
  const opens = ['e4', 'e4', 'e4', 'd4', 'd4', 'c4', 'nf3', 'flank', 'any', 'any'], dE4 = ['e5', 'e5', 'c5', 'c5', 'e6', 'c6', 'd6', 'g6', 'nf6', 'any'], dD4 = ['d5', 'd5', 'nf6', 'nf6', 'f5', 'e6', 'any'];
  let id = 0;
  for (const [lo, hi, n] of BOT_BANDS) for (let i = 0; i < n; i++) {
    const base = lo + (hi - lo) * (n === 1 ? 0 : i / (n - 1)), elo = Math.max(100, Math.min(3050, Math.round((base + (r() - .5) * (hi - lo) / n) / 5) * 5));
    let name, first; do { first = BOT_FIRST[Math.floor(r() * BOT_FIRST.length)]; name = first + ' ' + BOT_LAST[Math.floor(r() * BOT_LAST.length)]; } while (used.has(name)); used.add(name);
    const g = BOT_F.has(first) ? 'f' : BOT_M.has(first) ? 'm' : (r() < .5 ? 'f' : 'm');
    const temper = temperBag[Math.floor(r() * temperBag.length)], nicks = TEMPERS[temper].nick, nick = r() < .45 ? nicks[Math.floor(r() * nicks.length)] : '';
    out.push({ id, g, name, nick, elo, temper, open: opens[Math.floor(r() * opens.length)], defE4: dE4[Math.floor(r() * dE4.length)], defD4: dD4[Math.floor(r() * dD4.length)],
      book: Math.max(0, Math.min(18, Math.round((elo - 500) / 130 + (r() - .3) * 4))), styleP: temper === 'balanced' ? 0 : .3 + r() * .3, chatty: Math.floor(r() * 3), seed: 1000 + id * 17 + Math.floor(r() * 1000) });
    id++;
  }
  // a few chaos bots: they play like the total beginner (the Hustler persona)
  for (const nm of ['Boomer Quill', 'Pip Wobble', 'Mo Flapjack', 'Dot Pancake', 'Ziggy Mumble', 'Bea Bumble']) out.push({ id: id++, g: ['Dot', 'Bea'].includes(nm.split(' ')[0]) ? 'f' : 'm', name: nm, nick: 'Chaos', elo: 'hustle', temper: 'tricky', open: 'any', defE4: 'any', defD4: 'any', book: 0, styleP: 0, chatty: 2, seed: 5000 + id * 31 });
  return out;
}
// ---- tributes: some of the greatest players of any era, and well-known chess creators. They play at a strength and in a style
// that fits what they are known for; their faces are drawn by Sibyl (they are not portraits) and none of this is endorsed by them.
// What each person is known for, as drawing instructions (hair, beard, glasses, age, clothes). Stylised portraits, not likenesses traced from photos.
const GREY = ['#a9a6a2', '#d6d4d0'], DARK = ['#14100d', '#2a221b'], DARKB = ['#17110d', '#2f241c'];
const SPECS = {
  'Paul Morphy': { skin: '#efc9a8', hair: ['#16110d', '#2d241c'], hs: 'side', part: 1, age: .05, bg: 'sepia', mouth: 3, serious: 1, w: .95, cloth: { type: 'suit', col: '#1d1b19', shirt: '#eeeae0', tie: '#111', bow: true } },
  'Wilhelm Steinitz': { skin: '#e9c3a3', hair: ['#5b4a3a', '#8d7a66'], hs: 'balds', beard: 'long', glasses: 'pince', gcol: '#8a7a55', age: .6, bg: 'sepia', mouth: 3, w: 1.05, browW: 1.3, cloth: { type: 'suit', col: '#3a342c', shirt: '#e6e0d2', tie: '#25211c', bow: true } },
  'Emanuel Lasker': { skin: '#e6c4a6', hair: GREY, hs: 'quiff', part: -1, beard: 'walrus', beardCol: '#8b8782', age: .7, bg: ['#8f8f92', '#4a4a50'], mouth: 3, serious: 1, browW: 1.6, cloth: { type: 'suit', col: '#2e2e2e', shirt: '#e8e8e4', tie: '#555', stripe: '#9a9a9a' } },
  'José Raúl Capablanca': { skin: '#e8c4a4', hair: DARK, hs: 'slick', age: .25, bg: ['#8f8f92', '#4a4a50'], mouth: 2, serious: 1, w: .93, jaw: 3, cloth: { type: 'suit', col: '#1b1b1b', shirt: '#f0f0f0', tie: '#2a2a2a' } },
  'Alexander Alekhine': { skin: '#efd0b5', hair: ['#6b5436', '#9a8160'], hs: 'slick', age: .3, bg: ['#8f8f92', '#4a4a50'], mouth: 3, serious: 1, cloth: { type: 'suit', col: '#202020', shirt: '#eeeeea', tie: '#4a4a4a', stripe: '#9a9a9a' } },
  'Mikhail Botvinnik': { skin: '#e8c3a2', hair: ['#9a9a9a', '#cfcfcf'], hs: 'recede', glasses: 'thickround', gcol: '#16120e', age: .65, mouth: 0, w: 1.08, bg: ['#8f8f92', '#4a4a50'], cloth: { type: 'suit', col: '#7b7260', shirt: '#d8d4c8' } },
  'Vasily Smyslov': { skin: '#ebc8a8', hair: ['#8b8f94', '#c5c8cc'], hs: 'recede', glasses: 'thickrect', gcol: '#1d1d22', age: .7, mouth: 3, bg: ['#6a6a70', '#3a3a40'], cloth: { type: 'suit', col: '#7a6a52', shirt: '#f1eee6', tie: '#25252b' } },
  'Mikhail Tal': { skin: '#e6c2a2', hair: DARK, hs: 'quiff', age: .2, jaw: 3, w: .9, mouth: 2, serious: 1, browW: 1.3, bg: ['#8f8f92', '#4a4a50'], cloth: { type: 'suit', col: '#2b2b2f', shirt: '#f0f0f0', tie: '#3a3a40' } },
  'Tigran Petrosian': { skin: '#e3bd9a', hair: DARK, hs: 'curly', curl: .8, age: .35, mouth: 1, w: 1.08, bg: ['#8f8f92', '#4a4a50'], cloth: { type: 'suit', col: '#2b2b30', shirt: '#f0f0f0', tie: '#7a6a4a', stripe: '#c9c0a6' } },
  'Boris Spassky': { skin: '#e7c8ac', hair: ['#6f6254', '#9a8c7a'], hs: 'slick', age: .5, h: 3, w: .95, mouth: 3, serious: 1, bg: ['#8f8f92', '#4a4a50'], cloth: { type: 'suit', col: '#b9b09a', shirt: '#f3f1ea' } },
  'Bobby Fischer': { skin: '#efc6a6', hair: ['#4a3320', '#6e4f33'], hs: 'side', part: 1, age: .1, mouth: 0, eye: 1, w: 1.05, bg: 'sepia', cloth: { type: 'suit', col: '#1f1d1d', shirt: '#f2efe8', tie: '#b0823e', stripe: '#3b6b5a' } },
  'Anatoly Karpov': { skin: '#efc9ae', hair: GREY, hs: 'slick', age: .85, w: 1.1, mouth: 3, serious: 1, bg: ['#8e98a6', '#4e5560'], cloth: { type: 'suit', col: '#23324a', shirt: '#cfd8e6' } },
  'Garry Kasparov': { skin: '#e8bd9a', hair: ['#a5a5a8', '#d0d0d4'], hs: 'recede', browC: '#2a2420', browW: 1.5, age: .6, jaw: 7, w: 1.05, mouth: 3, serious: 1, bg: ['#a89a86', '#6a5f50'], cloth: { type: 'suit', col: '#233a6b', shirt: '#b9d0ea' } },
  'Vladimir Kramnik': { skin: '#efcdb2', hair: ['#3a2f26', '#5d4d3e'], hs: 'side', glasses: 'thin', gcol: '#8f8f96', age: .45, w: .92, jaw: 3, mouth: 3, serious: 1, bg: ['#2a3550', '#141a2a'], cloth: { type: 'suit', col: '#1c2338', shirt: '#f1f1f1' } },
  'Viswanathan Anand': { skin: '#b9825a', hair: ['#15110e', '#2a221b'], hs: 'side', glasses: 'round', gcol: '#b69a55', age: .5, mouth: 0, bg: ['#c9c4bd', '#8a847b'], cloth: { type: 'suit', col: '#3b352e', shirt: '#f4f4f0' } },
  'Magnus Carlsen': { skin: '#efd0b8', hair: ['#7a5a3b', '#a98457'], hs: 'curly', curl: .8, curlW: 1.05, beard: 'stubble', age: .15, mouth: 3, serious: 1, bg: ['#d1c6c0', '#8a7a7a'], cloth: { type: 'suit', col: '#35353a', shirt: '#23232a' } },
  'Ding Liren': { narrow: .72, skin: '#e8c59d', hair: ['#0f0c0a', '#2a2420'], hs: 'spiky', age: .15, w: 1.08, jaw: 6, mouth: 3, serious: 1, bg: ['#d0453a', '#8a2a24'], cloth: { type: 'polo', col: '#1c2a4a' } },
  'Fabiano Caruana': { skin: '#f0cfb3', hair: ['#3d2b1d', '#5e4430'], hs: 'curly', curl: .72, glasses: 'thickrect', gcol: '#1d1d22', age: .25, mouth: 3, serious: 1, bg: ['#7a6f9a', '#3c3558'], cloth: { type: 'suit', col: '#2c2c33', shirt: '#f4f4f2' } },
  'Judit Polgar': { fem: true, skin: '#f0cdb2', hair: ['#7a3a25', '#a85a3a'], hs: 'longw', age: .4, mouth: 3, bg: ['#6e4a35', '#3a2418'], cloth: { type: 'suit', col: '#6b5e52', shirt: '#eeeeea' } },
  'Hou Yifan': { narrow: .72, fem: true, skin: '#f0cfae', hair: ['#0f0c0a', '#2a2420'], hs: 'fringe', glasses: 'rect', gcol: '#6a4fa0', age: .1, mouth: 0, bg: ['#b83a3a', '#6e2222'], cloth: { type: 'polo', col: '#a9c3e8' } },
  'Hikaru Nakamura': { narrow: .72, skin: '#e3bf98', hair: ['#0f0c0a', '#2a2420'], hs: 'quiff', beard: 'stubble', age: .25, mouth: 3, serious: 1, bg: ['#2a3040', '#141824'], cloth: { type: 'polo', col: '#26346b' } },
  'Levy Rozman': { skin: '#e8c2a0', hair: DARKB, hs: 'crop', beard: 'full', glasses: 'round', gcol: '#c9b89a', mouth: 0, age: .2, bg: ['#e0634a', '#b8412b'], cloth: { type: 'polo', col: '#6b1f2f' } },
  'Eric Rosen': { skin: '#edc9aa', hair: DARKB, hs: 'crop', beard: 'stubble', age: .15, mouth: 1, bg: ['#cfd0d2', '#9a9ca0'], cloth: { type: 'crew', col: '#1f2a44' } },
  'Anna Cramling': { fem: true, skin: '#f6d9c4', hair: ['#d6b57a', '#f0d9a6'], hs: 'longs', mouth: 0, age: .05, bg: ['#d9d4cb', '#a8a298'], cloth: { type: 'crew', col: '#cdbba0' } },
  'Alexandra Botez': { fem: true, skin: '#f1cfb6', hair: ['#4a2f1f', '#6e4a31'], hs: 'longw', mouth: 0, age: .05, bg: ['#8fb6d6', '#5a8a5a'], cloth: { type: 'crew', col: '#e7d9d3' } },
  'Andrea Botez': { fem: true, skin: '#e0b08c', hair: ['#6b4425', '#c79a5a'], hs: 'longw', mouth: 1, age: .05, bg: ['#c89a84', '#8a6a58'], cloth: { type: 'crew', col: '#202020' } },
  'Agadmator': { skin: '#e6c0a0', hair: ['#2a1f17', '#4a3a2c'], hs: 'crop', beard: 'stubble', mouth: 0, age: .2 },
  'Ben Finegold': { skin: '#ecc9ad', hair: ['#7a6a58', '#a3927c'], hs: 'recede', beard: 'short', age: .5, w: 1.15, jaw: 8, bg: ['#d8d8dc', '#a6a6ac'], cloth: { type: 'polo', col: '#5b86c4' } },
  'Simon Williams': { skin: '#f0c9a8', hair: ['#b8652f', '#d98a4a'], hs: 'quiff', beard: 'short', age: .4, mouth: 3, serious: 1, bg: ['#6e7a55', '#3a4430'], cloth: { type: 'polo', col: '#5a3a3a' } },
  'Eric Hansen': { skin: '#efcdb0', hair: ['#201812', '#3a2d22'], hs: 'side', age: .1, mouth: 2, bg: ['#7a8088', '#4a4f55'], cloth: { type: 'crew', col: '#1f1f22' } },
  'Aman Hambleton': { skin: '#f2d1b8', hair: ['#b08a55', '#d9b87c'], hs: 'quiff', beard: 'stubble', age: .2, mouth: 3, serious: 1, bg: ['#3a5fb8', '#1f2f6b'], cloth: { type: 'crew', col: '#1b1b1f' } },
};
const LEGENDS = [   // name, gender, strength, temperament, opening, vs 1.e4, vs 1.d4, book moves, group, blurb, nickname
  ['Paul Morphy', 'm', 2650, 'gambiteer', 'e4', 'e5', 'd5', 16, 'legend', 'Unofficial world champion of the 1850s. Quick development and open attacks.'],
  ['Wilhelm Steinitz', 'm', 2600, 'positional', 'e4', 'e5', 'd5', 14, 'legend', 'First official World Champion (1886). The father of positional play.'],
  ['Emanuel Lasker', 'm', 2750, 'tricky', 'd4', 'e5', 'd5', 16, 'legend', 'World Champion for 27 years (1894 to 1921). A great fighter.'],
  ['José Raúl Capablanca', 'm', 2800, 'positional', 'd4', 'e5', 'd5', 18, 'legend', 'World Champion 1921 to 1927. Famous for effortless technique.'],
  ['Alexander Alekhine', 'm', 2800, 'aggressive', 'e4', 'nf6', 'd5', 18, 'legend', 'World Champion 1927 to 1935 and 1937 to 1946. Deadly combinations.'],
  ['Mikhail Botvinnik', 'm', 2750, 'positional', 'c4', 'c6', 'd5', 18, 'legend', 'Three-time World Champion. The patriarch of the Soviet school.'],
  ['Vasily Smyslov', 'm', 2750, 'positional', 'e4', 'e5', 'nf6', 16, 'legend', 'World Champion 1957 to 1958. Smooth, harmonious chess.'],
  ['Mikhail Tal', 'm', 2800, 'gambiteer', 'e4', 'c5', 'nf6', 18, 'legend', 'World Champion 1960 to 1961. The Magician from Riga, a lover of sacrifices.', 'the Magician'],
  ['Tigran Petrosian', 'm', 2780, 'solid', 'nf3', 'c6', 'nf6', 18, 'legend', 'World Champion 1963 to 1969. Almost impossible to attack.', 'Iron Tigran'],
  ['Boris Spassky', 'm', 2780, 'balanced', 'e4', 'e5', 'nf6', 18, 'legend', 'World Champion 1969 to 1972. A universal player.'],
  ['Bobby Fischer', 'm', 2900, 'aggressive', 'e4', 'c5', 'nf6', 20, 'legend', 'World Champion 1972 to 1975. Opened with 1.e4 almost every time.'],
  ['Anatoly Karpov', 'm', 2850, 'solid', 'e4', 'e5', 'nf6', 20, 'legend', 'World Champion 1975 to 1985. Squeezes opponents slowly.'],
  ['Garry Kasparov', 'm', 2950, 'aggressive', 'e4', 'c5', 'nf6', 22, 'legend', 'World Champion 1985 to 2000. Fierce preparation and attack.'],
  ['Vladimir Kramnik', 'm', 2850, 'solid', 'd4', 'e5', 'd5', 20, 'legend', 'World Champion 2000 to 2007. Known for the Berlin Wall.'],
  ['Viswanathan Anand', 'm', 2850, 'balanced', 'e4', 'e5', 'nf6', 20, 'legend', 'World Champion 2007 to 2013. Fast and universal.', 'the Tiger of Madras'],
  ['Magnus Carlsen', 'm', 3000, 'trader', 'any', 'e5', 'nf6', 22, 'legend', 'World Champion 2013 to 2023. Grinds out wins from equal positions.'],
  ['Ding Liren', 'm', 2850, 'solid', 'nf3', 'e5', 'd5', 20, 'legend', 'World Champion 2023 to 2024. Patient and resilient.'],
  ['Fabiano Caruana', 'm', 2900, 'balanced', 'e4', 'e5', 'nf6', 20, 'legend', 'Challenged for the world title in 2018. Deeply prepared.'],
  ['Judit Polgar', 'f', 2780, 'aggressive', 'e4', 'e5', 'nf6', 20, 'legend', 'The strongest woman player in history. A fearless attacker.'],
  ['Hou Yifan', 'f', 2700, 'positional', 'd4', 'e5', 'd5', 18, 'legend', 'Four-time Women\'s World Champion.'],
  ['Hikaru Nakamura', 'm', 2900, 'tricky', 'e4', 'c5', 'nf6', 16, 'creator', 'Speed-chess star and streamer. Sets problems quickly.'],
  ['Levy Rozman', 'm', 2300, 'aggressive', 'e4', 'e5', 'd5', 14, 'creator', 'International Master and YouTuber.', 'GothamChess'],
  ['Eric Rosen', 'm', 2300, 'gambiteer', 'e4', 'e5', 'd5', 12, 'creator', 'International Master and YouTuber. Loves the Stafford Gambit.'],
  ['Anna Cramling', 'f', 2200, 'aggressive', 'e4', 'e5', 'd5', 12, 'creator', 'Streamer and chess creator. Plays with energy.'],
  ['Alexandra Botez', 'f', 2000, 'tricky', 'e4', 'e5', 'd5', 10, 'creator', 'Streamer and chess creator. Plays for tricks.'],
  ['Andrea Botez', 'f', 1500, 'tricky', 'e4', 'e5', 'd5', 6, 'creator', 'Streamer and chess creator.'],
  ['Agadmator', 'm', 2200, 'balanced', 'e4', 'e5', 'd5', 14, 'creator', 'YouTuber who tells the stories behind famous games.'],
  ['Ben Finegold', 'm', 2500, 'trader', 'any', 'e5', 'd5', 16, 'creator', 'Grandmaster, teacher and streamer.'],
  ['Simon Williams', 'm', 2450, 'aggressive', 'flank', 'e5', 'nf6', 14, 'creator', 'Grandmaster and YouTuber. Loves attacking chess.', 'the Ginger GM'],
  ['Eric Hansen', 'm', 2500, 'tricky', 'any', 'any', 'any', 12, 'creator', 'Grandmaster, streamer and co-founder of Chessbrah.'],
  ['Aman Hambleton', 'm', 2300, 'tricky', 'any', 'any', 'any', 10, 'creator', 'Streamer and co-founder of Chessbrah.'],
];
const strSeed = (n) => { let h = 7; for (const c of n) h = (h * 31 + c.charCodeAt(0)) % 90000; return 20000 + h; };
const BOTS = makeBots();
for (const L of LEGENDS) BOTS.push({ id: BOTS.length, g: L[1], name: L[0], nick: L[10] || '', elo: L[2], temper: L[3], open: L[4], defE4: L[5], defD4: L[6], book: L[7], styleP: L[3] === 'balanced' ? 0 : .5, chatty: 1, seed: strSeed(L[0]), group: L[8], blurb: L[9], spec: SPECS[L[0]] });
const botById = (id) => BOTS[id] || null;
function botLine(b, kind) { const L = (LINES[b.temper] || LINES.balanced)[kind] || []; return L.length ? L[Math.floor(Math.random() * L.length)] : ''; }
