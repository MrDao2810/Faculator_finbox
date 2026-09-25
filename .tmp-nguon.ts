import { QUIZ_ITEMS } from './src/core/quiz';

const IDS = [
  'Q454',
  'Q455',
  'Q456',
  'Q457',
  'Q458',
  'Q459',
  'Q462',
  'Q464',
  'Q465',
  'Q466',
  'Q470',
  'Q471',
];
for (const id of IDS) {
  const q = QUIZ_ITEMS.find((x) => x.id === id)!;
  console.log(`\n=== ${id} ${q.formulaId} ${q.source.url}`);
  console.log('PROMPT:', q.prompt.vi);
  for (const f of q.facts ?? []) console.log('  ', f.label.vi, '=>', f.value.vi);
  if (q.format === 'dien-so') console.log('WORKED:', q.worked.vi);
  const nhac = [q.explain.vi, q.explain.en ?? '', q.prompt.en ?? '']
    .join(' ')
    .match(/cophieu68|investing|Investing/g);
  console.log('nhắc nguồn trong explain/en:', nhac?.length ?? 0);
}
