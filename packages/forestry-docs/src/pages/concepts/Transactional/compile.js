import fs from 'fs';

const eggSample = fs.readFileSync('./eggSample.ts');

fs.writeFileSync(
  'eggSample.mdx',
  `
${'```JavaScript'}

${eggSample}
${'```'}
`
);
