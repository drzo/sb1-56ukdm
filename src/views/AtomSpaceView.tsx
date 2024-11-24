import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AtomSpaceProvider } from '@/atomspace/core/AtomSpaceProvider'
import { NodeType, LinkType } from '@/types/AtomTypes'
import { Logger } from '@/cogutil/Logger'
import { PLNReasoner } from '@/opencog/reasoning/PLNReasoner'
import { AttentionBank } from '@/opencog/attention/AttentionBank'
import { PatternMiner } from '@/opencog/learning/PatternMiner'
import { AtomSpaceStats } from '@/components/atomspace/AtomSpaceStats'
import { AddNodeForm } from '@/components/atomspace/AddNodeForm'
import { AtomList } from '@/components/atomspace/AtomList'

const atomspaceProvider = AtomSpaceProvider.getInstance();
const atomspace = atomspaceProvider.getAtomSpace();
const reasoner = new PLNReasoner();
const attentionBank = AttentionBank.getInstance();
const patternMiner = new PatternMiner();

export function AtomSpaceView() {
  const [nodeName, setNodeName] = useState('')
  const [nodeStrength, setNodeStrength] = useState('0.9')
  const [nodeConfidence, setNodeConfidence] = useState('0.8')
  const [atoms, setAtoms] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    atomCount: 0,
    nodeCount: 0,
    linkCount: 0,
    patterns: 0,
    avgAttention: 0
  })

  useEffect(() => {
    const updateStats = async () => {
      try {
        const allAtoms = atomspace.getAllAtoms();
        const nodes = allAtoms.filter(atom => 
          Object.values(NodeType).includes(atom.getType() as NodeType)
        );
        const links = allAtoms.filter(atom => 
          Object.values(LinkType).includes(atom.getType() as LinkType)
        );

        const patterns = await patternMiner.minePatterns(allAtoms);
        const attention = attentionBank.getAttentionDistribution();

        setStats({
          atomCount: allAtoms.length,
          nodeCount: nodes.length,
          linkCount: links.length,
          patterns: patterns.length,
          avgAttention: attention.meanSTI
        });
      } catch (err) {
        Logger.error('Failed to update stats:', err);
        setError('Failed to update AtomSpace statistics');
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const addNode = async () => {
    try {
      if (!nodeName.trim()) {
        setError('Node name cannot be empty');
        return;
      }

      const node = atomspace.addNode(NodeType.CONCEPT, nodeName, {
        strength: parseFloat(nodeStrength),
        confidence: parseFloat(nodeConfidence)
      });

      await attentionBank.updateSTI(node, 50);

      setAtoms(prev => [...prev, {
        id: node.getId(),
        type: node.getType(),
        name: nodeName,
        tv: node.getTruthValue(),
        attention: attentionBank.getAttentionValue(node)
      }]);

      setNodeName('');
      setError(null);
      Logger.info(`Added node: ${nodeName}`);
    } catch (err) {
      Logger.error('Failed to add node:', err);
      setError(err instanceof Error ? err.message : 'Failed to add node');
    }
  };

  const addLink = async () => {
    try {
      if (atoms.length < 2) {
        setError('Need at least 2 nodes to create a link');
        return;
      }

      const [node1, node2] = atoms.slice(-2);
      const atom1 = atomspace.getAtom(node1.id);
      const atom2 = atomspace.getAtom(node2.id);

      if (!atom1 || !atom2) {
        setError('Selected atoms not found');
        return;
      }

      const link = atomspace.addLink(LinkType.INHERITANCE, [atom1, atom2], {
        strength: 0.9,
        confidence: 0.8
      });

      await attentionBank.updateSTI(link, 30);

      setAtoms(prev => [...prev, {
        id: link.getId(),
        type: link.getType(),
        outgoing: [node1.id, node2.id],
        tv: link.getTruthValue(),
        attention: attentionBank.getAttentionValue(link)
      }]);

      const premises = [link];
      const conclusion = atomspace.addLink(LinkType.INHERITANCE, [atom2, atom1]);
      const inference = await reasoner.deductiveInference(premises, conclusion);

      if (inference.valid) {
        Logger.info(`Valid inference found with confidence ${inference.confidence}`);
      }

      setError(null);
    } catch (err) {
      Logger.error('Failed to add link:', err);
      setError(err instanceof Error ? err.message : 'Failed to add link');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AtomSpace Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md">
            {error}
          </div>
        )}

        <AtomSpaceStats stats={stats} />

        <AddNodeForm
          nodeName={nodeName}
          nodeStrength={nodeStrength}
          nodeConfidence={nodeConfidence}
          onNodeNameChange={setNodeName}
          onNodeStrengthChange={setNodeStrength}
          onNodeConfidenceChange={setNodeConfidence}
          onAddNode={addNode}
          onAddLink={addLink}
          disableAddLink={atoms.length < 2}
        />

        <AtomList atoms={atoms} />
      </CardContent>
    </Card>
  );
}