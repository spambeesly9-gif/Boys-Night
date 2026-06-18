const { assignRound, fillMissingAnswers, tallyReveal, generateRoomCode } = require('./quiplash/gameEngine');

const ANSWER_TIME = 90;   // seconds
const VOTE_TIME   = 30;   // seconds
const REVEAL_PAUSE = 5000; // ms before advancing to next prompt

const rooms = {}; // roomCode → room

function createRoom(hostId, hostName) {
  let code;
  do { code = generateRoomCode(); } while (rooms[code]);

  rooms[code] = {
    roomCode: code,
    hostId,
    players: [{ id: hostId, name: hostName, score: 0, isConnected: true, isHost: true }],
    state: 'lobby',
    round: 0,
    roundPrompts: [],
    currentVoteIndex: 0,
    usedPromptIds: new Set(),
    timers: {},
  };
  return rooms[code];
}

function getRoom(code) {
  return rooms[code.toUpperCase()] ?? null;
}

function removeRoom(code) {
  const room = rooms[code];
  if (!room) return;
  Object.values(room.timers).forEach(clearTimeout);
  delete rooms[code];
}

function addPlayer(room, id, name) {
  if (room.players.find(p => p.id === id)) return;
  room.players.push({ id, name, score: 0, isConnected: true, isHost: false });
}

function markDisconnected(room, id) {
  const p = room.players.find(p => p.id === id);
  if (p) p.isConnected = false;
}

function reconnectPlayer(room, oldId, newId) {
  const p = room.players.find(p => p.id === oldId);
  if (p) { p.id = newId; p.isConnected = true; }
}

// ─── Public game state (safe to broadcast to all) ───────────────────────────

function publicState(room) {
  return {
    roomCode: room.roomCode,
    state: room.state,
    round: room.round,
    players: room.players.map(({ id, name, score, isConnected, isHost }) =>
      ({ id, name, score, isConnected, isHost })
    ),
    currentVoteIndex: room.currentVoteIndex,
    totalPrompts: room.roundPrompts.length,
  };
}

function currentVotingPrompt(room) {
  const p = room.roundPrompts[room.currentVoteIndex];
  if (!p) return null;
  fillMissingAnswers(p);
  return {
    promptId: p.promptId,
    promptText: p.promptText,
    assignedPlayerIds: p.assignedPlayerIds,
    answers: p.answers.map(a => ({ playerId: a.playerId, text: a.text })),
    voteCount: { ...Object.fromEntries(p.assignedPlayerIds.map(id => [id, 0])) },
  };
}

// ─── Game flow ───────────────────────────────────────────────────────────────

function startGame(io, room) {
  room.round = 1;
  room.usedPromptIds = new Set();
  startAnswerPhase(io, room);
}

function startAnswerPhase(io, room) {
  room.state = 'answering';
  room.roundPrompts = assignRound(
    room.players.filter(p => p.isConnected).map(p => p.id),
    room.usedPromptIds,
    room.round === 3
  );
  room.currentVoteIndex = 0;

  io.to(room.roomCode).emit('game_state', publicState(room));
  io.to(room.roomCode).emit('answer_phase_start', { round: room.round, duration: ANSWER_TIME });

  // Send each player their prompts
  const playerPromptMap = {};
  for (const prompt of room.roundPrompts) {
    for (const pid of prompt.assignedPlayerIds) {
      if (!playerPromptMap[pid]) playerPromptMap[pid] = [];
      playerPromptMap[pid].push({ promptId: prompt.promptId, promptText: prompt.promptText });
    }
  }

  for (const [pid, prompts] of Object.entries(playerPromptMap)) {
    io.to(pid).emit('your_prompts', prompts);
  }

  // Timer
  clearTimeout(room.timers.answer);
  room.timers.answer = setTimeout(() => {
    advanceToVoting(io, room);
  }, ANSWER_TIME * 1000);
}

function submitAnswer(io, room, playerId, promptId, text) {
  const prompt = room.roundPrompts.find(p => p.promptId === promptId);
  if (!prompt || !prompt.assignedPlayerIds.includes(playerId)) return;
  if (prompt.answers.find(a => a.playerId === playerId)) return; // already answered

  prompt.answers.push({ playerId, text: text.trim().slice(0, 200) || 'Nothing.' });

  // Broadcast who has answered (no text)
  const answerStatus = {};
  for (const p of room.roundPrompts) {
    for (const pid of p.assignedPlayerIds) {
      if (!answerStatus[pid]) answerStatus[pid] = true;
      if (!p.answers.find(a => a.playerId === pid)) answerStatus[pid] = false;
    }
  }
  io.to(room.roomCode).emit('answer_status', answerStatus);

  // Check if all players have answered all their prompts
  const allDone = room.roundPrompts.every(p =>
    p.assignedPlayerIds.every(pid => p.answers.find(a => a.playerId === pid))
  );
  if (allDone) {
    clearTimeout(room.timers.answer);
    advanceToVoting(io, room);
  }
}

