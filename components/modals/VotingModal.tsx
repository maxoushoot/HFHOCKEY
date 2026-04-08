import React from 'react';
import { MVPVote } from '../game/MVPVote';
import { ModalBase } from '../ui/ModalBase';

interface VotingModalProps {
  visible: boolean;
  onClose: () => void;
  match: any;
  onVoteMVP: (playerId: string) => void;
}

export function VotingModal({ visible, onClose, match, onVoteMVP }: VotingModalProps) {
  return (
    <ModalBase visible={visible} onClose={onClose} title="Vote MVP" mode="bottom">
      <MVPVote
        homeTeamId={match?.home_team?.id}
        awayTeamId={match?.away_team?.id}
        onVote={onVoteMVP}
      />
    </ModalBase>
  );
}
