import {test, expect} from 'bun:test';

import {Production} from '../Production';
import {NonTerminal} from '../NonTerminal';
import {Token} from '../Token';
import {Grammar} from '../Grammar';
import {removeEpsilonProductions} from '../removeEpsilonProductions';

test('removeEpsilonProductions should work', () => {
  const symbols = {
    epsilon: Grammar.epsilon,
    ident: new Token('ident'),
    argList: new NonTerminal('argList'),
  };
  const productions = [new Production(symbols.argList, [symbols.epsilon])];

  removeEpsilonProductions(productions);
});
