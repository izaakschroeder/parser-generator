import {Grammar, Production, NonTerminal, Token, generateStates} from './src';

const Identifier = new Token('ident');
const Plus = new Token('+');
const Minus = new Token('-');
const Multiply = new Token('*');
const Divide = new Token('/');
const EOI = new Token('$');
const Expression = new NonTerminal('expr');
const Start = new NonTerminal('S');

const productions = [
  new Production(Start, [Expression]),
  new Production(Expression, [Identifier]),
  new Production(Expression, [Expression, Plus, Expression]),
  new Production(Expression, [Expression, Minus, Expression]),
  new Production(Expression, [Expression, Multiply, Expression]),
  new Production(Expression, [Expression, Divide, Expression]),
];

const states = generateStates(productions, EOI);
