import type {NonTerminal} from './NonTerminal.ts';
import type {Symbol} from './Symbol.ts';

export class Production {
  constructor(
    public leftHandSide: NonTerminal,
    public rightHandSide: Symbol[],
  ) {}

  equals(production: Production) {
    if (!this.leftHandSide.equals(production.leftHandSide)) {
      return false;
    }
    if (this.rightHandSide.length !== production.rightHandSide.length) {
      return false;
    }
    for (let i = 0; i < this.rightHandSide.length; ++i) {
      if (!this.rightHandSide[i].equals(production.rightHandSide[i])) {
        return false;
      }
    }
    return true;
  }

  toString() {
    const lhs = this.leftHandSide.toString();
    const rhs = this.rightHandSide.map((x) => x.toString()).join(' ');
    return `${lhs} -> ${rhs}`;
  }
}
