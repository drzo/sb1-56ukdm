import { describe, it, expect, beforeEach } from 'vitest';
import { AttentionBank } from '../../opencog/attention/AttentionBank';
import { Node } from '../../types/Node';
import { NodeType } from '../../types/AtomTypes';

describe('AttentionBank', () => {
  let attentionBank: AttentionBank;
  let testAtom: Node;

  beforeEach(() => {
    attentionBank = AttentionBank.getInstance();
    testAtom = new Node(NodeType.CONCEPT, 'TestAtom');
  });

  it('should update STI values', async () => {
    const initialAV = attentionBank.getAttentionValue(testAtom);
    await attentionBank.updateSTI(testAtom, 50);
    
    // Wait for async update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const updatedAV = attentionBank.getAttentionValue(testAtom);
    expect(updatedAV.sti).toBeGreaterThan(initialAV.sti);
  });

  it('should set LTI values', () => {
    attentionBank.setLTI(testAtom, 75);
    const av = attentionBank.getAttentionValue(testAtom);
    expect(av.lti).toBe(75);
  });

  it('should set VLTI flag', () => {
    attentionBank.setVLTI(testAtom, true);
    const av = attentionBank.getAttentionValue(testAtom);
    expect(av.vlti).toBe(true);
  });

  it('should get top STI atoms', async () => {
    const atom1 = new Node(NodeType.CONCEPT, 'HighSTI');
    const atom2 = new Node(NodeType.CONCEPT, 'LowSTI');

    await attentionBank.updateSTI(atom1, 90);
    await attentionBank.updateSTI(atom2, 30);

    // Wait for async updates
    await new Promise(resolve => setTimeout(resolve, 100));

    const topAtoms = attentionBank.getTopSTIAtoms(2);
    expect(topAtoms).toHaveLength(2);
    expect(topAtoms[0].av.sti).toBeGreaterThan(topAtoms[1].av.sti);
  });

  it('should calculate attention distribution', async () => {
    await attentionBank.updateSTI(testAtom, 50);
    
    // Wait for async update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const distribution = attentionBank.getAttentionDistribution();
    expect(distribution.totalAtoms).toBeGreaterThan(0);
    expect(distribution.meanSTI).toBeDefined();
    expect(distribution.stdDevSTI).toBeDefined();
  });
});