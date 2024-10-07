import fs from 'fs';

const observation = fs.readFileSync('./observation.ts');

fs.writeFileSync(
  'observation.mdx',
  `
${'```JavaScript'}

${observation}
${'```'}
`
);
