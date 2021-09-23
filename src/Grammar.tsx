import {Production} from './Production';
import {Token} from './Token';
import {NonTerminal} from './NonTerminal';
import {Symbol} from './Symbol';
import {Epsilon} from './Epsilon';
import {firstSet} from './firstSet';

export class Grammar {
  static epsilon = new Epsilon();
  static endOfInput = new Token('$');
  productions: Production[];
  internalStartSymbol = new NonTerminal('^');
  startProduction = new Production(this.internalStartSymbol, [
    this.startSymbol,
  ]);
  productionMap = new Map<NonTerminal, Production[]>();
  terminals = new Set<Token>([Grammar.endOfInput]);
  firstSetCache = new Map<Symbol, Set<Token | Epsilon>>();

  constructor(public startSymbol: NonTerminal, productions: Production[]) {
    this.productions = [this.startProduction, ...productions];
    for (const production of this.productions) {
      let val = this.productionMap.get(production.leftHandSide);
      if (!val) {
        val = [];
        this.productionMap.set(production.leftHandSide, val);
      }
      val.push(production);
    }
    for (const production of this.productions) {
      for (const symbol of production.rightHandSide) {
        if (!this.productionMap.has(symbol as NonTerminal)) {
          if (symbol instanceof Token) {
            this.terminals.add(symbol);
          } else if (!(symbol instanceof Epsilon)) {
            throw new TypeError();
          }
        }
      }
    }
  }

  public getEndOfInputToken() {
    return Grammar.endOfInput;
  }

  public getStartProduction() {
    return this.startProduction;
  }

  public firstSet(symbols: Symbol[]) {
    return firstSet(this, symbols, this.firstSetCache);
  }

  public getProductionsForNonTerminal(sym: NonTerminal) {
    if (!this.isNonTerminal(sym)) {
      throw new TypeError(`Not non-terminal: ${sym}`);
    }
    const res = this.productionMap.get(sym);
    if (!res) {
      throw new Error(`Non-terminal with no productions: ${sym}`);
    }
    return res;
  }

  public isNonTerminal(symbol: Symbol): symbol is NonTerminal {
    return symbol instanceof NonTerminal;
  }

  public isToken(symbol: Symbol): symbol is Token {
    return symbol instanceof Token;
  }

  public isEpsilon(symbol: Symbol): symbol is Epsilon {
    return symbol === Grammar.epsilon;
  }

  public getTokens() {
    return this.terminals;
  }

  public getNonTerminals() {
    return this.productionMap.keys();
  }

  public getProductions() {
    return this.productions;
  }
}
