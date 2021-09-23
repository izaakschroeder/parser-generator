import {Production} from '../Production';
import {firstSet} from '../firstSet';
import {NonTerminal} from '../NonTerminal';
import {Token} from '../Token';
import {Grammar} from '../Grammar';

describe('firstSet', () => {
  const symbols = {
    epsilon: Grammar.epsilon,
    session: new NonTerminal('session'),
    facts: new NonTerminal('facts'),
    fact: new NonTerminal('fact'),
    question: new NonTerminal('question'),
    qus: new Token('qus'),
    lbr: new Token('lbr'),
    rbr: new Token('rbr'),
    str: new Token('str'),
    exl: new Token('exl'),
  };
  const productions = [
    new Production(symbols.session, [symbols.facts, symbols.question]),
    new Production(symbols.session, [
      symbols.lbr,
      symbols.session,
      symbols.rbr,
      symbols.session,
    ]),
    new Production(symbols.facts, [symbols.facts, symbols.fact]),
    new Production(symbols.facts, [symbols.epsilon]),
    new Production(symbols.fact, [symbols.exl, symbols.str]),
    new Production(symbols.question, [symbols.qus, symbols.str]),
  ];
  const grammar = new Grammar(symbols.session, productions);
  describe('cases', () => {
    [
      [[symbols.qus], [symbols.qus]],
      [[symbols.lbr], [symbols.lbr]],
      [[symbols.rbr], [symbols.rbr]],
      [[symbols.str], [symbols.str]],
      [[symbols.exl], [symbols.exl]],
      [[symbols.session], [symbols.exl, symbols.lbr, symbols.qus]],
      [[symbols.facts], [symbols.exl, symbols.epsilon]],
      [[symbols.fact], [symbols.exl]],
      [[symbols.question], [symbols.qus]],
    ].forEach(([symbols, expected]) => {
      it(`should works for ${symbols}`, () => {
        const result = firstSet(grammar, symbols);
        expect(result).toEqual(new Set(expected));
      });
    });
  });
});
