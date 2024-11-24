export interface PLNRule {
  name: string;
  description: string;
  apply: (atoms: Atom[]) => Atom[];
  validate: (atoms: Atom[]) => boolean;
}