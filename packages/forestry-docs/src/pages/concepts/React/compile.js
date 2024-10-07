import fs from 'fs';

const conceptsState = fs.readFileSync('./../concepts.state.ts');

fs.writeFileSync(
  'example.mdx',
  `
import {SeeMore} from "../../../components/SeeMore";

<SeeMore title="A More Involved Example">
${'```JavaScript'}

This is the controller for the concepts section. The concept data for each page 
is loaded as data and interated over for navigation. The detail page examines the 
concept for page based on the url. Also, the rotating focus of the index page
is managed with custom methods. 

${conceptsState}
${'```'}

</SeeMore>
`
);
