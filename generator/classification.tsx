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

const locale = "nl-NL" as const;
const formatNumberOptions = {
  minimumFractionDigits: 2,
} as const;
const defaultOptions: ClassificationOptions = {
  includeEmpty: true,
  removePrefix: true,
} as const;

export interface ClassificationOptions {
  includeEmpty?: boolean;
  removePrefix?: boolean;
}

function getOptions(options?: ClassificationOptions): ClassificationOptions {
  if (!options) {
    return defaultOptions;
  }

  return {
    ...defaultOptions,
    ...options,
  };
}

export function renderClassification(
  classificationId: string | number,
  tree: AccountTree,
  options?: ClassificationOptions,
) {
  options = getOptions(options);
  const classification = getClassificationData(classificationId, tree);

  if (!classification) {
    return render(
      <p>
        <h3>{classificationId}</h3>
        <p class="warning">
          Could not find classification for '{classificationId}'.
        </p>
      </p>,
    );
  }

  const accountRows = classificationAccountRows(classification, options);

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

function classificationAccountRows(
  classification: AccountTreeItemClassification,
  options: Pick<ClassificationOptions, "includeEmpty" | "removePrefix">,
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
        {classificationAccountTotalRow(accounts)}
      </tfoot>
    </Fragment>
  );
}

/**
 * Removes the prefixed classification name/description from the account
 * name/description.
 *
 * A usual case is where the classification is called 'Vervoerie', and an
 * account is called 'Vervoerie - Activiteiten'. Not only should the prefix
 * 'Vervoerie' be removed but also the dash and surrounding spaces.
 * @param classificationDesc
 * @param accountDesc
 * @returns the new filtered account description.
 */
function removeAccountPrefix(
  classificationDesc: string,
  accountDesc: string,
): string {
  const lowerClassificationDesc = classificationDesc.toLowerCase();
  const newAccountDesc =
    accountDesc.toLowerCase().startsWith(lowerClassificationDesc)
      ? accountDesc.substr(classificationDesc.length)
      : accountDesc;

  // Removes the dash and surrounding spaces
  return newAccountDesc.replace(/\s*-\s*/, "");
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
