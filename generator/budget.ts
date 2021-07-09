import { YearlyBudgetScenarioValue } from "./types.d.ts";

export function getBudgetForAccount(
  accountGuid: string,
  budgetValues: YearlyBudgetScenarioValue[],
) {
  return budgetValues.find((b) => b.GLAccount === accountGuid)?.AmountDC;
}
