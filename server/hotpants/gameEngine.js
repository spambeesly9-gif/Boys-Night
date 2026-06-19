const { generateRoomCode } = require('../quiplash/gameEngine');
const autoPairs = require('./autoPairs.json');

function generateToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function pickAutoPair(usedIndices) {
  const available = autoPairs.map((_, i) => i).filter(i => !usedIndices.has(i));
  if (available.length === 0) { usedIndices.clear(); return pickAutoPair(usedIndices); }
  const idx = available[Math.floor(Math.random() * available.length)];
  usedIndices.add(idx);
  return autoPairs[idx];
}

const hpRooms = new Map();

// ─── Room management ────────────────────────────────────────────────────────

function createHPRoom(hostId, hostName) {
  let code;
  do { code = generateRoomCode(); } while (hpRooms.has(code));

  const room = {
    roomCode: code,
    hostId,
    players: [{ id: hostId, name: hostName, score: 0, isConnected: true, reconnectToken: generateToken() }],
    state: 'lobby',
    config: { rounds: 3 },
    round: 0,
    czarIndex: 0,
    currentRound: null,
    timers: {},
  };

  hpRooms.set(code, room);
  return room;
}

function getHPRoom(code) {
  return hpRooms.get(String(code || '').toUpperCase()) ?? null;
}

function removeHPRoom(code) {
  const room = hpRooms.get(code);
  if (!room) return;
  Object.values(room.timers).forEach(clearTimeout);
  hpRooms.delete(code);
}

function addHPPlayer(room, id, name) {
  if (room.players.find(p => p.id === id)) return;
  room.players.push({ id, name, score: 0, isConnected: true, reconnectToken: generateToken() });
}

function reconnectHPPlayer(room, token, newSocketId) {
  const player = room.players.find(p => p.reconnectToken === token);
  if (!player) return null;

  const oldId = player.id;
  if (room.hostId === oldId) room.hostId = newSocketId;
  player.id = newSocketId;
  player.isConnected = true;

  // Update czar / imposter references
  if (room.currentRound) {
    if (room.currentRound.czarId === oldId) room.currentRound.czarId = newSocketId;
    if (room.currentRound.imposterId === oldId) room.currentRound.imposterId = newSocketId;
    // answers keyed by id
    if (room.currentRound.answers[oldId] !== undefined) {
      room.currentRound.answers[newSocketId] = room.currentRound.answers[oldId];
      delete room.currentRound.answers[oldId];
    }
    if (room.currentRound.votes[oldId] !== undefined) {
      room.currentRound.votes[newSocketId] = room.currentRound.votes[oldId];
      delete room.currentRound.votes[oldId];
    }
  }

  return player;
}

function markHPDisconnected(room, id) {
  const p = room.players.find(p => p.id === id);
  if (p) p.isConnected = false;
}

function hpPublicState(room) {
  return {
    roomCode: room.roomCode,
    state: room.state,
    round: room.round,
    config: room.config,
    czarId: room.currentRound?.czarId ?? null,
    players: room.players.map(({ id, name, score, isConnected }) =>
      ({ id, name, score, isConnected })
    ),
  };
}

// ─── Game flow ───────────────────────────────────────────────────────────────

function startHPGame(io, room, config = {}) {
  const rawRounds = config.rounds ?? 3;
  const rounds = (String(rawRounds).toLowerCase() === 'endless') ? 'endless' : (Number(rawRounds) || 3);
  const answerTime = config.answerTime ?? 60;
  const voteTime = config.voteTime ?? 30;
  const autoMode = !!config.autoMode;
  room.config = { rounds, answerTime, voteTime, autoMode };
  room.round = 0;
  room.czarIndex = 0;
  room.usedPairIndices = new Set();
  if (autoMode) {
    startAutoRound(io, room);
  } else {
    startCzarSetup(io, room);
  }
}

