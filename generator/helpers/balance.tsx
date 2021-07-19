/** @jsx h */

import type {
  AccountTree,
  AccountTreeItem,
  AccountTreeItemClassification,
  VNode,
} from "../../deps.ts";
import { Fragment, h, render } from "../../deps.ts";
import {
  getClassificationData,
  removeAccountPrefix,
  renderClassificationIdNotFound,
} from "../services/classification.tsx";
import { formatNumberOptions, locale } from "../constants.ts";
import {
  getDataFile,
  isHelperOptions,
  validateClassificationId,
} from "./helper_util.ts";

export async function balanceHelper(
  classificationLeft: unknown,
  classificationRight: unknown,
  options: unknown,
) {
  validateClassificationId(classificationLeft);
  validateClassificationId(classificationRight);

  if (!isHelperOptions(options)) {
    throw new TypeError("Invalid option object given.");
  }

  const report = await getDataFile<AccountTree>(options.report);

  return renderBalance(
    classificationLeft,
    classificationRight,
    report,
  );
}

export function renderBalance(
  classificationIdLeft: string | number,
  classificationIdRight: string | number,
  tree: AccountTree,
) {
  const left = getClassificationData(classificationIdLeft, tree);
  const right = getClassificationData(classificationIdRight, tree);

  if (!left) {
    return render(renderClassificationIdNotFound(classificationIdLeft));
  }

  if (!right) {
    return render(renderClassificationIdNotFound(classificationIdLeft));
  }

  const leftTotal = calculateTotalInTreeItems(left.children);
  const rightTotal = -1 * calculateTotalInTreeItems(right.children);
  const profit = leftTotal - rightTotal;

  return render(
    <Fragment>
      {renderBalanceTree(left, right, profit)}
      {renderBalanceTotals(leftTotal, rightTotal + profit)}
    </Fragment>,
  );
}

function renderBalanceTree(
  left: AccountTreeItemClassification,
  right: AccountTreeItemClassification,
  profit?: number,
) {
  let profitLossNode: VNode | undefined = undefined;

  if (typeof profit === "number") {
    const profitLossItem = createProfitLossTreeItem(profit);
    profitLossNode = renderClassificationTree(profitLossItem);
  }

  return (<div class="two-columns balance">
    <div class="left">
      <h3>Activa</h3>
      {renderClassificationTree(left)}
    </div>

    <div class="right">
      <h3>Passiva</h3>
      {renderClassificationTree(right, -1)}
      {profitLossNode}
    </div>
  </div>);
}

function renderBalanceTotals(
  left: number,
  right: number,
) {
  return (
    <div class="two-columns balance-total">
      <div class="left">
        {renderBalanceLine("Totaal activa:", left)}
      </div>

      <div class="right">
        {renderBalanceLine("Totaal passiva:", right)}
      </div>
    </div>
  );
}

function renderClassificationTreeAccount(
  item: AccountTreeItem,
  multiplier = 1,
  classificationDesc?: string,
): h.JSX.Element | undefined {
  if (item.type !== "account") {
    return;
  }

  if (!item.result || !item.result.Amount) {
    return;
  }

  const desc = classificationDesc
    ? removeAccountPrefix(
      classificationDesc,
      item.account.GLAccountDescription,
    )
    : item.account.GLAccountDescription;

  return renderBalanceLine(desc, item.result.Amount * multiplier);
}

function sortAccountTreeItems(items: AccountTreeItem[]): AccountTreeItem[] {
  return items.sort((a, b) => {
    const nameA = a.type === "account"
      ? a.account.GLAccountDescription
      : a.classification.Description;
    const nameB = b.type === "account"
      ? b.account.GLAccountDescription
      : b.classification.Description;

    return nameA.localeCompare(
      nameB,
      locale,
    );
  });
}

function calculateTotalInTreeItems(items: AccountTreeItem[]): number {
  return items.reduce((accumulator, current) => {
    if (current.type === "classification") {
      return accumulator + calculateTotalInTreeItems(current.children);
    }

    if (!current.result) {
      return accumulator;
    }

    return accumulator + current.result.Amount;
  }, 0);
}

function renderClassificationTree(
  item: AccountTreeItem,
  multiplier = 1,
  classificationDesc?: string,
): h.JSX.Element | undefined {
  if (item.type === "account") {
    return renderClassificationTreeAccount(
      item,
      multiplier,
      classificationDesc,
    );
  }

  const children = sortAccountTreeItems(item.children);

  const renderedChildren = children.map((c) =>
    renderClassificationTree(c, multiplier, item.classification.Description)
  );

  if (!renderedChildren.some((c) => c)) {
    return;
  }

  const showHeader = !children.some((c) => c.type === "classification");
  const total = showHeader
    ? renderBalanceLine(
      "Totaal",
      calculateTotalInTreeItems(children) * multiplier,
      [
        "balance--line--total",
      ],
    )
    : undefined;

  return (
    <Fragment>
      {showHeader
        ? <h4 class="balance--header">{item.classification.Description}</h4>
        : ""}
      {renderedChildren}
      {total}
    </Fragment>
  );
}

function renderBalanceLine(
  description: string,
  amount: number,
  extraDescriptionClasses: string[] = [],
) {
  const descriptionClasses = [
    "balance--line--description",
    ...extraDescriptionClasses,
  ];
  return (
    <div class="balance--line">
      <span class={descriptionClasses.join(" ")}>
        {description}
      </span>
      <span class="balance--line--amount">
        {amount.toLocaleString(
          locale,
          formatNumberOptions,
        )}
      </span>
    </div>
  );
}

function createProfitLossTreeItem(
  profit: number,
): AccountTreeItemClassification {
  const description = profit >= 0 ? "Winst" : "Verlies";
  return {
    type: "classification",
    classification: {
      ID: "",
      Code: "",
      Description: "Te alloceren",
      PeriodType: "instant",
    },
    children: [{
      type: "account",
      account: {
        GLAccount: "",
        GLAccountCode: "",
        GLAccountDescription: description,
      },
      result: {
        Amount: profit,
        AmountCredit: profit >= 0 ? profit : 0,
        AmountDebit: profit < 0 ? profit : 0,
        BalanceType: "B",
        Count: 1,
      },
    }],
  };
}