function advanceToVoting(io, room) {
  // Fill any missing answers with safety quips
  for (const p of room.roundPrompts) fillMissingAnswers(p);
  room.state = 'voting';
  room.currentVoteIndex = 0;
  emitCurrentVote(io, room);
}

function emitCurrentVote(io, room) {
  const prompt = room.roundPrompts[room.currentVoteIndex];
  if (!prompt) return;

  const shuffledAnswers = [...prompt.answers].sort(() => Math.random() - 0.5);
  const votePayload = {
    promptId: prompt.promptId,
    promptText: prompt.promptText,
    assignedPlayerIds: prompt.assignedPlayerIds,
    answers: shuffledAnswers.map(a => ({ playerId: a.playerId, text: a.text })),
    promptIndex: room.currentVoteIndex,
    totalPrompts: room.roundPrompts.length,
    duration: VOTE_TIME,
    round: room.round,
  };

  io.to(room.roomCode).emit('voting_start', votePayload);

  clearTimeout(room.timers.vote);
  room.timers.vote = setTimeout(() => {
    revealCurrentPrompt(io, room);
  }, VOTE_TIME * 1000);
}

function castVote(io, room, voterId, promptId, forPlayerId) {
  if (room.state !== 'voting') return;
  const prompt = room.roundPrompts[room.currentVoteIndex];
  if (!prompt || prompt.promptId !== promptId) return;

  // Can't vote if you answered this prompt
  if (prompt.assignedPlayerIds.includes(voterId)) return;
  // Can't vote twice
  if (prompt.votes.find(v => v.voterId === voterId)) return;
  // Must vote for someone who answered
  if (!prompt.answers.find(a => a.playerId === forPlayerId)) return;

  prompt.votes.push({ voterId, forPlayerId });

  // Emit live vote counts (anonymized)
  const tally = {};
  for (const a of prompt.answers) {
    tally[a.playerId] = prompt.votes.filter(v => v.forPlayerId === a.playerId).length;
  }
  io.to(room.roomCode).emit('vote_tally', { promptId, tally });

  // Check if all eligible voters have voted
  const eligibleVoters = room.players.filter(
    p => p.isConnected && !prompt.assignedPlayerIds.includes(p.id)
  );
  if (eligibleVoters.length > 0 && eligibleVoters.every(p => prompt.votes.find(v => v.voterId === p.id))) {
    clearTimeout(room.timers.vote);
    revealCurrentPrompt(io, room);
  }
}

function revealCurrentPrompt(io, room) {
  room.state = 'reveal';
  const prompt = room.roundPrompts[room.currentVoteIndex];
  const revealData = tallyReveal(prompt, room.players, room.round);

  io.to(room.roomCode).emit('reveal', {
    ...revealData,
    promptIndex: room.currentVoteIndex,
    totalPrompts: room.roundPrompts.length,
    players: publicState(room).players,
  });

  // Send personal delta to each player
  for (const a of revealData.answers) {
    io.to(a.playerId).emit('score_delta', { points: a.points });
  }

  clearTimeout(room.timers.reveal);
  room.timers.reveal = setTimeout(() => {
    advanceAfterReveal(io, room);
  }, REVEAL_PAUSE);
}

function advanceAfterReveal(io, room) {
  const nextIndex = room.currentVoteIndex + 1;

  if (nextIndex < room.roundPrompts.length) {
    room.currentVoteIndex = nextIndex;
    room.state = 'voting';
    emitCurrentVote(io, room);
  } else {
    // Round over → scoreboard
    room.state = 'scoreboard';
    io.to(room.roomCode).emit('scoreboard', {
      players: publicState(room).players,
      round: room.round,
      isFinal: room.round === 3,
    });
  }
}

function nextRound(io, room, requesterId) {
  if (requesterId !== room.hostId) return;
  if (room.state !== 'scoreboard') return;

  if (room.round >= 3) {
    room.state = 'gameover';
    io.to(room.roomCode).emit('game_over', { players: publicState(room).players });
  } else {
    room.round++;
    startAnswerPhase(io, room);
  }
}

module.exports = {
  createRoom, getRoom, removeRoom, addPlayer,
  markDisconnected, reconnectPlayer,
  publicState, startGame, submitAnswer, castVote, nextRound,
};
