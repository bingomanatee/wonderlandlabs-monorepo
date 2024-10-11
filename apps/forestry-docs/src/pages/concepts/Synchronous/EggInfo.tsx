import { eggCost, hamCost, startingEggs, startingHam } from './constants.ts';
import { USDollar } from './USDollar.tsx';

export default function EggInfo({
  eggs,
  ham,
  balance,
}: {
  eggs: number;
  balance: number;
  ham: number;
}) {
  return (
    <>
      <h1 className="egg-header">Let's buy some Eggs and Ham</h1>

      <p>
        Eggs Remaining: {eggs} from {startingEggs} ({USDollar.format(eggCost)} each)
      </p>
      <p>
        Ham Remaining: {ham} from {startingHam} ({USDollar.format(hamCost)} each)
      </p>
      <p> Balance: {USDollar.format(balance)}</p>
    </>
  );
}
