import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class ModalRule extends BasePLNRule {
  readonly name = 'Modal';
  readonly description = 'Handle modal logic operators (possibility and necessity)';
  readonly category = 'Core';
  readonly computationalCost = 0.8;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [modal, proposition] = atoms;
    if (!modal.truthValue || !proposition.truthValue) return [];

    const modalTv = this.isNecessity(modal)
      ? this.calculateNecessity(modal, proposition)
      : this.calculatePossibility(modal, proposition);

    return [this.createResultAtom(
      `modal-${modal.id}-${proposition.id}`,
      this.isNecessity(modal) ? 'NecessityLink' : 'PossibilityLink',
      `Modal(${modal.name},${proposition.name})`,
      [modal.id, proposition.id],
      modalTv
    )];
  }

  private isNecessity(atom: Atom): boolean {
    return atom.name.startsWith('Necessary');
  }

  private calculateNecessity(modal: Atom, proposition: Atom): TruthValue {
    return {
      strength: Math.min(modal.truthValue!.strength, proposition.truthValue!.strength),
      confidence: Math.min(modal.truthValue!.confidence, proposition.truthValue!.confidence) * 0.9
    };
  }

  private calculatePossibility(modal: Atom, proposition: Atom): TruthValue {
    return {
      strength: Math.max(modal.truthValue!.strength * proposition.truthValue!.strength, 0.1),
      confidence: Math.min(modal.truthValue!.confidence, proposition.truthValue!.confidence) * 0.8
    };
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}