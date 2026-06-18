import { useEffect, useRef, useState, useCallback } from 'react';
import socket from '../../socket';
import JoinScreen from '../../components/quiplash/JoinScreen';
import LobbyScreen from '../../components/quiplash/LobbyScreen';
import AnswerPhase from '../../components/quiplash/AnswerPhase';
import VotingPhase from '../../components/quiplash/VotingPhase';
import RevealScreen from '../../components/quiplash/RevealScreen';
import ScoreboardScreen from '../../components/quiplash/ScoreboardScreen';
import WinnerScreen from '../../components/quiplash/WinnerScreen';

export default function QuiplashPage() {
  const [screen, setScreen] = useState('join'); // join | lobby | game
  const [error, setError] = useState('');

  // Room / player info
  const [roomCode, setRoomCode] = useState('');
  const [myId, setMyId] = useState('');
  const [isHost, setIsHost] = useState(false);

  // Shared game state
  const [gameState, setGameState] = useState(null); // { state, round, players, ... }

  // Phase-specific data
  const [answerPhaseData, setAnswerPhaseData] = useState(null);   // { round, duration }
  const [myPrompts, setMyPrompts] = useState([]);                  // prompts I need to answer
  const [answerStatus, setAnswerStatus] = useState({});            // playerId → bool
  const [votingData, setVotingData] = useState(null);              // current prompt voting info
  const [voteTally, setVoteTally] = useState({});
  const [revealData, setRevealData] = useState(null);
  const [scoreboardData, setScoreboardData] = useState(null);
  const [winnerData, setWinnerData] = useState(null);
  const [scoreDelta, setScoreDelta] = useState(null);

  const myIdRef = useRef('');

  useEffect(() => {
    socket.connect();

    socket.on('room_joined', ({ roomCode: code, playerId, isHost: host }) => {
      setRoomCode(code);
      setMyId(playerId);
      myIdRef.current = playerId;
      setIsHost(host);
      setScreen('lobby');
      setError('');
    });

    socket.on('join_error', (msg) => setError(msg));

    socket.on('game_state', (state) => {
      setGameState(state);
    });

    socket.on('answer_phase_start', (data) => {
      setAnswerPhaseData(data);
      setMyPrompts([]);
      setAnswerStatus({});
      setRevealData(null);
      setScoreboardData(null);
      setVotingData(null);
      setScreen('game');
    });

    socket.on('your_prompts', (prompts) => {
      setMyPrompts(prompts);
    });

    socket.on('answer_status', (status) => {
      setAnswerStatus(status);
    });

    socket.on('voting_start', (data) => {
      setVotingData(data);
      setVoteTally({});
      setRevealData(null);
    });

    socket.on('vote_tally', ({ tally }) => {
      setVoteTally(tally);
    });

    socket.on('reveal', (data) => {
      setRevealData(data);
      setVotingData(null);
    });

    socket.on('score_delta', ({ points }) => {
      setScoreDelta(points);
      setTimeout(() => setScoreDelta(null), 3000);
    });

    socket.on('scoreboard', (data) => {
      setScoreboardData(data);
      setRevealData(null);
      setVotingData(null);
      setAnswerPhaseData(null);
    });

    socket.on('game_over', (data) => {
      setWinnerData(data);
    });

    return () => {
      socket.off('room_joined');
      socket.off('join_error');
      socket.off('game_state');
      socket.off('answer_phase_start');
      socket.off('your_prompts');
      socket.off('answer_status');
      socket.off('voting_start');
      socket.off('vote_tally');
      socket.off('reveal');
      socket.off('score_delta');
      socket.off('scoreboard');
      socket.off('game_over');
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback((name) => {
    socket.emit('create_room', { playerName: name });
  }, []);

  const joinRoom = useCallback((code, name) => {
    socket.emit('join_room', { roomCode: code, playerName: name });
  }, []);

  const startGame = useCallback(() => {
    socket.emit('start_game', { roomCode });
  }, [roomCode]);

  const submitAnswer = useCallback((promptId, answerText) => {
    socket.emit('submit_answer', { roomCode, promptId, answerText });
  }, [roomCode]);

  const castVote = useCallback((promptId, forPlayerId) => {
    socket.emit('cast_vote', { roomCode, promptId, forPlayerId });
  }, [roomCode]);

  const nextRound = useCallback(() => {
    socket.emit('next_round', { roomCode });
  }, [roomCode]);

  if (screen === 'join') {
    return <JoinScreen onCreate={createRoom} onJoin={joinRoom} error={error} />;
  }

  if (screen === 'lobby') {
    return (
      <LobbyScreen
        roomCode={roomCode}
        players={gameState?.players ?? []}
        isHost={isHost}
        onStart={startGame}
        myId={myId}
      />
    );
  }

  // game screen — decide which phase component to show
  const phase = gameState?.state;

  if (winnerData) {
    return <WinnerScreen players={winnerData.players} myId={myId} />;
  }

  if (scoreboardData) {
    return (
      <ScoreboardScreen
        {...scoreboardData}
        isHost={isHost}
        onNext={nextRound}
        myId={myId}
      />
    );
  }

  if (revealData) {
    return (
      <RevealScreen
        {...revealData}
        myId={myId}
        scoreDelta={scoreDelta}
        players={gameState?.players ?? []}
      />
    );
  }

  if (votingData) {
    return (
      <VotingPhase
        {...votingData}
        myId={myId}
        voteTally={voteTally}
        onVote={castVote}
        players={gameState?.players ?? []}
      />
    );
  }

  if (phase === 'answering' || answerPhaseData) {
    return (
      <AnswerPhase
        round={answerPhaseData?.round ?? gameState?.round}
        duration={answerPhaseData?.duration ?? 90}
        myPrompts={myPrompts}
        answerStatus={answerStatus}
        players={gameState?.players ?? []}
        myId={myId}
        onSubmitAnswer={submitAnswer}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7ff] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">⏳</div>
        <p className="font-display text-2xl text-gray-600">Waiting for game to start…</p>
      </div>
    </div>
  );
}
