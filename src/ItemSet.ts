import type {Grammar} from './Grammar.ts';
import {Item} from './Item.ts';
import type {Token} from './Token.ts';

export class ItemSet implements Iterable<Item> {
  public isComplete = false;
  private items: Map<string, Item> = new Map();

  public [Symbol.iterator](): Iterator<Item> {
    return this.items.values()[Symbol.iterator]();
  }

  public has(item: Item) {
    const key = this.itemKey(item);
    return this.items.has(key);
  }

  public add(item: Item) {
    const key = this.itemKey(item);
    const existing = this.items.get(key);
    if (existing) {
      return;
    }
    this.items.set(key, item);
  }

  containsCore(other: Item) {
    for (const item of this) {
      if (item.hasIdenticalCoresWith(other)) {
        return true;
      }
    }
    return false;
  }

  hasReducingItem() {
    for (const item of this) {
      if (item.isReduction()) {
        return true;
      }
    }
    return false;
  }

  isWeaklyCompatibleWith(other: ItemSet) {
    for (const item of this) {
      if (item.isKernel && !other.containsCore(item)) {
        return false;
      }
    }
    return true;
  }

  hasShiftingItem() {
    for (const item of this) {
      if (item.isShift()) {
        return true;
      }
    }
    return false;
  }

  hasReduceReduceConflictWith(itemSet: ItemSet) {
    for (const itemA of this) {
      for (const itemB of itemSet) {
        if (itemA.hasReductionConflictWith(itemB)) {
          return true;
        }
      }
    }
    return false;
  }

  merge(itemSet: ItemSet, mergeFn: (item: Item) => unknown) {
    for (const item of itemSet) {
      if (!this.has(item)) {
        mergeFn(item);
        this.add(item);
      }
    }
  }

  addClosure(grammar: Grammar) {
    const workQueue = [...this];
    while (workQueue.length > 0) {
      // biome-ignore lint/style/noNonNullAssertion: Ok.
      const item = workQueue.shift()!;
      const dotPosition = item.dotPosition;
      const rightHandSide = item.production.rightHandSide;
      if (dotPosition < rightHandSide.length) {
        const nonTerminal = rightHandSide[dotPosition];
        if (!grammar.isNonTerminal(nonTerminal)) {
          continue;
        }
        const tmp = rightHandSide
          .slice(dotPosition + 1)
          .concat(item.lookahead);
        const productions =
          grammar.getProductionsForNonTerminal(nonTerminal);
        for (const production of productions) {
          for (const symbol of grammar.firstSet(tmp)) {
            // FIXME: Token[] cast can be replaced if we make a version of
            // `firstSet` that ignores epsilon.
            const newItem = new Item(
              production,
              0,
              symbol as Token,
              false,
            );
            if (!this.has(newItem)) {
              this.add(newItem);
              workQueue.push(newItem);
            }
          }
        }
      }
    }
  }

  toString() {
    let out = '';
    for (const item of this.items.values()) {
      out += `\n\t${item.toString()}`;
    }
    return `[${out}\n]`;
  }

  private itemKey(item: Item) {
    const lhs = item.production.leftHandSide.id;
    const rhs = item.production.rightHandSide
      .map((sym) => sym.toString())
      .join(',');
    const lah = item.lookahead.toString();
    return `${lhs}/${rhs}/${lah}`;
  }
}
