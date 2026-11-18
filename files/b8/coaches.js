/* Sibyl coaches: the legends and creators explain WHY, in their own manner.
   The reasons are found by the app (coachFacts, checked with chess.js and the engine's best line, never made up); each coach only chooses the words around them.
   Friendly tributes in their public style: not quotes, not affiliated with or endorsed by the people. {m} = the move you played. */
(function () {
  'use strict';
  // ------------------------------------------------------------ voice kits: blunder, mistake (also inaccuracy), miss, good, best, brilliant, close (after the lesson)
  const K = {
    // ---- legends
    'Paul Morphy': { blunder: ['Oh dear. {m} throws the game away.', 'My friend, that is a grave error.', 'Alas, {m} loses ground at once.'], mistake: ['{m} is not worthy of you.', 'A slip, my friend.', 'Not quite, my friend.'], miss: ['A fine chance missed.', 'You had a brilliant chance.'], good: ['{m}: a gentleman\'s move.', 'Good. Development first.'], best: ['Splendid, {m} is the very move.', 'Just so. Quick development wins.'], brilliant: ['Magnificent! A sacrifice worthy of an attack.'], close: ['Develop quickly, open the lines, attack the king.', 'Pieces out, my friend, then the attack.', 'Never let the king stay at home too long.'] },
    'Wilhelm Steinitz': { blunder: ['That weakens everything. {m} is a serious error.', 'A heavy concession.'], mistake: ['{m} gives away a small advantage.', 'That is a weakening, you see.'], miss: ['You overlooked a clear advantage.', 'A weakness was there to exploit.'], good: ['Sound. {m} accumulates a small advantage.', 'Correct, and solid.'], best: ['Quite right: {m}.', 'Exactly. The position demands it.'], brilliant: ['A sacrifice, justified by the position.'], close: ['Gather small advantages, then attack.', 'The king is a strong piece, but keep it safe.', 'Do not attack before the position permits it.'] },
    'Emanuel Lasker': { blunder: ['That is a bad mistake. Chess is a struggle.', '{m} loses material. Fight on!'], mistake: ['A practical error.', 'That costs you something real.'], miss: ['A chance for a better struggle.', 'You missed a strong idea.'], good: ['Practical. {m} makes it hard for the opponent.', 'Good.'], best: ['Yes, {m}. The best practical choice.', 'Exactly the move.'], brilliant: ['A bold and effective idea!'], close: ['Chess is a fight: always find the move that troubles the opponent.', 'Play the opponent as well as the board.', 'Keep your pieces active and your head cool.'] },
    'José Raúl Capablanca': { blunder: ['That is far too complicated, and it loses.', '{m} was simply a mistake.'], mistake: ['Too elaborate. Keep it simple.', '{m} makes things harder than they need to be.'], miss: ['The simple move was there.', 'A simpler path was available.'], good: ['Simple and clear. {m}.', 'Good, nothing forced.'], best: ['Effortless: {m}.', 'The simple move, and the best.'], brilliant: ['Surprisingly beautiful, and also simple!'], close: ['Simplify when ahead; trade the pieces that guard the enemy.', 'Keep it simple and the endgame will help you.', 'Look for the clear, natural move first.'] },
    'Alexander Alekhine': { blunder: ['That is a disaster, my friend.', '{m} gives the initiative away entirely.'], mistake: ['Too passive. {m} loses time.', 'A mistake, and a costly one.'], miss: ['A combination was waiting for you!', 'You missed the combination.'], good: ['Good, {m} keeps the pressure.', 'Not bad. Keep the attack alive.'], best: ['Yes! {m}. Attack!', 'Precisely the move.'], brilliant: ['A beautiful combination!'], close: ['Seek the combination; keep the initiative.', 'Passive play loses games.', 'Attack where the king is weakest.'] },
    'Mikhail Botvinnik': { blunder: ['That is a failure of analysis.', '{m} is a serious error. Check your calculation.'], mistake: ['Insufficient analysis.', '{m} does not stand up to scrutiny.'], miss: ['A matter of calculation: you missed it.', 'There was a stronger plan.'], good: ['Correct. {m} follows the plan.', 'Good, methodical.'], best: ['Exactly: {m}. The analysis is clear.', 'Correct and well prepared.'], brilliant: ['Deep and correct preparation!'], close: ['Analyse carefully; discipline wins.', 'Make a plan and follow it.', 'Check every forcing move before you decide.'] },
    'Vasily Smyslov': { blunder: ['That disturbs the harmony, and loses.', '{m} is a clear mistake.'], mistake: ['Not harmonious. {m} misplaces a piece.', 'A small disharmony, but it costs.'], miss: ['A harmonious move was available.', 'You missed a beautiful idea.'], good: ['Harmonious. {m}.', 'Good, the pieces work together.'], best: ['Lovely: {m}. Everything in harmony.', 'Exactly right.'], brilliant: ['Harmony and surprise together!'], close: ['Let the pieces work together.', 'Find the natural square for each piece.', 'Harmony first, tactics will follow.'] },
    'Mikhail Tal': { blunder: ['Oh no. And not even beautiful. {m} loses.', 'A sacrifice needs a reason. {m} had none.'], mistake: ['Too timid, my friend.', '{m} is not sound, and not exciting either.'], miss: ['You missed a sacrifice!', 'There was magic here, and you missed it.'], good: ['Playable. But where is the poetry?', 'Good. Now complicate!'], best: ['Yes! {m}. Magic!', 'Delicious. That is the move.'], brilliant: ['A sacrifice! Now the board is on fire!'], close: ['If in doubt, complicate: the opponent will go wrong first.', 'Dare to sacrifice when the king is exposed.', 'Chess is also art. Look for the beautiful move.'] },
    'Tigran Petrosian': { blunder: ['That is unsafe, and it loses.', '{m} walks into danger.'], mistake: ['Not careful enough. {m} allows too much.', 'Prevent the problem first.'], miss: ['A safer, stronger move was there.', 'You missed a quiet strong move.'], good: ['Careful. {m} is safe.', 'Good: solid.'], best: ['Precisely, {m}. Safe and strong.', 'Exactly, the cautious best.'], brilliant: ['A rare sacrifice, and sound!'], close: ['First ask what your opponent wants, then prevent it.', 'Safety first; the attack will come.', 'A quiet move can be the strongest.'] },
    'Boris Spassky': { blunder: ['Oh. That is a blunder, my friend.', '{m} is simply a mistake.'], mistake: ['Slightly off. {m} is not best.', 'A small mistake, friend.'], miss: ['A better chance was there.', 'You missed something strong.'], good: ['Good, flexible. {m}.', 'Fine move.'], best: ['Yes, {m}. Well chosen.', 'The best, with calm.'], brilliant: ['Beautiful, and very sharp!'], close: ['Play flexibly: attack or defend as the position asks.', 'Stay calm and choose the best move.', 'Keep all your options open.'] },
    'Bobby Fischer': { blunder: ['{m} is a blunder. Plain and simple.', 'Wrong. {m} loses.'], mistake: ['Not the best. {m} is inexact.', 'Inaccurate. Be precise.'], miss: ['You missed the best move.', 'There was a clear win. Look harder.'], good: ['Acceptable. {m}.', 'Fine. But the best was stronger.'], best: ['Correct. {m}.', 'Best move. As it should be.'], brilliant: ['Perfect. Nothing to add.'], close: ['Be precise. The best move is usually the simplest strong one.', 'Calculate it to the end.', 'Always look for the move that works by force.'] },
    'Anatoly Karpov': { blunder: ['That loosens everything, and loses.', '{m} is a clear error.'], mistake: ['A small concession. {m} gives space.', 'Too loose.'], miss: ['A squeezing move was available.', 'You missed the strongest restraint.'], good: ['Good, {m} keeps control.', 'Solid.'], best: ['Exactly: {m}. The squeeze tightens.', 'Quietly the best.'], brilliant: ['A rare tactical blow, executed with care!'], close: ['Take away your opponent\'s squares, slowly.', 'Restrict first; the win comes later.', 'Small advantages add up.'] },
    'Garry Kasparov': { blunder: ['Unacceptable. {m} gives up the initiative.', 'That is a catastrophic mistake.'], mistake: ['Too passive. You lose the initiative.', '{m} lacks energy.'], miss: ['The initiative was yours. You missed it.', 'A dynamic strike was available!'], good: ['Good. Keep the initiative.', '{m} is active.'], best: ['Yes! {m}. Full energy!', 'The best, and the sharpest.'], brilliant: ['Magnificent! Dynamism!'], close: ['Seize the initiative and do not let it go.', 'Be active; passivity loses.', 'Prepare deeply, then strike.'] },
    'Vladimir Kramnik': { blunder: ['That is a serious technical error.', '{m} loses by force.'], mistake: ['Technically inexact. {m} is not it.', 'A small inaccuracy that matters.'], miss: ['A deeper idea was there.', 'You missed the deep move.'], good: ['Good. {m} is technical and clean.', 'Correct.'], best: ['Precisely: {m}. A deep choice.', 'Exactly the move.'], brilliant: ['Deep and surprising!'], close: ['Think about the structure, then choose.', 'Look for the deep, quiet resource.', 'Technique decides close positions.'] },
    'Viswanathan Anand': { blunder: ['Oh no, that is a blunder, I am afraid.', '{m} loses material, sorry.'], mistake: ['A small slip. {m} is not the best.', 'Slightly inaccurate, no worries.'], miss: ['You missed something nice there.', 'A stronger idea was available.'], good: ['Good, quick and natural. {m}.', 'Nice.'], best: ['Yes! {m}. Very nice.', 'Exactly. Good eye.'], brilliant: ['Wonderful! Lightning in the board.'], close: ['Trust your instincts, then verify.', 'Play fast, but check the tactics.', 'Stay relaxed; it helps the calculation.'] },
    'Magnus Carlsen': { blunder: ['Ouch. That was not a good move.', '{m} just loses. It happens.'], mistake: ['Slightly worse. {m} was not necessary.', 'Meh, that is a bit careless.'], miss: ['You missed something there. Chances, chances.', 'There was more in the position.'], good: ['Fine. {m} does the job.', 'Reasonable.'], best: ['Yeah, {m}. Obvious.', 'Best. Good job.'], brilliant: ['Not bad at all. Quite nice, actually.'], close: ['Just play good moves and wait for mistakes.', 'Keep the pieces safe and the position simple.', 'Small edges. Squeeze them.'] },
    'Fabiano Caruana': { blunder: ['That is an objective mistake, I am afraid.', '{m} loses material.'], mistake: ['A slight inaccuracy. {m} is not the most precise.', 'Not the most accurate.'], miss: ['There was a stronger move, accurate and clear.', 'You missed the most precise continuation.'], good: ['Accurate enough. {m}.', 'Good, objectively fine.'], best: ['Precise: {m}.', 'Yes, the most accurate move.'], brilliant: ['Very sharp and very accurate!'], close: ['Be precise and prepare thoroughly.', 'Accuracy beats ambition.', 'Check the concrete variations.'] },
    'Ding Liren': { blunder: ['Oh. This is a mistake, I think. {m} loses.', 'Sorry, {m} is too dangerous.'], mistake: ['A little inaccurate, I think.', '{m} is not so careful.'], miss: ['Maybe there was a better move here.', 'I think you missed a chance.'], good: ['Good. {m}, I think.', 'This is fine.'], best: ['Yes, {m}. I think this is the best.', 'Good move.'], brilliant: ['Very nice, very brave!'], close: ['Stay calm and calculate carefully.', 'Be humble with every move; check again.', 'Slow down when the position is sharp.'] },
    'Judit Polgar': { blunder: ['That is a tactical oversight. {m} loses.', 'Careful! {m} allows a strong reply.'], mistake: ['A small tactical slip. {m} is not best.', 'You can do better than {m}.'], miss: ['There was a tactic here. Look again!', 'You missed a tactical shot.'], good: ['Good, {m} keeps the pressure.', 'Nice, active.'], best: ['Yes! {m}. Well seen!', 'Exactly the move!'], brilliant: ['Wow! A real tactical blow!'], close: ['Look for tactics first; checks, captures, threats.', 'Attack the weak spots.', 'Be brave. You can do this.'] },
    'Hou Yifan': { blunder: ['That is a clear mistake. {m} loses material.', '{m} is too risky here.'], mistake: ['Not the most accurate. {m} gives something away.', 'A small error.'], miss: ['There was a stronger idea available.', 'You missed a good chance.'], good: ['Good. {m} is sensible.', 'Fine.'], best: ['Yes, {m}. Clear and strong.', 'That is the move.'], brilliant: ['Excellent and sharp!'], close: ['Think about both the position and the tactics.', 'Stay composed and keep improving.', 'Every move should have a clear purpose.'] },
    // ---- creators
    'Levy Rozman': { blunder: ['Oh NO. {m}? Chat, that is a blunder.', 'WOW. {m} is a blunder, my friend.'], mistake: ['Hmm, {m}. That is a mistake.', 'Oof, not the best, chat.'], miss: ['You MISSED it, chat!', 'Oh, there was something big there!'], good: ['{m}, okay, not bad!', 'Good. I like it.'], best: ['YES. {m}. Best move, chat!', 'Beautiful. That is the one.'], brilliant: ['WHAT?! A brilliant move!'], close: ['Check your checks, captures and threats. Every time.', 'Look at what they threaten before you move.', 'Do not hang pieces, chat. That is the number one rule.'] },
    'Hikaru Nakamura': { blunder: ['Bro. {m}? That is a blunder.', 'Chat, he just blundered.'], mistake: ['Not great, bro. {m} is a mistake.', 'Yeah, that is a mistake.'], miss: ['Bro, you missed it. It was right there.', 'Chat, he missed the best move.'], good: ['{m}. Fine, it works.', 'Okay, decent.'], best: ['{m}. Best. Obviously.', 'Yep, that is the move, bro.'], brilliant: ['Okay, that is actually sick.'], close: ['Premove less, calculate more, bro.', 'Always check what they can capture.', 'Time pressure is not an excuse, chat.'] },
    'Eric Rosen': { blunder: ['Oh no, friend. {m} loses material.', 'Uh oh. That is a blunder.'], mistake: ['Hmm, not quite, friend.', '{m} is a little inaccurate.'], miss: ['Ooh, you missed something cute!', 'There was a nice trick there, friend.'], good: ['Nice, {m} is good!', 'Good move, friend.'], best: ['Yes! {m}. Love it!', 'The best move. Very cute.'], brilliant: ['Oh my! That is beautiful!'], close: ['Have fun, and keep looking for the cute tactic.', 'Open lines help the attack. Remember that.', 'Mistakes happen. We learn!'] },
    'Anna Cramling': { blunder: ['Oh no! {m} is a blunder!', 'Ouch! That loses material!'], mistake: ['Hmm, {m} is not the best.', 'A small mistake, but okay!'], miss: ['You missed something good!', 'Ooh, there was a better move!'], good: ['Nice! {m}!', 'Good move!'], best: ['Yes! {m}! Best move!', 'Perfect!'], brilliant: ['WOW! Amazing move!'], close: ['Keep playing with energy!', 'Look at all the threats before you move.', 'You are doing great, keep going!'] },
    'Alexandra Botez': { blunder: ['Oh no. {m} is a blunder. It happens to me all the time.', 'Chat... that is a blunder.'], mistake: ['Hmm, {m} is a bit of a mistake.', 'Ooh, not the best one.'], miss: ['You missed something! I would have missed it too.', 'There was a better move, sorry!'], good: ['Nice, {m} is good!', 'Good! I would have lost my queen there.'], best: ['Yes! {m}. Best move!', 'Wow, great move.'], brilliant: ['That is better than a Botez Gambit!'], close: ['Do not hang your queen. Trust me, I know.', 'Look at what they can take first.', 'We all blunder. We learn!'] },
    'Andrea Botez': { blunder: ['Oh no! {m} is a blunder!', 'Aww, that loses material.'], mistake: ['Hmm, that was not the best.', '{m} is a little mistake.'], miss: ['Oh! You missed a good move!', 'There was something better!'], good: ['Nice one, {m}!', 'Good move!'], best: ['Yay! {m} is the best!', 'Perfect move!'], brilliant: ['Wow, that is amazing!'], close: ['You can do it, just check for threats.', 'Take your time, it is okay.', 'Look at what could be captured.'] },
    'Agadmator': { blunder: ['My friends, {m} is a serious mistake.', 'And this, my friends, is a blunder.'], mistake: ['{m} is not the best, my friend.', 'A natural move, but not the best.'], miss: ['My friend, you missed a very nice move.', 'There was a beautiful move here.'], good: ['A very natural move, {m}.', 'Good, my friends.'], best: ['And {m}, my friends. The best move.', 'Exactly. A very nice move.'], brilliant: ['A beautiful move, my friends!'], close: ['Check what your opponent threatens, my friend.', 'A game of chess is a story. Play it well.', 'Take your time, my friends.'] },
    'Ben Finegold': { blunder: ['Children. {m} is a blunder.', 'A blunder, children. A blunder.'], mistake: ['{m}? Not good, children.', 'No. Not that one.'], miss: ['You missed a good move. Look at all the forcing moves.', 'There was a move, children. There was a move.'], good: ['Okay. {m}. Acceptable.', 'Fine, children.'], best: ['Correct, {m}. Gold star.', 'Yes. Even a broken clock...'], brilliant: ['Now THAT I did not expect, children.'], close: ['Check, capture, threat. Every move, children.', 'Do not hang pieces. It is not complicated.', 'Develop, castle, and think.'] },
    'Simon Williams': { blunder: ['Oh dear, {m} is a blunder, mate.', 'Right, that is a mistake, I am afraid.'], mistake: ['Hmm, {m} is not quite right, mate.', 'A bit passive, that.'], miss: ['You missed a lovely attack, mate!', 'There was a shot there!'], good: ['Lovely, {m}!', 'Good move, mate.'], best: ['Yes! {m}. Attack!', 'Brilliant. Spot on.'], brilliant: ['Stunning! That is the Ginger GM approved!'], close: ['Attack, attack, attack, but check the safety first.', 'Look for the shot, mate!', 'Keep the pieces active.'] },
    'Eric Hansen': { blunder: ['Dude. {m}? That is a blunder.', 'Oh no, dude. That hangs material.'], mistake: ['Hmm, {m} is not great, dude.', 'Eh, that is a mistake.'], miss: ['Dude, you missed it!', 'There was a better one, dude.'], good: ['{m}. Cool, dude.', 'Good, nice.'], best: ['Yes, {m}, dude. Best.', 'Clean.'], brilliant: ['Dude! That is sick!'], close: ['Chill, look at what they can take.', 'Do not hang stuff, dude.', 'Play fast, but check the tactics.'] },
    'Aman Hambleton': { blunder: ['Oh no, my friend, {m} is a blunder.', 'Ouch, that is a mistake!'], mistake: ['Hmm, not the best, my friend.', '{m} is a little off.'], miss: ['You missed a good one!', 'There was something better, my friend!'], good: ['Nice, {m}!', 'Good move, my friend.'], best: ['Yes! {m}! The best!', 'Perfect, my friend!'], brilliant: ['Amazing move, my friend!'], close: ['Stay positive and check the threats.', 'Keep going, you are improving!', 'Take your time with each move.'] },
  };
  const DEFAULT = { blunder: ['{m} is a blunder.'], mistake: ['{m} is a mistake.'], miss: ['You missed something strong.'], good: ['Good. {m}.'], best: ['Best move. {m}.'], brilliant: ['Brilliant!'], close: [] };

  // short descriptions of each coach's manner: used with the examples above when the server writes a comment
  const DESC = {
    'Paul Morphy': 'a courteous 19th-century gentleman, loves quick development and open attacks', 'Wilhelm Steinitz': 'a formal, stern theorist who believes in small advantages and sound structure',
    'Emanuel Lasker': 'a practical philosopher who sees chess as a struggle between people', 'José Raúl Capablanca': 'a calm, elegant master who values simplicity and clear technique',
    'Alexander Alekhine': 'an intense attacker who loves combinations and the initiative', 'Mikhail Botvinnik': 'a disciplined scientist who demands preparation and analysis',
    'Vasily Smyslov': 'a gentle artist who looks for harmony between the pieces', 'Mikhail Tal': 'a romantic attacking genius, brief and poetic, loves sacrifices and complications',
    'Tigran Petrosian': 'a cautious defender who values safety and preventing the opponent\'s plans', 'Boris Spassky': 'a calm, gentlemanly all-rounder with dry understatement',
    'Bobby Fischer': 'blunt, exacting and no-nonsense, values precision above all', 'Anatoly Karpov': 'a patient squeezer who restricts the opponent step by step',
    'Garry Kasparov': 'an intense, demanding competitor who talks about initiative and energy', 'Vladimir Kramnik': 'a deep, technical thinker, measured and exact',
    'Viswanathan Anand': 'a warm, humble, quick-thinking champion, friendly and relaxed', 'Magnus Carlsen': 'a relaxed, slightly cheeky champion who keeps it simple and practical',
    'Fabiano Caruana': 'a precise, polite, objective analyst', 'Ding Liren': 'a modest, careful, soft-spoken thinker', 'Judit Polgar': 'a warm, clear, encouraging tactician who is exact',
    'Hou Yifan': 'a composed, clear, matter-of-fact strategist', 'Levy Rozman': 'an energetic YouTuber with dramatic reactions and friendly teasing, says "chat"',
    'Hikaru Nakamura': 'a fast, confident streamer, casual, says "bro" and "chat"', 'Eric Rosen': 'a cheerful, friendly streamer who loves the Stafford Gambit and says "friend"',
    'Anna Cramling': 'an upbeat, energetic, encouraging streamer', 'Alexandra Botez': 'a cheerful, self-deprecating streamer who jokes about the Botez Gambit',
    'Andrea Botez': 'a sweet, upbeat, encouraging streamer', 'Agadmator': 'a calm, polite storyteller who says "my friends" and never rushes',
    'Ben Finegold': 'a dry, sarcastic teacher who calls students "children" and loves the basics', 'Simon Williams': 'an enthusiastic British attacker who says "mate" and loves attacking chess',
    'Eric Hansen': 'a laid-back streamer who says "dude"', 'Aman Hambleton': 'an upbeat, friendly streamer who says "my friend"',
  };
  // what the server needs to write a comment in this coach's voice: a description plus real lines of theirs for this kind of move
  window.coachStyle = function (name, cls) {
    const k = K[name] || DEFAULT, bucket = cls === 'blunder' ? 'blunder' : cls === 'miss' ? 'miss' : (cls === 'inacc' || cls === 'mistake') ? 'mistake' : cls === 'brilliant' ? 'brilliant' : (cls === 'best' || cls === 'great') ? 'best' : 'good';
    const strip = (a) => (a || []).map((x) => x.replace(/\{m\}/g, 'that move'));
    return { desc: DESC[name] || 'a friendly chess coach', open: strip(k[bucket]), close: strip(k.close) };
  };
  const pick = (a) => (a && a.length ? a[Math.floor(Math.random() * a.length)] : '');

  // ------------------------------------------------------------ the facts (found by the app, never invented)
  const mk = (moves) => { const g = new Chess(); moves.forEach((u) => g.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] || undefined })); return g; };
  const NM = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
  const listN = (a) => (a.length <= 1 ? a[0] || '' : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
  function coachFacts(histBefore, played, best, reply, sAfter) {
    const out = { problem: null, solution: null };
    try {                                              // what does the move you played allow?
      const g2 = mk(histBefore.concat([played])), pm = reply && reply !== '0000' ? g2.move({ from: reply.slice(0, 2), to: reply.slice(2, 4), promotion: reply[4] || undefined }) : null;
      if (pm) {
        if (g2.in_checkmate() || sAfter <= -9000) out.problem = { k: 'mate', san: pm.san };
        else if (pm.captured) { const defended = g2.moves({ verbose: true }).some((m) => m.to === pm.to && m.captured); out.problem = { k: defended ? 'wins' : 'hangs', piece: NM[pm.captured], sq: pm.to }; }
        else if (pm.promotion) out.problem = { k: 'promote' };
        else if (g2.in_check()) out.problem = { k: 'check', san: pm.san };
      }
    } catch (e) {}
    try {                                              // quiet problems: king left in the center, no development
      if (!out.problem && histBefore.length < 24) {
        const g0 = mk(histBefore), gp = mk(histBefore.concat([played])), me = g0.turn(), bm = best && g0.move({ from: best.slice(0, 2), to: best.slice(2, 4), promotion: best[4] || undefined });
        const pl = gp.history({ verbose: true }).pop();
        if (bm && /^O-O/.test(bm.san) && pl && !/^O-O/.test(pl.san)) out.problem = { k: 'kingCenter' };
        else if (bm && bm.piece !== 'p' && bm.piece !== 'k' && pl && (pl.piece === 'p' || pl.piece === 'r') && histBefore.length < 20) out.problem = { k: 'undeveloped' };
      }
    } catch (e) {}
    try {                                              // what does the best move do?
      const g = mk(histBefore), m = best && g.move({ from: best.slice(0, 2), to: best.slice(2, 4), promotion: best[4] || undefined });
      if (m) {
        const v = { p: 1, n: 3, b: 3, r: 5, q: 9 }[m.piece] || 0;
        if (g.in_checkmate()) out.solution = { k: 'mate' };
        else {
          const hit = (typeof attacksFrom === 'function' ? attacksFrom(g, m.to) : []).filter((p) => p !== 'k' && p !== 'p' && ({ p: 1, n: 3, b: 3, r: 5, q: 9 }[p] >= v || p === 'q'));
          const targets = [...new Set((g.in_check() ? ['king'] : []).concat(hit.map((p) => NM[p])))];
          if (targets.length >= 2) out.solution = { k: 'fork', list: listN(targets) };
          else if (m.promotion) out.solution = { k: 'promote', piece: NM[m.promotion] };
          else if (m.captured) out.solution = { k: 'takes', piece: NM[m.captured] };
          else if (/^O-O/.test(m.san)) out.solution = { k: 'castle' };
          else if (g.in_check()) out.solution = { k: 'check' };
          else if (hit.length) out.solution = { k: 'attacks', piece: NM[hit[0]] };
          else if (m.piece !== 'p' && m.piece !== 'k' && histBefore.length < 20) out.solution = { k: 'develops' };
        }
      }
    } catch (e) {}
    return out;
  }
  const problemText = (p) => !p ? '' : p.k === 'mate' ? 'That walks into checkmate (' + p.san + ').' : p.k === 'hangs' ? 'That leaves your ' + p.piece + ' on ' + p.sq + ' hanging.' : p.k === 'wins' ? 'That lets them win your ' + p.piece + ' on ' + p.sq + '.' :
    p.k === 'promote' ? 'That lets them promote a pawn.' : p.k === 'check' ? 'That allows a strong check: ' + p.san + '.' : p.k === 'kingCenter' ? 'Your king is still in the center.' : p.k === 'undeveloped' ? 'That does not develop a piece.' : '';
  const solutionText = (s, best) => !s ? 'Better was ' + best + '.' : s.k === 'mate' ? best + ' was checkmate.' : s.k === 'fork' ? best + ' forks their ' + s.list + '.' : s.k === 'promote' ? best + ' makes a new ' + s.piece + '.' : s.k === 'takes' ? best + ' wins their ' + s.piece + '.' :
    s.k === 'castle' ? best + ' puts your king to safety.' : s.k === 'check' ? best + ' gives a strong check.' : s.k === 'attacks' ? best + ' attacks their ' + s.piece + '.' : s.k === 'develops' ? best + ' develops a piece.' : 'Better was ' + best + '.';

  // ------------------------------------------------------------ what the coach says about your move
  function coachSay(name, cls, san, bestSan, facts) {
    const k = K[name] || DEFAULT, f = (s) => String(s || '').replace(/\{m\}/g, san);
    if (cls === 'brilliant') return f(pick(k.brilliant) || pick(DEFAULT.brilliant));
    if (cls === 'best' || cls === 'great') return f(pick(k.best));
    if (cls === 'good' || cls === 'exc' || cls === 'book' || cls === 'forced') return f(pick(k.good)) + (cls === 'good' && bestSan && bestSan !== san ? ' ' + bestSan + ' was a little stronger.' : '');
    const bucket = cls === 'blunder' ? 'blunder' : cls === 'miss' ? 'miss' : 'mistake';
    const parts = [f(pick(k[bucket])), cls === 'miss' ? '' : problemText(facts && facts.problem), solutionText(facts && facts.solution, bestSan), cls === 'inacc' ? '' : f(pick(k.close))].filter(Boolean);
    return parts.join(' ');
  }
  // the verified fact sentence (what the app found), the same wording the hand-written comment uses
  window.coachCore = function (cls, san, bestSan, facts) {
    if (cls === 'brilliant') return san + ' gives up material, and it works.';
    if (cls === 'best' || cls === 'great') return san + ' was the best move.';
    if (cls === 'good' || cls === 'exc' || cls === 'book' || cls === 'forced') return san + ' was good.' + (bestSan && bestSan !== san ? ' ' + bestSan + ' was a little stronger.' : '');
    const kind = cls === 'blunder' ? 'a blunder' : cls === 'miss' ? 'a miss' : cls === 'inacc' ? 'an inaccuracy' : 'a mistake';
    return [san + ' was ' + kind + '.', cls === 'miss' ? '' : problemText(facts && facts.problem), solutionText(facts && facts.solution, bestSan)].filter(Boolean).join(' ');
  };
  window.coachCompose = (x) => (x.open ? x.open + ' ' : '') + x.core + (x.close ? ' ' + x.close : '');
  // after a game: pick the moments worth a comment (your worst moves and your best), ask the server for the coach's flavour, keep what comes back
  window.coachReview = async function (g, an, name, alive) {
    if (!name || !window.coachVoice(name) || !window.remoteReady || !(await window.remoteReady())) return null;
    const q = ranksOf(g, an), mine = (k) => (k % 2 === 0) === (g.me === 'w'), cand = [];
    q.forEach((x, k) => { if (x && mine(k) && an.j[k]) cand.push({ k, x }); });
    const bad = cand.filter((o) => RANK_BAD[o.x.cls]).sort((a, b) => b.x.loss - a.x.loss).slice(0, 4);
    const goodRank = { brilliant: 0, great: 1, best: 2 }, good = cand.filter((o) => goodRank[o.x.cls] != null).sort((a, b) => goodRank[a.x.cls] - goodRank[b.x.cls]).slice(0, 2);
    const picks = bad.concat(good); if (!picks.length) return null;
    const sanOf = (moves, u) => { try { const t = new Chess(); moves.forEach((m) => t.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] || undefined })); const m = t.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] || undefined }); return m ? m.san : u; } catch (e) { return u; } };
    const moments = [], cores = {};
    for (const o of picks) {
      const before = g.moves.slice(0, o.k), j = an.j[o.k], san = sanOf(before, g.moves[o.k]), best = j.b && j.b !== g.moves[o.k] ? sanOf(before, j.b) : san;
      const facts = RANK_BAD[o.x.cls] ? window.coachFacts(before, g.moves[o.k], j.b, j.reply, j.sP) : null, core = window.coachCore(o.x.cls, san, best, facts), st = window.coachStyle(name, o.x.cls);
      moments.push({ id: String(o.k + 1), san, cls: o.x.cls, bestSan: best, core, open: st.open, close: st.close }); cores[String(o.k + 1)] = core;
    }
    const desc = window.coachStyle(name, 'good').desc, out = await window.remoteComments(name, { desc }, moments, alive);
    const gem = {}; for (const id of Object.keys(out)) if (out[id] && (out[id].open || out[id].close)) gem[id] = { open: out[id].open || '', close: out[id].close || '', core: cores[id] };
    return Object.keys(gem).length ? gem : null;
  };
  // ------------------------------------------------------------ taste: how each coach JUDGES a move (Reviewer v2's personality; the legends and creators only)
  // The objective rank of your move never changes. The coach adds a personal reading of it: does the move fit their style (aggression, trading, pawn pushes,
  // solidity, risk, queen play, activity, retreats: the same 8 numbers that make them play like themselves)? The flavour of the move is found with chess.js.
  const DIM = ['aggression', 'trading', 'pawn push', 'solidity', 'risk', 'queen', 'activity', 'retreat'];
  const PVAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const T_LIKE = [
    ['That is the kind of move I live for.', 'Attack! This is my style.'], ['A fair trade. That is how I like it.', 'Trade down and keep it clean: my style.'],
    ['Pushing the pawn: I like the ambition.', 'A pawn push. I would have done the same.'], ['Solid. Exactly how I would do it.', 'Safe and sensible. My kind of move.'],
    ['A brave one. My kind of risk.', 'Bold! I like it.'], ['The queen joins in. Yes, my style.', 'Queen play, and I like it.'],
    ['Active pieces, always. This is my style.', 'Developing with purpose, I like it.'], ['A patient retreat. I like it.', 'Pulling back to regroup: my style.']];
  const T_NOT = [
    ['Fine, though I prefer to keep things calmer.', 'Correct, but too sharp for my taste.'], ['Fine, though I would keep the pieces on.', 'Correct, but I do not like trading here.'],
    ['Fine, though I would not push that pawn yet.', 'Correct, but I am wary of pawn pushes.'], ['Fine, though a little too solid for my taste.', 'Correct, but I would play more ambitiously.'],
    ['Fine, though too risky for me.', 'Correct, but I like to keep the risk down.'], ['Fine, though I would keep the queen at home.', 'Correct, but I am careful with the queen.'],
    ['Fine, though I prefer a quieter piece.', 'Correct, but not my kind of activity.'], ['Fine, though I would not give ground.', 'Correct, but I do not like to retreat.']];
  const T_SMALL = ['Not the strongest, but it is my kind of idea.', 'A little loose, but I like the spirit.', 'Not best, but I understand the idea.'];
  const CALL = { 'Levy Rozman': 'chat', 'Hikaru Nakamura': 'bro', 'Eric Rosen': 'friend', 'Agadmator': 'my friends', 'Ben Finegold': 'children', 'Simon Williams': 'mate', 'Eric Hansen': 'dude', 'Aman Hambleton': 'my friend', 'Paul Morphy': 'my friend', 'Alexander Alekhine': 'my friend', 'Anna Cramling': 'chat', 'Alexandra Botez': 'chat' };
  // the flavour of the move you played: eight numbers 0..1 in the same order as the style vectors
  function tasteFlavor(histBefore, uci) {
    const g = mk(histBefore), m = g.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || undefined });
    if (!m) return null;
    const white = m.color === 'w', rank = (sq) => (white ? +sq[1] : 9 - +sq[1]), pv = PVAL[m.piece] || 0, cap = !!m.captured, chk = /[+#]/.test(m.san);
    const f = [0, 0, 0, 0, 0, 0, 0, 0];
    f[0] = chk ? 1 : cap ? .6 : (m.piece !== 'k' && rank(m.to) >= 5 && rank(m.to) - rank(m.from) >= 1) ? .4 : 0;
    if (cap) f[1] = m.piece !== 'p' && Math.abs((PVAL[m.captured] || 0) - pv) <= 1 ? .9 : .4;
    if (m.piece === 'p') f[2] = cap ? .2 : 1;
    f[3] = /^O-O/.test(m.san) ? 1 : (!cap && !chk && m.piece !== 'p' && m.piece !== 'k' && rank(m.to) <= 4 && rank(m.to) <= rank(m.from)) ? .5 : 0;
    try {                                              // risk: the piece can be taken and the move loses material on balance (a sacrifice)
      const g2 = mk(histBefore.concat([uci])), caps = g2.moves({ verbose: true }).filter((x) => x.to === m.to && x.captured);
      if (caps.length && m.piece !== 'k') {
        let worst = 0;
        caps.forEach((c) => { const g3 = mk(histBefore.concat([uci, c.from + c.to + (c.promotion || '')])), back = g3.moves({ verbose: true }).some((x) => x.to === m.to && x.captured), net = (PVAL[m.captured] || 0) - (pv - (back ? PVAL[c.piece] || 0 : 0)); worst = Math.min(worst, net); });
        f[4] = worst <= -2 ? 1 : worst <= -1 ? .5 : 0;
      }
    } catch (e) {}
    f[5] = m.piece === 'q' ? 1 : 0;
    const dist = (sq) => Math.max(Math.abs(sq.charCodeAt(0) - 100.5), Math.abs(+sq[1] - 4.5));
    f[6] = (m.piece === 'n' || m.piece === 'b') && rank(m.from) === 1 ? 1 : (m.piece !== 'p' && m.piece !== 'k' && dist(m.to) <= dist(m.from) - 1) ? .5 : 0;
    f[7] = (m.piece !== 'p' && m.piece !== 'k' && !cap && rank(m.to) < rank(m.from)) ? 1 : 0;
    return f;
  }
  // a short personal reading of the move, or '' (not every move says something about a coach's taste)
  window.coachTaste = function (name, cls, histBefore, played) {
    try {
      const st = typeof LEGEND_STYLE !== 'undefined' ? LEGEND_STYLE[name] : null;
      if (!st || !played || histBefore.length < 4 || cls === 'book' || cls === 'forced') return '';
      const f = tasteFlavor(histBefore, played); if (!f) return '';
      const scale = Math.max(.45, ...st.map(Math.abs));       // quiet personalities (small style numbers) are read relative to their own range
      const tot = f.reduce((a, b) => a + b, 0), aff = f.reduce((a, b, i) => a + b * st[i], 0) / (tot + .5) / scale;
      let di = 0, dc = 0; f.forEach((x, i) => { const c = x * st[i] / scale; if (Math.abs(c) > Math.abs(dc)) { dc = c; di = i; } });
      if (Math.abs(aff) < .3 || Math.abs(dc) < .25) return '';
      if (Math.random() > Math.min(1, (Math.abs(aff) - .2) * 2)) return '';      // the stronger the fit (or clash), the more often they say so
      const good = cls === 'best' || cls === 'great' || cls === 'brilliant' || cls === 'good' || cls === 'exc', small = cls === 'inacc' || cls === 'mistake';
      let note = '';
      if (dc > 0 && good) note = pick(T_LIKE[di]); else if (dc > 0 && small) note = pick(T_SMALL); else if (dc < 0 && good && cls !== 'brilliant') note = pick(T_NOT[di]);
      if (!note) return '';
      const call = CALL[name]; if (call) note = note.replace(/([.!])$/, ', ' + call + '$1');
      return ' ' + note;
    } catch (e) { return ''; }
  };
  window.TASTE_DIMS = DIM;
  window.coachFacts = coachFacts; window.coachSay = coachSay; window.COACH_NAMES = Object.keys(K);
  window.coachVoice = (name) => !!K[name];

  // ------------------------------------------------------------ the picker: Play Coach asks who should coach you
  window.coachPicker = function (onPick) {
    const bots = BOTS.filter((b) => b.group && K[b.name]), cur = S.coach || '';
    const row = (b) => '<button class="coachrow' + (b.name === cur ? ' on' : '') + '" data-n="' + esc(b.name) + '"><span class="botav">' + faceHTML(b) + '</span><span><b>' + esc(b.name) + '</b><small>' + esc((b.blurb || '').split('.')[0]) + '</small></span></button>';
    openSheet('<h2>Pick your coach</h2><div class="coachlist"><button class="coachrow' + (!cur ? ' on' : '') + '" data-n=""><span class="botav"><span class="orb mini"></span></span><span><b>Sibyl</b><small>Her own voice</small></span></button>' +
      '<p class="coachhead">Legends</p>' + bots.filter((b) => b.group === 'legend').map(row).join('') + '<p class="coachhead">Creators</p>' + bots.filter((b) => b.group === 'creator').map(row).join('') + '</div>');
    $('sheet').querySelectorAll('.coachrow').forEach((r) => r.onclick = () => { S.coach = r.dataset.n || null; saveSettings(); closeSheet(); buzz(8); onPick(); });
  };
  const css = document.createElement('style');
  css.textContent = `.coachlist { max-height: 62vh; overflow-y: auto; display: grid; gap: 8px; padding: 0 14px 6px } .coachhead { margin: 10px 0 0; font: 600 12px var(--sans); color: var(--muted); letter-spacing: .08em; text-transform: uppercase }
  .coachrow { display: flex; align-items: center; gap: 12px; padding: 8px 10px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); text-align: left; min-height: 56px } .coachrow.on { border-color: var(--accent) } .coachrow .botav { flex: none; width: 44px; height: 44px; border-radius: 50%; overflow: hidden; display: grid; place-items: center }
  .coachrow b { display: block; font: 600 16px var(--sans) } .coachrow small { display: block; color: var(--muted); font: 400 12px var(--sans) }`;
  document.head.appendChild(css);
})();
