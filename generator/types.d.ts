import type { BudgetScenarioValue } from "../deps.ts";

export type YearlyBudgetScenarioValue = Omit<
  BudgetScenarioValue,
  "ReportingPeriod"
>;
