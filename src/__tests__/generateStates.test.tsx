import {Shift} from '../Action';
import {Grammar} from '../Grammar';
import {NonTerminal} from '../NonTerminal';
import {Production} from '../Production';
import {Token} from '../Token';

import {generateStates} from '../generateStates';
import {generateTables} from '../generateTables';
import {Parser} from '../Parser';

describe('generateStates', () => {
  it('should work', () => {
    const symbols = {
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
      new Production(symbols.facts, [symbols.fact]),
      new Production(symbols.fact, [symbols.exl, symbols.str]),
      new Production(symbols.question, [symbols.qus, symbols.str]),
    ];
    const grammar = new Grammar(symbols.session, productions);
    const [states, actions] = generateStates(grammar);

    for (const state of states) {
      for (const item of state) {
        expect(actions.has(item)).toBe(true);
        const action = actions.get(item)!;
        if (action instanceof Shift) {
          expect(states.indexOf(action.nextState)).not.toBe(-1);
        }
      }
    }

    const tables = generateTables(grammar, states, actions);

    console.log(tables.actionTable);

    const parser = new Parser({
      actionTable: tables.actionTable,
      gotoTable: tables.gotoTable,
      productionTable: tables.productionTable,
      endOfInput: Grammar.endOfInput.id,
      onReduce: (lhs, rhs) => {
        console.log(`reduce: ${grammar.productions[lhs]}`);
      },
    });
    parser.write(symbols.lbr);
    parser.write(symbols.exl);
    parser.write(symbols.str);
    parser.write(symbols.qus);
    parser.write(symbols.str);
    parser.write(symbols.rbr);
    parser.write(symbols.exl);
    parser.write(symbols.str);
    parser.write(symbols.exl);
    parser.write(symbols.str);
    parser.write(symbols.qus);
    parser.write(symbols.str);
    parser.end();
  });
});
