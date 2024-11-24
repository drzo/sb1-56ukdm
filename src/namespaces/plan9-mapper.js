// Plan 9 namespace mapping to AtomSpace
export class Plan9Mapper {
  constructor() {
    this.namespaces = new Map();
    this.mountPoints = new Map();
  }

  // Create a Plan 9 style namespace
  createNamespace(path, type = 'directory') {
    const namespace = {
      type,
      children: new Map(),
      content: null,
      mountPoint: null
    };

    this.namespaces.set(path, namespace);
    return namespace;
  }

  // Mount an AtomSpace concept to a namespace
  mountAtomSpace(namespacePath, atomSpaceConcept) {
    const namespace = this.namespaces.get(namespacePath);
    if (namespace) {
      namespace.mountPoint = atomSpaceConcept;
      this.mountPoints.set(atomSpaceConcept.id, namespacePath);
    }
  }

  // Navigate namespace hierarchy
  resolvePath(path) {
    const parts = path.split('/').filter(p => p);
    let current = this.namespaces.get('/');
    
    for (const part of parts) {
      if (!current?.children.has(part)) {
        return null;
      }
      current = current.children.get(part);
    }
    
    return current;
  }

  // Export namespace structure to AtomSpace format
  toAtomSpace() {
    const atoms = [];
    
    for (const [path, namespace] of this.namespaces) {
      atoms.push({
        type: 'ConceptNode',
        name: path,
        value: {
          type: namespace.type,
          mountPoint: namespace.mountPoint?.id
        }
      });
    }

    return atoms;
  }
}