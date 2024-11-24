import { Atom } from '../../types';
import { ECANConfig } from './ecan-config';
import { AttentionDynamics } from './attention-dynamics';

export class TournamentSelection {
  private dynamics: AttentionDynamics;

  constructor(private config: ECANConfig) {
    this.dynamics = new AttentionDynamics(config);
  }

  selectAtoms(atoms: Atom[], count: number): Atom[] {
    const selected: Atom[] = [];
    
    while (selected.length < count) {
      const tournament = this.selectTournamentParticipants(atoms);
      const winner = this.runTournament(tournament);
      if (winner) {
        selected.push(winner);
      }
    }

    return selected;
  }

  private selectTournamentParticipants(atoms: Atom[]): Atom[] {
    const participants: Atom[] = [];
    
    while (participants.length < this.config.tournamentSize) {
      const randomIndex = Math.floor(Math.random() * atoms.length);
      const atom = atoms[randomIndex];
      if (!participants.includes(atom)) {
        participants.push(atom);
      }
    }

    return participants;
  }

  private runTournament(participants: Atom[]): Atom | null {
    if (participants.length === 0) return null;

    return participants.reduce((winner, current) => {
      if (!winner) return current;

      const winnerScore = this.dynamics.calculateImportance(winner);
      const currentScore = this.dynamics.calculateImportance(current);

      if (Math.random() < this.config.selectionPressure) {
        return winnerScore > currentScore ? winner : current;
      } else {
        return Math.random() < 0.5 ? winner : current;
      }
    });
  }
}