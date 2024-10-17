import type {Symbol} from './Symbol.ts';

export class NonTerminal implements Symbol {
  constructor(public id: string) {}
  equals(other: Symbol): boolean {
    return other instanceof NonTerminal && other.id === this.id;
  }
  toString() {
    return this.id;
  }
}
