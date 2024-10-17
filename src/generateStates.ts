import {ItemSet} from './ItemSet.ts';
import {Item} from './Item.ts';
import {type Action, Shift, Reduce} from './Action.ts';
import type {Grammar} from './Grammar.ts';

function mergeStates(
  actions: WeakMap<Item, Action>,
  comeFrom: ItemSet,
  currentSet: ItemSet,
  toProcess: ItemSet[],
): [boolean, ItemSet[]] {
  let shouldReset = false;
  const incompleteList: ItemSet[] = [];

  for (const itemSet of toProcess) {
    if (!itemSet.isWeaklyCompatibleWith(currentSet)) {
      continue;
    }

    if (itemSet.hasReduceReduceConflictWith(currentSet)) {
      // Grammar is LR not LALR
      continue;
    }

    let hasShift = false;
    itemSet.merge(currentSet, (item) => {
      const action = actions.get(item);

      if (action instanceof Shift) {
        if (action.nextState === currentSet) {
          action.nextState = itemSet;
        }
      }
      if (item.isShift()) {
        hasShift = true;
      }
    });
    for (const item of comeFrom) {
      const action = actions.get(item);
      if (action instanceof Shift && action.nextState === currentSet) {
        action.nextState = itemSet;
      }
    }
    if (itemSet.isComplete && hasShift) {
      for (const item of itemSet) {
        const action = actions.get(item);
        if (
          action instanceof Shift &&
          action.nextState === currentSet
        ) {
          actions.delete(item);
        }
      }
      itemSet.isComplete = false;
      incompleteList.push(itemSet);
    }
    shouldReset = true;
    break;
  }
  return [shouldReset, incompleteList];
}

export const generateStates = (
  grammar: Grammar,
): [ItemSet[], Map<Item, Action>] => {
  const initialState = new ItemSet();
  initialState.add(
    new Item(
      grammar.getStartProduction(),
      0,
      grammar.getEndOfInputToken(),
      true,
    ),
  );

  const toDoList: ItemSet[] = [initialState];
  const incompleteList: ItemSet[] = [];
  const doneList: ItemSet[] = [];
  let currentSet: ItemSet | undefined;
  let comeFrom: ItemSet | undefined;

  const actions: Map<Item, Action> = new Map();

  const doMerge = (source: ItemSet[]) => {
    if (!currentSet) {
      return;
    }
    const [shouldReset, entries] = mergeStates(
      actions,
      // biome-ignore lint/style/noNonNullAssertion: Needed
      comeFrom!,
      currentSet,
      source,
    );
    for (const entry of entries) {
      doneList.splice(doneList.indexOf(entry), 1);
      incompleteList.push(entry);
    }
    if (shouldReset) {
      currentSet = undefined;
    }
  };

  while (incompleteList.length > 0 || toDoList.length > 0) {
    if (incompleteList.length > 0) {
      // biome-ignore lint/style/noNonNullAssertion: Needed
      currentSet = incompleteList.pop()!;
      comeFrom = currentSet;
      for (const item of currentSet) {
        if (item.isShift() && !actions.has(item)) {
          const symbol = item.getMarkedSymbol();
          const newItemSet = new ItemSet();
          toDoList.push(newItemSet);
          for (const shItem of currentSet) {
            if (
              shItem.isShift() &&
              shItem.getMarkedSymbol().equals(symbol)
            ) {
              newItemSet.add(
                new Item(
                  shItem.production,
                  shItem.dotPosition + 1,
                  shItem.lookahead,
                  true,
                ),
              );
              actions.set(shItem, new Shift(symbol, item, newItemSet));
            }
          }
        }
      }
      currentSet.isComplete = true;
      doneList.push(currentSet);
    }

    while (toDoList.length > 0) {
      // biome-ignore lint/style/noNonNullAssertion: Needed
      currentSet = toDoList.pop()!;
      currentSet.addClosure(grammar);

      for (const item of currentSet) {
        if (item.isReduction()) {
          actions.set(
            item,
            new Reduce(item.production, item.lookahead),
          );
        }
      }

      doMerge(doneList);
      doMerge(incompleteList);

      if (currentSet) {
        incompleteList.push(currentSet);
      }
    }
  }

  return [doneList, actions];
};
