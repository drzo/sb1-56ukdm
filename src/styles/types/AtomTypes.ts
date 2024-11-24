export enum NodeType {
  // Core Types
  CONCEPT = 'ConceptNode',
  PREDICATE = 'PredicateNode',
  VARIABLE = 'VariableNode',
  
  // Number Types
  NUMBER = 'NumberNode',
  FLOAT = 'FloatNode',
  INTEGER = 'IntegerNode',
  
  // Language Types
  WORD = 'WordNode',
  SCHEMA = 'SchemaNode',
  
  // Special Types
  ANCHOR = 'AnchorNode',
  CONTEXT = 'ContextNode',
  TYPE = 'TypeNode',
  PROXY = 'ProxyNode',
  
  // Bio Types
  GENE = 'GeneNode',
  PROTEIN = 'ProteinNode',
  PATHWAY = 'PathwayNode',
  DISEASE = 'DiseaseNode',
  ORGANISM = 'OrganismNode',
  
  // Swarm Types
  AGENT = 'AgentNode',
  TASK = 'TaskNode',
  GOAL = 'GoalNode',
  SKILL = 'SkillNode',
  MEMORY = 'MemoryNode',
  RESOURCE = 'ResourceNode'
}

export enum LinkType {
  // Logical Links
  AND = 'AndLink',
  OR = 'OrLink',
  NOT = 'NotLink',
  
  // Evaluation Links
  EVALUATION = 'EvaluationLink',
  INHERITANCE = 'InheritanceLink',
  SIMILARITY = 'SimilarityLink',
  
  // Relationship Links
  MEMBER = 'MemberLink',
  REFERENCE = 'ReferenceLink',
  LIST = 'ListLink',
  
  // Special Links
  CONTEXT = 'ContextLink',
  VARIABLE_LIST = 'VariableList',
  TYPED_VARIABLE = 'TypedVariableLink',
  
  // Bio Links
  EXPRESSES = 'ExpressesLink',
  INTERACTS = 'InteractsLink',
  PARTICIPATES = 'ParticipatesLink',
  ASSOCIATED = 'AssociatedLink',
  LOCATED = 'LocatedLink',
  
  // Swarm Links
  EXECUTES = 'ExecutesLink',
  REQUIRES = 'RequiresLink',
  ACHIEVES = 'AchievesLink',
  COLLABORATES = 'CollaboratesLink',
  KNOWS = 'KnowsLink',
  USES = 'UsesLink'
}

export type AtomType = NodeType | LinkType;

export function isValidNodeType(type: string): type is NodeType {
  return Object.values(NodeType).includes(type as NodeType);
}

export function isValidLinkType(type: string): type is LinkType {
  return Object.values(LinkType).includes(type as LinkType);
}

export function isValidAtomType(type: string): type is AtomType {
  return isValidNodeType(type) || isValidLinkType(type);
}