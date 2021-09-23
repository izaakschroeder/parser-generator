import {Item} from './Item';
import {ItemSet} from './ItemSet';
import {Production} from './Production';
import {Symbol} from './Symbol';
import {Token} from './Token';

export interface Action {}

export class Shift implements Action {
  constructor(
    public symbol: Symbol,
    public item: Item,
    public nextState: ItemSet,
  ) {}
}

export class Reduce implements Action {
  constructor(public production: Production, public lookahead: Token) {}
}
