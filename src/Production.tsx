import {NonTerminal} from './NonTerminal';
import {Symbol} from './Symbol';

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
}
