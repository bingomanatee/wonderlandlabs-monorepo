import { useState, useEffect } from 'react';
import { Receipt } from './Receipt.tsx';
import { Item } from './Item.tsx';
import style from './eggStyle.module.css';
import EggInfo from './EggInfo.tsx';
import { startingBalance, startingEggs, startingHam } from './constants.ts';

const eggCost = 3;
const hamCost = 5;

function makeItem(initialBalance: number, type: string, cost: number, balance: number): Item {
  return {
    initialBalance,
    id: `${Math.random()}-${Date.now()}`.replace('0.', ''),
    item: '1 ' + type,
    cost: cost,
    currentBalance: balance,
  };
}

export function BuyEggsAndHam() {
  const [receipts, setReceipts] = useState<Item[]>([]);
  const [eggs, setEggs] = useState(startingEggs);
  const [ham, setHam] = useState(startingHam);
  const [balance, setBalance] = useState(startingBalance);

  // buy an egg if you can

  useEffect(() => {
    if (balance >= eggCost && eggs > 0) {
      setBalance((b) => b - eggCost);
      setEggs((e) => e - 1);

      const newItem = makeItem(balance, 'egg', eggCost, balance - eggCost);

      setReceipts((r) => [...r, newItem]);
    }
  }, [balance, eggs]);

  // buy a ham if you can

  useEffect(() => {
    if (balance >= hamCost && ham > 0) {
      setBalance((b) => b - hamCost);
      setHam((e) => e - 1);

      const newItem = makeItem(balance, 'ham', hamCost, balance - hamCost);

      setReceipts((r: Item[]) => [...r, newItem]);
    }
  }, [balance, ham]);

  return (
    <div className={style.Eggs}>
      <EggInfo balance={balance} eggs={eggs} ham={ham} />

      <table>
        <thead>
          <tr>
            <th>Item Purchased</th>
            <th>Item Cost</th>
            <th>Balance</th>
          </tr>
        </thead>

        <tbody>
          {receipts.map((r) => (
            <Receipt key={r.id} value={r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
