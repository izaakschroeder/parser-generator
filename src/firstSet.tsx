import {Symbol} from './Symbol';
import {Token} from './Token';
import {Epsilon} from './Epsilon';
import {Grammar} from './Grammar';
import {NonTerminal} from './NonTerminal';

export function firstSet(
  grammar: Grammar,
  symbols: Symbol[],
  cache: WeakMap<Symbol, Set<Token | Epsilon>> = new WeakMap(),
): Set<Token | Epsilon> {
  const first = new Set<Token | Epsilon>();

  if (symbols.length === 0) {
    return first;
  }

  let derivesEpsilon = null;

  for (const symbol of symbols) {
    let existing: Set<Token | Epsilon> | undefined = cache.get(symbol);
    const hasExisting = !!existing;
    if (!existing) {
      existing = new Set<Token | Epsilon>();
      cache.set(symbol, existing);
    }
    if (grammar.isToken(symbol)) {
      existing.add(symbol);
      first.add(symbol);
      return first;
    }
    if (grammar.isEpsilon(symbol)) {
      derivesEpsilon = symbol;
      existing.add(symbol);
      continue;
    }
    if (hasExisting) {
      continue;
    }
    const productions = grammar.getProductionsForNonTerminal(
      symbol as NonTerminal,
    );
    let anyContainsEpsilon = false;
    for (const production of productions!) {
      const entries = firstSet(grammar, production.rightHandSide, cache);
      for (const entry of entries) {
        existing.add(entry);
        if (grammar.isEpsilon(entry)) {
          derivesEpsilon = entry;
          anyContainsEpsilon = true;
        } else {
          first.add(entry);
        }
      }
    }
    if (!anyContainsEpsilon) {
      return first;
    }
  }

  if (derivesEpsilon) {
    first.add(derivesEpsilon!);
  }
  return first;
}
