export type StateId = number;
export type SymbolId = string;
export type ProductionId = number;
export type ShiftAction = [StateId, ProductionId];
export type ReduceAction = ProductionId;
export type TableAction = ShiftAction | ReduceAction;
export type ActionTableEntry = {
  [symbolId: string]: TableAction[] | TableAction;
};
export type GotoTableEntry = {[symbolId: string]: StateId};
export type ProductionTableEntry = [SymbolId, number];
export type ActionTable = ActionTableEntry[];
export type GotoTable = GotoTableEntry[];
export type ProductionTable = ProductionTableEntry[];

export const isShiftAction = (action: TableAction): action is ShiftAction => {
  return Array.isArray(action);
};

export const isReduceAction = (action: TableAction): action is ReduceAction => {
  return !isShiftAction(action);
};

export const isSingleAction = (
  action: TableAction[] | TableAction,
): action is TableAction => {
  return !Array.isArray(action) || typeof action[0] === 'number';
};

export const isMultipleActions = (
  action: TableAction[] | TableAction,
): action is TableAction[] => {
  return !isSingleAction(action);
};
