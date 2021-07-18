/** @jsx h */

import type {
  AccountTreeItem,
  AccountTreeItemClassification,
  SimplifiedClassification,
} from "../../deps.ts";
import { h } from "../../deps.ts";

export function renderClassificationIdNotFound(
  classificationId: string | number,
) {
  return (<p>
    <h3>{classificationId}</h3>
    <p class="warning">
      Could not find classification for '{classificationId}'.
    </p>
  </p>);
}

export function getClassificationData(
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

export function isClassification(
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
export function removeAccountPrefix(
  classificationDesc: string,
  accountDesc: string,
): string {
  const lowerClassificationDesc = classificationDesc.toLowerCase();

  if (!accountDesc.toLowerCase().startsWith(lowerClassificationDesc)) {
    return accountDesc;
  }

  const newAccountDesc = accountDesc.substr(classificationDesc.length)
    // Removes the dash and surrounding spaces
    .replace(/\s*-\s*/, "");

  if (!newAccountDesc) {
    // If we have transformed the description to an empty string we just keep
    // the original value.
    return accountDesc;
  }

  return newAccountDesc;
}