function startAutoRound(io, room) {
  room.round += 1;
  room.state = 'answering';

  const connectedPlayers = room.players.filter(p => p.isConnected);
  const pair = pickAutoPair(room.usedPairIndices);

  // Pick random imposter (not the same person two rounds in a row if possible)
  const lastImposterId = room.currentRound?.imposterId;
  const eligible = connectedPlayers.filter(p => p.id !== lastImposterId);
  const pool = eligible.length > 0 ? eligible : connectedPlayers;
  const imposter = pool[Math.floor(Math.random() * pool.length)];

  room.currentRound = {
    czarId: null,
    imposterId: imposter.id,
    mainQuestion: pair.main,
    imposterQuestion: pair.trap,
    answers: {},
    votes: {},
  };

  const ANSWER_DURATION = room.config.answerTime ?? 60;

  io.to(room.roomCode).emit('hp_game_state', hpPublicState(room));
  io.to(room.roomCode).emit('hp_auto_round_start', {
    round: room.round,
    duration: ANSWER_DURATION,
  });

  for (const p of connectedPlayers) {
    if (p.id === imposter.id) {
      io.to(p.id).emit('hp_your_question', { question: pair.trap, isImposter: true });
    } else {
      io.to(p.id).emit('hp_your_question', { question: pair.main, isImposter: false });
    }
  }

  clearTimeout(room.timers.answer);
  if (ANSWER_DURATION > 0) room.timers.answer = setTimeout(() => startReveal(io, room), ANSWER_DURATION * 1000);
}

function startCzarSetup(io, room) {
  room.round += 1;
  room.state = 'czar_setup';

  const connectedPlayers = room.players.filter(p => p.isConnected);
  const czar = connectedPlayers[room.czarIndex % connectedPlayers.length];

  room.currentRound = {
    czarId: czar.id,
    imposterId: null,
    mainQuestion: '',
    imposterQuestion: '',
    answers: {},
    votes: {},
  };

  io.to(room.roomCode).emit('hp_game_state', hpPublicState(room));

  // Non-czar players that can be picked as imposter
  const nonCzarPlayers = connectedPlayers
    .filter(p => p.id !== czar.id)
    .map(p => ({ id: p.id, name: p.name }));

  io.to(room.roomCode).emit('hp_czar_setup_start', {
    czarId: czar.id,
    czarName: czar.name,
    round: room.round,
    players: nonCzarPlayers,
  });
}

function czarSubmit(io, room, czarSocketId, { imposterId, mainQuestion, imposterQuestion }) {
  if (room.state !== 'czar_setup') return { error: 'Wrong state.' };
  if (room.currentRound.czarId !== czarSocketId) return { error: 'You are not the Czar.' };

  const mq = String(mainQuestion || '').trim().slice(0, 300);
  const iq = String(imposterQuestion || '').trim().slice(0, 300);

  if (!imposterId) return { error: 'Pick an imposter.' };
  if (!mq) return { error: 'Main question cannot be empty.' };
  if (!iq) return { error: 'Imposter question cannot be empty.' };
  if (mq === iq) return { error: 'Questions must be different.' };

  const imposterPlayer = room.players.find(p => p.id === imposterId);
  if (!imposterPlayer) return { error: 'Invalid imposter selection.' };

  room.currentRound.imposterId = imposterId;
  room.currentRound.mainQuestion = mq;
  room.currentRound.imposterQuestion = iq;

  startAnswerPhase(io, room);
  return { ok: true };
}

function startAnswerPhase(io, room) {
  room.state = 'answering';
  const ANSWER_DURATION = room.config.answerTime ?? 60;

  io.to(room.roomCode).emit('hp_game_state', hpPublicState(room));
  io.to(room.roomCode).emit('hp_answer_phase', {
    round: room.round,
    duration: ANSWER_DURATION,
    czarId: room.currentRound.czarId,
    czarName: room.players.find(p => p.id === room.currentRound.czarId)?.name ?? '',
  });

  // Send individual questions
  const { czarId, imposterId, mainQuestion, imposterQuestion } = room.currentRound;
  for (const p of room.players) {
    if (p.id === czarId) continue;
    if (p.isConnected) {
      if (p.id === imposterId) {
        io.to(p.id).emit('hp_your_question', { question: imposterQuestion, isImposter: true });
      } else {
        io.to(p.id).emit('hp_your_question', { question: mainQuestion, isImposter: false });
      }
    }
  }

  clearTimeout(room.timers.answer);
  if (ANSWER_DURATION > 0) room.timers.answer = setTimeout(() => startReveal(io, room), ANSWER_DURATION * 1000);
}

