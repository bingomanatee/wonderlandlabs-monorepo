/**
 * translate a number from one min-max base
 * to a different min-max base
 */
export function project(
  n: number,
  min: number,
  max: number,
  min2: number,
  max2: number
) {
  const domain = max - min;
  const range = max2 - min2;
  const extent = (n - min) / domain;
  return extent * range + min2;
}
