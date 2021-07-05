/** @jsx h */

import type {
  AccountResult,
  AccountTree,
  AccountTreeItem,
  AccountTreeItemAccount,
  AccountTreeItemClassification,
  SimplifiedClassification,
} from "../deps.ts";
import { Fragment, h, render } from "../deps.ts";
import {
  getClassificationData,
  removeAccountPrefix,
  renderClassificationIdNotFound,
} from "./classification.tsx";
import { formatNumberOptions, locale } from "./constants.ts";

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
  options?: ProfitLossOptions,
) {
  options = getOptions(options);
  const classification = getClassificationData(classificationId, tree);

  if (!classification) {
    return render(renderClassificationIdNotFound(classificationId));
  }

  const accountRows = renderClassificationAccountRows(classification, options);

  if (!accountRows) {
    return render(
      <p>
        <h3>{classification.classification.Description}</h3>
        <div class="warning">
          Classification '{classificationId}' does not have children of type
          'account'.
        </div>
      </p>,
    );
  }

  return render(
    <p>
      <h3>{classification.classification.Description}</h3>
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
    </p>,
  );
}

function renderClassificationAccountRows(
  classification: AccountTreeItemClassification,
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

          return (
            <tr>
              <td>{desc}</td>
              <td>{obj.debit}</td>
              <td>{obj.credit}</td>
              <td>{obj.total}</td>
              <td>{/* TODO: Begroot */}</td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        {renderClassificationAccountTotalRow(accounts)}
      </tfoot>
    </Fragment>
  );
}

function renderClassificationAccountTotalRow(
  accounts: AccountTreeItemAccount[],
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

  return (
    <tr>
      <td>Totaal</td>
      <td>{obj.debit}</td>
      <td>{obj.credit}</td>
      <td>{obj.total}</td>
      <td>{/* TODO: Begroot */}</td>
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
