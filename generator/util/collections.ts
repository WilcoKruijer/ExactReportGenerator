// From https://github.com/denoland/deno_std/pull/993/files (licensed MIT)
// This can be removed when #993 is merged.

export type Predicate<T> = (item: T) => boolean;
export type Selector<T, O = unknown> = (item: T) => O;
export type Grouping<V> = Record<string, Array<V>>;

export function cumulativeSum(
  array: Array<number>,
) {
  let accumulator = 0;
  return array.map((n) => accumulator += n);
}

/**
 * @param array
 * @returns the input without the last item.
 */
export function init<T>(
  array: Array<T>,
): Array<T> {
  const take = array.length - 1 >= 0 ? array.length - 1 : 0;

  return array.slice(0, take);
}

export function groupBy<T>(
  array: Array<T>,
  selector: Selector<T, string>,
): Grouping<T> {
  const ret: { [key: string]: Array<T> } = {};

  for (const element of array) {
    const key = selector(element);

    if (ret[key] === undefined) {
      ret[key] = [element];

      continue;
    }

    ret[key].push(element);
  }

  return ret;
}