function submitHPAnswer(io, room, playerId, answerText) {
  if (room.state !== 'answering') return;
  if (room.currentRound.czarId === playerId) return;
  if (room.currentRound.answers[playerId] !== undefined) return;

  const text = String(answerText || '').trim().slice(0, 300) || '(nothing)';
  room.currentRound.answers[playerId] = text;

  // Emit answer status (boolean map, no text)
  const answerStatus = {};
  for (const p of room.players) {
    if (p.id === room.currentRound.czarId) continue;
    answerStatus[p.id] = room.currentRound.answers[p.id] !== undefined;
  }
  io.to(room.roomCode).emit('hp_answer_status', answerStatus);

  // Check if all connected non-czar players answered
  const nonCzar = room.players.filter(p => p.isConnected && p.id !== room.currentRound.czarId);
  const allAnswered = nonCzar.every(p => room.currentRound.answers[p.id] !== undefined);
  if (allAnswered) {
    clearTimeout(room.timers.answer);
    startReveal(io, room);
  }
}

function startReveal(io, room) {
  if (room.state === 'reveal') return; // prevent double-fire
  room.state = 'reveal';

  // Fill missing answers
  for (const p of room.players) {
    if (p.id === room.currentRound.czarId) continue;
    if (room.currentRound.answers[p.id] === undefined) {
      room.currentRound.answers[p.id] = '(no answer)';
    }
  }

  const { answers, mainQuestion, czarId } = room.currentRound;

  // Sort answers alphabetically by player name
  const answersArray = room.players
    .filter(p => p.id !== czarId)
    .map(p => ({ playerId: p.id, playerName: p.name, answer: answers[p.id] ?? '(no answer)' }))
    .sort((a, b) => a.playerName.localeCompare(b.playerName));

  io.to(room.roomCode).emit('hp_game_state', hpPublicState(room));
  io.to(room.roomCode).emit('hp_reveal', {
    answers: answersArray,
    mainQuestion,
    round: room.round,
    czarId,
  });
}

// Czar advances from reveal → voting
function startHPVoting(io, room, czarSocketId) {
  if (room.state !== 'reveal') return { error: 'Not in reveal phase.' };
  if (room.currentRound.czarId !== czarSocketId) return { error: 'Only the Czar can start voting.' };

  const VOTE_DURATION = room.config.voteTime ?? 30;
  room.state = 'voting';

  const { answers, mainQuestion, czarId } = room.currentRound;
  const answersArray = room.players
    .filter(p => p.id !== czarId)
    .map(p => ({ playerId: p.id, playerName: p.name, answer: answers[p.id] ?? '(no answer)' }))
    .sort((a, b) => a.playerName.localeCompare(b.playerName));

  io.to(room.roomCode).emit('hp_game_state', hpPublicState(room));
  io.to(room.roomCode).emit('hp_voting_start', {
    answers: answersArray,
    mainQuestion,
    round: room.round,
    duration: VOTE_DURATION,
    czarId,
  });

  clearTimeout(room.timers.vote);
  if (VOTE_DURATION > 0) room.timers.vote = setTimeout(() => resolveVotes(io, room), VOTE_DURATION * 1000);

  return { ok: true };
}

function castHPVote(io, room, voterId, votedForId) {
  if (room.state !== 'voting') return;
  if (room.currentRound.czarId === voterId) return; // czar can't vote
  if (voterId === votedForId) return; // can't vote for yourself
  if (room.currentRound.votes[voterId] !== undefined) return; // already voted

  // Check votedForId is a valid non-czar player
  const valid = room.players.find(p => p.id === votedForId && p.id !== room.currentRound.czarId);
  if (!valid) return;

  room.currentRound.votes[voterId] = votedForId;

  // Emit running tally
  const tally = buildTally(room);
  io.to(room.roomCode).emit('hp_vote_tally', { tally });

  // Check if all eligible voters have voted
  const eligibleVoters = room.players.filter(
    p => p.isConnected && p.id !== room.currentRound.czarId
  );
  const allVoted = eligibleVoters.every(p => room.currentRound.votes[p.id] !== undefined);
  if (allVoted) {
    clearTimeout(room.timers.vote);
    resolveVotes(io, room);
  }
}

function buildTally(room) {
  const tally = {};
  for (const p of room.players) {
    if (p.id !== room.currentRound.czarId) tally[p.id] = 0;
  }
  for (const votedForId of Object.values(room.currentRound.votes)) {
    if (tally[votedForId] !== undefined) tally[votedForId]++;
  }
  return tally;
}

