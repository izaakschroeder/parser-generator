import {type ActionTable, isSingleAction} from './Tables.ts';

export const disambiguateTables = (actionTable: ActionTable) => {
  // const getProductionId = (a: TableAction) => {
  //   if (isShiftAction(a)) {
  //     return a[0];
  //   }
  //   if (isReduceAction(a)) {
  //     return a;
  //   }
  //   throw new TypeError();
  // };

  // const compareActions = (a1: TableAction, a2: TableAction) => {
  //   const p1 = getProductionId(a1);
  //   const p2 = getProductionId(a2);
  // };

  return actionTable.map((entry) => {
    const newEntry = {...entry};
    for (const lookahead in entry) {
      const actions = entry[lookahead];
      if (isSingleAction(actions)) {
        continue;
      }
      // Take cross-product of actions.
      // Eliminate.
      // Repeat?
      // Pick a winner.
      newEntry[lookahead] = actions[0];
    }
    return newEntry;
  });
};
