import fs from 'fs';

const unitTest = fs.readFileSync('./unitTest.ts');

fs.writeFileSync(
  'unitTest.mdx',
  `
import {SeeMore} from "../../../components/SeeMore";

<SeeMore open title="Example Unit Test">
${'```JavaScript'}
Here is the unit test suite for the Eggs example from [Transactional](/contents/transactional):
Collections have a similar profile and testing pattern.
${unitTest}
${'```'}

</SeeMore>
`
);
