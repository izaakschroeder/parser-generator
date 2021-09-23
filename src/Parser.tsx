import {
  ActionTable,
  GotoTable,
  isReduceAction,
  isShiftAction,
  ProductionTable,
  ReduceAction,
  ShiftAction,
  StateId,
  SymbolId,
} from './Tables';

interface Input {
  getTokenId(): string;
}

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
  stack!: StackEntry[];
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
    const lookahead = input.getTokenId();
    do {
      const top = this.peek();
      const actions = this.actionTable[top.nextState][lookahead];

      if (!actions || actions.length === 0) {
        throw new Error(
          `Invalid input; given: ${lookahead}, expected: ${this.expects()}.`,
        );
      }
      if (actions.length > 1) {
        throw new Error('Ambiguous state.');
      }

      const action = actions[0];
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
    this.write({
      getTokenId: () => this.endOfInput,
    });
  }

  peek() {
    return this.stack[this.stack.length - 1];
  }

  private shift([nextState]: ShiftAction, input: Input) {
    const stackEntry = new StackEntry(input, input.getTokenId(), nextState);
    this.stack.push(stackEntry);
  }

  private reduce(action: ReduceAction, input: Input) {
    var rhs: Data = [];
    var [lhs, len] = this.productionTable[action];
    //Loop through the right hand side of the production
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
