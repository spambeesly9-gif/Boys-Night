import { useEffect, useRef, useState, useCallback } from 'react';
import socket from '../../socket';
import { startLobbyMusic, stopLobbyMusic } from '../../utils/sounds';
import JoinScreen from '../../components/quiplash/JoinScreen';
import LobbyScreen from '../../components/quiplash/LobbyScreen';
import AnswerPhase from '../../components/quiplash/AnswerPhase';
import VotingPhase from '../../components/quiplash/VotingPhase';
import RevealScreen from '../../components/quiplash/RevealScreen';
import ScoreboardScreen from '../../components/quiplash/ScoreboardScreen';
import WinnerScreen from '../../components/quiplash/WinnerScreen';
import InGameMenu from '../../components/quiplash/InGameMenu';

export default function QuiplashPage() {
  const [screen, setScreen] = useState('join');
  const [error, setError] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [myId, setMyId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [answerPhaseData, setAnswerPhaseData] = useState(null);
  const [myPrompts, setMyPrompts] = useState([]);
  const [answerStatus, setAnswerStatus] = useState({});
  const [votingData, setVotingData] = useState(null);
  const [voteTally, setVoteTally] = useState({});
  const [revealData, setRevealData] = useState(null);
  const [scoreboardData, setScoreboardData] = useState(null);
  const [winnerData, setWinnerData] = useState(null);
  const [scoreDelta, setScoreDelta] = useState(null);

  const roomCodeRef = useRef('');

  useEffect(() => {
    socket.connect();

    socket.on('room_joined', ({ roomCode: code, playerId, isHost: host }) => {
      setRoomCode(code);
      roomCodeRef.current = code;
      setMyId(playerId);
      setIsHost(host);
      setScreen('lobby');
      setError('');
      startLobbyMusic();
    });

    socket.on('join_error', (msg) => setError(msg));
    socket.on('game_state', (state) => setGameState(state));

    socket.on('answer_phase_start', (data) => {
      stopLobbyMusic();
      setAnswerPhaseData(data);
      setMyPrompts([]);
      setAnswerStatus({});
      setRevealData(null);
      setScoreboardData(null);
      setVotingData(null);
      setScreen('game');
    });

    socket.on('your_prompts', (prompts) => setMyPrompts(prompts));
    socket.on('answer_status', (status) => setAnswerStatus(status));

    socket.on('voting_start', (data) => {
      setVotingData(data);
      setVoteTally({});
      setRevealData(null);
    });

    socket.on('vote_tally', ({ tally }) => setVoteTally(tally));

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

    socket.on('game_over', (data) => setWinnerData(data));

    return () => {
      socket.off('room_joined'); socket.off('join_error'); socket.off('game_state');
      socket.off('answer_phase_start'); socket.off('your_prompts'); socket.off('answer_status');
      socket.off('voting_start'); socket.off('vote_tally'); socket.off('reveal');
      socket.off('score_delta'); socket.off('scoreboard'); socket.off('game_over');
      socket.disconnect();
      stopLobbyMusic();
    };
  }, []);

  const createRoom = useCallback((name) => socket.emit('create_room', { playerName: name }), []);
  const joinRoom  = useCallback((code, name) => socket.emit('join_room', { roomCode: code, playerName: name }), []);

  const startGame = useCallback((config) => {
    socket.emit('start_game', { roomCode: roomCodeRef.current, config });
  }, []);

  const submitAnswer = useCallback((promptId, answerText) => {
    socket.emit('submit_answer', { roomCode: roomCodeRef.current, promptId, answerText });
  }, []);

  const castVote = useCallback((promptId, forPlayerId) => {
    socket.emit('cast_vote', { roomCode: roomCodeRef.current, promptId, forPlayerId });
  }, []);

  const nextRound = useCallback(() => {
    socket.emit('next_round', { roomCode: roomCodeRef.current });
  }, []);

  const endGame = useCallback(() => {
    socket.emit('force_end_game', { roomCode: roomCodeRef.current });
  }, []);

  if (screen === 'join') return <JoinScreen onCreate={createRoom} onJoin={joinRoom} error={error} />;

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

  // In-game — render current phase + floating menu
  const phase = gameState?.state;

  const renderPhase = () => {
    if (winnerData) return <WinnerScreen players={winnerData.players} myId={myId} />;
    if (scoreboardData) return <ScoreboardScreen {...scoreboardData} isHost={isHost} onNext={nextRound} myId={myId} />;
    if (revealData) return <RevealScreen {...revealData} myId={myId} scoreDelta={scoreDelta} players={gameState?.players ?? []} />;
    if (votingData) return <VotingPhase {...votingData} myId={myId} voteTally={voteTally} onVote={castVote} players={gameState?.players ?? []} />;
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
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-display text-2xl italic text-gray-500">Loading…</p>
      </div>
    );
  };

  return (
    <div className="relative">
      {renderPhase()}
      {!winnerData && <InGameMenu isHost={isHost} onEndGame={endGame} />}
    </div>
  );
}
