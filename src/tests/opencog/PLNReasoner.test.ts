import { describe, it, expect, beforeEach } from 'vitest';
import { PLNReasoner } from '../../opencog/reasoning/PLNReasoner';
import { Link } from '../../types/Link';
import { Node } from '../../types/Node';
import { NodeType, LinkType } from '../../types/AtomTypes';

describe('PLNReasoner', () => {
  let reasoner: PLNReasoner;
  let premises: Link[];
  let conclusion: Link;

  beforeEach(() => {
    reasoner = new PLNReasoner();

    const human = new Node(NodeType.CONCEPT, 'Human');
    const mortal = new Node(NodeType.CONCEPT, 'Mortal');
    const socrates = new Node(NodeType.CONCEPT, 'Socrates');

    premises = [
      new Link(LinkType.INHERITANCE, [human, mortal], { strength: 0.9, confidence: 0.8 }),
      new Link(LinkType.INHERITANCE, [socrates, human], { strength: 0.9, confidence: 0.9 })
    ];

    conclusion = new Link(LinkType.INHERITANCE, [socrates, mortal]);
  });

  it('should perform deductive inference', async () => {
    const result = await reasoner.deductiveInference(premises, conclusion);
    expect(result.valid).toBe(true);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('should perform abductive inference', async () => {
    const observation = premises[0];
    const explanation = premises[1];
    
    const result = await reasoner.abductiveInference(observation, explanation);
    expect(result.plausible).toBeDefined();
    expect(result.probability).toBeGreaterThan(0);
  });

  it('should perform inductive generalization', async () => {
    const instances = [
      new Node(NodeType.CONCEPT, 'Dog', { strength: 0.8, confidence: 0.7 }),
      new Node(NodeType.CONCEPT, 'Cat', { strength: 0.9, confidence: 0.8 })
    ];
    const animal = new Node(NodeType.CONCEPT, 'Animal');

    const result = await reasoner.inductiveGeneralization(instances, animal);
    expect(result.strength).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
  });
});