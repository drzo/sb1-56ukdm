import { AtomType } from '../types';
import { TypeHierarchy } from './type-hierarchy';

export class TypeComposition {
  constructor(private hierarchy: TypeHierarchy) {}

  // Compose two types into a new compound type
  composeTypes(type1: AtomType, type2: AtomType): AtomType {
    // If types are the same, return the type
    if (type1 === type2) return type1;

    // If one type is a subtype of another, return the more specific type
    if (this.hierarchy.isSubtype(type1, type2)) return type1;
    if (this.hierarchy.isSubtype(type2, type1)) return type2;

    // For link types, create a compound type
    if (this.isLinkType(type1) && this.isLinkType(type2)) {
      return this.composeLinkTypes(type1, type2);
    }

    // For node types, find most specific common supertype
    return this.hierarchy.getMostSpecificCommonType([type1, type2]);
  }

  // Compose multiple types
  composeMultipleTypes(types: AtomType[]): AtomType {
    if (types.length === 0) return 'Node';
    if (types.length === 1) return types[0];

    return types.reduce((composed, type) => 
      this.composeTypes(composed, type)
    );
  }

  private isLinkType(type: AtomType): boolean {
    return type.endsWith('Link');
  }

  private composeLinkTypes(type1: AtomType, type2: AtomType): AtomType {
    // Special composition rules for link types
    const linkCompositions: Record<string, Record<string, AtomType>> = {
      'InheritanceLink': {
        'SimilarityLink': 'EquivalenceLink',
        'ImplicationLink': 'ImplicationLink'
      },
      'SimilarityLink': {
        'InheritanceLink': 'EquivalenceLink',
        'ImplicationLink': 'EquivalenceLink'
      }
    };

    return linkCompositions[type1]?.[type2] || 'ListLink';
  }
}