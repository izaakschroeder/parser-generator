export interface Symbol {
  equals(other: Symbol): boolean;
  toString(): string;
}
