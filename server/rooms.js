const { assignRound, fillMissingAnswers, tallyReveal, generateRoomCode } = require('./quiplash/gameEngine');

const REVEAL_PAUSE = 5000;
const rooms = {};

function createRoom(hostId, hostName) {
  let code;
  do { code = generateRoomCode(); } while (rooms[code]);

  rooms[code] = {
    roomCode: code,
    hostId,
    players: [{ id: hostId, name: hostName, score: 0, isConnected: true, isHost: true }],
    state: 'lobby',
    round: 0,
    totalRounds: 4,
    answerTime: 90,
    voteTime: 30,
    roundPrompts: [],
    currentVoteIndex: 0,
    usedPromptIds: new Set(),
    timers: {},
  };
  return rooms[code];
}

function getRoom(code) { return rooms[code?.toUpperCase()] ?? null; }

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

function publicState(room) {
  return {
    roomCode: room.roomCode,
    state: room.state,
    round: room.round,
    totalRounds: room.totalRounds,
    answerTime: room.answerTime,
    voteTime: room.voteTime,
    players: room.players.map(({ id, name, score, isConnected, isHost }) =>
      ({ id, name, score, isConnected, isHost })
    ),
    currentVoteIndex: room.currentVoteIndex,
    totalPrompts: room.roundPrompts.length,
  };
}

function startGame(io, room, config = {}) {
  const raw = config.rounds ?? 4;
  room.totalRounds = (raw === 'Endless' || raw === 'endless') ? Infinity : (Number(raw) || 4);
  room.answerTime  = config.answerTime ?? 90;
  room.voteTime    = config.voteTime ?? 30;
  room.round = 1;
  room.usedPromptIds = new Set();
  startAnswerPhase(io, room);
}

function startAnswerPhase(io, room) {
  room.state = 'answering';
  room.roundPrompts = assignRound(
    room.players.filter(p => p.isConnected).map(p => p.id),
    room.usedPromptIds,
    room.round === room.totalRounds,
    room.round
  );
  room.currentVoteIndex = 0;

  io.to(room.roomCode).emit('game_state', publicState(room));
  io.to(room.roomCode).emit('answer_phase_start', { round: room.round, duration: room.answerTime });

  const playerPromptMap = {};
  for (const prompt of room.roundPrompts) {
    for (const pid of prompt.assignedPlayerIds) {
      if (!playerPromptMap[pid]) playerPromptMap[pid] = [];
      playerPromptMap[pid].push({ promptId: prompt.promptId, promptText: prompt.promptText, promptImage: prompt.promptImage ?? null });
    }
  }
  for (const [pid, prompts] of Object.entries(playerPromptMap)) {
    io.to(pid).emit('your_prompts', prompts);
  }

  clearTimeout(room.timers.answer);
  if (room.answerTime > 0) room.timers.answer = setTimeout(() => advanceToVoting(io, room), room.answerTime * 1000);
}

function submitAnswer(io, room, playerId, promptId, text) {
  const prompt = room.roundPrompts.find(p => p.promptId === promptId);
  if (!prompt || !prompt.assignedPlayerIds.includes(playerId)) return;
  if (prompt.answers.find(a => a.playerId === playerId)) return;

  prompt.answers.push({ playerId, text: text.trim().slice(0, 200) || 'Nothing.' });

  const answerStatus = {};
  for (const p of room.roundPrompts) {
    for (const pid of p.assignedPlayerIds) {
      if (!answerStatus[pid]) answerStatus[pid] = true;
      if (!p.answers.find(a => a.playerId === pid)) answerStatus[pid] = false;
    }
  }
  io.to(room.roomCode).emit('answer_status', answerStatus);

  const allDone = room.roundPrompts.every(p =>
    p.assignedPlayerIds.every(pid => p.answers.find(a => a.playerId === pid))
  );
  if (allDone) { clearTimeout(room.timers.answer); advanceToVoting(io, room); }
}

function advanceToVoting(io, room) {
  for (const p of room.roundPrompts) fillMissingAnswers(p);
  room.state = 'voting';
  room.currentVoteIndex = 0;
  emitCurrentVote(io, room);
}

