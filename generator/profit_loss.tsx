/** @jsx h */

import type {
  AccountResult,
  AccountTree,
  AccountTreeItemAccount,
  AccountTreeItemClassification,
} from "../deps.ts";

import type { YearlyBudgetScenarioValue } from "./types.d.ts";

import { Fragment, h, render } from "../deps.ts";
import {
  getClassificationData,
  removeAccountPrefix,
  renderClassificationIdNotFound,
} from "./classification.tsx";
import { formatNumberOptions, locale } from "./constants.ts";
import { getBudgetForAccount } from "./budget.ts";

const defaultOptions: ProfitLossOptions = {
  includeEmpty: true,
  removePrefix: true,
} as const;

export interface ProfitLossOptions {
  includeEmpty?: boolean;
  removePrefix?: boolean;
}

function getOptions(options?: ProfitLossOptions): ProfitLossOptions {
  if (!options) {
    return defaultOptions;
  }

  return {
    ...defaultOptions,
    ...options,
  };
}

export function renderProfitLoss(
  classificationId: string | number,
  tree: AccountTree,
  budget?: YearlyBudgetScenarioValue[],
  options?: ProfitLossOptions,
) {
  options = getOptions(options);
  const classification = getClassificationData(classificationId, tree);

  if (!classification) {
    return render(renderClassificationIdNotFound(classificationId));
  }

  const accountRows = renderClassificationAccountRows(
    classification,
    budget,
    options,
  );

  if (!accountRows) {
    // Renders the header using markdown so it can be included in the table of
    // content.
    return render(
      <Fragment>
        ### {classification.classification.Description + "\n"}
        <div class="warning">
          Classification '{classificationId}' does not have children of type
          'account'.
        </div>
      </Fragment>,
    );
  }

  return render(
    <Fragment>
      ### {classification.classification.Description + "\n"}
      <table>
        <thead>
          <tr>
            <th>Post</th>
            <th>Debet</th>
            <th>Credit</th>
            <th>Saldo</th>
            <th>Begroot</th>
          </tr>
        </thead>
        {accountRows}
      </table>
    </Fragment>,
  );
}

function renderClassificationAccountRows(
  classification: AccountTreeItemClassification,
  budget: YearlyBudgetScenarioValue[] | undefined,
  options: Pick<ProfitLossOptions, "includeEmpty" | "removePrefix">,
) {
  let accounts: AccountTreeItemAccount[] = classification.children.filter(
    (c): c is AccountTreeItemAccount => c.type === "account",
  ).sort((a, b) =>
    a.account.GLAccountDescription.localeCompare(
      b.account.GLAccountDescription,
      locale,
    )
  );

  if (!options.includeEmpty) {
    accounts = accounts.filter((a) => a.result);
  }

  if (!accounts.length) {
    return;
  }

  return (
    <Fragment>
      <tbody>
        {accounts.map((account) => {
          const desc = options.removePrefix
            ? removeAccountPrefix(
              classification.classification.Description,
              account.account.GLAccountDescription,
            )
            : account.account.GLAccountDescription;

          const obj = accountResultToLocale(account.result);

          let budgetString = "";
          if (Array.isArray(budget)) {
            let budgetAmount = getBudgetForAccount(
              account.account.GLAccount,
              budget,
            );

            if (budgetAmount) {
              budgetAmount *= -1;
            }

            budgetString = budgetAmount?.toLocaleString(
              locale,
              formatNumberOptions,
            ) ?? "";
          }

          return (
            <tr>
              <td>{desc}</td>
              <td>{obj.debit}</td>
              <td>{obj.credit}</td>
              <td>{obj.total}</td>
              <td>{budgetString}</td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        {renderClassificationAccountTotalRow(accounts, budget)}
      </tfoot>
    </Fragment>
  );
}

function renderClassificationAccountTotalRow(
  accounts: AccountTreeItemAccount[],
  budget: YearlyBudgetScenarioValue[] | undefined,
) {
  const total = accounts.reduce<
    Pick<AccountResult, "AmountDebit" | "AmountCredit" | "Amount">
  >((prev, current) => ({
    AmountDebit: prev.AmountDebit + (current.result?.AmountDebit || 0),
    AmountCredit: prev.AmountCredit + (current.result?.AmountCredit || 0),
    Amount: prev.Amount + (current.result?.Amount || 0),
  }), {
    AmountDebit: 0,
    AmountCredit: 0,
    Amount: 0,
  });

  const obj = accountResultToLocale(total);

  let budgetString = "";
  if (Array.isArray(budget)) {
    let totalBudget = accounts.reduce<number | undefined>((prev, account) => {
      const budgetAmount = getBudgetForAccount(
        account.account.GLAccount,
        budget,
      );

      if (typeof prev === "undefined") {
        return budgetAmount;
      }

      if (typeof budgetAmount === "undefined") {
        return prev;
      }

      return prev + budgetAmount;
    }, undefined);

    if (totalBudget) {
      totalBudget *= -1;
    }

    budgetString = totalBudget?.toLocaleString(
      locale,
      formatNumberOptions,
    ) ?? "";
  }

  return (
    <tr>
      <td>Totaal</td>
      <td>{obj.debit}</td>
      <td>{obj.credit}</td>
      <td>{obj.total}</td>
      <td>{budgetString}</td>
    </tr>
  );
}

function accountResultToLocale(
  res:
    | Pick<AccountResult, "AmountDebit" | "AmountCredit" | "Amount">
    | undefined,
) {
  const obj = {
    debit: "",
    credit: "",
    total: "",
  };

  if (res?.AmountDebit) {
    obj.debit = res.AmountDebit.toLocaleString(
      locale,
      formatNumberOptions,
    );
  }

  if (res?.AmountCredit) {
    obj.credit = res.AmountCredit.toLocaleString(
      locale,
      formatNumberOptions,
    );
  }

  if (res?.Amount) {
    obj.total = (-1 * res.Amount).toLocaleString(
      locale,
      formatNumberOptions,
    );
  }

  return obj;
}
