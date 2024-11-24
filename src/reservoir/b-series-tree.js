// B-Series Rooted Tree implementation for reservoir structure
export class BSeriesTree {
  constructor() {
    this.root = null;
    this.nodes = new Map();
  }

  // Create a new tree node
  createNode(id, value) {
    const node = {
      id,
      value,
      children: [],
      parent: null,
      depth: 0
    };
    
    this.nodes.set(id, node);
    return node;
  }

  // Add child node to parent
  addChild(parentId, childId) {
    const parent = this.nodes.get(parentId);
    const child = this.nodes.get(childId);
    
    if (parent && child) {
      child.parent = parent;
      child.depth = parent.depth + 1;
      parent.children.push(child);
      return true;
    }
    return false;
  }

  // Get tree structure at given depth
  getLevel(depth) {
    return Array.from(this.nodes.values())
      .filter(node => node.depth === depth);
  }

  // Convert tree to reservoir structure
  toReservoir() {
    const reservoirNodes = [];
    const maxDepth = Math.max(...Array.from(this.nodes.values())
      .map(n => n.depth));
    
    for (let depth = 0; depth <= maxDepth; depth++) {
      const levelNodes = this.getLevel(depth);
      reservoirNodes.push({
        depth,
        nodes: levelNodes.map(n => ({
          id: n.id,
          value: n.value,
          connections: n.children.map(c => c.id)
        }))
      });
    }

    return reservoirNodes;
  }
}