function emitCurrentVote(io, room) {
  const prompt = room.roundPrompts[room.currentVoteIndex];
  if (!prompt) return;

  const connectedIds = room.players.filter(p => p.isConnected).map(p => p.id);
  const isAllPlay = connectedIds.every(id => prompt.assignedPlayerIds.includes(id));

  const shuffledAnswers = [...prompt.answers].sort(() => Math.random() - 0.5);
  io.to(room.roomCode).emit('voting_start', {
    promptId: prompt.promptId,
    promptText: prompt.promptText,
    promptImage: prompt.promptImage ?? null,
    assignedPlayerIds: prompt.assignedPlayerIds,
    answers: shuffledAnswers.map(a => ({ playerId: a.playerId, text: a.text })),
    promptIndex: room.currentVoteIndex,
    totalPrompts: room.roundPrompts.length,
    duration: room.voteTime,
    round: room.round,
    isAllPlay,
  });

  clearTimeout(room.timers.vote);
  if (room.voteTime > 0) room.timers.vote = setTimeout(() => revealCurrentPrompt(io, room), room.voteTime * 1000);
}

function castVote(io, room, voterId, promptId, forPlayerId) {
  if (room.state !== 'voting') return;
  const prompt = room.roundPrompts[room.currentVoteIndex];
  if (!prompt || prompt.promptId !== promptId) return;

  const connectedIds = room.players.filter(p => p.isConnected).map(p => p.id);
  const isAllPlay = connectedIds.every(id => prompt.assignedPlayerIds.includes(id));

  if (isAllPlay) {
    if (voterId === forPlayerId) return; // can't vote for yourself
  } else {
    if (prompt.assignedPlayerIds.includes(voterId)) return; // assigned players don't vote in normal rounds
  }

  if (prompt.votes.find(v => v.voterId === voterId)) return;
  if (!prompt.answers.find(a => a.playerId === forPlayerId)) return;

  prompt.votes.push({ voterId, forPlayerId });

  const tally = {};
  for (const a of prompt.answers) {
    tally[a.playerId] = prompt.votes.filter(v => v.forPlayerId === a.playerId).length;
  }
  io.to(room.roomCode).emit('vote_tally', { promptId, tally });

  const eligibleVoters = room.players.filter(p => {
    if (!p.isConnected) return false;
    if (isAllPlay) return true;
    return !prompt.assignedPlayerIds.includes(p.id);
  });
  if (eligibleVoters.length > 0 && eligibleVoters.every(p => prompt.votes.find(v => v.voterId === p.id))) {
    clearTimeout(room.timers.vote);
    revealCurrentPrompt(io, room);
  }
}

function revealCurrentPrompt(io, room) {
  room.state = 'reveal';
  const prompt = room.roundPrompts[room.currentVoteIndex];
  const revealData = tallyReveal(prompt, room.players, room.round, room.totalRounds);

  io.to(room.roomCode).emit('reveal', {
    ...revealData,
    promptIndex: room.currentVoteIndex,
    totalPrompts: room.roundPrompts.length,
    players: publicState(room).players,
  });

  for (const a of revealData.answers) {
    io.to(a.playerId).emit('score_delta', { points: a.points });
  }

  clearTimeout(room.timers.reveal);
  room.timers.reveal = setTimeout(() => advanceAfterReveal(io, room), REVEAL_PAUSE);
}

function advanceAfterReveal(io, room) {
  const nextIndex = room.currentVoteIndex + 1;
  if (nextIndex < room.roundPrompts.length) {
    room.currentVoteIndex = nextIndex;
    room.state = 'voting';
    emitCurrentVote(io, room);
  } else {
    room.state = 'scoreboard';
    const isEndless = room.totalRounds === Infinity;
    io.to(room.roomCode).emit('scoreboard', {
      players: publicState(room).players,
      round: room.round,
      isFinal: !isEndless && room.round === room.totalRounds,
      isEndless,
    });
  }
}

function nextRound(io, room, requesterId) {
  if (requesterId !== room.hostId) return;
  if (room.state !== 'scoreboard') return;
  if (room.totalRounds !== Infinity && room.round >= room.totalRounds) {
    endGame(io, room);
  } else {
    room.round++;
    startAnswerPhase(io, room);
  }
}

function endGame(io, room) {
  Object.values(room.timers).forEach(clearTimeout);
  room.state = 'gameover';
  io.to(room.roomCode).emit('game_over', { players: publicState(room).players });
}

function forceEndGame(io, room, requesterId) {
  if (requesterId !== room.hostId) return;
  endGame(io, room);
}

module.exports = {
  createRoom, getRoom, removeRoom, addPlayer,
  markDisconnected, publicState, startGame,
  submitAnswer, castVote, nextRound, forceEndGame,
};
