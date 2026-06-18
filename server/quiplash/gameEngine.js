const allPrompts = require('./prompts.json');

const SAFETY_QUIPS = [
  'I plead the fifth.',
  'My lawyer advised me not to answer this.',
  'Error 404: Answer not found.',
  'I was too busy being awesome.',
  '[nervous laughter]',
  'Absolutely nothing. Moving on.',
  '...uh...',
  'My dog ate my answer.',
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomSafetyQuip() {
  return SAFETY_QUIPS[Math.floor(Math.random() * SAFETY_QUIPS.length)];
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Assign prompts so each player gets ~3 duels (fewer with small groups)
function buildPromptPairs(playerIds) {
  const n = playerIds.length;
  const promptsPerPlayer = n <= 3 ? 2 : 3;
  const totalPrompts = Math.ceil((n * promptsPerPlayer) / 2);

  const counts = Object.fromEntries(playerIds.map(id => [id, 0]));
  const usedPairs = new Set();
  const pairs = [];

  const ids = shuffle(playerIds);

  while (pairs.length < totalPrompts) {
    let found = false;
    const sorted = [...ids].sort((a, b) => counts[a] - counts[b]);

    for (let i = 0; i < sorted.length && !found; i++) {
      const p1 = sorted[i];
      if (counts[p1] >= promptsPerPlayer) continue;

      for (let j = i + 1; j < sorted.length && !found; j++) {
        const p2 = sorted[j];
        if (counts[p2] >= promptsPerPlayer) continue;

        const key = [p1, p2].sort().join('|');
        if (!usedPairs.has(key)) {
          pairs.push([p1, p2]);
          usedPairs.add(key);
          counts[p1]++;
          counts[p2]++;
          found = true;
        }
      }
    }

    if (!found) break; // no more valid pairs
  }

  return pairs;
}

function assignRound(playerIds, usedPromptIds, isRound3 = false) {
  const available = allPrompts
    .map((text, idx) => ({ id: String(idx), text }))
    .filter(p => !usedPromptIds.has(p.id));

  const shuffled = shuffle(available);

  if (isRound3) {
    const selected = shuffled.slice(0, 3);
    selected.forEach(p => usedPromptIds.add(p.id));
    return selected.map(p => ({
      promptId: p.id,
      promptText: p.text,
      assignedPlayerIds: [...playerIds],
      answers: [],
      votes: [],
    }));
  }

  const pairs = buildPromptPairs(playerIds);
  const selected = shuffled.slice(0, pairs.length);
  selected.forEach(p => usedPromptIds.add(p.id));

  return selected.map((p, i) => ({
    promptId: p.id,
    promptText: p.text,
    assignedPlayerIds: pairs[i],
    answers: [],
    votes: [],
  }));
}

function fillMissingAnswers(prompt) {
  for (const pid of prompt.assignedPlayerIds) {
    if (!prompt.answers.find(a => a.playerId === pid)) {
      prompt.answers.push({ playerId: pid, text: randomSafetyQuip(), isSafetyQuip: true });
    }
  }
}

function tallyReveal(prompt, players, round, totalRounds) {
  fillMissingAnswers(prompt);

  const multiplier = round === (totalRounds ?? 3) ? 2 : 1;
  const totalVoters = prompt.votes.length;
  const pointsAwarded = {};

  for (const answer of prompt.answers) {
    const voteCount = prompt.votes.filter(v => v.forPlayerId === answer.playerId).length;
    const isQuiplash = totalVoters > 0 && voteCount === totalVoters;
    const pts = answer.isSafetyQuip
      ? 0
      : (voteCount * 1000 + (isQuiplash ? 2000 : 0)) * multiplier;

    pointsAwarded[answer.playerId] = { points: pts, voteCount, isQuiplash };

    const player = players.find(p => p.id === answer.playerId);
    if (player) player.score += pts;
  }

  const anyQuiplash = Object.values(pointsAwarded).some(v => v.isQuiplash);

  return {
    promptText: prompt.promptText,
    answers: prompt.answers.map(a => ({
      playerId: a.playerId,
      playerName: players.find(p => p.id === a.playerId)?.name ?? '???',
      text: a.text,
      isSafetyQuip: a.isSafetyQuip ?? false,
      ...pointsAwarded[a.playerId],
    })),
    isQuiplash: anyQuiplash,
  };
}

module.exports = { assignRound, fillMissingAnswers, tallyReveal, generateRoomCode };
