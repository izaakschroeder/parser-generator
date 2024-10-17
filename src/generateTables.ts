import isEqual from 'fast-deep-equal';

import type {ItemSet} from './ItemSet.ts';
import {Shift, Reduce, type Action} from './Action.ts';
import type {Item} from './Item.ts';
import type {Grammar} from './Grammar.ts';
import type {Token} from './Token.ts';
import type {NonTerminal} from './NonTerminal.ts';
import type {Production} from './Production.ts';
import {
  type ActionTable,
  type ActionTableEntry,
  type GotoTable,
  type GotoTableEntry,
  isSingleAction,
  type ProductionTable,
  type StateId,
  type SymbolId,
  type TableAction,
} from './Tables.ts';

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
  const existingAction = entry[lookahead];
  if (!existingAction) {
    entry[lookahead] = action;
    return;
  }
  if (isEqual(existingAction, action)) {
    return;
  }

  const actions: TableAction[] = isSingleAction(existingAction)
    ? // biome-ignore lint/suspicious/noAssignInExpressions: FIXME later
      (entry[lookahead] = [existingAction])
    : existingAction;

  const actionExists = actions.some((entry) => isEqual(action, entry));
  if (!actionExists) {
    actions.push(action);
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
    throw new Error(
      `Goto table mismatch! (${current} vs ${nextStateId})`,
    );
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

  for (const production of grammar.productions) {
    productionTable[getProductionId(production)] = [
      getSymbolId(production.leftHandSide),
      production.rightHandSide.length,
    ];
  }

  states.forEach((state, i) => {
    stateIds.set(state, i);
  });

  for (const state of states) {
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
  }

  return {actionTable, gotoTable, productionTable};
}
