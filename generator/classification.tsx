/** @jsx h */

import type {
  AccountTree,
  AccountTreeItem,
  AccountTreeItemAccount,
  AccountTreeItemClassification,
  SimplifiedClassification,
  VNode,
} from "../deps.ts";
import { Fragment, h, render } from "../deps.ts";

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

  const options = {
    minimumFractionDigits: 2,
  };

  return accounts.map((account) => {
    const res = account.result;

    let debit = "", credit = "", total = "";
    if (res?.AmountDebit) {
      debit = res.AmountDebit.toLocaleString("nl-NL", options);
    }

    if (res?.AmountCredit) {
      credit = res.AmountCredit.toLocaleString("nl-NL", options);
    }

    if (res?.Amount) {
      total = (-1 * res.Amount).toLocaleString("nl-NL", options);
    }

    return (
      <tr>
        <td>{account.account.GLAccountDescription}</td>
        <td>{debit}</td>
        <td>{credit}</td>
        <td>{total}</td>
        <td>{/* TODO: Begroot */}</td>
      </tr>
    );
  });
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
