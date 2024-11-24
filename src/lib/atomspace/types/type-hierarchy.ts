import { AtomType } from '../types';

export class TypeHierarchy {
  private hierarchy: Map<AtomType, Set<AtomType>> = new Map();
  private typeProperties: Map<AtomType, TypeProperties> = new Map();

  constructor() {
    this.initializeHierarchy();
  }

  private initializeHierarchy(): void {
    // Base types
    this.addType('Node', { abstract: true });
    this.addType('Link', { abstract: true });

    // Node types
    this.addType('ConceptNode', { parent: 'Node' });
    this.addType('PredicateNode', { parent: 'Node' });
    this.addType('VariableNode', { parent: 'Node' });
    this.addType('NumberNode', { parent: 'Node' });
    this.addType('TypeNode', { parent: 'Node' });

    // Link types
    this.addType('OrderedLink', { parent: 'Link', abstract: true });
    this.addType('UnorderedLink', { parent: 'Link', abstract: true });
    
    this.addType('InheritanceLink', { parent: 'OrderedLink' });
    this.addType('SimilarityLink', { parent: 'UnorderedLink' });
    this.addType('ImplicationLink', { parent: 'OrderedLink' });
    this.addType('EquivalenceLink', { parent: 'UnorderedLink' });
    this.addType('EvaluationLink', { parent: 'OrderedLink' });
    this.addType('ListLink', { parent: 'OrderedLink' });
  }

  private addType(type: AtomType, properties: TypeProperties): void {
    this.typeProperties.set(type, properties);
    
    if (properties.parent) {
      if (!this.hierarchy.has(properties.parent)) {
        this.hierarchy.set(properties.parent, new Set());
      }
      this.hierarchy.get(properties.parent)!.add(type);
    }
  }

  isSubtype(subType: AtomType, superType: AtomType): boolean {
    if (subType === superType) return true;

    const parent = this.typeProperties.get(subType)?.parent;
    if (!parent) return false;

    return this.isSubtype(parent, superType);
  }

  getMostSpecificCommonType(types: AtomType[]): AtomType {
    if (types.length === 0) return 'Node';
    if (types.length === 1) return types[0];

    const commonAncestors = this.findCommonAncestors(types);
    return this.getMostSpecific(commonAncestors);
  }

  private findCommonAncestors(types: AtomType[]): AtomType[] {
    const ancestorSets = types.map(type => this.getAncestors(type));
    const commonAncestors = ancestorSets.reduce((common, current) =>
      new Set([...common].filter(x => current.has(x)))
    );

    return Array.from(commonAncestors);
  }

  private getAncestors(type: AtomType): Set<AtomType> {
    const ancestors = new Set<AtomType>([type]);
    let current = type;

    while (true) {
      const parent = this.typeProperties.get(current)?.parent;
      if (!parent) break;
      ancestors.add(parent);
      current = parent;
    }

    return ancestors;
  }

  private getMostSpecific(types: AtomType[]): AtomType {
    return types.reduce((mostSpecific, current) =>
      types.every(t => 
        t === current || !this.isSubtype(current, t)
      ) ? current : mostSpecific
    );
  }

  getAllTypes(): AtomType[] {
    return Array.from(this.typeProperties.keys());
  }

  isAbstract(type: AtomType): boolean {
    return this.typeProperties.get(type)?.abstract || false;
  }
}

interface TypeProperties {
  parent?: AtomType;
  abstract?: boolean;
}