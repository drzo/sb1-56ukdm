import { Atom, TruthValue } from '../../types';

export class ProceduralMemory {
  private procedures: Map<string, Procedure> = new Map();

  constructor(private atomSpace: Map<string, Atom>) {}

  learnProcedure(sequence: Atom[]): void {
    const procedure = this.createProcedure(sequence);
    this.procedures.set(procedure.id, procedure);
    this.strengthenConnections(procedure);
  }

  findProcedure(context: ProcedureContext): Procedure[] {
    return Array.from(this.procedures.values())
      .filter(proc => this.matchesContext(proc, context))
      .sort((a, b) => b.successRate - a.successRate);
  }

  updateSuccess(procedureId: string, success: boolean): void {
    const procedure = this.procedures.get(procedureId);
    if (!procedure) return;

    procedure.attempts++;
    if (success) procedure.successes++;
    procedure.successRate = procedure.successes / procedure.attempts;

    this.updateProcedureStrength(procedure);
  }

  private createProcedure(sequence: Atom[]): Procedure {
    return {
      id: crypto.randomUUID(),
      steps: sequence.map(atom => ({
        atomId: atom.id,
        type: atom.type,
        preconditions: this.extractPreconditions(atom),
        postconditions: this.extractPostconditions(atom)
      })),
      attempts: 0,
      successes: 0,
      successRate: 0,
      truthValue: this.calculateProcedureTruthValue(sequence)
    };
  }

  private strengthenConnections(procedure: Procedure): void {
    procedure.steps.forEach((step, i) => {
      if (i === 0) return;
      const prevStep = procedure.steps[i - 1];
      
      this.atomSpace.set(`${prevStep.atomId}->${step.atomId}`, {
        id: `${prevStep.atomId}->${step.atomId}`,
        type: 'ProceduralLink',
        truthValue: {
          strength: procedure.successRate,
          confidence: procedure.attempts / 100
        },
        outgoing: [prevStep.atomId, step.atomId]
      });
    });
  }

  private extractPreconditions(atom: Atom): Condition[] {
    return Array.from(this.atomSpace.values())
      .filter(a => 
        a.type === 'PreconditionLink' &&
        a.outgoing?.includes(atom.id)
      )
      .map(a => ({
        atomId: a.id,
        type: 'precondition',
        truthValue: a.truthValue
      }));
  }

  private extractPostconditions(atom: Atom): Condition[] {
    return Array.from(this.atomSpace.values())
      .filter(a => 
        a.type === 'PostconditionLink' &&
        a.outgoing?.includes(atom.id)
      )
      .map(a => ({
        atomId: a.id,
        type: 'postcondition',
        truthValue: a.truthValue
      }));
  }

  private calculateProcedureTruthValue(sequence: Atom[]): TruthValue {
    const tvs = sequence.map(a => a.truthValue);
    return {
      strength: tvs.reduce((sum, tv) => sum + tv.strength, 0) / tvs.length,
      confidence: Math.min(...tvs.map(tv => tv.confidence))
    };
  }

  private matchesContext(procedure: Procedure, context: ProcedureContext): boolean {
    if (context.preconditions) {
      const firstStep = procedure.steps[0];
      return context.preconditions.every(cond =>
        firstStep.preconditions.some(p => 
          p.atomId === cond.atomId && 
          p.truthValue.strength >= cond.truthValue.strength
        )
      );
    }
    return true;
  }

  private updateProcedureStrength(procedure: Procedure): void {
    procedure.truthValue = {
      strength: procedure.successRate,
      confidence: Math.min(1, procedure.attempts / 100)
    };
    this.strengthenConnections(procedure);
  }
}

interface Procedure {
  id: string;
  steps: ProcedureStep[];
  attempts: number;
  successes: number;
  successRate: number;
  truthValue: TruthValue;
}

interface ProcedureStep {
  atomId: string;
  type: string;
  preconditions: Condition[];
  postconditions: Condition[];
}

interface Condition {
  atomId: string;
  type: 'precondition' | 'postcondition';
  truthValue: TruthValue;
}

interface ProcedureContext {
  preconditions?: Condition[];
  [key: string]: any;
}