import {
  ActionTable,
  GotoTable,
  isReduceAction,
  isShiftAction,
  isSingleAction,
  ProductionTable,
  ReduceAction,
  ShiftAction,
  StateId,
  SymbolId,
} from './Tables';

interface ObjectInput {
  getTokenId(): SymbolId;
}

type Input = ObjectInput | SymbolId;

interface Reduction {
  leftHandSide: SymbolId;
  rightHandSide: (Input | Reduction)[];
}

type Data = Data[] | Input | Reduction;

class StackEntry {
  constructor(
    public data: Data,
    public symbol: SymbolId,
    public nextState: StateId,
  ) {}
}

interface Options {
  actionTable: ActionTable;
  gotoTable: GotoTable;
  productionTable: ProductionTable;
  endOfInput: SymbolId;
  onReduce: (prodId: number, rhs: Data) => unknown;
}

export class Parser {
  private actionTable: ActionTable;
  private gotoTable: GotoTable;
  private productionTable: ProductionTable;
  private endOfInput: SymbolId;
  private stack!: StackEntry[];
  initialState = 0;

  onReduce: (prodId: number, rhs: Data) => unknown;

  constructor(options: Options) {
    this.actionTable = options.actionTable;
    this.gotoTable = options.gotoTable;
    this.productionTable = options.productionTable;
    this.endOfInput = options.endOfInput;
    this.onReduce = options.onReduce;
    this.reset();
  }

  expects() {
    return Object.keys(this.actionTable[this.peek().nextState]);
  }

  reset() {
    this.stack = [new StackEntry(null, null, this.initialState)];
  }

  write(input: Input) {
    const lookahead = typeof input === 'string' ? input : input.getTokenId();
    do {
      const top = this.peek();
      const action = this.actionTable[top.nextState][lookahead];

      if (action === undefined) {
        throw new Error(
          `Invalid input; given: ${lookahead}, expected: ${this.expects()}.`,
        );
      }
      if (!isSingleAction(action)) {
        throw new Error(`Ambiguous state, ${JSON.stringify(action)}.`);
      }

      if (isShiftAction(action)) {
        this.shift(action, input);
        return;
      } else if (isReduceAction(action)) {
        this.reduce(action, input);
        if (this.peek().nextState === this.initialState) {
          return;
        }
      } else {
        throw new Error();
      }
    } while (true);
  }

  end() {
    this.write(this.endOfInput);
  }

  peek() {
    return this.stack[this.stack.length - 1];
  }

  private shift([nextState]: ShiftAction, input: Input) {
    const lookahead = typeof input === 'string' ? input : input.getTokenId();
    const stackEntry = new StackEntry(input, lookahead, nextState);
    this.stack.push(stackEntry);
  }

  private reduce(action: ReduceAction, _input: Input) {
    var rhs: Data = [];
    var [lhs, len] = this.productionTable[action];
    for (var i = 0; i < len; ++i) {
      const top = this.stack.pop();
      const item = top.data;
      rhs.unshift(item);
    }

    const top = this.peek();
    const nextState = this.gotoTable[top.nextState][lhs];

    if (typeof nextState !== 'number') {
      if (top.nextState !== this.initialState) {
        throw new Error();
      }
      //In the accept state
      return;
    }

    this.stack.push(new StackEntry(rhs, lhs, nextState));

    this.onReduce(action, rhs);
  }
}
