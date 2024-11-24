import { Atom, TruthValue } from '../../types';
import { PLNRule } from './pln-rule';

export class ImportanceDiffusionRule implements PLNRule {
  name = 'ImportanceDiffusion';
  description = 'Spread STI along HebbianLinks based on truth values';

  apply(atoms: Atom[]): Atom[] {
    if (!this.validate(atoms)) return [];
    
    const [source, target, hebbianLink] = atoms;
    if (!source.attention || !target.attention || !hebbianLink.truthValue) return [];

    // Calculate diffusion amount based on source STI and hebbian strength
    const diffusionAmount = source.attention.sti * hebbianLink.truthValue.strength;
    
    // Create new attention values reflecting the diffusion
    const newSourceAttention = {
      ...source.attention,
      sti: source.attention.sti - diffusionAmount
    };

    const newTargetAttention = {
      ...target.attention,
      sti: target.attention.sti + diffusionAmount
    };

    return [
      {
        ...source,
        attention: newSourceAttention
      },
      {
        ...target,
        attention: newTargetAttention
      }
    ];
  }

  validate(atoms: Atom[]): boolean {
    return atoms.length === 3 && 
           atoms[2].type === 'HebbianLink' &&
           atoms.every(atom => atom.attention !== undefined);
  }
}