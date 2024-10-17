import type {Symbol} from './Symbol.ts';

export class Epsilon implements Symbol {
  equals(other: Symbol) {
    return other instanceof Epsilon;
  }
  toString() {
    return 'e';
  }
}
