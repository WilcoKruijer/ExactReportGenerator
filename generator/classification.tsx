/** @jsx h */

import type {
  AccountResult,
  AccountTree,
  AccountTreeItem,
  AccountTreeItemAccount,
  AccountTreeItemClassification,
  SimplifiedClassification,
  VNode,
} from "../deps.ts";
import { Fragment, h, render } from "../deps.ts";

const formatNumberLocale = "nl-NL" as const;
const formatNumberOptions = {
  minimumFractionDigits: 2,
} as const;

export function renderClassification(
  classificationId: string | number,
  tree: AccountTree,
) {
  const classification = getClassificationData(classificationId, tree);

  if (!classification) {
    return render(
      <div class="warning">
        Could not find classification for '{classificationId}'.
      </div>,
    );
  }

  return render(
    <Fragment>
      <h3>{classification.classification.Description}</h3>
      <table>
        <tr>
          <th>Post</th>
          <th>Debet</th>
          <th>Credit</th>
          <th>Saldo</th>
          <th>Begroot</th>
        </tr>
        {classificationAccountRows(classification, true)}
      </table>
    </Fragment>,
  );
}

function classificationAccountRows(
  classification: AccountTreeItemClassification,
  includeEmpty = false,
) {
  let accounts: AccountTreeItemAccount[] = classification.children.filter(
    (c): c is AccountTreeItemAccount => c.type === "account",
  ).sort((a, b) =>
    a.account.GLAccountDescription.localeCompare(
      b.account.GLAccountDescription,
      "nl-NL",
    )
  );

  if (!includeEmpty) {
    accounts = accounts.filter((a) => a.result);
  }

  return (
    <Fragment>
      {accounts.map((account) => {
        const obj = accountResultToLocale(account.result);

        return (
          <tr>
            <td>{account.account.GLAccountDescription}</td>
            <td>{obj.debit}</td>
            <td>{obj.credit}</td>
            <td>{obj.total}</td>
            <td>{/* TODO: Begroot */}</td>
          </tr>
        );
      })}
      {classificationAccountTotalRow(accounts)}
    </Fragment>
  );
}

function classificationAccountTotalRow(
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
      formatNumberLocale,
      formatNumberOptions,
    );
  }

  if (res?.AmountCredit) {
    obj.credit = res.AmountCredit.toLocaleString(
      formatNumberLocale,
      formatNumberOptions,
    );
  }

  if (res?.Amount) {
    obj.total = (-1 * res.Amount).toLocaleString(
      formatNumberLocale,
      formatNumberOptions,
    );
  }

  return obj;
}

function getClassificationData(
  classificationId: string | number,
  current: AccountTreeItem[],
): AccountTreeItemClassification | undefined {
  for (const treeItem of current) {
    if (
      treeItem.type === "account"
    ) {
      continue;
    }

    if (treeItem.type === "classification") {
      if (isClassification(classificationId, treeItem.classification)) {
        return treeItem;
      }

      let result;
      if (
        typeof (result = getClassificationData(
          classificationId,
          treeItem.children,
        )) !== "undefined"
      ) {
        return result;
      }
    }
  }
}

function isClassification(
  identifier: string | number,
  classification: SimplifiedClassification,
): boolean {
  if (typeof identifier === "string") {
    return classification.Description.toLowerCase() ===
      identifier.toLowerCase();
  }

  if (typeof identifier === "number") {
    return classification.Code === "" + identifier;
  }

  return false;
}
