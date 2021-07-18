import type { BudgetScenarioValue } from "../../deps.ts";

export type YearlyBudgetScenarioValue = Omit<
  BudgetScenarioValue,
  "ReportingPeriod"
>;


export function getBudgetForAccount(
  accountGuid: string,
  budgetValues: YearlyBudgetScenarioValue[],
) {
  return budgetValues.find((b) => b.GLAccount === accountGuid)?.AmountDC;
}
