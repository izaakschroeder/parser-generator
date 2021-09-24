import {Production} from './Production';
import {Token} from './Token';
import {Symbol} from './Symbol';

const symbolArrayEquals = (a: Symbol[], b: Symbol[]) => {
  return a.length === b.length && a.every((entry, i) => entry.equals(b[i]));
};

export class Item {
  public constructor(
    public production: Production,
    public dotPosition: number,
    public lookahead: Token,
    public isKernel: boolean,
  ) {
    // ...
  }

  public isShift() {
    return this.dotPosition < this.production.rightHandSide.length;
  }

  public isReduction() {
    return !this.isShift();
  }

  public hasReductionConflictWith(item: Item) {
    if (!this.isReduction() || !item.isReduction()) return false;

    return (
      !this.production.leftHandSide.equals(item.production.leftHandSide) &&
      this.lookahead.equals(item.lookahead) &&
      symbolArrayEquals(
        this.production.rightHandSide,
        item.production.rightHandSide,
      ) &&
      this.dotPosition === item.dotPosition
    );
  }

  public equals(item: Item) {
    return (
      this.hasIdenticalCoresWith(item) && this.lookahead.equals(item.lookahead)
    );
  }

  public hasIdenticalCoresWith(item: Item) {
    return (
      this.production.equals(item.production) &&
      this.dotPosition === item.dotPosition
    );
  }

  public getMarkedSymbol() {
    return this.production.rightHandSide[this.dotPosition];
  }

  public toString() {
    var beforeDot = this.production.rightHandSide
      .slice(0, this.dotPosition)
      .map((entry) => entry.toString())
      .join(' ');
    var afterDot = this.production.rightHandSide
      .slice(this.dotPosition)
      .map((entry) => entry.toString())
      .join(' ');
    return (
      (this.isKernel ? '*' : '') +
      this.production.leftHandSide.toString() +
      ' ->' +
      (beforeDot ? ' ' + beforeDot : '') +
      ' .' +
      (afterDot ? ' ' + afterDot : '') +
      ' [ ' +
      this.lookahead.toString() +
      ' ]'
    );
  }
}