function resolveVotes(io, room) {
  if (room.state === 'result') return;
  room.state = 'result';

  const { czarId, imposterId, mainQuestion, imposterQuestion, votes } = room.currentRound;
  const tally = buildTally(room);

  // Find player(s) with max votes
  const maxVotes = Math.max(...Object.values(tally), 0);
  const topVoted = Object.entries(tally).filter(([, v]) => v === maxVotes).map(([id]) => id);

  // Caught = imposter got strictly the most votes (no tie)
  const caught = maxVotes > 0 && topVoted.length === 1 && topVoted[0] === imposterId;

  // Calculate score deltas
  const scoreDelta = {};
  for (const p of room.players) scoreDelta[p.id] = 0;

  if (caught) {
    // Each correct voter +1000, czar +500
    for (const [voterId, votedForId] of Object.entries(votes)) {
      if (votedForId === imposterId) scoreDelta[voterId] = (scoreDelta[voterId] || 0) + 1000;
    }
    scoreDelta[czarId] = (scoreDelta[czarId] || 0) + 500;
  } else {
    // Imposter escapes: +2000
    scoreDelta[imposterId] = (scoreDelta[imposterId] || 0) + 2000;
  }

  // Apply deltas to scores
  for (const p of room.players) {
    p.score += scoreDelta[p.id] || 0;
  }

  const imposterPlayer = room.players.find(p => p.id === imposterId);
  const czarPlayer = room.players.find(p => p.id === czarId);

  // Build votes map: voterId → votedForId
  const votesMap = { ...votes };

  io.to(room.roomCode).emit('hp_game_state', hpPublicState(room));
  io.to(room.roomCode).emit('hp_result', {
    imposterId,
    imposterName: imposterPlayer?.name ?? '',
    imposterQuestion,
    mainQuestion,
    caught,
    tally,
    votes: votesMap,
    scoreDelta,
    czarId,
    czarName: czarPlayer?.name ?? '',
    players: hpPublicState(room).players,
  });
}

function nextHPRound(io, room, requesterId) {
  if (requesterId !== room.hostId) return;
  if (room.state !== 'result') return;

  const isEndless = room.config.rounds === 'endless';
  const isLastRound = !isEndless && room.round >= room.config.rounds;

  if (isLastRound) {
    endHPGame(io, room);
  } else if (room.config.autoMode) {
    startAutoRound(io, room);
  } else {
    const connectedPlayers = room.players.filter(p => p.isConnected);
    room.czarIndex = (room.czarIndex + 1) % connectedPlayers.length;
    startCzarSetup(io, room);
  }
}

function endHPGame(io, room) {
  Object.values(room.timers).forEach(clearTimeout);
  room.state = 'gameover';
  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  io.to(room.roomCode).emit('hp_game_over', { players: sorted });
}

function forceEndHPGame(io, room, requesterId) {
  if (requesterId !== room.hostId) return;
  endHPGame(io, room);
}

function handleHPDisconnect(io, room, playerId) {
  markHPDisconnected(room, playerId);

  if (room.state === 'answering' && room.currentRound) {
    // Fill their answer so the round isn't stuck waiting for them
    if (playerId !== room.currentRound.czarId && room.currentRound.answers[playerId] === undefined) {
      room.currentRound.answers[playerId] = '(no answer)';
    }
    const nonCzar = room.players.filter(p => p.isConnected && p.id !== room.currentRound.czarId);
    if (nonCzar.length > 0 && nonCzar.every(p => room.currentRound.answers[p.id] !== undefined)) {
      clearTimeout(room.timers.answer);
      startReveal(io, room);
      return;
    }
  }

  if (room.state === 'voting') {
    // Re-check if all remaining connected players voted
    const eligible = room.players.filter(p => p.isConnected && p.id !== room.currentRound?.czarId);
    const allVoted = eligible.length === 0 || eligible.every(p => room.currentRound.votes[p.id]);
    if (allVoted) {
      clearTimeout(room.timers.vote);
      resolveVotes(io, room);
      return;
    }
  }

  io.to(room.roomCode).emit('hp_game_state', hpPublicState(room));
}

module.exports = {
  hpRooms,
  createHPRoom,
  getHPRoom,
  removeHPRoom,
  addHPPlayer,
  markHPDisconnected,
  handleHPDisconnect,
  reconnectHPPlayer,
  hpPublicState,
  startHPGame,
  czarSubmit,
  submitHPAnswer,
  startReveal,
  startHPVoting,
  castHPVote,
  nextHPRound,
  forceEndHPGame,
};
