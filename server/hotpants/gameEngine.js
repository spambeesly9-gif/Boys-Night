const { generateRoomCode } = require('../quiplash/gameEngine');

const hpRooms = new Map();

// ─── Room management ────────────────────────────────────────────────────────

function createHPRoom(hostId, hostName) {
  let code;
  do { code = generateRoomCode(); } while (hpRooms.has(code));

  const room = {
    roomCode: code,
    hostId,
    players: [{ id: hostId, name: hostName, score: 0, isConnected: true }],
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
  room.players.push({ id, name, score: 0, isConnected: true });
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
  const rounds = config.rounds ?? 3;
  room.config = { rounds };
  room.round = 0;
  room.czarIndex = 0;
  startCzarSetup(io, room);
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
  const ANSWER_DURATION = 60;

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
  room.timers.answer = setTimeout(() => startReveal(io, room), ANSWER_DURATION * 1000);
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

  const VOTE_DURATION = 30;
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
  room.timers.vote = setTimeout(() => resolveVotes(io, room), VOTE_DURATION * 1000);

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

  const connectedPlayers = room.players.filter(p => p.isConnected);
  room.czarIndex = (room.czarIndex + 1) % connectedPlayers.length;

  const isEndless = room.config.rounds === 'endless';
  const isLastRound = !isEndless && room.round >= room.config.rounds;

  if (isLastRound) {
    endHPGame(io, room);
  } else {
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

module.exports = {
  hpRooms,
  createHPRoom,
  getHPRoom,
  removeHPRoom,
  addHPPlayer,
  markHPDisconnected,
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
