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

// ---- voices: the creators talk like their public selves (friendly tributes in their manner, not quotes). Kinds: hi, check, take, win, lose, draw.
const VOICES = {
  'Levy Rozman': { hi: ["Hello everybody, it's Levy! Let's play some chess.", 'Welcome back, chat. Today: you versus an International Master. Oh, this will be good.', 'No Bongcloud today. Probably.'],
    check: ['Check! Did you see that coming?', 'Oh, that is check, my friend.', 'Check. Chat, his king is in trouble.'], take: ['Free piece. Thank you very much!', 'You cannot just leave pieces hanging.', 'I will take that. Hope that is okay!'],
    win: ['And THAT is checkmate, everybody. Good game!', 'GG. Like and subscribe... kidding. Great game!'], lose: ['WOW. Okay. That was a great game. Well played!', 'I got outplayed. That is embarrassing, honestly!'], draw: ['A draw?! Okay, I will take it.'] },
  'Hikaru Nakamura': { hi: ["Alright chat, let's get this going.", "Ladies and gentlemen, it's game time.", "Let's play some fast chess, bro."],
    check: ['Check, bro.', 'Check. Chat, he is cooked.', 'Check! This is going to be rough.'], take: ['Free pawn, free pawn. Thank you.', 'Chat, he just hung that.', 'I will take that.'],
    win: ['GG. Easy game, chat.', 'That is what happens. Good game, though!'], lose: ['Okay, that one is on me. Rematch?', 'Wow. I lost. That is tilting.'], draw: ['A draw? Okay, whatever. Run it back.'] },
  'Eric Rosen': { hi: ["Hello, friends! Today we are playing the Stafford Gambit. Maybe.", 'Fun first, rating second!', "Let's have a good game. I will try not to blunder... too much."],
    check: ['Check! That is the Stafford spirit.', 'Oh, that is a cute check.', 'Check! Look at those open lines.'], take: ['Thank you! Pieces make the attack better.', 'I will take that. Very kind of you.', 'Mmm, that is tasty.'],
    win: ['The Stafford wins again! Good game, friend!', 'Ha! That worked. Great game!'], lose: ['Oh no, the gambit did not work. Well played!', 'That was well defended. Respect!'], draw: ['A draw. That is fine, friend.'] },
  'Anna Cramling': { hi: ["Hi everybody! Let's have an exciting game!", "Let's go! I am ready to play.", 'Hello, hello! A fun game ahead, I hope!'],
    check: ['Check! Let us go!', 'Ooh, check!', 'Check. Run, king, run!'], take: ['Yes! I will take that.', 'Thank you, that was a present!', 'Oh nice, a free piece!'],
    win: ['Yes! Good game, that was fun!', 'I won! Thanks for playing with me.'], lose: ['Oh no! Well played, that was great!', 'You got me. Good game!'], draw: ['A draw? Okay, that is fair!'] },
  'Alexandra Botez': { hi: ['Hello chat! It is me. Let us play.', 'Is it Botez Gambit time? It is always Botez Gambit time.', 'Hi! Please be nice to me.'],
    check: ['Check! Wait, is that check? Yes, check!', 'Ooh, check. I feel powerful.', 'Check! Do not tell anyone I planned that.'], take: ['Free piece! Oh my gosh, thank you.', 'Mine now. Sorry!', 'I will take that!'],
    win: ['I won?! Wait, that is amazing. Good game!', 'Yes! Good game, thank you for playing.'], lose: ['Okay, that is fair. You played really well!', 'Of course. Of course I lost the queen. Good game!'], draw: ['A draw! I will take it, honestly.'] },
  'Andrea Botez': { hi: ["Hi hi! Let's play some chess!", 'Hello! I hope you are gentle with me.', "Okay, let's do this!"],
    check: ['Check! Is that good? I think that is good.', 'Oh, check!', 'Check! Wait, yes.'], take: ['Oh, I get to take that? Okay!', 'Yay, a free piece!', 'Thank you!'],
    win: ['I won! That is so exciting!', 'Yay! Good game!'], lose: ['Aww. You are really good. Well played!', 'Okay, you got me. Good game!'], draw: ['A draw! That is not bad for me.'] },
  'Agadmator': { hi: ['Hello, ladies and gentlemen. Let us play a game.', 'Good evening, my friends. Shall we begin?', 'A game of chess. Let us see what happens.'],
    check: ['And that is check, my friends.', 'Check. A very natural move.', 'Check, and now the king must decide.'], take: ['I take. A very natural capture.', 'The piece is taken. And that is all, my friends.', 'I will take, and this is the best, I think.'],
    win: ['And that is checkmate. A very nice game, my friends. Thank you for playing!', 'A good game. Thank you, and see you next time.'], lose: ['A beautiful finish by you. Thank you for the game, my friend.', 'You played very well. Congratulations.'], draw: ['A draw. A fair result, my friends.'] },
  'Ben Finegold': { hi: ["Greetings, children. Let's play some chess.", 'Sit down, class is in session.', "Let's see what you have learned."],
    check: ['Check. This is basic stuff, people.', 'Check. And what do you do now, hmm?', 'Check. I am just a humble teacher.'], take: ['Free piece. Remember: look at all the checks, captures and threats.', 'I will take that. Thank you for the donation.', 'Hanging pieces, children. Always check.'],
    win: ['Class dismissed. Good game!', 'And that is why you do your homework. Good game.'], lose: ['Well played! You will go far, young one.', 'Okay, you got me. Do not tell the class.'], draw: ['A draw. Everyone gets a gold star.'] },
  'Simon Williams': { hi: ["Right, let's get stuck in!", 'Hello, chess fans! Time to attack.', 'Attacking chess only. That is the rule.'],
    check: ['Check! The attack is on.', 'Check! Right, keep going.', 'Check, and the king is on the run.'], take: ['Lovely, thank you very much.', 'Mine! The attack needed that.', 'I will have that, thanks.'],
    win: ['What a game! Attack wins. Cheers!', 'Brilliant. Good game, mate.'], lose: ['Superb defence, mate. Well played.', 'Ah, you got me. Cheers for the game.'], draw: ['A draw? I was hoping for more fireworks.'] },
  'Eric Hansen': { hi: ["Yo, let's play some chess.", 'Alright, dude. Have fun.', "Chat, we're playing. Let's go."],
    check: ['Check, dude.', 'Check. That is a bit rude, huh?', 'Check! Classic.'], take: ['Free pawn, free pawn.', 'Dude, that was just hanging.', 'Thank you, kind stranger.'],
    win: ['Easy game. Just kidding, good game.', 'GG, dude.'], lose: ['Okay, nice. That was clean.', 'Dang. Well played, dude.'], draw: ['Draw. We both played it safe, dude.'] },
  'Aman Hambleton': { hi: ['Hey, hey! Let us play some chess.', 'Alright, let us have some fun.', 'Hello! Time for a good game.'],
    check: ['Check! Let us go!', 'Check, my friend.', 'Check! That feels nice.'], take: ['I will take that, thanks!', 'Oh, a free piece!', 'Thanks, that is very kind.'],
    win: ['Nice! Good game, my friend.', 'Yes! That was a fun one.'], lose: ['Well played! Great game.', 'Nice one, you got me.'], draw: ['A draw. Fair enough!'] },
};
// ---- chat written by the model (Hugging Face Space) in each person's manner; a friendly tribute, never real quotes (tools/bake_voices.py)
/*VOICES_GEN_START*/
const VOICES_GEN = {
"Paul Morphy": {
"hi": [
"A most pleasant encounter, indeed!",
"Greetings, my esteemed opponent.",
"May we have a most spirited contest.",
"I am quite looking forward to this dance.",
"Welcome to the grand arena of minds.",
"Let us commence this noble affair.",
"I trust you are well this fine day.",
"A pleasure to meet you across the board.",
"Prepare for a delightful excursion!",
"May the best game unfold."
],
"check": [
"A little attention, if you please.",
"My apologies, a slight interruption.",
"Have a care, my friend.",
"Pray, observe this development.",
"Might I draw your eye to this?",
"A moment to ponder, perhaps.",
"Consider this position carefully.",
"A small greeting from my forces.",
"Let us see how you respond."
],
"take": [
"I have secured this position.",
"A piece now joins my ranks.",
"This part of the battlefield is mine.",
"A most opportune moment, I believe.",
"The board reshapes itself.",
"My strategy unfolds thusly.",
"A welcome addition to my forces."
],
"win": [
"A truly exhilarating contest, thank you.",
"That was a most satisfying conclusion.",
"A well-fought game, my friend.",
"I am humbled by your skill.",
"The game has concluded most happily.",
"A most remarkable display.",
"I shall cherish this memory.",
"Thank you for a superb encounter.",
"Victory smiles upon us today.",
"A fine outcome, indeed."
],
"lose": [
"A most instructive experience, thank you.",
"Your play was quite exceptional.",
"I have much to learn from this.",
"A valuable lesson, truly.",
"The game has taken its course.",
"You have demonstrated great mastery.",
"I commend your brilliant strategy.",
"A humbling moment, nonetheless.",
"It was a privilege to play.",
"I shall reflect upon this."
],
"draw": [
"A most balanced and elegant conclusion.",
"The game has reached a perfect equilibrium.",
"We have arrived at a mutual understanding.",
"The contest ends in harmony.",
"A resolution of perfect accord.",
"The tension has gracefully subsided.",
"A worthy outcome, I feel.",
"Let us call it a splendid truce."
]
},
"Wilhelm Steinitz": {
"hi": [
"A new study begins. Excellent.",
"Welcome to our little intellectual exercise.",
"The dance of strategy commences.",
"Observe the foundational principles, if you will.",
"A moment for thoughtful consideration.",
"Let us engage with the complexities.",
"The canvas awaits our strategic brushstrokes.",
"I trust your preparation is adequate.",
"The opening presents its early challenges."
],
"check": [
"A mild inconvenience, perhaps?",
"Your king faces a pointed inquiry.",
"A small adjustment of the pieces.",
"Observe this particular arrangement.",
"The initiative remains with me.",
"The position demands attention.",
"Do you perceive the threat?",
"A simple positional refinement.",
"The board is speaking, you see."
],
"take": [
"A gain, however minor.",
"The material balance shifts.",
"An exchange of assets. Fair enough.",
"Such exchanges are part of the game.",
"A piece removed from your army.",
"The structure has been altered.",
"A calculated necessity, I assure you.",
"A small step in the right direction.",
"We are refining the form."
],
"win": [
"The logical conclusion has arrived.",
"The principles have prevailed.",
"A satisfactory demonstration of strategy.",
"The advantage was consolidated.",
"Indeed, the theory held true.",
"A rather inevitable outcome, I feel.",
"The position simply demanded this result.",
"A fine example of positional mastery.",
"The opponent's resistance eventually softened.",
"Another problem solved, elegantly."
],
"lose": [
"A curious miscalculation, it seems.",
"The initiative was surrendered, unfortunately.",
"A lesson to be learned, clearly.",
"The board offered a different path.",
"My analysis was, perhaps, incomplete.",
"The pressure became too great.",
"A minor deviation from sound principles.",
"The game concluded with an unexpected twist.",
"My apologies for the less than optimal display.",
"The opponent found a compelling advantage."
],
"draw": [
"A state of equilibrium is reached.",
"The board refuses to yield a winner.",
"Neither side could establish dominance.",
"The struggle found its natural end.",
"The complexities led to stasis.",
"A testament to both players' vigilance.",
"A shared understanding of the outcome."
]
},
"Emanuel Lasker": {
"hi": [
"Ah, a new encounter! Shall we dance?",
"Let us explore this battlefield together.",
"The board awaits our thoughts, my friend.",
"A fresh start, full of delightful possibilities.",
"Welcome to the theatre of the mind.",
"May our minds meet in noble contest.",
"Another journey begins. I am ready.",
"The first move, a whispered invitation.",
"Intriguing. Let the contemplation commence.",
"So, another soul seeks understanding here."
],
"check": [
"A little nudge, a gentle reminder.",
"Observe the unfolding drama, won't you?",
"A moment to reconsider the path.",
"This position requires your keenest eye.",
"Just a small breath of urgency.",
"The wind shifts, doesn't it?",
"A prompt to assess the landscape.",
"Now, what intricate thought arises?",
"A subtle pressure, no more, no less.",
"Consider this a philosophical pause."
],
"take": [
"Ah, an offering! Thank you kindly.",
"A piece finds a new purpose.",
"Such is the nature of exchange.",
"A small victory in the grand scheme.",
"The ebb and flow of power.",
"This changes the tapestry, doesn't it?",
"A necessary subtraction, perhaps?",
"The board breathes differently now.",
"A testament to bold action.",
"Every piece has its moment."
],
"win": [
"A most rewarding exploration.",
"The pieces have spoken their truth.",
"Wisdom found in thoughtful struggle.",
"A good lesson learned for both.",
"That was quite the cerebral workout.",
"The mind can indeed prevail.",
"A satisfactory conclusion to our study.",
"May this outcome spark further reflection.",
"The struggle itself was the reward.",
"A moment of quiet appreciation for the game."
],
"lose": [
"The mind is a vast ocean; I underestimated the currents.",
"A valuable lesson in humility, then.",
"The opponent's strategy was most illuminating.",
"Sometimes, the teacher learns the most.",
"A humbling reminder of the game's depths.",
"The board has shown me its wisdom.",
"Perhaps another time, with fresh eyes.",
"The journey was interesting, regardless.",
"A well-played encounter. Well done.",
"The spirit of play endures."
],
"draw": [
"A perfect balance, a shared insight.",
"Neither side truly yielded, a testament.",
"A quiet understanding reached.",
"The game offered no definitive answer.",
"A moment of mutual contemplation.",
"The struggle led to harmony.",
"The mind pauses, not defeated, not victorious.",
"A shared journey to an unexpected end."
]
},
"José Raúl Capablanca": {
"hi": [
"Ah, a new dance begins. Shall we start?",
"Welcome, my friend. Ready for a pleasant game?",
"Let us explore the board together. Hello!",
"A moment of quiet pleasure awaits us.",
"So, the stage is set. Good day.",
"I hope you are feeling refreshed. Hello there.",
"The pieces are poised. A simple hello.",
"Let the pleasant duel commence. Greetings.",
"It's a pleasure to share this moment.",
"Ready for a touch of strategy, perhaps?"
],
"check": [
"Oh, a little nudge. Watch out!",
"A gentle reminder of my presence.",
"Just a small announcement, my friend.",
"A moment to consider your next step.",
"A polite warning, nothing more.",
"There, a bit of pressure applied.",
"Consider this a friendly tap.",
"A simple question for you to answer.",
"Just ensuring you're still with me."
],
"take": [
"And that piece makes its exit.",
"A small exchange, no trouble.",
"This is now in my keeping.",
"My apologies, but it was necessary.",
"One less obstacle on the path.",
"A rather straightforward transaction.",
"That piece has fulfilled its purpose.",
"So, a small simplification.",
"Ah, that has been accounted for.",
"A clean capture, as they say."
],
"win": [
"Well played, it was a fine contest.",
"A beautiful game, thank you kindly.",
"That was most enjoyable. Until next time.",
"A satisfying conclusion, wouldn't you agree?",
"The pieces have spoken. A good game.",
"A graceful end to our encounter.",
"Thank you for the lovely dance.",
"That was quite a pleasant experience.",
"My compliments on your efforts.",
"The final position reveals all. Bravo."
],
"lose": [
"Ah, a lesson learned. Very insightful.",
"You played a strong game indeed.",
"That was a most instructive encounter.",
"Your strategy was quite effective. Well done.",
"A beautiful demonstration of skill.",
"I shall ponder this outcome. Thank you.",
"The board shows a clear winner.",
"That was a truly engaging match.",
"You have outmaneuvered me. Bravo.",
"A thoughtful game, and a worthy opponent."
],
"draw": [
"A balanced outcome. Quite fair, I think.",
"The pieces reached a peaceful accord.",
"Neither side could quite prevail. A good result.",
"We played to a mutual understanding.",
"The board offers no further advantage.",
"A moment of equilibrium. Enjoyable.",
"The game has found its natural conclusion.",
"A tie. A perfectly reasonable outcome.",
"This result feels quite complete."
]
},
"Alexander Alekhine": {
"hi": [
"Ah, a worthy adversary enters the arena!",
"Let the grand dance of kings commence!",
"Prepare yourself for a duel of wits.",
"The stage is set, the pieces are poised.",
"A pleasure to face such a keen mind.",
"We shall see what fire burns within you.",
"Your move, if you dare to begin.",
"Let us forge a masterpiece on the board.",
"The battle awaits! Shall we begin?",
"May the sharpest intellect prevail!"
],
"check": [
"A whisper of danger, wouldn't you say?",
"Your monarch feels the chill, I trust?",
"A small prelude to the storm.",
"The net tightens, step by careful step.",
"Consider this a friendly nudge.",
"A moment for reflection, perhaps?",
"The shadows lengthen around your king.",
"This is merely the beginning of the end.",
"A warning shot across your bow.",
"The hounds are at the door!"
],
"take": [
"A piece falls, the tapestry unravels.",
"The board simplifies, for better or worse.",
"A regrettable casualty, but necessary.",
"This exchange favors my grand design.",
"A small victory, but a victory nonetheless.",
"The fabric of your defense frays.",
"Such a lovely trinket, I shall keep it.",
"The price of vigilance is high.",
"Your material weakens, my friend.",
"A bold sacrifice, met with a sharp response."
],
"win": [
"The game is concluded, a victory for the bold!",
"Your resistance was spirited, but ultimately futile.",
"A symphony of brilliant moves played out.",
"The chessboard yields to superior strategy.",
"A most satisfying conclusion to our contest.",
"We have reached the final chord.",
"Your king has met its destiny.",
"The victor's laurel is mine today.",
"A fitting end to a grand struggle.",
"Until we meet again, perhaps on higher ground."
],
"lose": [
"Alas, the dice of fate did not favor me.",
"A humbling lesson, but one I shall learn.",
"My calculations fell short this time.",
"The battlefield belonged to you, evidently.",
"A bitter pill, but I shall swallow it.",
"Your brilliance eclipsed my own today.",
"The tide of battle turned unexpectedly.",
"A moment of weakness, exploited with precision.",
"The crown slips, but the spirit remains.",
"A worthy opponent indeed. Well played."
],
"draw": [
"Neither of us could claim ultimate victory.",
"A balanced struggle, a truce of sorts.",
"The board remains a field of contention.",
"Perhaps the fates deemed us equals.",
"A moment of shared reflection on the board.",
"We shall meet again, on a different day.",
"The battle was fierce, the result inconclusive.",
"A curious impasse, wouldn't you agree?",
"The game ends, but the rivalry continues."
]
},
"Mikhail Botvinnik": {
"hi": [
"Greetings. Let us commence.",
"The match begins. Observe.",
"Prepared for this engagement.",
"A structured contest awaits.",
"My analysis is complete.",
"We shall proceed with rigor.",
"The board is set. Focus.",
"Anticipating a precise game.",
"Discipline shall be paramount.",
"Let the strategic exchange unfold."
],
"check": [
"A positional adjustment.",
"The initiative is mine.",
"Your king is challenged.",
"Observe the consequence.",
"A planned maneuver.",
"The tempo shifts.",
"My strategy unfolds.",
"Consider your response.",
"A direct question.",
"This requires your attention."
],
"take": [
"Material advantage gained.",
"An opportunity exploited.",
"My plan progresses.",
"A necessary exchange.",
"Resources consolidated.",
"The structure is altered.",
"A calculation confirmed.",
"Further preparation complete.",
"A logical acquisition.",
"The board is refined."
],
"win": [
"The plan was executed successfully.",
"Discipline yields results.",
"A testament to preparation.",
"The outcome aligns with analysis.",
"Order has been restored.",
"A diligent effort recognized.",
"The strategy proved sound.",
"Further study is recommended.",
"The objective achieved."
],
"lose": [
"An unexpected deviation.",
"My preparation was insufficient.",
"A critical miscalculation occurred.",
"The plan requires revision.",
"This outcome is noted.",
"Lessons will be extracted.",
"My analytical framework needs adjustment.",
"Further analysis is imperative."
],
"draw": [
"The positions were equal.",
"Neither side gained a decisive advantage.",
"The tension was maintained.",
"A worthy contest.",
"The analysis suggested this possibility.",
"A mutual understanding of limitations.",
"The struggle was significant.",
"Further contemplation is warranted."
]
},
"Vasily Smyslov": {
"hi": [
"A gentle start to our little dance.",
"Let the harmony of the board unfold.",
"Welcome, friend. May our moves sing.",
"Ready for a quiet contemplation?",
"A new melody begins.",
"Glad to share this space with you.",
"Let's find the beauty together.",
"A peaceful game awaits.",
"May the flow of play be kind.",
"Greetings, fellow traveler of the squares."
],
"check": [
"A little note, a soft reminder.",
"Just a whisper, a gentle nudge.",
"See how the pattern shifts?",
"A moment of focused attention.",
"The rhythm calls for this.",
"A pleasing arrangement, wouldn't you say?",
"This position has a certain grace.",
"Consider the next phrase.",
"The music leads us here.",
"A quiet declaration of intent."
],
"take": [
"One less voice in the chorus.",
"A small exchange, like a passing note.",
"The piece finds a new harmony.",
"A simple necessity, nothing more.",
"The canvas changes its color.",
"Each move has its purpose.",
"This part of the composition is complete.",
"A natural progression of the theme.",
"The board breathes a little differently.",
"A quiet rearrangement of our world."
],
"win": [
"The final chord has been played.",
"Our little song concludes.",
"A satisfying resolution.",
"May this end bring you peace too.",
"The harmony was complete.",
"A moment of quiet fulfillment.",
"The pattern reached its natural end.",
"So it flowed, so it finished.",
"A peaceful conclusion to our duet.",
"May we meet again on this peaceful stage."
],
"lose": [
"Ah, the quieter notes sometimes prevail.",
"A different melody unfolded today.",
"The board showed me a new path.",
"It was a beautiful composition, nonetheless.",
"Thank you for sharing your art.",
"Sometimes the silence speaks loudest.",
"This lesson is a gentle one.",
"I enjoyed the flow.",
"The music guided us differently.",
"A moment to reflect on the harmony."
],
"draw": [
"A perfect balance, a still moment.",
"The harmony remains unbroken.",
"A shared space, a quiet understanding.",
"Our melodies found common ground.",
"A peaceful pause, a shared breath.",
"The composition rests here, beautifully.",
"A gentle resolution for both.",
"We found a resonant chord.",
"The dance found its equilibrium.",
"This is a pleasing stillness."
]
},
"Mikhail Tal": {
"hi": [
"Greetings, fellow traveler on the checkered plains!",
"Ready for a little dance with destiny?",
"Let's paint a masterpiece, shall we?",
"Prepare for a touch of delightful chaos!",
"The board awaits its intrepid adventurers.",
"May your spirits be as high as your pieces!",
"A pleasure to share this battlefield.",
"Let the whimsical war commence!",
"Hope you're ready for a bit of fun.",
"The stars have aligned for our game!"
],
"check": [
"A gentle nudge, my friend!",
"Just a whisper of what's to come.",
"The King feels a tickle!",
"A little surprise for your royal personage.",
"Now, where were we going with this?",
"Is that a smile on your face?",
"The plot thickens, wouldn't you say?",
"A moment of delightful tension!",
"The hounds are nipping at your heels.",
"Just a friendly reminder of gravity."
],
"take": [
"Oh, what a lovely gift!",
"Such a generous offering, thank you!",
"One less distraction on the stage.",
"A small sacrifice for a grander vision.",
"Into the great beyond you go!",
"Another brushstroke on our canvas.",
"The tapestry is becoming richer.",
"A neat little exchange, I think.",
"You make giving so easy!"
],
"win": [
"And so the magician conjures victory!",
"A truly exhilarating journey, wouldn't you agree?",
"That was a beautiful mess we made!",
"The darkest corners of tactics revealed their secrets.",
"A delightful conclusion to our little ballet.",
"May this inspire your next grand adventure.",
"What a spectacular display of daring!",
"The applause is for both of us, truly.",
"Until our next whimsical encounter!",
"The magic, it seems, was strong today."
],
"lose": [
"Ah, the forest claims another wanderer!",
"A most instructive lesson, thank you.",
"Sometimes the grand design takes a different turn.",
"That was a dazzling display of your prowess.",
"My apologies for the dramatic exit.",
"A worthy opponent indeed!",
"The tapestry unraveled beautifully for you.",
"A truly spirited contest, I must say.",
"Until the next time the muse calls.",
"You played a truly enchanting game!"
],
"draw": [
"A perfectly balanced dance, wouldn't you say?",
"The scales of fate found their equilibrium.",
"We painted a picture neither could conquer.",
"A harmonious conclusion, a shared masterpiece.",
"The magic simply refused to fade away.",
"A testament to our shared brilliance.",
"Perhaps a bit too much fun for one winner.",
"The board breathes a sigh of relief.",
"Until our next fascinating deadlock!"
]
},
"Tigran Petrosian": {
"hi": [
"A gentle beginning, I trust?",
"Welcome, I hope you are ready.",
"The game commences. Observe carefully.",
"A quiet start, perhaps.",
"May we find a pleasant contest.",
"The pieces are set. Proceed.",
"Let us explore the possibilities.",
"A moment of anticipation.",
"The first move is always important."
],
"check": [
"Just a reminder of presence.",
"A gentle prod, perhaps.",
"See how they react.",
"A moment to consider.",
"A slight inconvenience, I hope.",
"The king feels a breeze.",
"A moment for thought.",
"A subtle pressure applied.",
"Just ensuring everything is in order."
],
"take": [
"A small price for a piece.",
"A careful exchange, I think.",
"The board feels a little lighter.",
"A calculated removal.",
"Sometimes, a sacrifice is necessary.",
"A bit tidier now.",
"The structure shifts slightly.",
"An opportunity seized, quietly.",
"A small problem solved."
],
"win": [
"A quiet victory, as expected.",
"The long game, rewarded.",
"A solid defense, ultimately.",
"Hardly a surprise, was it?",
"Patience, it seems, paid off.",
"The fortress held, as planned.",
"A rather predictable outcome.",
"The danger was averted.",
"All is secure now."
],
"lose": [
"Ah, a lesson learned today.",
"It seems I misjudged the path.",
"A moment of unexpected danger.",
"The defense, it seems, faltered.",
"A rather unfortunate turn.",
"The position became too complex.",
"A small crack appeared.",
"One must accept the outcome.",
"Perhaps I was too passive.",
"A reminder of the unpredictable."
],
"draw": [
"The struggle found its peace.",
"A game of equal measure.",
"Neither side could find an edge.",
"The fortress was impenetrable.",
"A prudent conclusion.",
"A shared moment of reflection.",
"The board remains standing.",
"Perhaps next time, a clearer path."
]
},
"Boris Spassky": {
"hi": [
"Ah, a new game! Ready when you are.",
"Greetings! Let's have a pleasant match.",
"Hope you're in good spirits today.",
"Shall we begin this little dance?",
"The board is set, my friend.",
"Looking forward to our game.",
"Let the best player win, eh?",
"A quiet moment before the storm.",
"This should be an interesting encounter."
],
"check": [
"Just a little nudge, my friend.",
"A moment of your attention, please.",
"Careful there, that was close!",
"A gentle reminder of the situation.",
"Just letting you know I'm here.",
"A small announcement.",
"Consider yourself notified.",
"A polite suggestion to move.",
"The king is feeling a bit exposed.",
"Just a friendly poke."
],
"take": [
"A piece removed from the battlefield.",
"A small gain, perhaps.",
"The board is getting a bit emptier.",
"A piece is no longer standing.",
"A strategic removal.",
"Well, that's one less to worry about.",
"A necessary sacrifice, or a good opportunity?",
"The game unfolds.",
"A change in the landscape."
],
"win": [
"A good game indeed! Well played.",
"That was a fascinating contest.",
"A victory, but a hard-fought one.",
"The outcome is decided. A pleasure.",
"A rather satisfying conclusion.",
"Sometimes the pieces just fall into place.",
"I enjoyed our little duel.",
"A lesson learned, perhaps for both of us.",
"A fine game, thank you.",
"That was quite the experience."
],
"lose": [
"Ah, the game goes to you. Congratulations!",
"Well played! You certainly earned it.",
"A tough lesson, but a valuable one.",
"The better player won today.",
"That was a fine display of skill.",
"A most enjoyable game, despite the outcome.",
"You saw the path to victory clearly.",
"A good effort on my part, but yours was superior.",
"Thank you for the challenge and the result.",
"Sometimes the dice roll differently."
],
"draw": [
"An even contest, it seems. A fair result.",
"We found a peaceful resolution.",
"A draw! A respectable outcome.",
"A balanced game, indeed.",
"The tension remained until the very end.",
"Well, that was a good struggle.",
"A shared moment of parity."
]
},
"Bobby Fischer": {
"hi": [
"Let's play.",
"Your move.",
"No wasted time.",
"Show me your best.",
"This position demands clarity.",
"Focus.",
"We begin.",
"No room for error.",
"The board is yours.",
"Let's see the truth."
],
"check": [
"Your king is exposed.",
"A direct threat.",
"There is no escape.",
"You must react.",
"See this.",
"Consider your king's safety.",
"This is not ideal.",
"The pressure is on.",
"A simple fact.",
"Where do you go now?"
],
"take": [
"A piece removed.",
"Material advantage secured.",
"The position shifts.",
"A clear gain.",
"This simplifies things.",
"One less defender.",
"Your forces are diminished.",
"An important exchange.",
"The board reflects this.",
"Accept this reality."
],
"win": [
"The game is over.",
"Victory is absolute.",
"The truth prevailed.",
"A decisive result.",
"It was inevitable.",
"Consider this lesson.",
"No further play.",
"The position dictated this.",
"A clean win.",
"That is all."
],
"lose": [
"A clear defeat.",
"The position was lost.",
"This was not my best.",
"I made errors.",
"The opponent played well.",
"No excuses.",
"This outcome is factual.",
"A difficult result.",
"The game is finished.",
"I see the mistakes."
],
"draw": [
"The position held.",
"Neither side gained.",
"An even contest.",
"The truth is balance.",
"No decisive advantage.",
"The game concludes here.",
"A shared outcome.",
"The board shows this.",
"A fair result."
]
},
"Anatoly Karpov": {
"hi": [
"A quiet beginning, perhaps.",
"A new contest. Interesting.",
"The board awaits us.",
"A moment for contemplation.",
"Shall we begin this dance?",
"I sense a thoughtful opponent.",
"Let the strategy commence.",
"A peaceful start to our game."
],
"check": [
"The king feels the pressure.",
"A breath of fresh air, perhaps.",
"A minor inconvenience.",
"We are making progress.",
"A subtle shift in the wind.",
"The king must consider his options.",
"Just a small squeeze."
],
"take": [
"A minor material gain.",
"One less obstacle, it seems.",
"A simple adjustment.",
"The structure changes slightly.",
"Another piece enters the exchange.",
"We are simplifying.",
"A small advantage accrues.",
"The tempo is ours.",
"A necessary subtraction."
],
"win": [
"A patient approach yielded results.",
"The game has found its conclusion.",
"A quiet victory, as is often the way.",
"The pressure was applied consistently.",
"The smaller advantages accumulated.",
"It was a matter of time.",
"The final position is clear.",
"A well-fought contest concludes."
],
"lose": [
"A lesson learned for next time.",
"The game has ended.",
"A small oversight, perhaps.",
"The pressure was not enough.",
"An interesting game, regardless.",
"Sometimes the advantage slips away.",
"The position became difficult.",
"We acknowledge the result.",
"A moment of reflection."
],
"draw": [
"A balanced outcome, it seems.",
"A fair division of the points.",
"The contest ends in equilibrium.",
"The pieces found their rest.",
"A draw is a valid result.",
"We both played with care."
]
},
"Garry Kasparov": {
"hi": [
"Alright, let's see what energy you bring!",
"The battle begins! Show me your will.",
"Ready for a fierce contest of minds?",
"Let the initiative be ours from the start!",
"Prepare for a game with fire and purpose.",
"This is where champions are forged!",
"Bring your best. I'm ready.",
"Let's make some dynamic moves together.",
"The board awaits our decisive actions.",
"Let's attack this game with pure energy!"
],
"check": [
"A warning shot! Feel the pressure!",
"Now you must react. Where is your will?",
"The attack intensifies! Time to move.",
"See that? Initiative is key!",
"Consider this a sharp reminder.",
"Your king is feeling the heat!",
"This is just the beginning of the storm.",
"A calculated push forward. Respond!",
"The tempo is ours. Can you keep up?",
"This is how we build our advantage!"
],
"take": [
"Resourceful. But was it worth it?",
"A small gain, a significant risk.",
"You surrendered that. Interesting.",
"Excellent, you took the bait!",
"Pieces fall. The energy shifts.",
"A valuable exchange. We learn.",
"This is how we seize opportunities.",
"Your forces diminish. Mine grow stronger.",
"A bold move, but predictable.",
"Sacrifice? Or mistake? We'll see."
],
"win": [
"Victory! The will to win prevails!",
"A hard-fought triumph. Excellent resistance!",
"That was a clash of titans!",
"Pure energy and preparation won this.",
"We pushed, we attacked, we conquered!",
"A brilliant display of initiative!",
"This is the taste of true competition.",
"You gave your all. Respect.",
"The scoreboard reflects our relentless spirit.",
"A magnificent demonstration of winning will!"
],
"lose": [
"A tough lesson. The board demands more.",
"My energy faltered. A valuable learning.",
"Passive play has its price.",
"I underestimated your preparation.",
"The initiative was lost. A mistake.",
"This is a reminder to stay sharp.",
"I will analyze this intensely.",
"Not my finest hour. Back to work.",
"You earned this victory. Well played.",
"A duel of wills, and you prevailed."
],
"draw": [
"An intense battle, but no decisive blow.",
"We met as equals today.",
"A balanced contest. Commendable resistance.",
"Perhaps a draw is a victory in itself.",
"The energy was there, but the finish elusive.",
"We both fought with strong will.",
"A moment of equilibrium on the board.",
"Neither side could break the other's spirit.",
"A testament to resilient defense and attack."
]
},
"Vladimir Kramnik": {
"hi": [
"A pleasant game, I hope.",
"Let us begin this quiet contest.",
"Ready for a thoughtful exchange?",
"The board awaits our precise efforts.",
"A new wall to build, perhaps?",
"A moment for careful consideration.",
"Good afternoon. Let us play.",
"The foundation is set.",
"May our calculations be sharp."
],
"check": [
"A small nudge to consider.",
"The King must find shelter.",
"A hint of what is to come.",
"The focus shifts, slightly.",
"A moment for defensive thought.",
"This position demands attention.",
"A subtle pressure is applied.",
"The King requires a safe haven.",
"Consider this developing threat.",
"A position to react to."
],
"take": [
"A piece removed. Solid.",
"The structure is now different.",
"An exchange made. Precise.",
"That material is now mine.",
"The defensive line has a gap.",
"A concrete calculation paid off.",
"The balance shifts, subtly.",
"Good. That was necessary.",
"The wall remains intact.",
"A clean acquisition."
],
"win": [
"A solid victory, earned.",
"The final wall stands tall.",
"A precisely executed plan.",
"Our calculations were sound.",
"A good game, well played.",
"A quiet but decisive result.",
"The objective has been met.",
"A satisfying conclusion.",
"Solid technique prevailed."
],
"lose": [
"A difficult position to defend.",
"My defenses were not sufficient.",
"The opponent's attack was strong.",
"A lesson in precision.",
"Perhaps my calculation was flawed.",
"A solid effort, but not enough.",
"The wall crumbled.",
"I must review this game.",
"A challenging outcome."
],
"draw": [
"Neither side yielded an inch.",
"The wall stood, unbreached.",
"A mutual understanding was reached.",
"The contest was too even.",
"A precise equilibrium.",
"A shared analysis."
]
},
"Viswanathan Anand": {
"hi": [
"Hello there! Ready for a friendly dance?",
"A pleasure to see you across the board!",
"Hope you're feeling sharp today!",
"This should be fun!",
"Welcome to the little battleground.",
"Always a joy to play against you.",
"Time to see what we can conjure up.",
"Here we go! A fresh start.",
"May your pieces be inspired!"
],
"check": [
"Oh, a little peek-a-boo!",
"Just saying hello to your king!",
"Hope that didn't startle you too much.",
"Just reminding your king who's here.",
"A polite announcement!",
"Look out! Someone's at the door.",
"Fancy seeing you there, your majesty!",
"A quick tap on the shoulder.",
"Just checking in!"
],
"take": [
"Oops, did that piece wander off?",
"A little souvenir for me!",
"That was a bit of a mistake, eh?",
"Thank you for the gift!",
"My collection grows!",
"A fair exchange, I think.",
"Snack time!",
"That seemed to be in the way.",
"Lovely, a new addition!"
],
"win": [
"Well played! That was a wonderful game.",
"A hard-fought victory! So enjoyable.",
"You gave me quite a challenge!",
"That was a thrilling finish. Thanks!",
"A pleasure to play, even in defeat for you.",
"Sometimes the stars align. Good game!",
"That was a really fun one. Cheers!",
"So glad we played that out.",
"A close one, but it went my way this time.",
"You played brilliantly. Until next time!"
],
"lose": [
"Ah, you were too good today!",
"That was a magnificent display!",
"You outplayed me, fair and square.",
"A very strong performance from you. Well done!",
"I enjoyed every moment of that struggle.",
"You found the right path, I missed it.",
"A lesson learned, perhaps. Nicely played!",
"That was a truly impressive game.",
"You were simply better today. Congratulations!",
"A very well-deserved win for you."
],
"draw": [
"That was a perfect balance.",
"We pushed each other all the way!",
"A draw is a good conclusion.",
"Neither of us could quite break through.",
"A very satisfying game.",
"We can both be proud of that one.",
"An honourable tie!",
"That felt like a proper contest."
]
},
"Magnus Carlsen": {
"hi": [
"Alright, let's play.",
"So, this is it.",
"Let's see what we've got.",
"A bit of fun, then.",
"Hope you're feeling sharp.",
"Here we go.",
"Just a game, right?",
"Time to start.",
"Let's get on with it."
],
"check": [
"Oh, that's a thing.",
"There's that.",
"A heads-up, you could say.",
"Something to consider.",
"Well, well.",
"A slight inconvenience for you.",
"Hmm, a moment for thought."
],
"take": [
"One less.",
"That's gone then.",
"Interesting exchange.",
"Seems fair enough.",
"A piece for a piece.",
"Took care of that.",
"Accidents happen.",
"That's how it goes.",
"A small victory, maybe."
],
"win": [
"Well played, mostly.",
"A grind, but here we are.",
"Luck was on my side, I think.",
"Didn't expect that.",
"That was a bit boring, honestly.",
"Good effort.",
"Felt like a long one.",
"We'll call it a day."
],
"lose": [
"Ah, that happened.",
"My mistake, clearly.",
"Not my best effort, I'll admit.",
"Bit of a slip-up.",
"That wasn't quite right.",
"Oh well, these things occur.",
"Too bad. I was getting bored anyway.",
"Learned something, I hope.",
"Next time, perhaps.",
"That went surprisingly fast."
],
"draw": [
"A fair outcome, I suppose.",
"Couldn't find a way through.",
"We'll call it even.",
"A bit anticlimactic, wasn't it?",
"Neither of us made a big enough mistake.",
"That was... something.",
"Back to the drawing board, maybe.",
"A respectable result.",
"An even match."
]
},
"Ding Liren": {
"hi": [
"Hello there, let us begin.",
"Good to play with you.",
"A new challenge awaits.",
"Hope you enjoy this game.",
"Let the thinking commence.",
"May your thoughts be clear.",
"It is nice to meet you.",
"Let us have a good match.",
"Welcome to the board."
],
"check": [
"A little attention, perhaps?",
"Is this moment... interesting?",
"Something to consider here.",
"A gentle reminder, friend.",
"The board is quite active now.",
"My apologies, a move forward.",
"A small nudge for you.",
"This position requires thought.",
"Hope this is not too sudden.",
"Just a passing thought on the board."
],
"take": [
"Oh, that piece is now mine.",
"A small exchange, no harm done.",
"This piece will rest here now.",
"A moment of quiet for it.",
"Thank you for the offering.",
"A rather unexpected situation.",
"The board changes, doesn't it?",
"This feels like progress.",
"My apologies for the capture.",
"A piece has found a new home."
],
"win": [
"A close game, thank you.",
"It was a pleasure playing.",
"That was a tough fight.",
"I am grateful for the experience.",
"Well played, you made me think.",
"I learned much from this game.",
"You played very well indeed.",
"A most enjoyable match.",
"This victory is very kind."
],
"lose": [
"Ah, a learning moment for me.",
"You were very strong today.",
"Thank you for the lesson.",
"My apologies, I missed something.",
"It was a tough battle.",
"I enjoyed the struggle greatly.",
"You deserve this win.",
"Perhaps next time will be better.",
"A good game, even in defeat.",
"Thank you for your patience."
],
"draw": [
"A fair result, I think.",
"This was a very balanced game.",
"Thank you for the shared effort.",
"We both fought hard for this.",
"The board reached a peaceful state.",
"A good, solid game.",
"Thank you for the interesting play.",
"It ended as it should have."
]
},
"Fabiano Caruana": {
"hi": [
"A pleasure to begin.",
"Let us proceed with precision.",
"Hoping for a well-fought game.",
"I have reviewed a few lines.",
"Let the calculation commence.",
"A quiet opening, perhaps?",
"I trust your preparation is sound.",
"Shall we commence the analysis?",
"A moment to focus."
],
"check": [
"A calculated move.",
"A slight adjustment to the board.",
"You may need to consider this.",
"That requires a response.",
"My calculations indicated this possibility.",
"A moment of attention is needed.",
"The position has shifted.",
"An important juncture.",
"This presents a challenge.",
"Observe the consequences carefully."
],
"take": [
"A piece is now off the board.",
"My assessment was correct.",
"The material balance has changed.",
"A useful exchange.",
"I have gained an advantage.",
"That was a logical conclusion.",
"The computation proved fruitful.",
"An outcome of careful planning.",
"The board looks different now.",
"A necessary adjustment."
],
"win": [
"The final position is reached.",
"My analysis held true.",
"A victory through diligence.",
"The calculations were conclusive.",
"The objective has been achieved.",
"The preparation paid off.",
"A testament to focused effort.",
"A difficult, but decisive, encounter."
],
"lose": [
"An unexpected turn of events.",
"My calculations were flawed.",
"A lesson learned from this game.",
"The opponent's strategy was superior.",
"The position became untenable.",
"A challenging result to process.",
"I will review my approach.",
"The game concluded as it did.",
"A difficult outcome, but accepted.",
"I must analyze where things went awry."
],
"draw": [
"The position led to equilibrium.",
"A fair result for both sides.",
"Neither side could force a win.",
"An interesting strategic outcome.",
"The game ended as it should.",
"A shared point of understanding.",
"The analysis indicated this possibility."
]
},
"Judit Polgar": {
"hi": [
"Hello there, ready for a good fight?",
"Greetings! Let's have some fun, yes?",
"A warm hello to my opponent today!",
"Welcome to the board! Let's see what unfolds.",
"So glad to be playing you!",
"Ready for a spirited game?",
"Hello! May your moves be bold.",
"Let's begin this exciting dance!",
"Hello! Let your courage shine."
],
"check": [
"Just a friendly reminder!",
"Watch out, something's coming!",
"Think about this, my friend.",
"The king needs to move!",
"A little nudge to keep things interesting.",
"This could be exciting!",
"Let's see how you handle this.",
"A bold move, wouldn't you say?"
],
"take": [
"A valuable piece removed!",
"That was a good exchange.",
"Off the board you go!",
"A necessary step forward.",
"Gaining some ground here.",
"My attack grows stronger.",
"A bold capture, indeed!",
"That piece served its purpose.",
"A little more space now.",
"Every piece counts, you know."
],
"win": [
"A well-fought battle, my friend!",
"Victory is sweet, but you played well!",
"That was a thrilling game!",
"You showed great determination!",
"A truly memorable contest!",
"I hope you enjoyed that!",
"Your courage was admirable!",
"A fantastic display of skill!",
"What a spirited encounter!"
],
"lose": [
"A tough outcome, but a learning moment!",
"Sometimes the attack doesn't quite land.",
"That was a challenging game for me.",
"Your strategy was very effective.",
"I am proud of my effort.",
"We both fought hard, didn't we?",
"A valuable lesson learned today.",
"It was a good game, truly.",
"Onwards to the next challenge!",
"Better luck next time for me!"
],
"draw": [
"A very balanced game, wouldn't you agree?",
"We both held our ground!",
"A truly equal contest!",
"A spirited draw, a good outcome.",
"Neither of us would yield!",
"That was an exciting fight!",
"A respectful draw, well played.",
"We kept the tension high!"
]
},
"Hou Yifan": {
"hi": [
"Let us begin with calm minds.",
"I look forward to our exchange.",
"May we both find clarity here.",
"A moment for thoughtful play.",
"The board is set.",
"Let understanding guide us.",
"Respect for the game, always.",
"A quiet beginning is often best."
],
"check": [
"An interesting development.",
"Consider this position.",
"A gentle nudge.",
"The king must move.",
"A moment of focus.",
"Opportunity arises.",
"See this possibility?",
"The game continues.",
"Watch your king.",
"A small step forward."
],
"take": [
"A piece is removed.",
"The board is changing.",
"A tactical adjustment.",
"Material is exchanged.",
"An opportunity taken.",
"The structure shifts.",
"A decision made.",
"The balance alters.",
"We learn from these exchanges."
],
"win": [
"A game well played, by both.",
"Victory is a matter of perspective.",
"We reached a clear conclusion.",
"Thank you for the thoughtful contest.",
"Understanding deepened today.",
"The path to this was interesting.",
"A valuable lesson learned.",
"May you find strength.",
"Until our next thoughtful encounter."
],
"lose": [
"The game has its own wisdom.",
"This outcome offers much to consider.",
"The board showed me something new.",
"Patience will bring rewards.",
"An important lesson received.",
"There is always more to understand.",
"We will meet again.",
"The game is a continuous journey."
],
"draw": [
"Perhaps a mutual understanding was reached.",
"The positions were well defended.",
"A fair result for this game.",
"We explored many possibilities.",
"A game of thoughtful defense.",
"Respect for the complexity.",
"We can learn from this.",
"Until the next careful consideration."
]
},
"Hikaru Nakamura": {
"hi": [
"Yo, ready to rumble, chat?",
"Alright, let's get this bread.",
"Hope you brought your A-game, bro.",
"Let's see what you got.",
"Time to get cooking, yeah?",
"This is gonna be fun, right?",
"Game on, my dude.",
"You think you're ready for this?",
"Strap in, it's gonna be wild.",
"Let's goooo!"
],
"check": [
"Oh, that's a little spicy!",
"Uh oh, somebody's in trouble.",
"You see that coming, bro?",
"Just a little nudge, you know?",
"Getting a bit cozy over there.",
"That was a friendly warning, chat.",
"Making you think, that's the goal.",
"Surprise! Didn't see that, did ya?",
"Just warming up the pieces, that's all."
],
"take": [
"Ooh, freebie! Thanks a bunch.",
"That was kinda sloppy, my friend.",
"Gonna take that, no cap.",
"That was an easy pick-up.",
"Appreciate the donation, bro.",
"Little snack time, if you know what I mean.",
"Didn't even break a sweat for that.",
"Yoink! Mine now."
],
"win": [
"GG, that was a good one!",
"And that's how it's done, chat.",
"Too fast, too good, sorry bro.",
"Well played, but I'm just better.",
"Easy peasy, lemon squeezy.",
"Swindled and schooled, my dude.",
"That was a whole vibe, right?",
"We out! That was clutch."
],
"lose": [
"Ouch. That one stung a bit.",
"Guess I wasn't online enough, huh?",
"My bad, chat. Gotta shake that off.",
"That was a tough one, for sure.",
"Time scramble got me good, bro.",
"Back to the drawing board, I guess.",
"Didn't see that coming, yikes.",
"Okay, okay, you got me."
],
"draw": [
"Fair enough, that was a battle.",
"Wild game, bro. Close one!",
"Respect the grind, chat. Solid.",
"That was a real nail-biter.",
"Good fight, my friend.",
"A true test of skill, that.",
"A draw is a draw, you know?"
]
},
"Levy Rozman": {
"hi": [
"Let's have a blast with this game!",
"Alright, let's see what magic we can make!",
"So excited to play with you!",
"Hope you're as pumped as I am!",
"This is going to be epic!",
"New game, new adventure, woohoo!",
"Welcome to the battlefield, my friend!",
"Get ready for some serious chess vibes!",
"Let's get this chess party started!"
],
"check": [
"Oh wow, a little surprise for you!",
"Incoming! Look out!",
"That was a big move, right?",
"Uh oh, danger zone!",
"Now that's what I call pressure!",
"Heads up! Something's coming your way!",
"Feeling the heat yet?",
"Watch out for this one!",
"Just a friendly little poke!"
],
"take": [
"And poof! Gone!",
"That was a bold move!",
"Ooh, a nice little souvenir!",
"Gotta take what's given, you know?",
"Score! That was clean!",
"Did you see that? So satisfying!",
"Piece off the board, just like that!",
"That one was begging to be taken!",
"A little exchange happens!"
],
"win": [
"We did it! That was wild!",
"YES! What a game!",
"Unbelievable! We pulled it off!",
"That was absolutely insane!",
"Can you believe that ending?",
"We just crushed it!",
"Pure magic on the board!",
"That felt SO good!",
"The hype is real!",
"Victory is ours!"
],
"lose": [
"Well played, you earned that one.",
"That was a tough one to swallow.",
"Sometimes the chess gods aren't with you.",
"A valiant effort, but not today.",
"That ending was a bit rough.",
"Gotta regroup and try again!",
"Learned something valuable there.",
"A moment of quiet reflection.",
"That was a real nail-biter, sadly."
],
"draw": [
"We fought hard for that!",
"A truly balanced game, impressive!",
"That was a close one, wasn't it?",
"Neither of us could break through!",
"We can both be proud of that.",
"A true test of wills!",
"That's how you play a solid game.",
"A perfectly even match!"
]
},
"Eric Rosen": {
"hi": [
"Let's have a grand old time!",
"Hope you're feeling adventurous today!",
"Buckle up, it's going to be exciting!",
"May the best gambit win!",
"Fancy a little game of skill?",
"Hope your board is feeling fresh!",
"Time to shake things up a bit!",
"Ready for some delightful chaos?"
],
"check": [
"Oh, hello there, little surprise!",
"Peek-a-boo, how do you like that?",
"Is that a bit of trouble?",
"Making things a tad more interesting!",
"A gentle nudge your way!",
"Just keeping you on your toes!",
"Hope that wasn't too shocking!",
"Look at that, a visitor!"
],
"take": [
"Ooh, a souvenir for me!",
"And that's gone, poof!",
"Well, that was a tasty one!",
"Little treat for the collection!",
"Thank you kindly for that!",
"One less obstacle, yay!",
"Snagged that right up!",
"Such a generous gift!"
],
"win": [
"Wow, that was a blast!",
"What a thrilling ride that was!",
"We played a good one!",
"That was delightfully unexpected!",
"So much fun, a real adventure!",
"Hooray for happy endings!",
"Glad we had that exciting game!",
"A truly memorable encounter!",
"Phew, what a finish!",
"That was just fantastic!"
],
"lose": [
"Well, that was a valiant effort!",
"A good learning experience, that's for sure!",
"Sometimes the dice just roll that way!",
"You played a very smart game!",
"Can't win them all, right?",
"That was quite the challenge!",
"A respectable finish, even so!",
"Bravo on your victory!",
"Enjoyed the spirited play!",
"Off to ponder that one!"
],
"draw": [
"A perfectly balanced outcome!",
"An exciting standoff, wasn't it?",
"A delightful little dance!",
"That was a fun tussle!",
"A classic battle of wits!",
"Happy we could find harmony!",
"A wonderfully even game!"
]
},
"Anna Cramling": {
"hi": [
"Ooh, a new game! Let's do this!",
"Hi! So excited to play with you!",
"Hey! Hope you're ready for some awesome moves!",
"Hello! This is going to be epic!",
"Hi hi! So glad you're here!",
"Fancy meeting you here! Let's play!",
"Hello! Get ready for some exciting chess!",
"Hi there! Let the games begin!"
],
"check": [
"Whoa, look at that! Bam!",
"Aha! You're in a bit of trouble now!",
"Uh oh, getting a little close, huh?",
"Hehe, did you see that coming?",
"Watch out! That's a big one!",
"Ooh, that's a nice move, but...",
"Haha, put you on the spot!",
"Incoming! Better watch your king!",
"Surprise! Hope you like it!"
],
"take": [
"Ooh, a freebie! Thanks a lot!",
"Yummy! Gotcha!",
"Score! That was a good one!",
"Heehee, took that right off the board!",
"What a nice little present!",
"Yes! Exactly what I wanted!",
"Gone! Just like that!",
"Oh, was that important? Oops!",
"Nabbed it! So satisfying!",
"Gotcha! Beautifully done!"
],
"win": [
"YES! We did it! Amazing!",
"Woohoo! That was so much fun!",
"Incredible! What a game!",
"We won! You played so well!",
"Victory! So happy right now!",
"Fantastic! That was absolutely brilliant!",
"We totally crushed it! Yay!",
"What an awesome win! So exciting!",
"YES! That was a masterpiece!",
"So proud of that win!"
],
"lose": [
"Aw man, that was tough!",
"That was a very close one!",
"So close! Almost had it!",
"Darn! That was a good fight!",
"You were amazing! I learned a lot!",
"You really earned that one!",
"That was a fantastic effort!"
],
"draw": [
"Huh, a draw! That's fair!",
"Well, that was a solid game!",
"A tie! It was a good battle!",
"Interesting finish! Very balanced!",
"A draw! That was a good struggle!",
"This one was truly even!",
"A draw is a good result!",
"Happy with that outcome!"
]
},
"Alexandra Botez": {
"hi": [
"Okay, let's do this!",
"Hope you're ready for some fun!",
"Game on, my friend!",
"Ooh, a new challenger appears!",
"Let's see what magic we can cook up.",
"Alright, let the brain cells commence firing!",
"Prepare for… well, me!",
"This is going to be epic, I can feel it!",
"Ready to throw down?",
"So excited to play!"
],
"check": [
"Uh oh, someone's in a bit of a pickle!",
"Peek-a-boo! I see you!",
"Just a little nudge, don't mind me.",
"That was a surprise, right?",
"Hope you brought your superhero cape!",
"Is this what they call a 'moment'?",
"Thinking about your next move now?",
"Just a friendly reminder I'm here!",
"Did I startle you?"
],
"take": [
"Well, that's one less thing for me to worry about!",
"Aha! Gotcha!",
"My collection just got a little bigger.",
"That was… unexpected, but hey!",
"Farewell, little friend!",
"It was nice knowing you.",
"Mmm, tasty snack!",
"One step closer to victory!",
"My strategy is… impeccable, obviously."
],
"win": [
"Woohoo! We did it!",
"That was absolutely wild!",
"My heart is pounding!",
"I can't believe that just happened!",
"Victory is SWEET!",
"That was a rollercoaster!",
"My brain officially needs a nap now.",
"So much fun, even if I say so myself!",
"Yes! Nailed it!",
"What a game, truly!"
],
"lose": [
"Oh wow, well played!",
"My brain just went on vacation.",
"I swear I had a plan for that.",
"You really got me there!",
"That's the way the cookie crumbles.",
"Time for a deep breath and a rethink.",
"Okay, that was a bit embarrassing!",
"Until next time, my friend!",
"That was tough but fun!"
],
"draw": [
"A draw! How dramatic!",
"Well, that's a surprise ending!",
"We both fought hard!",
"Can't believe we ended up here.",
"That was a true test of wills.",
"So close, yet so… even!",
"A perfectly balanced game!",
"I guess neither of us wanted to budge.",
"That was an adventure!",
"A tie! Who knew?"
]
},
"Andrea Botez": {
"hi": [
"Hope you're up for a chill game!",
"Let's play some chess, shall we?",
"Ready to have a good time?",
"Glad to see you're here!",
"Hope your day is going well.",
"Alright, let's get this started.",
"Feeling lucky today?",
"This should be interesting!",
"Hope you brought your A-game!",
"Hope you're having a great day!",
"This should be a chill game.",
"Fancy a little brain workout?",
"Ready when you are, no rush.",
"Let's see what happens, shall we?",
"Always happy to play a new face.",
"Hope your connection is good!",
"Time to have some fun, opponent!"
],
"check": [
"Thought I'd say hi.",
"Pay attention now!",
"Hope that wasn't too surprising.",
"Just keeping things lively.",
"Hope you're not too bothered.",
"Fancy seeing you here!",
"Oops, did I just do that?",
"Look out, something's coming your way!",
"Heads up, friend!",
"Uh oh, is that a problem?",
"Playing nice... mostly.",
"Consider yourself alerted!",
"Hope you saw that coming!",
"A friendly reminder to move!"
],
"take": [
"Oops, that was mine now.",
"Freebie!",
"Well, that simplifies things.",
"My bad, I guess?",
"Ooh, freebie!",
"And that one's mine now!",
"Well, that just happened.",
"My bad, I'll take that.",
"Just tidying up the board.",
"Hope that didn't hurt too much.",
"Gotta keep the collection growing!"
],
"win": [
"Whew, that was fun!",
"Well played, that was a good one.",
"Thanks for the game, had a blast!",
"Always a pleasure playing with you.",
"I got lucky there, I think.",
"That was a nice challenge!",
"Hope you enjoyed that too.",
"So much fun! Until next time.",
"Well played, that was super fun!",
"We did it! Victory dance time!",
"Can't believe that worked!",
"Phew, that was close, but we got it!",
"So much fun playing with you!",
"That was a good one!",
"Glad we got to play!",
"Hooray! What a game!",
"Another one for the books!"
],
"lose": [
"My bad, I totally missed that.",
"Back to the drawing board for me.",
"That was a good game, though!",
"Guess I wasn't feeling it today.",
"Oops, where did that go wrong?",
"You played a great game!",
"Time to rethink my strategy.",
"Ah, well, that happens!",
"My blunders, always keeping me humble.",
"Sometimes you just gotta laugh it off.",
"No worries, was fun anyway!",
"You got me! Well played!",
"Back to the drawing board!",
"That was a good challenge, thanks!"
],
"draw": [
"A fair fight, I'd say.",
"Looks like we're all tied up.",
"A draw is pretty cool too.",
"Solid game, right down to the end.",
"Always interesting when it's even.",
"Nice to see a balanced game!",
"Well, that's a fair result!",
"A tie! Can't argue with that.",
"A peaceful conclusion for us.",
"It was a good fight!",
"Glad we could agree on this.",
"Interesting outcome, wasn't it?",
"That was a balanced game.",
"Fun match, even with the draw!"
]
},
"Agadmator": {
"hi": [
"Hello there, my friend!",
"A pleasure to begin this journey.",
"Welcome to our little chess theatre.",
"Let us explore the possibilities, shall we?",
"The board awaits our story.",
"Ready to dive into this beautiful game?",
"It's a joy to share this space.",
"May our moves be thoughtful, my friend.",
"Greetings to you, esteemed opponent.",
"I look forward to our game."
],
"check": [
"Oh, a little surprise for you!",
"Just a gentle nudge, my friend.",
"The king feels a touch of heat.",
"Behold, a developing situation!",
"The king must now consider its options.",
"A classic theme unfolds.",
"Quite an interesting turn of events.",
"The spotlight finds our royal friend.",
"A whisper of danger, perhaps?"
],
"take": [
"And just like that, a piece departs.",
"A little simplification of the board.",
"Such is the ebb and flow, my friend.",
"A sacrifice, perhaps? Or a simple exchange.",
"The balance shifts, ever so slightly.",
"A gentle removal from the scene.",
"The tapestry of the game changes.",
"A moment for reflection, I think.",
"The board breathes a little easier."
],
"win": [
"A truly fascinating game, my friend.",
"The story has reached its conclusion.",
"It was an honour to play.",
"A beautiful struggle we shared.",
"Sometimes the pieces align perfectly.",
"What a delightful contest!",
"Thank you for the wonderful game.",
"That was a truly memorable experience.",
"The final chapter is written.",
"A moment to appreciate the journey."
],
"lose": [
"Ah, the tides have turned, my friend.",
"A most instructive game indeed.",
"The opponent's brilliance shone through.",
"A humbling reminder of the game's depth.",
"A learning experience for us all.",
"A worthy victory for my friend.",
"The board has spoken its truth.",
"Perhaps another time, with better fortune."
],
"draw": [
"A mutual understanding on the board.",
"A balanced conclusion, my friend.",
"The game found its peace.",
"A testament to our careful play.",
"Neither side could quite prevail.",
"A very respectable outcome.",
"Thank you for the shared journey.",
"The story ends on an even note.",
"The board offers a moment of calm."
]
},
"Ben Finegold": {
"hi": [
"Alright, let's see what you've got.",
"Ready to have some fun, I hope.",
"Don't worry, I'm a patient teacher.",
"Let's try not to bore ourselves.",
"You brought your thinking cap, right?",
"This should be interesting, maybe.",
"Let's get this over with.",
"Show me your best effort, please.",
"Time to see if you learned anything.",
"Don't be scared, it's just a game."
],
"check": [
"Oh look, a little surprise.",
"Is that really the best you can do?",
"Don't pretend you didn't see that.",
"Pay attention, please.",
"You might want to move that.",
"Tick-tock, your clock is running.",
"Did you think that was a good idea?",
"Well, that's one way to play.",
"Trying to spice things up, are we?"
],
"take": [
"That was... a move.",
"Hmm, you left that unattended.",
"Did you mean to do that?",
"Well, that simplifies things, I suppose.",
"A moment of weakness?",
"You know, that's usually not a good plan.",
"Someone's feeling generous today.",
"Was that intentional or an accident?",
"Such a bold strategic decision."
],
"win": [
"See? I told you so.",
"You played well. Almost.",
"Practice makes perfect, eventually.",
"Don't feel too bad about it.",
"A valuable lesson learned, I trust.",
"That was... educational.",
"You'll get 'em next time, champ.",
"Now go study your mistakes."
],
"lose": [
"Well, that was anticlimactic.",
"My apologies. Didn't mean to break you.",
"Sometimes you just have to accept it.",
"That was a bit embarrassing, wasn't it?",
"Don't worry, everyone has off days.",
"At least you put up a fight.",
"It happens to the best of us.",
"Consider this a learning opportunity.",
"You'll bounce back. Maybe.",
"Don't dwell on it too much."
],
"draw": [
"A fair result, I suppose.",
"We'll call it a truce.",
"Neither of us wanted to lose.",
"An acceptable outcome.",
"Perhaps we'll try again sometime.",
"Let's agree to disagree.",
"That was... uneventful.",
"We both played cautiously."
]
},
"Simon Williams": {
"hi": [
"Right then, let's have some fun!",
"Hello there! Ready for a rumble?",
"Fancy a bit of a dance, old chap?",
"Alright, my friend, let's get this party started!",
"Here we go! Prepare for some fireworks!",
"Hello! Let's see what magic we can conjure.",
"Good day! Time to make some moves, eh?",
"Welcome! Let's push some pawns, shall we?",
"Ah, hello! Ready to unleash the fury?"
],
"check": [
"Peek-a-boo! Gotcha!",
"Coming through! Watch out!",
"Right in the kisser!",
"That's a bit of a pickle, isn't it?",
"Hello, hello! Fancy seeing you here!",
"Here comes trouble, my friend!"
],
"take": [
"And that one's off to the races!",
"One less problem, wouldn't you say?",
"Nicely done! A little snack!",
"Gone in a flash!",
"Oh, that's a shame for you!",
"And down it goes!",
"Just clearing the path!",
"A very tasty acquisition!"
],
"win": [
"Boom! That's how we do it!",
"And the Ginger GM reigns supreme!",
"What a performance! Absolutely brilliant!",
"Smashing! Couldn't have planned it better myself!",
"That was a right good scrap!",
"Yes! Victory is ours!",
"Simply unstoppable today!",
"Pure attacking genius on display!",
"That, my friends, is how you attack!"
],
"lose": [
"Well, that was a good effort!",
"A valiant attempt, but not today.",
"Sometimes the dice just don't roll your way.",
"A learning experience, as always.",
"Can't win 'em all, can you?",
"A tough one, but still smiling!",
"The opponent played a blinder.",
"A bit of a humbling experience.",
"Back to the drawing board, then!",
"Well played, opponent. Well played indeed."
],
"draw": [
"A fair result for a tough battle.",
"A solid handshake, then?",
"A true contest of wills!",
"And so it ends, balanced and fair.",
"A respectful draw.",
"That was a nail-biter!",
"We'll have to do that again sometime!",
"A rather interesting outcome!"
]
},
"Eric Hansen": {
"hi": [
"Alright, dude, let's get this vibe going.",
"Hope you're ready for some chill chess.",
"Let's see what the universe has in store.",
"Ready to play some good ol' chess?",
"Hope your wifi is strong, my friend.",
"Let's have some fun, eh?",
"The board is set, the vibes are right.",
"Let's make some moves, dude.",
"This should be a good one.",
"Here we go, into the matrix."
],
"check": [
"Oh, hey there. Just a little poke.",
"Peek-a-boo, my dude.",
"Didn't see that coming, did ya?",
"Just making sure you're still there.",
"A friendly reminder, perhaps?",
"Little pressure, no big deal.",
"Just a heads-up, dude.",
"Consider this a gentle nudge.",
"Welcome to the danger zone.",
"Checking in, my friend."
],
"take": [
"Ooh, a little snack. Thanks, dude.",
"That was a bold move, I'll give you that.",
"Looks like that piece was yours.",
"Gotcha. Smooth sailing from here.",
"Appreciate the gift, my friend.",
"That's how we do it, eh?",
"A calculated grab, if you will."
],
"win": [
"Well played, dude. That was fun.",
"Lucky swindle, maybe? Haha.",
"The vibes aligned for me today.",
"A good game, truly.",
"GG, my friend. Until next time.",
"That was a wild ride.",
"Sometimes the universe just lets you have it.",
"Couldn't have asked for a better game.",
"A pleasant victory, if I do say so.",
"Hope you had a good time too."
],
"lose": [
"Ah, well. That's chess, right?",
"Didn't quite catch the vibe there.",
"My bad, dude. Totally tilted.",
"Sometimes you just run into a wall.",
"Lesson learned, I guess.",
"That one got away from me.",
"No worries, my friend.",
"A respectable effort, I think.",
"The board had other plans.",
"Back to the drawing board, eh?"
],
"draw": [
"The vibes were just… even.",
"A respectable draw, my friend.",
"A balanced outcome, as it should be.",
"We'll call it a draw.",
"The universe decided on equality.",
"A good fight, but no clear winner.",
"See you around, eh?"
]
},
"Aman Hambleton": {
"hi": [
"Hello! Let's have a great game!",
"Hi! So glad we're playing today.",
"Good to see you! Let's play!",
"Hey! Hope you're having a good day.",
"Hi! Looking forward to this match.",
"Hello! Let the games begin!",
"Hey! Excited to play some chess!",
"Welcome! Let's make some magic!"
],
"check": [
"Oh, hello there!",
"Just letting you know!",
"Look out!",
"Coming through!",
"Watch your back!",
"A friendly reminder!",
"Heads up!"
],
"take": [
"Ooh, a little snack!",
"Frees up some space!",
"Appreciate the offering!",
"Someone's getting lighter!",
"A good trade, perhaps?",
"That's mine now!"
],
"win": [
"Wow, what a game!",
"That was so much fun!",
"You played incredibly well!",
"A fantastic battle we had!",
"So happy with that result!",
"That was a thrilling conclusion!",
"What a wonderful game!",
"Learned a lot from that!",
"A truly memorable game!",
"That felt amazing!"
],
"lose": [
"You really outplayed me there!",
"A very strong game from you!",
"Sometimes the board just clicks!",
"That was a great lesson!",
"You earned that win!",
"My compliments, well done!",
"A very strong opponent today!",
"I'll get 'em next time!"
],
"draw": [
"A fair outcome, I think!",
"A very balanced game!",
"That was a solid draw!",
"Well fought on both sides!",
"A respectable result for us!",
"A fitting end to that!",
"Good game all around!",
"Can't argue with that!",
"An honorable draw!"
]
}
};
/*VOICES_GEN_END*/
function botLine(b, kind) {
  const V = VOICES[b.name], L = (V && V[kind] && V[kind].length ? V[kind] : (LINES[b.temper] || LINES.balanced)[kind]) || [], G = VOICES_GEN[b.name] && VOICES_GEN[b.name][kind];
  if (G && G.length && Math.random() < .75) return G[Math.floor(Math.random() * G.length)];        // mostly the model-written lines, now and then a hand-written one
  return L.length ? L[Math.floor(Math.random() * L.length)] : '';
}

