import fs from 'fs';

const buyEggsAndHam = fs.readFileSync('./BuyEggsAndHam.tsx');

fs.writeFileSync(
  'BuyEggsAndHam.mdx',
  `
import {SeeMore} from "../../../components/SeeMore";

<SeeMore open title="EggsAndHam Source">
${'```JavaScript'}

${buyEggsAndHam}
${'```'}

</SeeMore>
`
);
const buyEggsAndHamForestry = fs.readFileSync('./BuyEggsAndHamWithForestry.tsx');

fs.writeFileSync(
  'BuyEggsAndHamWithForestry.mdx',
  `
import {SeeMore} from "../../../components/SeeMore";

<SeeMore title="EggsAndHamWithForestry Source">
${'```JavaScript'}

${buyEggsAndHamForestry}

${'```'}
</SeeMore>
`
);
