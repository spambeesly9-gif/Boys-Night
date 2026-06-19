import { useEffect, useRef, useState, useCallback } from 'react';
import socket from '../../socket';
import HPJoinScreen from '../../components/hotpants/HPJoinScreen';
import HPLobbyScreen from '../../components/hotpants/HPLobbyScreen';
import HPCzarSetup from '../../components/hotpants/HPCzarSetup';
import HPAnswerPhase from '../../components/hotpants/HPAnswerPhase';
import HPReveal from '../../components/hotpants/HPReveal';
import HPVoting from '../../components/hotpants/HPVoting';
import HPResult from '../../components/hotpants/HPResult';
import HPWinnerScreen from '../../components/hotpants/HPWinnerScreen';

export default function HotPantsPage() {
  const [screen, setScreen] = useState('join');
  const [error, setError] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [myId, setMyId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [gameState, setGameState] = useState(null);

  // Per-phase data
  const [czarSetupData, setCzarSetupData] = useState(null);
  const [answerPhaseData, setAnswerPhaseData] = useState(null);
  const [myQuestion, setMyQuestion] = useState('');
  const [isImposter, setIsImposter] = useState(false);
  const [answerStatus, setAnswerStatus] = useState({});
  const [revealData, setRevealData] = useState(null);
  const [votingData, setVotingData] = useState(null);
  const [voteTally, setVoteTally] = useState({});
  const [resultData, setResultData] = useState(null);
  const [winnerData, setWinnerData] = useState(null);

  const roomCodeRef = useRef('');

  useEffect(() => {
    socket.connect();

    socket.on('hp_room_joined', ({ roomCode: code, playerId, isHost: host, reconnectToken }) => {
      if (reconnectToken) sessionStorage.setItem('hp_session', JSON.stringify({ roomCode: code, reconnectToken }));
      setRoomCode(code);
      roomCodeRef.current = code;
      setMyId(playerId);
      setIsHost(host);
      setScreen('lobby');
      setError('');
    });

    socket.on('hp_reconnect_failed', () => {
      sessionStorage.removeItem('hp_session');
      setScreen('join');
    });

    socket.on('hp_join_error', (msg) => { setError(msg); setScreen('join'); });
    socket.on('hp_game_state', (state) => setGameState(state));

    socket.on('hp_czar_setup_start', (data) => {
      setCzarSetupData(data);
      setAnswerPhaseData(null);
      setRevealData(null);
      setVotingData(null);
      setResultData(null);
      setMyQuestion('');
      setIsImposter(false);
      setAnswerStatus({});
      setVoteTally({});
      setScreen('game');
    });

    socket.on('hp_your_question', ({ question, isImposter: imp }) => {
      setMyQuestion(question);
      setIsImposter(imp);
    });

    socket.on('hp_answer_phase', (data) => {
      setAnswerPhaseData(data);
      setCzarSetupData(null);
    });

    socket.on('hp_answer_status', (status) => setAnswerStatus(status));

    socket.on('hp_reveal', (data) => {
      setRevealData(data);
      setAnswerPhaseData(null);
    });

    socket.on('hp_voting_start', (data) => {
      setVotingData(data);
      setRevealData(null);
      setVoteTally({});
    });

    socket.on('hp_vote_tally', ({ tally }) => setVoteTally(tally));

    socket.on('hp_result', (data) => {
      setResultData(data);
      setVotingData(null);
    });

    socket.on('hp_game_over', (data) => {
      setWinnerData(data);
      setResultData(null);
    });

    // Auto-reconnect if we have a saved session
    const saved = sessionStorage.getItem('hp_session');
    if (saved) {
      try {
        const { roomCode: savedCode, reconnectToken } = JSON.parse(saved);
        socket.emit('hp_reconnect_room', { roomCode: savedCode, reconnectToken });
      } catch { sessionStorage.removeItem('hp_session'); }
    }

    return () => {
      socket.off('hp_room_joined');
      socket.off('hp_reconnect_failed');
      socket.off('hp_join_error');
      socket.off('hp_game_state');
      socket.off('hp_czar_setup_start');
      socket.off('hp_your_question');
      socket.off('hp_answer_phase');
      socket.off('hp_answer_status');
      socket.off('hp_reveal');
      socket.off('hp_voting_start');
      socket.off('hp_vote_tally');
      socket.off('hp_result');
      socket.off('hp_game_over');
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback((name) => {
    socket.emit('hp_create_room', { playerName: name });
  }, []);

  const joinRoom = useCallback((code, name) => {
    socket.emit('hp_join_room', { roomCode: code, playerName: name });
  }, []);

  const startGame = useCallback((config) => {
    socket.emit('hp_start_game', { roomCode: roomCodeRef.current, config });
  }, []);

  const czarSubmit = useCallback(({ imposterId, mainQuestion, imposterQuestion }) => {
    socket.emit('hp_czar_submit', { roomCode: roomCodeRef.current, imposterId, mainQuestion, imposterQuestion });
  }, []);

  const submitAnswer = useCallback((answer) => {
    socket.emit('hp_submit_answer', { roomCode: roomCodeRef.current, answer });
  }, []);

  const czarAdvance = useCallback(() => {
    socket.emit('hp_czar_advance', { roomCode: roomCodeRef.current });
  }, []);

  const castVote = useCallback((votedForId) => {
    socket.emit('hp_cast_vote', { roomCode: roomCodeRef.current, votedForId });
  }, []);

  const nextRound = useCallback(() => {
    socket.emit('hp_next_round', { roomCode: roomCodeRef.current });
  }, []);

  const endGame = useCallback(() => {
    socket.emit('hp_force_end', { roomCode: roomCodeRef.current });
  }, []);

  if (screen === 'join') {
    return <HPJoinScreen onCreate={createRoom} onJoin={joinRoom} error={error} />;
  }

  if (screen === 'lobby') {
    return (
      <HPLobbyScreen
        roomCode={roomCode}
        players={gameState?.players ?? []}
        isHost={isHost}
        onStart={startGame}
        myId={myId}
      />
    );
  }

  // In-game screens
  const renderPhase = () => {
    if (winnerData) {
      return <HPWinnerScreen players={winnerData.players} myId={myId} />;
    }

    if (resultData) {
      return (
        <HPResult
          {...resultData}
          myId={myId}
          isHost={isHost}
          round={gameState?.round}
          config={gameState?.config}
          onNext={nextRound}
          onEnd={endGame}
        />
      );
    }

    if (votingData) {
      return (
        <HPVoting
          {...votingData}
          myId={myId}
          voteTally={voteTally}
          onVote={castVote}
        />
      );
    }

    if (revealData) {
      return (
        <HPReveal
          {...revealData}
          myId={myId}
          isHost={isHost}
          onStartVoting={czarAdvance}
        />
      );
    }

    if (answerPhaseData) {
      return (
        <HPAnswerPhase
          {...answerPhaseData}
          myId={myId}
          myQuestion={myQuestion}
          isImposter={isImposter}
          answerStatus={answerStatus}
          players={gameState?.players ?? []}
          onSubmit={submitAnswer}
        />
      );
    }

    if (czarSetupData) {
      return (
        <HPCzarSetup
          {...czarSetupData}
          myId={myId}
          isHost={isHost}
          onSubmit={czarSubmit}
          onEnd={endGame}
        />
      );
    }

    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-display text-2xl italic text-gray-500">Loading…</p>
      </div>
    );
  };

  return <div>{renderPhase()}</div>;
}
