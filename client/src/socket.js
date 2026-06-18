import { io } from 'socket.io-client';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

const socket = io(SERVER, { autoConnect: false });

export default socket;