// ---- legends and creators play like themselves (hand-set style vectors, signature opening lines)
const { LEGEND_STYLE, LEGEND_LINES } = (() => {
const E4 = 'e4 e5 Nf3 Nc6', LOPEZ = E4 + ' Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3', BERLIN = E4 + ' Bb5 Nf6 O-O Nxe4 d4 Nd6 Bxc6 dxc6 dxe5 Nf5 Qxd8+ Kxd8',
  NAJ = 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6', QGD = 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3', NIMZO = 'd4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5 Nf3 c5 O-O Nc6 a3 Bxc3 bxc3 dxc4 Bxc4 Qc7',
  KID = 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7', GRU = 'd4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4 Nxc3 bxc3 Bg7 Bc4 c5 Ne2 Nc6 Be3 O-O O-O Na5',
  ITAL = E4 + ' Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 a6', EVANS = E4 + ' Bc4 Bc5 b4 Bxb4 c3 Ba5 d4 exd4 O-O d6', FRIED = E4 + ' Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7 Kxf7 Qf3+ Ke6 Nc3 Nb4 Qe4 c6',
  CARO = 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 h5 Bh7 Bd3 Bxd3 Qxd3 e6', CATALAN = 'd4 Nf6 c4 e6 g3 d5 Bg2 Be7 Nf3 O-O O-O dxc4 Qc2 a6', RETI = 'Nf3 d5 g3 Nf6 Bg2 e6 O-O Be7 d3 O-O Nbd2 c5 e4 Nc6 Re1',
  LONDON = 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 O-O Nbd2 c5 c3 Nc6 Bd3', SEMI = 'd4 d5 c4 c6 Nf3 Nf6 Nc3 e6 e3 Nbd7 Bd3 dxc4 Bxc4 b5 Bd3', STAFF = 'e4 e5 Nf3 Nf6 Nxe5 Nc6 Nxc6 dxc6 d3 Bc5 Be3 Bxe3 fxe3 Ng4',
  BONG = 'e4 e5 Ke2 Ke7', DUTCH = 'd4 f5 g3 Nf6 Bg2 e6 Nf3 d5 O-O c6 c4 Bd6 Nc3 O-O', OPERA = 'e4 e5 Nf3 d6 d4 Bg4 dxe5 Bxf3 Qxf3 dxe5 Bc4 Nf6 Qb3 Qe7 Nc3 c6 Bg5 b5 Nxb5 cxb5 Bxb5+ Nbd7 O-O-O Rd8 Rxd7 Rxd7 Rd1 Qe6 Bxd7+ Nxd7 Qb8+ Nxb8 Rd8#';
const S = (s) => s.split(' ');
const LEGEND_STYLE = {
  'Paul Morphy': [.8, -.2, .2, -.5, .6, .4, .9, -.6], 'Wilhelm Steinitz': [.1, .2, -.1, .9, -.3, .1, .4, .3], 'Emanuel Lasker': [.3, .1, 0, .2, .5, .2, .5, .2],
  'José Raúl Capablanca': [-.1, .8, -.1, .6, -.6, .2, .5, .2], 'Alexander Alekhine': [.8, -.3, .3, -.3, .7, .7, .8, -.4], 'Mikhail Botvinnik': [.2, .3, .1, .5, -.2, .2, .6, 0],
  'Vasily Smyslov': [-.1, .4, -.2, .5, -.4, 0, .6, .2], 'Mikhail Tal': [1, -.5, .3, -.8, 1, .7, .7, -.8], 'Tigran Petrosian': [-.7, .4, -.4, 1, -.8, 0, .1, .9],
  'Boris Spassky': [.3, 0, .1, .1, .2, .2, .5, -.1], 'Bobby Fischer': [.5, .2, .2, .3, .1, .3, .7, -.2], 'Anatoly Karpov': [-.3, .5, -.3, .8, -.6, 0, .4, .5],
  'Garry Kasparov': [.9, -.2, .3, -.2, .5, .6, 1, -.5], 'Vladimir Kramnik': [-.3, .4, -.1, .8, -.5, .1, .5, .3], 'Viswanathan Anand': [.3, .1, .1, .1, .1, .3, .7, 0],
  'Magnus Carlsen': [-.1, .7, 0, .2, -.3, .4, .4, .1], 'Ding Liren': [-.4, .3, -.2, .8, -.5, 0, .3, .6], 'Fabiano Caruana': [.1, .2, 0, .4, -.2, .2, .6, 0],
  'Judit Polgar': [.9, -.2, .4, -.4, .7, .6, .7, -.5], 'Hou Yifan': [.1, .3, 0, .5, -.3, .1, .6, .1],
  'Hikaru Nakamura': [.5, -.1, .1, -.2, .5, .8, .8, -.2], 'Levy Rozman': [.5, 0, .2, -.1, .3, .5, .5, -.3], 'Eric Rosen': [.7, -.5, .5, -.6, 1, .3, .7, -.5], 'Anna Cramling': [.6, -.2, .3, -.2, .4, .4, .7, -.4],
  'Alexandra Botez': [.2, 0, .1, 0, .4, .3, .4, 0], 'Andrea Botez': [.1, .1, .1, 0, .1, 0, .2, .1], 'Agadmator': [.1, .1, 0, .2, 0, .1, .4, .1], 'Ben Finegold': [-.2, .8, -.2, .5, -.4, .1, .3, .2],
  'Simon Williams': [.9, -.3, .8, -.4, .7, .4, .7, -.6], 'Eric Hansen': [.2, .1, .2, -.1, .4, .5, .6, -.1], 'Aman Hambleton': [.3, 0, .2, 0, .3, .3, .5, -.1],
};
const LEGEND_LINES = {
  'Paul Morphy': { w: [OPERA, E4 + ' Bc4 Nf6 d4 exd4 O-O Nxe4 Re1 d5 Bxd5 Qxd5 Nc3'], b: [E4 + ' Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O'] },
  'Wilhelm Steinitz': { w: [ITAL, 'e4 e5 Nc3 Nc6 f4 exf4 Nf3 g5 h4 g4 Ng5 h6 Nxf7 Kxf7 d4 d6'], b: [E4 + ' Bb5 d6 d4 Bd7 Nc3 Nge7 Bxc6 Bxc6 Qd3 exd4 Nxd4 Bd7'] },
  'Emanuel Lasker': { w: [QGD + ' Nbd7 Rc1 c6 Bd3 dxc4 Bxc4 Nd5'], b: [BERLIN] },
  'José Raúl Capablanca': { w: [QGD + ' h6 Bh4 b6 Bd3 Bb7 O-O Nbd7', LOPEZ.replace(' h3', '')], b: [QGD.replace('d4 d5', 'd4 d5') + ' b6 Bd3 Bb7 cxd5 exd5 Qc2 Nbd7', LOPEZ.replace(' h3', '')] },
  'Alexander Alekhine': { w: [LOPEZ.replace(' h3', ''), 'e4 e5 Nf3 Nc6 Bb5 Nf6 d3 Bc5 c3 O-O O-O Re8 Re1 a6 Ba4 b5 Bb3 d6'], b: ['e4 Nf6 e5 Nd5 d4 d6 Nf3 Bg4 Be2 e6 O-O Be7 c4 Nb6 Nc3 O-O', 'd4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5'] },
  'Mikhail Botvinnik': { w: ['c4 e5 Nc3 Nf6 g3 d5 cxd5 Nxd5 Bg2 Nb6 Nf3 Nc6 O-O Be7 a3 O-O b4 f6'], b: ['d4 d5 c4 c6 Nf3 Nf6 Nc3 e6 Bg5 dxc4 e4 b5 e5 h6 Bh4 g5 Nxg5 hxg5 Bxg5 Nbd7', CARO] },
  'Vasily Smyslov': { w: [LOPEZ, 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 Na5 Bc2 c5 d4 Qc7'], b: [KID, 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Be2 O-O Nf3 e5 O-O Nc6 d5 Ne7 Ne1 Nd7'] },
  'Mikhail Tal': { w: ['e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Bg5 e6 f4 Qb6 Qd2 Qxb2 Rb1 Qa3 e5 dxe5 fxe5 Nfd7', FRIED, EVANS], b: ['e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nc6 Nc3 Qc7 Be3 a6 Be2 Nf6 O-O Bb4 Na4 O-O', GRU] },
  'Tigran Petrosian': { w: [RETI, 'Nf3 Nf6 g3 g6 Bg2 Bg7 O-O O-O d3 d6 Nbd2 Nc6 e4 e5 c3 a5'], b: [CARO, NIMZO] },
  'Boris Spassky': { w: [LOPEZ, 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O a6 Bb3 Ba7 Nbd2 O-O'], b: [LOPEZ + ' Nb8 d4 Nbd7', 'd4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5'] },
  'Bobby Fischer': { w: [LOPEZ.replace(' h3', '') + ' h3 Na5 Bc2 c5 d4 Qc7', NAJ + ' Bc4 e6 Bb3 Be7 O-O O-O Qe2 Nc6 Be3 Na5'], b: [NAJ + ' Bg5 e6 f4 Be7 Qf3 Qc7 O-O-O Nbd7 g4 b5', KID, GRU] },
  'Anatoly Karpov': { w: [LOPEZ + ' Nb8 d4 Nbd7 Nbd2 Bb7 Bc2 Re8 Nf1 Bf8 Ng3 g6', NIMZO.replace('Bd3', 'Bd3')], b: [LOPEZ + ' Nb8 d4 Nbd7 Nbd2 Bb7 Bc2 Re8 Nf1 Bf8 Ng3 g6', NIMZO] },
  'Garry Kasparov': { w: [NAJ + ' Be3 e5 Nb3 Be6 f3 Be7 Qd2 O-O O-O-O Nbd7 g4 b5 g5 b4 Ne2 Ne8', NAJ + ' Bg5 e6 f4 Be7 Qf3 Qc7 O-O-O Nbd7 g4 b5 Bxf6 Nxf6 g5 Nd7'], b: [NAJ + ' Be3 e5 Nb3 Be6 f3 Be7 Qd2 O-O O-O-O Nbd7 g4 b5', GRU, KID] },
  'Vladimir Kramnik': { w: [QGD + ' h6 Bh4 b6 Bd3 Bb7 O-O Nbd7 Qe2 c5', CATALAN], b: [BERLIN, QGD + ' h6 Bh4 b6 Bd3 Bb7 O-O Nbd7 Qe2 c5'] },
  'Viswanathan Anand': { w: [LOPEZ.replace(' h3', '') + ' h3 Na5 Bc2 c5 d4 Qc7 Nbd2 cxd4 cxd4 Nc6', ITAL], b: [LOPEZ.replace(' h3', '') + ' h3 Nb8 d4 Nbd7', NAJ + ' Be3 e5 Nb3 Be6 f3 Be7 Qd2 O-O O-O-O Nbd7'] },
  'Magnus Carlsen': { w: [E4 + ' Bb5 Nf6 d3 Bc5 c3 O-O O-O Re8 Re1 a6 Ba4 b5 Bb3 d6', RETI, 'd4 Nf6 Nf3 e6 c4 b6 g3 Bb7 Bg2 Be7 O-O O-O Nc3 Ne4'], b: [E4 + ' Bb5 Nf6 d3 Bc5 c3 O-O O-O Re8 Re1 a6', CATALAN, 'e4 c5 Nf3 e6 d4 cxd4 Nxd4 a6 Bd3 Nc6 Nxc6 bxc6 O-O d5'] },
  'Ding Liren': { w: ['Nf3 Nf6 c4 e6 g3 d5 b3 Be7 Bg2 O-O O-O c5 e3 Nc6 Bb2 b6', RETI], b: [BERLIN, QGD + ' Nbd7 Rc1 c6 Bd3 dxc4 Bxc4 Nd5'] },
  'Fabiano Caruana': { w: [BERLIN + ' h3 Ke8 Nc3 h5', ITAL, E4 + ' Bb5 Nf6 O-O Nxe4 Re1 Nd6 Nxe5 Be7 Bf1 Nxe5 Rxe5 O-O d4 Bf6 Re1 Re8'], b: [E4 + ' Bb5 Nf6 O-O Nxe4 Re1 Nd6 Nxe5 Be7 Bf1 Nxe5 Rxe5 O-O d4 Bf6 Re1 Re8', 'd4 Nf6 c4 e6 Nf3 d5 Nc3 Be7 Bf4 O-O e3 c5 dxc5 Bxc5'] },
  'Judit Polgar': { w: [LOPEZ.replace(' h3', '') + ' d4 Bg4 Be3 exd4 cxd4 Na5', NAJ + ' Bg5 e6 f4 Be7 Qf3 Qc7 O-O-O Nbd7 g4 b5'], b: [BERLIN, NAJ + ' Bg5 e6 f4 Be7 Qf3 Qc7 O-O-O Nbd7'] },
  'Hou Yifan': { w: ['d4 Nf6 c4 e6 Nc3 Bb4 Qc2 O-O a3 Bxc3+ Qxc3 b6 Bg5 Bb7 e3 d6', QGD], b: [BERLIN, SEMI + ' a6 e4 c5 e5 cxd4 Nxb5 axb5 exf6 gxf6'] },
  'Hikaru Nakamura': { w: [E4 + ' Bc4 Nf6 d4 exd4 O-O Nxe4 Re1 d5 Bxd5 Qxd5 Nc3 Qa5', BONG, 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2 e5 Nb3 Be7 O-O O-O'], b: [NAJ + ' Be3 e5 Nb3 Be6 f3 Be7 Qd2 O-O O-O-O Nbd7 g4 b5', BONG, E4 + ' Bc4 Nf6 d3 Bc5 c3 d5'] },
  'Levy Rozman': { w: [EVANS, LONDON, 'e4 e5 Nf3 Nc6 Bc4 Nf6 d4 exd4 O-O Nxe4 Re1 d5 Bxd5 Qxd5 Nc3 Qa5 Nxe4 Be6'], b: [ITAL.replace('d3 d6', 'd3 d6'), 'd4 d5 Bf4 Nf6 e3 c5 c3 Nc6 Nd2 e6 Ngf3 Bd6'] },
  'Eric Rosen': { w: [FRIED, 'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6 dxc6 bxc6 Be2 h6 Nf3 e4 Ne5 Bd6 d4 exd3'], b: [STAFF, 'e4 e5 Nf3 Nf6 Nxe5 Nc6 Nxc6 dxc6 d3 Bc5 Bg5 Qd4 Nc3'] },
  'Anna Cramling': { w: [E4 + ' Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Nc3 Nxe4 O-O Bxc3 d5'], b: [E4 + ' Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6 dxc6 bxc6 Be2 h6', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 O-O'] },
  'Alexandra Botez': { w: [FRIED, ITAL], b: [E4 + ' Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7', 'd4 d5 Bf4 Nf6 e3 Nc6'] },
  'Andrea Botez': { w: [E4 + ' Bc4 Bc5 d3 Nf6 O-O d6 c3 O-O'], b: [E4 + ' Bc4 Bc5 d3 Nf6 O-O d6 c3 O-O', 'd4 d5 Bf4 Nf6 e3 e6'] },
  'Agadmator': { w: [E4 + ' Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Nc3 Nxe4 O-O Bxc3 d5 Bf6 Re1 Ne7', EVANS], b: [EVANS, E4 + ' Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Nc3 Nxe4 O-O Bxc3 d5'] },
  'Ben Finegold': { w: [SEMI + ' a6', LOPEZ.replace(' h3', '')], b: [SEMI, LOPEZ.replace(' h3', '')] },
  'Simon Williams': { w: ['b4 e5 Bb2 Bxb4 Bxe5 Nf6 Nf3 O-O e3 Re8', 'f4 d5 Nf3 Nf6 e3 g6 b3 Bg7 Bb2 O-O Be2 c5 O-O Nc6', 'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7 Kxf7 Qf3+ Ke6 Nc3 Nb4'], b: [DUTCH, 'd4 f5 g3 Nf6 Bg2 g6 Nf3 Bg7 O-O O-O c4 d6', E4 + ' Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7'] },
  'Eric Hansen': { w: [E4 + ' Bc4 Nf6 d4 exd4 O-O Nxe4 Re1 d5 Bxd5 Qxd5 Nc3 Qa5', E4 + ' d4 exd4 Nxd4 Bc5 Be3 Qf6 c3 Nge7 Bc4 Ne5'], b: [E4 + ' d4 exd4 Nxd4 Bc5 Be3 Qf6 c3 Nge7 Bc4 Ne5 Bb3', 'd4 d5 Nf3 Nf6 c4 e6 Nc3 Be7'] },
  'Aman Hambleton': { w: [LOPEZ.replace(' h3', ''), ITAL], b: ['e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 Nf3 Nc6 cxd4 d6 Bc4 Nb6 Bb3 dxe5 Nxe5 Nxe5 dxe5 Qxd1+', DUTCH] },
};
for (const k of Object.keys(LEGEND_LINES)) for (const s of ['w', 'b']) LEGEND_LINES[k][s] = LEGEND_LINES[k][s].map(S);
return { LEGEND_STYLE, LEGEND_LINES };
})();
// ---- personalities: each bot plays with a style vector the Mind was trained on (train/personas.py), not just a re-ranking on top
const PERSONA_ARCH = {
  aggressive: [1, 0, 0, -.4, .5, .3, .5, -.6], solid: [-.4, .2, 0, 1, -.7, 0, 0, .5], tricky: [.3, -.3, 0, 0, .6, .4, .6, 0], gambiteer: [.7, -.6, .5, -.6, 1, 0, 0, 0],
  trader: [-.2, 1, 0, .3, -.4, .3, 0, 0], pusher: [.5, 0, 1, 0, .2, 0, 0, -.4], positional: [0, .2, -.2, .5, -.3, 0, .8, 0], balanced: [0, 0, 0, 0, 0, 0, 0, 0],
};
function legendMove(bot, hist) {          // the next move of one of this player's signature lines, while the game stays in them
  const L = LEGEND_LINES[bot.name]; if (!L) return null;
  try {
    const g = new Chess(), sans = [];
    for (const u of hist) { const m = g.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] || undefined }); if (!m) return null; sans.push(m.san); }
    const cand = L[hist.length % 2 ? 'b' : 'w'].filter((l) => l.length > sans.length && sans.every((s, i) => l[i] === s)).map((l) => l[sans.length]);
    if (!cand.length) return null;
    const m = g.move(cand[Math.floor(Math.random() * cand.length)]); return m ? m.from + m.to + (m.promotion || '') : null;
  } catch (e) { return null; }
}
function botPersona(bot) {          // "a,b,c,d,e,f,g,h" for the engine option PersonaStyle; the same bot always gets the same personality
  if (!bot) return '0,0,0,0,0,0,0,0';
  if (bot._pv) return bot._pv;
  if (LEGEND_STYLE[bot.name]) return (bot._pv = LEGEND_STYLE[bot.name].map((x) => x.toFixed(2)).join(','));      // a real player: their own style, not an archetype with noise
  const r = mulberry32((bot.seed != null ? bot.seed : bot.id * 7919) + 777), arch = PERSONA_ARCH[bot.temper] || PERSONA_ARCH.balanced, k = .6 + r() * .65;
  const gauss = () => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());
  bot._pv = arch.map((x) => Math.max(-1, Math.min(1, x * k + gauss() * .3)).toFixed(2)).join(',');
  return bot._pv;
}
