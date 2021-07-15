import type {
  TransactionLine,
} from "https://raw.githubusercontent.com/WilcoKruijer/ExactApiExplorer/v0.2.0/repositories/exact_models.d.ts";

function getRandomArbitrary(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

const fileName = "_data/example/transactions_gl1.json";
const transactions: TransactionLine[] = JSON.parse(
  Deno.readTextFileSync(fileName),
);

const targetYear = 2017;

for (const t of transactions) {
  let amount = -getRandomArbitrary(0, 7);

  if (Math.random() >= 0.9) {
    amount -= getRandomArbitrary(40, 110);
  }

  t.AmountDC = amount;
  t.AmountFC = amount;

  const d = new Date(t.Date);
  d.setUTCDate(d.getUTCDate() + getRandomArbitrary(-75, 100));
  d.setUTCFullYear(targetYear);

  t.FinancialYear = targetYear;
  t.Date = d.toJSON();
}

Deno.writeTextFileSync(
  "_data/example/transactions_gl2.json",
  JSON.stringify(transactions, null, 2),
);
