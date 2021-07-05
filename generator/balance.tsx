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
    <div class="balance">
      <div class="left">
        <h3>Activa</h3>
        {renderBalanceSide(left)}
      </div>

      <div class="right">
        <h3>Passiva</h3>
        {renderBalanceSide(right)}
      </div>
    </div>,
  );
}

function renderBalanceSide(
  classification: AccountTreeItemClassification,
) {
  return renderClassificationTree(classification);
}

function renderClassificationTree(
  item: AccountTreeItem,
  classificationDesc?: string,
): h.JSX.Element | undefined {
  if (item.type === "account") {
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

  const children = item.children.sort((a, b) => {
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

  const renderedChildren = children.map((c) =>
    renderClassificationTree(c, item.classification.Description)
  );

  if (!renderedChildren.some((c) => c)) {
    return;
  }

  const showHeader = !children.some((c) => c.type === "classification");

  return (
    <Fragment>
      {showHeader ? <h5>{item.classification.Description}</h5> : ""}
      {renderedChildren}
    </Fragment>
  );
}
