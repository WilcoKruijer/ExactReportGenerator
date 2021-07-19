import type { AccountTree } from "../../deps.ts";
import { renderProfitLoss } from "../helpers/profit_loss.tsx";
import { YearlyBudgetScenarioValue } from "../services/budget.ts";
import {
  getDataFile,
  isHelperOptions,
  validateClassificationId,
} from "./helper_util.ts";

export async function classificationHelper(
  classification: unknown,
  options: unknown,
) {
  validateClassificationId(classification);

  if (!isHelperOptions(options)) {
    throw new TypeError("Invalid option object given.");
  }

  const report = await getDataFile<AccountTree>(options.report);
  const budget = options.budget
    ? await getDataFile<YearlyBudgetScenarioValue[]>(
      options.budget,
    )
    : undefined;

  return renderProfitLoss(
    classification,
    report,
    budget,
  );
}
