const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const {
  createRoom, getRoom, removeRoom, addPlayer,
  markDisconnected, publicState, startGame,
  submitAnswer, castVote, nextRound, forceEndGame,
} = require('./rooms');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.get('/health', (_, res) => res.json({ ok: true }));

// Track which room each socket belongs to
const socketRoom = {};

io.on('connection', (socket) => {
  console.log('connect', socket.id);

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

  socket.on('disconnect', () => {
    console.log('disconnect', socket.id);
    const code = socketRoom[socket.id];
    delete socketRoom[socket.id];
    if (!code) return;

    const room = getRoom(code);
    if (!room) return;

    markDisconnected(room, socket.id);

    if (room.players.every(p => !p.isConnected)) {
      removeRoom(code);
    } else {
      io.to(code).emit('game_state', publicState(room));
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Boys Night server on :${PORT}`));
