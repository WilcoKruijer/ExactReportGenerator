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
import {
  getClassificationData,
  removeAccountPrefix,
  renderClassificationIdNotFound,
} from "./classification.tsx";
import { formatNumberOptions, locale } from "./constants.ts";

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

  return render(
    <Fragment>
      {renderBalanceTree(left, right)}
      {renderBalanceTotals(left, right)}
    </Fragment>,
  );
}

function renderBalanceTree(
  left: AccountTreeItemClassification,
  right: AccountTreeItemClassification,
) {
  return (<div class="balance">
    <div class="left">
      <h3>Activa</h3>
      {renderClassificationTree(left)}
    </div>

    <div class="right">
      <h3>Passiva</h3>
      {renderClassificationTree(right)}
    </div>
  </div>);
}

function renderBalanceTotals(
  left: AccountTreeItemClassification,
  right: AccountTreeItemClassification,
) {
  return (
    <div class="balance balance-total">
      <div class="left">
        <div class="balance--line">
          <span class="balance--line--description">
            Totaal activa:
          </span>
          <span class="balance--line--amount">
            {calculateTotalInTreeItems(left.children).toLocaleString(
              locale,
              formatNumberOptions,
            )}
          </span>
        </div>
      </div>

      <div class="right">
        <div class="balance--line">
          <span class="balance--line--description">
            Totaal passiva:
          </span>
          <span class="balance--line--amount">
            {calculateTotalInTreeItems(right.children).toLocaleString(
              locale,
              formatNumberOptions,
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

function renderClassificationTreeAccount(
  item: AccountTreeItem,
  classificationDesc?: string,
): h.JSX.Element | undefined {
  if (item.type !== "account") {
    return;
  }

  if (!item.result) {
    return;
  }

  const desc = classificationDesc
    ? removeAccountPrefix(
      classificationDesc,
      item.account.GLAccountDescription,
    )
    : item.account.GLAccountDescription;

  return (
    <div class="balance--line">
      <span class="balance--line--description">
        {desc}
      </span>
      <span class="balance--line--amount">
        {item.result.Amount.toLocaleString(locale, formatNumberOptions)}
      </span>
    </div>
  );
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
  classificationDesc?: string,
): h.JSX.Element | undefined {
  if (item.type === "account") {
    return renderClassificationTreeAccount(item, classificationDesc);
  }

  const children = sortAccountTreeItems(item.children);

  const renderedChildren = children.map((c) =>
    renderClassificationTree(c, item.classification.Description)
  );

  if (!renderedChildren.some((c) => c)) {
    return;
  }

  const showHeader = !children.some((c) => c.type === "classification");
  let total: VNode | undefined = undefined;
  if (showHeader) {
    total = (
      <div class="balance--line">
        <span class="balance--line--description balance--line--total">
          Totaal
        </span>
        <span class="balance--line--amount">
          {calculateTotalInTreeItems(children).toLocaleString(
            locale,
            formatNumberOptions,
          )}
        </span>
      </div>
    );
  }

  return (
    <Fragment>
      {showHeader ? <h5>{item.classification.Description}</h5> : ""}
      {renderedChildren}
      {total}
    </Fragment>
  );
}
