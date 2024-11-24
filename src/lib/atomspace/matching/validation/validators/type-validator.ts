import { AtomType, Pattern } from '../../../types';

export class TypeValidator {
  private static readonly VALID_TYPES: AtomType[] = [
    'ConceptNode',
    'PredicateNode',
    'ListLink',
    'EvaluationLink',
    'VariableNode',
    'NumberNode',
    'TypeNode',
    'TypeChoiceNode',
    'InheritanceLink',
    'SimilarityLink',
    'ImplicationLink'
  ];

  static validate(type: AtomType | undefined): boolean {
    if (!type) return true;
    return this.VALID_TYPES.includes(type);
  }

  static validateTypeRestriction(
    type: AtomType,
    restriction: AtomType | AtomType[]
  ): boolean {
    if (Array.isArray(restriction)) {
      return restriction.includes(type);
    }
    return type === restriction;
  }

  static isNodeType(type: AtomType): boolean {
    return type.endsWith('Node');
  }

  static isLinkType(type: AtomType): boolean {
    return type.endsWith('Link');
  }
}