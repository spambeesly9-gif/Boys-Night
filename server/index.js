const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const {
  createRoom, getRoom, removeRoom, addPlayer,
  markDisconnected, publicState, startGame,
  submitAnswer, castVote, nextRound, forceEndGame,
} = require('./rooms');
const {
  createHPRoom, getHPRoom, removeHPRoom, addHPPlayer,
  markHPDisconnected, hpPublicState, startHPGame,
  czarSubmit, submitHPAnswer, startHPVoting,
  castHPVote, nextHPRound, forceEndHPGame,
} = require('./hotpants/gameEngine');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.get('/health', (_, res) => res.json({ ok: true }));

// Track which room each socket belongs to (Quiplash)
const socketRoom = {};
// Track which HP room each socket belongs to
const socketHPRoom = {};

io.on('connection', (socket) => {
  console.log('connect', socket.id);

  // ─── Quiplash handlers ──────────────────────────────────────────────────────

  socket.on('create_room', ({ playerName }) => {
    const name = String(playerName || '').trim().slice(0, 20) || 'Anonymous';
    const room = createRoom(socket.id, name);
    socketRoom[socket.id] = room.roomCode;
    socket.join(room.roomCode);
    socket.emit('room_joined', { roomCode: room.roomCode, playerId: socket.id, isHost: true });
    io.to(room.roomCode).emit('game_state', publicState(room));
  });

  socket.on('join_room', ({ roomCode, playerName }) => {
    const code = String(roomCode || '').toUpperCase().trim();
    const name = String(playerName || '').trim().slice(0, 20) || 'Anonymous';
    const room = getRoom(code);
    if (!room) { socket.emit('join_error', 'Room not found.'); return; }
    if (room.state !== 'lobby') { socket.emit('join_error', 'Game already started.'); return; }
    if (room.players.length >= 8) { socket.emit('join_error', 'Room is full (max 8).'); return; }

    addPlayer(room, socket.id, name);
    socketRoom[socket.id] = code;
    socket.join(code);
    socket.emit('room_joined', { roomCode: code, playerId: socket.id, isHost: false });
    io.to(code).emit('game_state', publicState(room));
  });

  socket.on('start_game', ({ roomCode, config }) => {
    const room = getRoom(roomCode);
    if (!room || room.hostId !== socket.id) return;
    const connected = room.players.filter(p => p.isConnected);
    if (connected.length < 3) {
      socket.emit('join_error', 'Need at least 3 players to start.');
      return;
    }
    startGame(io, room, config || {});
  });

  socket.on('force_end_game', ({ roomCode }) => {
    const room = getRoom(roomCode);
    if (!room) return;
    forceEndGame(io, room, socket.id);
  });

  socket.on('submit_answer', ({ roomCode, promptId, answerText }) => {
    const room = getRoom(roomCode);
    if (!room || room.state !== 'answering') return;
    submitAnswer(io, room, socket.id, promptId, String(answerText || '').trim());
  });

  socket.on('cast_vote', ({ roomCode, promptId, forPlayerId }) => {
    const room = getRoom(roomCode);
    if (!room || room.state !== 'voting') return;
    castVote(io, room, socket.id, promptId, forPlayerId);
  });

  socket.on('next_round', ({ roomCode }) => {
    const room = getRoom(roomCode);
    if (!room) return;
    nextRound(io, room, socket.id);
  });

  // ─── Hot Pants handlers ─────────────────────────────────────────────────────

  socket.on('hp_create_room', ({ playerName }) => {
    const name = String(playerName || '').trim().slice(0, 20) || 'Anonymous';
    const room = createHPRoom(socket.id, name);
    socketHPRoom[socket.id] = room.roomCode;
    socket.join(room.roomCode);
    socket.emit('hp_room_joined', { roomCode: room.roomCode, playerId: socket.id, isHost: true });
    io.to(room.roomCode).emit('hp_game_state', hpPublicState(room));
  });

  socket.on('hp_join_room', ({ roomCode, playerName }) => {
    const code = String(roomCode || '').toUpperCase().trim();
    const name = String(playerName || '').trim().slice(0, 20) || 'Anonymous';
    const room = getHPRoom(code);
    if (!room) { socket.emit('hp_join_error', 'Room not found.'); return; }
    if (room.state !== 'lobby') { socket.emit('hp_join_error', 'Game already started.'); return; }
    if (room.players.length >= 8) { socket.emit('hp_join_error', 'Room is full (max 8).'); return; }

    addHPPlayer(room, socket.id, name);
    socketHPRoom[socket.id] = code;
    socket.join(code);
    socket.emit('hp_room_joined', { roomCode: code, playerId: socket.id, isHost: false });
    io.to(code).emit('hp_game_state', hpPublicState(room));
  });

  socket.on('hp_start_game', ({ roomCode, config }) => {
    const room = getHPRoom(roomCode);
    if (!room || room.hostId !== socket.id) return;
    const connected = room.players.filter(p => p.isConnected);
    if (connected.length < 3) {
      socket.emit('hp_join_error', 'Need at least 3 players to start.');
      return;
    }
    startHPGame(io, room, config || {});
  });

  socket.on('hp_czar_submit', ({ roomCode, imposterId, mainQuestion, imposterQuestion }) => {
    const room = getHPRoom(roomCode);
    if (!room) return;
    const result = czarSubmit(io, room, socket.id, { imposterId, mainQuestion, imposterQuestion });
    if (result && result.error) {
      socket.emit('hp_join_error', result.error);
    }
  });

  socket.on('hp_submit_answer', ({ roomCode, answer }) => {
    const room = getHPRoom(roomCode);
    if (!room) return;
    submitHPAnswer(io, room, socket.id, answer);
  });

  socket.on('hp_czar_advance', ({ roomCode }) => {
    const room = getHPRoom(roomCode);
    if (!room) return;
    const result = startHPVoting(io, room, socket.id);
    if (result && result.error) {
      socket.emit('hp_join_error', result.error);
    }
  });

  socket.on('hp_cast_vote', ({ roomCode, votedForId }) => {
    const room = getHPRoom(roomCode);
    if (!room) return;
    castHPVote(io, room, socket.id, votedForId);
  });

  socket.on('hp_next_round', ({ roomCode }) => {
    const room = getHPRoom(roomCode);
    if (!room) return;
    nextHPRound(io, room, socket.id);
  });

  socket.on('hp_force_end', ({ roomCode }) => {
    const room = getHPRoom(roomCode);
    if (!room) return;
    forceEndHPGame(io, room, socket.id);
  });

  // ─── Disconnect ─────────────────────────────────────────────────────────────

  socket.on('disconnect', () => {
    console.log('disconnect', socket.id);

    // Quiplash cleanup
    const code = socketRoom[socket.id];
    delete socketRoom[socket.id];
    if (code) {
      const room = getRoom(code);
      if (room) {
        markDisconnected(room, socket.id);
        if (room.players.every(p => !p.isConnected)) {
          removeRoom(code);
        } else {
          io.to(code).emit('game_state', publicState(room));
        }
      }
    }

    // Hot Pants cleanup
    const hpCode = socketHPRoom[socket.id];
    delete socketHPRoom[socket.id];
    if (hpCode) {
      const hpRoom = getHPRoom(hpCode);
      if (hpRoom) {
        markHPDisconnected(hpRoom, socket.id);
        if (hpRoom.players.every(p => !p.isConnected)) {
          removeHPRoom(hpCode);
        } else {
          io.to(hpCode).emit('hp_game_state', hpPublicState(hpRoom));
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Boys Night server on :${PORT}`));
