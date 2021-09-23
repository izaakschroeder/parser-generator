import isEqual from 'fast-deep-equal';
import {ItemSet} from './ItemSet';
import {Shift, Reduce, Action} from './Action';
import {Item} from './Item';
import {Grammar} from './Grammar';
import {Token} from './Token';
import {NonTerminal} from './NonTerminal';
import {Production} from './Production';
import {
  ActionTable,
  ActionTableEntry,
  GotoTable,
  GotoTableEntry,
  ProductionTable,
  StateId,
  SymbolId,
  TableAction,
} from './Tables';

interface Tables {
  actionTable: ActionTable;
  productionTable: ProductionTable;
  gotoTable: GotoTable;
}

function addAction(
  entry: ActionTableEntry,
  lookahead: SymbolId,
  action: TableAction,
) {
  if (!entry[lookahead]) {
    entry[lookahead] = [];
  }

  const actionExists = entry[lookahead].some((entry) => {
    return action === entry || isEqual(action, entry);
  });

  if (!actionExists) {
    entry[lookahead].push(action);
  }
}

function addGoTo(
  entry: GotoTableEntry,
  symbol: SymbolId,
  nextStateId: StateId,
) {
  //The shifted symbol is a non-terminal
  const current = entry[symbol];

  //We haven't marked this symbol in the goto table before
  if (current === undefined) {
    entry[symbol] = nextStateId;
  } else if (current !== nextStateId) {
    throw new Error(`Goto table mismatch! (${current} vs ${nextStateId})`);
  }
}

export function generateTables(
  grammar: Grammar,
  states: ItemSet[],
  actions: Map<Item, Action>,
): Tables {
  const stateIds = new WeakMap<ItemSet, number>();

  const actionTable: ActionTable = new Array(states.length);
  const gotoTable: GotoTable = new Array(states.length);
  const productionTable: ProductionTable = new Array(
    grammar.productions.length,
  );

  const getStateId = (state: ItemSet) => {
    const result = stateIds.get(state);
    if (typeof result !== 'number') {
      throw new Error(`Unknown state: ${state.toString()}`);
    }
    return result;
  };

  const getProductionId = (production: Production) => {
    return grammar.productions.indexOf(production);
  };

  const getSymbolId = (sym: Token | NonTerminal) => {
    return sym.id;
  };

  grammar.productions.forEach((production) => {
    productionTable[getProductionId(production)] = [
      getSymbolId(production.leftHandSide),
      production.rightHandSide.length,
    ];
  });

  states.forEach((state, i) => {
    stateIds.set(state, i);
  });

  states.forEach(function (state) {
    const id = getStateId(state);
    actionTable[id] = {};
    gotoTable[id] = {};

    for (const item of state) {
      const action = actions.get(item);
      if (action instanceof Shift) {
        if (grammar.isToken(action.symbol)) {
          addAction(actionTable[id], getSymbolId(action.symbol), [
            getStateId(action.nextState),
            getProductionId(action.item.production),
          ]);
        } else if (grammar.isNonTerminal(action.symbol)) {
          addGoTo(
            gotoTable[id],
            getSymbolId(action.symbol),
            getStateId(action.nextState),
          );
        } else {
          throw new TypeError(`Unknown symbol: ${action.symbol}`);
        }
      } else if (action instanceof Reduce) {
        addAction(
          actionTable[id],
          getSymbolId(action.lookahead),
          getProductionId(action.production),
        );
      } else {
        throw new TypeError(`Unknown action: ${action}`);
      }
    }
  });

  return {actionTable, gotoTable, productionTable};
}
