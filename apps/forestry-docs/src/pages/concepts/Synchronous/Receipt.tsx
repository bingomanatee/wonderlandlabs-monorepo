import { USDollar } from './USDollar.tsx';
import type { Item } from './Item.tsx';

export function Receipt({ value }: { value: Item }) {
  return (
    <tr>
      <td>{USDollar.format(value.initialBalance)}</td>
      <td>{value.item}</td>
      <td>{USDollar.format(value.cost)}</td>
      <td>{USDollar.format(value.currentBalance)}</td>
    </tr>
  );
}
