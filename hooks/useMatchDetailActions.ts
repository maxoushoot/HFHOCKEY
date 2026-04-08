import { useRef, useState } from 'react';
import ConfettiCannon from 'react-native-confetti-cannon';

interface UseMatchDetailActionsParams {
  matchId?: string;
  voteMVP: (matchId: string, playerId: string) => void;
  submitPrediction: (matchId: string, homeScore: number, awayScore: number) => void;
}

export function useMatchDetailActions({ matchId, voteMVP, submitPrediction }: UseMatchDetailActionsParams) {
  const [isVoteModalVisible, setIsVoteModalVisible] = useState(false);
  const [isPredictionModalVisible, setIsPredictionModalVisible] = useState(false);
  const [showMatchQuiz, setShowMatchQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const confettiRef = useRef<ConfettiCannon>(null);

  const onVoteMVP = (playerId: string) => {
    if (!matchId) return;
    voteMVP(matchId, playerId);
    setTimeout(() => {
      setIsVoteModalVisible(false);
      setTimeout(() => confettiRef.current?.start(), 300);
    }, 800);
  };

  const onSubmitPrediction = (homeScore: number, awayScore: number) => {
    if (!matchId) return;
    submitPrediction(matchId, homeScore, awayScore);
    setTimeout(() => confettiRef.current?.start(), 500);
  };

  return {
    activeTab,
    setActiveTab,
    isVoteModalVisible,
    setIsVoteModalVisible,
    isPredictionModalVisible,
    setIsPredictionModalVisible,
    showMatchQuiz,
    setShowMatchQuiz,
    confettiRef,
    onVoteMVP,
    onSubmitPrediction,
  };
}
