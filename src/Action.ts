import type {Item} from './Item.ts';
import type {ItemSet} from './ItemSet.ts';
import type {Production} from './Production.ts';
import type {Symbol} from './Symbol.ts';
import type {Token} from './Token.ts';

// biome-ignore lint/suspicious/noEmptyInterface: TODO
export interface Action {}

export class Shift implements Action {
  constructor(
    public symbol: Symbol,
    public item: Item,
    public nextState: ItemSet,
  ) {}
}

export class Reduce implements Action {
  constructor(
    public production: Production,
    public lookahead: Token,
  ) {}
}
