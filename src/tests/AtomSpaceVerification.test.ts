import { describe, it, expect, beforeEach } from 'vitest';
import { AtomSpace } from '../AtomSpace';
import { HyperonDAS } from '../hyperon/HyperonDAS';
import { NodeType, LinkType } from '../types/AtomTypes';

describe('AtomSpace Verification Suite', () => {
  let atomspace: AtomSpace;
  let hyperonDAS: HyperonDAS;

  beforeEach(() => {
    atomspace = new AtomSpace();
    hyperonDAS = new HyperonDAS();
  });

  describe('Core AtomSpace Functions', () => {
    it('should create and retrieve nodes', () => {
      const human = atomspace.addNode(NodeType.CONCEPT, 'Human');
      const retrieved = atomspace.getAtom(human.getId());
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.getType()).toBe(NodeType.CONCEPT);
    });

    it('should handle truth values', () => {
      const node = atomspace.addNode(NodeType.CONCEPT, 'Test');
      node.setTruthValue({ strength: 0.8, confidence: 0.9 });
      
      const tv = node.getTruthValue();
      expect(tv.strength).toBe(0.8);
      expect(tv.confidence).toBe(0.9);
    });
  });

  describe('Hyperon DAS Integration', () => {
    it('should add and query atoms in distributed system', async () => {
      const node = await hyperonDAS.addNode(NodeType.CONCEPT, 'Human', {
        strength: 0.9,
        confidence: 0.8
      });

      const results = await hyperonDAS.query({
        type: NodeType.CONCEPT,
        name: 'Human'
      });

      expect(results).toHaveLength(1);
      expect(results[0].getId()).toBe(node.getId());
    });

    it('should create complex relationship patterns', async () => {
      const human = await hyperonDAS.addNode(NodeType.CONCEPT, 'Human');
      const mammal = await hyperonDAS.addNode(NodeType.CONCEPT, 'Mammal');
      const animal = await hyperonDAS.addNode(NodeType.CONCEPT, 'Animal');

      await hyperonDAS.addLink(LinkType.INHERITANCE, [human, mammal]);
      await hyperonDAS.addLink(LinkType.INHERITANCE, [mammal, animal]);

      const allAtoms = await hyperonDAS.getAllAtoms();
      expect(allAtoms).toHaveLength(5);
    });
  });
});