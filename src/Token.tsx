import {Symbol} from './Symbol';

export class Token implements Symbol {
  constructor(public id: string) {}
  equals(other: Symbol): boolean {
    return other instanceof Token && other.id === this.id;
  }
  toString() {
    return this.id;
  }
}
