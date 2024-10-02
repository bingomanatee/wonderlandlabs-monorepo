import { useEffect, useRef, useState } from 'react';
import { Forest } from '@wonderlandlabs/forestry';
import type { ForestIF, TreeIF } from '@wonderlandlabs/forestry/build/src/types';
import { Receipt } from './Receipt.tsx';
import { Item } from './Item.tsx';
import { eggCost, hamCost, startingBalance, startingEggs, startingHam } from './constants.ts';
import style from './eggStyle.module.css';
import EggInfo from './EggInfo.tsx';

function makeNumberState(name: string, amount: number, forest: ForestIF) {
  return forest.hasTree(name)
    ? forest.tree<number>(name)!
    : forest.addTree<number>(name, { initial: amount });
}

function makeReceiptsState(forest: ForestIF) {
  return forest.hasTree('receipts')
    ? forest.tree<Item[]>('receipts')!
    : forest.addTree<Item[]>('receipts', {
        initial: [],
      });
}

function makeItem(initialBalance: number, type: string, cost: number, balance: number): Item {
  return {
    initialBalance,
    id: `${Math.random()}-${Date.now()}`.replace('0.', ''),
    item: '1 ' + type,
    cost: cost,
    currentBalance: balance,
  };
}

export function BuyEggsAndHamWithForestry() {
  const forest = useRef(new Forest());
  // const [eggCost, setEggCost] = useState(3);

  const receiptsState = useRef(makeReceiptsState(forest.current));
  const [receipts, setReceipts] = useState<Item[]>([]);

  const eggsState = useRef<TreeIF<number>>(makeNumberState('eggs', startingEggs, forest.current));
  const [eggs, setEggs] = useState(eggsState.current?.value);

  const hamState = useRef<TreeIF<number>>(makeNumberState('ham', startingHam, forest.current));
  const [ham, setHam] = useState(hamState.current?.value);

  const balanceState = useRef<TreeIF<number>>(
    makeNumberState('balance', startingBalance, forest.current)
  );
  const [balance, setBalance] = useState(balanceState.current?.value);

  useEffect(() => {
    const subs = [
      eggsState.current.subscribe(setEggs),
      hamState.current.subscribe(setHam),
      balanceState.current.subscribe(setBalance),
      receiptsState.current.subscribe(setReceipts),
    ];
    return () => {
      subs.forEach((sub) => sub.unsubscribe());
    };
  }, []);

  // buy an egg if you can

  useEffect(() => {
    const initialBalance = balanceState.current.value;
    if (balanceState.current.value >= eggCost && eggsState.current.value > 0) {
      balanceState.current.update((b) => b - eggCost);
      eggsState.current.update((e) => e - 1);

      const newItem = makeItem(initialBalance, 'egg', eggCost, balanceState.current.value);

      receiptsState.current.update((r) => [...r, newItem]);
    }
  }, [balance, eggs]);

  // buy a ham if you can

  useEffect(() => {
    const initialBalance = balanceState.current.value;
    if (balanceState.current.value >= hamCost && hamState.current.value > 0) {
      balanceState.current.update((b) => b - hamCost);
      hamState.current.update((e) => e - 1);

      const newItem = makeItem(initialBalance, 'ham', hamCost, balanceState.current.value);

      receiptsState.current.update((r: Item[]) => [...r, newItem]);
    }
  }, [balance, ham]);

  return (
    <div className={style.Eggs}>
      <EggInfo balance={balance} eggs={eggs} ham={ham} />
      <table>
        <thead>
          <tr>
            <th>Initial Balance</th>
            <th>Purchased</th>
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
