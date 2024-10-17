import type {Symbol} from './Symbol.ts';

export class Token implements Symbol {
  constructor(public id: string) {}
  getTokenId() {
    return this.id;
  }
  equals(other: Symbol): boolean {
    return other instanceof Token && other.id === this.id;
  }
  toString() {
    return this.id;
  }
}
