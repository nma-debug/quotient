/**
 * Procedural question generators for Quotient, mirroring the Learned app's runtime pattern.
 * Each generator takes a `diff` value (1–1000) and returns a Question or null on failure.
 * The adaptive engine calls generateQuestion(level, usedIds) which maps level → diff and
 * tries generators across all categories until a fresh (unseen) question is produced.
 */

import type { Question, Category, Difficulty } from '../types'

const rint = (lo: number, hi: number) =>
  Math.floor(Math.random() * (hi - lo + 1)) + lo

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function diffBand(r: number): Difficulty {
  return r < 334 ? 'easy' : r < 667 ? 'medium' : 'hard'
}

function makeQ(
  id: string,
  category: Category,
  style: string,
  rating: number,
  prompt: string,
  correct: string,
  distractors: string[],
  explanation: string,
): Question | null {
  const seen = new Set([correct])
  const pool: string[] = [correct]
  for (const d of distractors) {
    if (!seen.has(d)) { seen.add(d); pool.push(d) }
    if (pool.length === 4) break
  }
  if (pool.length < 4) return null
  return {
    id,
    category,
    difficulty: diffBand(rating),
    type: 'multiple-choice',
    prompt,
    options: shuffle(pool),
    answer: correct,
    explanation,
    style,
    difficultyRating: rating,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEQUENCE generators
// ─────────────────────────────────────────────────────────────────────────────

function seqArithmetic(diff: number): Question | null {
  const negative = diff > 400 && Math.random() < 0.35
  const step = negative
    ? -rint(2, diff < 700 ? 8 : 20)
    : rint(1, diff < 250 ? 4 : diff < 550 ? 10 : 25)
  const start = rint(diff < 400 ? 1 : -30, diff < 400 ? 50 : 200)
  const seq: number[] = [start]
  for (let i = 1; i < 5; i++) seq.push(seq[i - 1] + step)
  const ans = seq[4] + step
  const rating = Math.min(980, 80 + Math.abs(step) * 28 + (negative ? 160 : 0) + (start < 0 ? 80 : 0))
  return makeQ(
    `gen:seq:arith:${start}:${step}`,
    'sequence', 'arithmetic', rating,
    `What comes next?\n\n${seq.join(', ')}, __`,
    String(ans),
    [String(ans + step), String(ans - step), String(ans + step * 2), String(ans + 1)],
    `The sequence ${step > 0 ? 'increases' : 'decreases'} by ${Math.abs(step)} each time. ${seq[4]} ${step > 0 ? '+' : '−'} ${Math.abs(step)} = ${ans}.`,
  )
}

function seqGeometric(diff: number): Question | null {
  const ratio = diff < 300 ? pick([2, 3]) : diff < 650 ? pick([2, 3, 4, 5]) : pick([3, 4, 5, 10])
  const start = rint(1, diff < 400 ? 3 : 6)
  const seq: number[] = [start]
  for (let i = 1; i < 5; i++) seq.push(seq[i - 1] * ratio)
  if (seq[4] > 500_000) return null
  const ans = seq[4] * ratio
  return makeQ(
    `gen:seq:geo:${start}:${ratio}`,
    'sequence', 'geometric', Math.min(980, 180 + ratio * 55 + (start > 2 ? 60 : 0)),
    `What comes next?\n\n${seq.join(', ')}, __`,
    String(ans),
    [String(ans + ratio), String(ans - ratio), String(seq[4] + ratio), String(ans * 2)],
    `Each number is multiplied by ${ratio}. ${seq[4]} × ${ratio} = ${ans}.`,
  )
}

function seqFibonacci(diff: number): Question | null {
  const a = diff < 400 ? 1 : rint(1, 5)
  const b = diff < 400 ? pick([1, 2]) : rint(a, a + 5)
  const seq: number[] = [a, b]
  for (let i = 2; i < 6; i++) seq.push(seq[i - 1] + seq[i - 2])
  const ans = seq[5]
  return makeQ(
    `gen:seq:fib:${a}:${b}`,
    'sequence', 'fibonacci', diff < 400 ? 420 : 680,
    `What comes next?\n\n${seq.slice(0, 5).join(', ')}, __`,
    String(ans),
    [String(ans + 1), String(ans - 1), String(seq[4] + seq[2]), String(seq[3] + seq[4] + 1)],
    `Each number is the sum of the two before it: ${seq[3]} + ${seq[4]} = ${ans}.`,
  )
}

function seqPrimes(_diff: number): Question | null {
  const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71]
  const startIdx = rint(0, PRIMES.length - 7)
  const seq = PRIMES.slice(startIdx, startIdx + 5)
  const ans = PRIMES[startIdx + 5]
  return makeQ(
    `gen:seq:prime:${startIdx}`,
    'sequence', 'primes', 620,
    `What comes next in this prime number sequence?\n\n${seq.join(', ')}, __`,
    String(ans),
    [String(ans + 2), String(ans - 2), String(ans + 4), String(ans + 1)],
    `These are consecutive prime numbers (divisible only by 1 and themselves). The next prime after ${seq[4]} is ${ans}.`,
  )
}

function seqSquares(diff: number): Question | null {
  const start = diff < 400 ? rint(1, 5) : rint(3, 11)
  const seq = [0, 1, 2, 3, 4].map(i => (start + i) ** 2)
  const n = start + 5
  const ans = n * n
  return makeQ(
    `gen:seq:sq:${start}`,
    'sequence', 'squares', diff < 400 ? 280 : 540,
    `What comes next in this sequence of perfect squares?\n\n${seq.join(', ')}, __`,
    String(ans),
    [String(ans + n), String(ans - (n - 1)), String((start + 6) ** 2), String(seq[4] + (n - 1))],
    `These are perfect squares: ${start}², ${start + 1}², …, ${start + 4}². Next is ${n}² = ${ans}.`,
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALOGY generators — curated bank so answers are unambiguous
// ─────────────────────────────────────────────────────────────────────────────

interface AnalogyItem {
  prompt: string       // "A is to B as C is to __"
  answer: string
  distractors: string[]
  explanation: string
  rating: number
}

const ANALOGIES: AnalogyItem[] = [
  // Opposites
  { prompt: 'Hot is to Cold as Expand is to __', answer: 'Contract', distractors: ['Inflate', 'Grow', 'Stretch'], explanation: 'Hot and Cold are opposites. Expand and Contract are opposites in the same way.', rating: 180 },
  { prompt: 'Transparent is to Opaque as Volatile is to __', answer: 'Stable', distractors: ['Reactive', 'Liquid', 'Flammable'], explanation: 'Transparent and Opaque are opposites. Volatile and Stable are opposites.', rating: 520 },
  { prompt: 'Benevolent is to Malevolent as Lucid is to __', answer: 'Murky', distractors: ['Clear', 'Bright', 'Vivid'], explanation: 'Benevolent and Malevolent are opposites (kind vs wicked). Lucid and Murky are opposites (clear vs cloudy).', rating: 680 },
  { prompt: 'Ascend is to Descend as Amplify is to __', answer: 'Diminish', distractors: ['Boost', 'Reduce', 'Quieten'], explanation: 'Ascend and Descend are opposites. Amplify and Diminish are opposites.', rating: 580 },
  { prompt: 'Frugal is to Extravagant as Ephemeral is to __', answer: 'Permanent', distractors: ['Fleeting', 'Transient', 'Brief'], explanation: 'Frugal and Extravagant are opposites (thrifty vs wasteful). Ephemeral and Permanent are opposites (brief vs lasting).', rating: 750 },
  // Part-whole
  { prompt: 'Chapter is to Book as Verse is to __', answer: 'Poem', distractors: ['Song', 'Novel', 'Stanza'], explanation: 'A chapter is a part of a book. A verse is a part of a poem.', rating: 220 },
  { prompt: 'Neuron is to Brain as Pixel is to __', answer: 'Image', distractors: ['Screen', 'Colour', 'Camera'], explanation: 'A neuron is a unit of the brain. A pixel is a unit of a digital image.', rating: 420 },
  { prompt: 'Atom is to Molecule as Cell is to __', answer: 'Organism', distractors: ['Nucleus', 'Tissue', 'Protein'], explanation: 'Atoms combine to form molecules. Cells combine to form an organism.', rating: 560 },
  { prompt: 'Movement is to Symphony as Act is to __', answer: 'Play', distractors: ['Scene', 'Opera', 'Film'], explanation: 'A movement is a section of a symphony. An act is a section of a play.', rating: 480 },
  { prompt: 'Clause is to Sentence as Paragraph is to __', answer: 'Essay', distractors: ['Chapter', 'Article', 'Word'], explanation: 'A clause is a grammatical unit within a sentence. A paragraph is a structural unit within an essay.', rating: 380 },
  // Function / purpose
  { prompt: 'Barometer is to Pressure as Seismograph is to __', answer: 'Earthquakes', distractors: ['Altitude', 'Temperature', 'Gravity'], explanation: 'A barometer measures atmospheric pressure. A seismograph measures earthquake activity.', rating: 640 },
  { prompt: 'Rudder is to Steer as Catalyst is to __', answer: 'Accelerate', distractors: ['Fuel', 'React', 'Combine'], explanation: 'A rudder is used to steer a vessel. A catalyst is used to accelerate a chemical reaction.', rating: 700 },
  { prompt: 'Vaccine is to Immunity as Filter is to __', answer: 'Purification', distractors: ['Infection', 'Separation', 'Absorption'], explanation: 'A vaccine produces immunity. A filter produces purification.', rating: 600 },
  { prompt: 'Scalpel is to Cut as Compass is to __', answer: 'Navigate', distractors: ['Draw', 'Measure', 'Point'], explanation: 'A scalpel is a tool used to cut. A compass is a tool used to navigate.', rating: 350 },
  // Degree / scale
  { prompt: 'Warm is to Hot as Cool is to __', answer: 'Cold', distractors: ['Mild', 'Chilly', 'Crisp'], explanation: 'Warm is a lesser degree of Hot. Cool is a lesser degree of Cold.', rating: 200 },
  { prompt: 'Probable is to Certain as Possible is to __', answer: 'Inevitable', distractors: ['Likely', 'Definite', 'Expected'], explanation: 'Probable is a lesser degree of Certain. Possible is a lesser degree of Inevitable.', rating: 710 },
  { prompt: 'Mistake is to Blunder as Discomfort is to __', answer: 'Agony', distractors: ['Pain', 'Ache', 'Distress'], explanation: 'A blunder is a greater degree of mistake. Agony is a greater degree of discomfort.', rating: 650 },
  // Transformation / process
  { prompt: 'Ore is to Metal as Grape is to __', answer: 'Wine', distractors: ['Juice', 'Fruit', 'Raisin'], explanation: 'Ore is processed (smelted) to produce metal. Grapes are fermented to produce wine.', rating: 430 },
  { prompt: 'Hypothesis is to Theory as Draft is to __', answer: 'Publication', distractors: ['Manuscript', 'Proof', 'Revision'], explanation: 'A hypothesis matures into a theory through evidence. A draft is refined into a publication.', rating: 680 },
  { prompt: 'Cocoon is to Butterfly as Larva is to __', answer: 'Adult insect', distractors: ['Pupa', 'Egg', 'Grub'], explanation: 'A cocoon is the stage before a butterfly. A larva is the stage before an adult insect.', rating: 380 },
]

function makeAnalogy(diff: number): Question | null {
  const pool = diff < 350
    ? ANALOGIES.filter(a => a.rating < 450)
    : diff < 650
      ? ANALOGIES.filter(a => a.rating >= 300 && a.rating < 750)
      : ANALOGIES.filter(a => a.rating >= 550)
  if (!pool.length) return makeAnalogy(Math.min(diff + 200, 900))
  const item = pick(pool)
  return makeQ(
    `gen:ana:${item.answer.replace(/\s+/g, '-')}`,
    'analogy', 'analogy', item.rating,
    item.prompt,
    item.answer,
    item.distractors,
    item.explanation,
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIC generators
// ─────────────────────────────────────────────────────────────────────────────

interface SyllogismTemplate {
  major: string; minor: string; subject: string
  conclusion: string; distractors: string[]
  explanation: string; rating: number
}

const SYLLOGISMS: SyllogismTemplate[] = [
  {
    major: 'All mammals breathe air',
    minor: 'Dolphins are mammals',
    subject: 'dolphins',
    conclusion: 'breathe air',
    distractors: ['live in water', 'are fish', 'are cold-blooded'],
    explanation: 'Since all mammals breathe air, and dolphins are mammals, dolphins must breathe air.',
    rating: 280,
  },
  {
    major: 'All prime numbers greater than 2 are odd',
    minor: '17 is a prime number greater than 2',
    subject: '17',
    conclusion: 'is odd',
    distractors: ['is even', 'is divisible by 3', 'is composite'],
    explanation: 'Since all primes > 2 are odd, and 17 is a prime > 2, 17 must be odd.',
    rating: 400,
  },
  {
    major: 'All elements in Group 18 of the periodic table are noble gases',
    minor: 'Argon is in Group 18',
    subject: 'Argon',
    conclusion: 'is a noble gas',
    distractors: ['is highly reactive', 'is a metal', 'has a low atomic number'],
    explanation: 'Group 18 elements are all noble gases. Argon is in Group 18, so Argon is a noble gas.',
    rating: 520,
  },
  {
    major: 'All renewable energy sources are sustainable long-term',
    minor: 'Solar power is a renewable energy source',
    subject: 'Solar power',
    conclusion: 'is sustainable long-term',
    distractors: ['produces CO₂ emissions', 'will eventually run out', 'is non-renewable'],
    explanation: 'All renewable sources are sustainable. Solar power is renewable, so solar power is sustainable long-term.',
    rating: 350,
  },
  {
    major: 'All algorithms with polynomial time complexity are in class P',
    minor: 'Merge sort has O(n log n) time complexity',
    subject: 'Merge sort',
    conclusion: 'is in class P',
    distractors: ['is NP-complete', 'cannot be solved efficiently', 'is in class NP only'],
    explanation: 'O(n log n) is polynomial. All polynomial-time algorithms are in P. So merge sort is in P.',
    rating: 800,
  },
  {
    major: 'No vertebrates are invertebrates',
    minor: 'Sharks are vertebrates',
    subject: 'Sharks',
    conclusion: 'are not invertebrates',
    distractors: ['are invertebrates', 'lack a backbone', 'are classified as insects'],
    explanation: 'No vertebrate can be an invertebrate. Sharks are vertebrates, so sharks are not invertebrates.',
    rating: 450,
  },
  {
    major: 'All assets that generate recurring income are cash-flow positive',
    minor: 'A rental property generating monthly rent is an asset with recurring income',
    subject: 'That rental property',
    conclusion: 'is cash-flow positive',
    distractors: ['is a liability', 'generates no income', 'must be sold to realise value'],
    explanation: 'Recurring-income assets are cash-flow positive. This property has recurring income, so it is cash-flow positive.',
    rating: 650,
  },
  {
    major: 'If a number is divisible by 6, it is divisible by both 2 and 3',
    minor: '42 is divisible by 6',
    subject: '42',
    conclusion: 'is divisible by both 2 and 3',
    distractors: ['is divisible by 6 only', 'is a prime number', 'is not divisible by 3'],
    explanation: 'Divisibility by 6 requires divisibility by 2 AND 3. Since 42 is divisible by 6, it must be divisible by both.',
    rating: 480,
  },
]

function makeLogicSyllogism(diff: number): Question | null {
  const pool = diff < 450
    ? SYLLOGISMS.filter(s => s.rating < 550)
    : diff < 700
      ? SYLLOGISMS.filter(s => s.rating >= 350 && s.rating < 750)
      : SYLLOGISMS.filter(s => s.rating >= 550)
  if (!pool.length) return makeLogicSyllogism(Math.min(diff + 150, 900))
  const t = pick(pool)
  return makeQ(
    `gen:logic:syl:${t.subject.replace(/\s+/g, '-')}`,
    'logic', 'syllogism', t.rating,
    `${t.major}.\n${t.minor}.\n\nWhat can we conclude about ${t.subject}?`,
    `${t.subject} ${t.conclusion}`,
    t.distractors.map(d => `${t.subject} ${d}`),
    t.explanation,
  )
}

interface OrderingTemplate {
  statements: string[]
  items: [string, string, string]
  rel: string
  question: string
  smallestIdx: 0 | 1 | 2
  explanation: string
  rating: number
}

const ORDERINGS: OrderingTemplate[] = [
  {
    statements: ['Alice earns more than Bob', 'Bob earns more than Carol'],
    items: ['Alice', 'Bob', 'Carol'], rel: 'earns more than',
    question: 'Who earns the least?', smallestIdx: 2,
    explanation: 'Alice > Bob > Carol in earnings, so Carol earns the least.',
    rating: 300,
  },
  {
    statements: ['Project Alpha took longer than Project Beta', 'Project Beta took longer than Project Gamma'],
    items: ['Project Alpha', 'Project Beta', 'Project Gamma'], rel: 'took longer than',
    question: 'Which project was completed the fastest?', smallestIdx: 2,
    explanation: 'Alpha > Beta > Gamma in duration, so Gamma was the fastest.',
    rating: 380,
  },
  {
    statements: ['Model X is more accurate than Model Y', 'Model Y is more accurate than Model Z'],
    items: ['Model X', 'Model Y', 'Model Z'], rel: 'is more accurate than',
    question: 'Which model is least accurate?', smallestIdx: 2,
    explanation: 'X > Y > Z in accuracy, so Model Z is least accurate.',
    rating: 420,
  },
  {
    statements: ['Building A is taller than Building C', 'Building C is taller than Building B'],
    items: ['Building A', 'Building B', 'Building C'], rel: 'mixed',
    question: 'Which building is the shortest?', smallestIdx: 1,
    explanation: 'A > C > B in height. The middle item (C) is not the smallest — Building B is.',
    rating: 600,
  },
  {
    statements: ['Country P has a higher GDP than Country R', 'Country R has a higher GDP than Country Q'],
    items: ['Country P', 'Country Q', 'Country R'], rel: 'mixed',
    question: 'Which country has the lowest GDP?', smallestIdx: 1,
    explanation: 'P > R > Q in GDP. Country Q has the lowest GDP.',
    rating: 580,
  },
]

function makeLogicOrdering(diff: number): Question | null {
  const pool = diff < 500 ? ORDERINGS.filter(o => o.rating < 520) : ORDERINGS.filter(o => o.rating >= 380)
  if (!pool.length) return null
  const t = pick(pool)
  const answer = t.items[t.smallestIdx]
  const others = t.items.filter(x => x !== answer)
  return makeQ(
    `gen:logic:ord:${t.items[0].replace(/\s+/g, '-')}`,
    'logic', 'ordering', t.rating,
    `${t.statements.join('.\n')}.\n\n${t.question}`,
    answer,
    [...others, "Can't tell from the information given"],
    t.explanation,
  )
}

function makeLogic(diff: number): Question | null {
  return Math.random() < 0.55
    ? makeLogicSyllogism(diff)
    : makeLogicOrdering(diff)
}

// ─────────────────────────────────────────────────────────────────────────────
// NUMERICAL generators — adult contexts (salary, tax, investment, rates)
// ─────────────────────────────────────────────────────────────────────────────

function numPercentage(diff: number): Question | null {
  if (diff < 350) {
    const p = pick([10, 20, 25, 50])
    const basePool = p === 10 ? [40, 60, 80, 100, 200] : p === 20 ? [30, 40, 50, 100] : p === 25 ? [20, 40, 60, 80] : [30, 40, 60, 80]
    const base = pick(basePool)
    const ans = (p / 100) * base
    return makeQ(
      `gen:num:pct:${p}:${base}`,
      'numerical', 'percentage', 200,
      `What is ${p}% of ${base}?`,
      String(ans),
      [String(ans + p), String(ans - p < 0 ? ans + p * 2 : ans - p), String(base - ans)],
      `${p}% of ${base} = (${p} ÷ 100) × ${base} = ${ans}.`,
    )
  }
  if (diff < 650) {
    const contexts = [
      { noun: 'salary', verb: 'increases' },
      { noun: 'investment', verb: 'grows' },
      { noun: 'budget', verb: 'increases' },
    ]
    const ctx = pick(contexts)
    const base = pick([40000, 50000, 60000, 80000, 100000, 120000])
    const pct = pick([5, 8, 10, 12, 15, 20, 25])
    const isIncrease = Math.random() < 0.5
    const change = Math.round((pct / 100) * base)
    const ans = isIncrease ? base + change : base - change
    return makeQ(
      `gen:num:pctchg:${base}:${pct}:${isIncrease}`,
      'numerical', 'percentage', 480,
      `A ${ctx.noun} of $${base.toLocaleString()} ${isIncrease ? ctx.verb + ' by' : 'decreases by'} ${pct}%. What is the new ${ctx.noun}?`,
      `$${ans.toLocaleString()}`,
      [`$${(ans + change).toLocaleString()}`, `$${(base + pct).toLocaleString()}`, `$${(isIncrease ? ans - change * 2 : ans + change * 2).toLocaleString()}`],
      `${pct}% of $${base.toLocaleString()} = $${change.toLocaleString()}. New amount = $${base.toLocaleString()} ${isIncrease ? '+' : '−'} $${change.toLocaleString()} = $${ans.toLocaleString()}.`,
    )
  }
  // Hard: reverse percentage (original from result after % change)
  const pct = pick([20, 25, 40, 50])
  const original = pick([80, 100, 120, 150, 200, 240])
  const result = original * (1 - pct / 100)
  if (!Number.isInteger(result)) return null
  return makeQ(
    `gen:num:pctrev:${result}:${pct}`,
    'numerical', 'percentage', 780,
    `After a ${pct}% discount, a product costs $${result}. What was its original price?`,
    `$${original}`,
    [`$${result + pct}`, `$${result * 2}`, `$${original + pct}`],
    `After a ${pct}% discount, the price is ${100 - pct}% of the original. Original = $${result} ÷ ${(100 - pct) / 100} = $${original}.`,
  )
}

function numRatio(diff: number): Question | null {
  const a = rint(1, diff < 500 ? 4 : 7)
  const b = rint(1, diff < 500 ? 4 : 7)
  if (a === b) return null
  const unitVal = rint(5, diff < 400 ? 20 : 50) * 100
  const total = unitVal * (a + b)
  const ans = a * unitVal
  return makeQ(
    `gen:num:ratio:${a}:${b}:${unitVal}`,
    'numerical', 'ratio', diff < 400 ? 320 : 580,
    `Divide $${total.toLocaleString()} in the ratio ${a}:${b}. What is the larger share?`,
    `$${Math.max(ans, total - ans).toLocaleString()}`,
    [`$${Math.min(ans, total - ans).toLocaleString()}`, `$${(Math.max(ans, total - ans) + unitVal).toLocaleString()}`, `$${(total / 2).toLocaleString()}`],
    `Ratio ${a}:${b} = ${a + b} parts. Each part = $${total.toLocaleString()} ÷ ${a + b} = $${unitVal.toLocaleString()}. Larger share (${Math.max(a, b)} parts) = $${Math.max(ans, total - ans).toLocaleString()}.`,
  )
}

function numRate(diff: number): Question | null {
  const speed = rint(diff < 400 ? 40 : 60, diff < 400 ? 90 : 130)
  const time = rint(1, diff < 500 ? 5 : 9)
  const distance = speed * time
  const askFor = diff < 550 ? 'distance' : pick(['distance', 'time', 'speed'])
  if (askFor === 'distance') {
    return makeQ(
      `gen:num:rate:d:${speed}:${time}`,
      'numerical', 'rate', diff < 400 ? 240 : 480,
      `A vehicle travels at ${speed} km/h for ${time} hour${time > 1 ? 's' : ''}. How far does it travel?`,
      `${distance} km`,
      [`${distance + speed} km`, `${distance - speed} km`, `${distance + time} km`],
      `Distance = speed × time = ${speed} × ${time} = ${distance} km.`,
    )
  }
  if (askFor === 'time') {
    return makeQ(
      `gen:num:rate:t:${speed}:${distance}`,
      'numerical', 'rate', 640,
      `A vehicle travels ${distance} km at a constant ${speed} km/h. How long does the trip take?`,
      `${time} hour${time > 1 ? 's' : ''}`,
      [`${time + 1} hour${time + 1 > 1 ? 's' : ''}`, `${time > 1 ? time - 1 : time + 2} hour${time > 2 ? 's' : ''}`, `${Math.round(distance / (speed + 20))} hours`],
      `Time = distance ÷ speed = ${distance} ÷ ${speed} = ${time} hour${time > 1 ? 's' : ''}.`,
    )
  }
  return makeQ(
    `gen:num:rate:s:${distance}:${time}`,
    'numerical', 'rate', 700,
    `A vehicle covers ${distance} km in ${time} hour${time > 1 ? 's' : ''}. What is its average speed?`,
    `${speed} km/h`,
    [`${speed + 10} km/h`, `${speed - 10} km/h`, `${Math.round(distance / (time + 1))} km/h`],
    `Speed = distance ÷ time = ${distance} ÷ ${time} = ${speed} km/h.`,
  )
}

function numInterest(diff: number): Question | null {
  const principal = pick([1000, 2000, 5000, 10000])
  const rate = pick([2, 4, 5, 6, 8, 10])
  const years = rint(1, diff < 500 ? 3 : 6)
  const interest = (principal * rate * years) / 100
  const total = principal + interest
  const askTotal = diff > 450 && Math.random() < 0.5
  return makeQ(
    `gen:num:int:${principal}:${rate}:${years}`,
    'numerical', 'rate', diff < 450 ? 400 : 650,
    askTotal
      ? `$${principal.toLocaleString()} is invested at ${rate}% simple interest per annum for ${years} year${years > 1 ? 's' : ''}. What is the total value at maturity?`
      : `$${principal.toLocaleString()} is invested at ${rate}% simple interest per annum for ${years} year${years > 1 ? 's' : ''}. How much interest is earned?`,
    askTotal ? `$${total.toLocaleString()}` : `$${interest.toLocaleString()}`,
    askTotal
      ? [`$${(total + interest).toLocaleString()}`, `$${(principal + rate * years).toLocaleString()}`, `$${(total - principal / 2).toLocaleString()}`]
      : [`$${(interest + rate).toLocaleString()}`, `$${(interest * 2).toLocaleString()}`, `$${(principal * rate / 100).toLocaleString()}`],
    askTotal
      ? `Simple interest = Principal × Rate × Years ÷ 100 = $${interest.toLocaleString()}. Total = $${principal.toLocaleString()} + $${interest.toLocaleString()} = $${total.toLocaleString()}.`
      : `Simple interest = $${principal.toLocaleString()} × ${rate}% × ${years} = $${interest.toLocaleString()}.`,
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ODD-ONE-OUT — curated, unambiguous groups
// ─────────────────────────────────────────────────────────────────────────────

interface OddGroup {
  items: [string, string, string, string]
  odd: string
  explanation: string
  rating: number
}

const ODD_GROUPS: OddGroup[] = [
  { items: ['4', '9', '16', '17'], odd: '17', explanation: '4, 9 and 16 are perfect squares (2², 3², 4²). 17 is not a perfect square.', rating: 320 },
  { items: ['2', '3', '5', '9'], odd: '9', explanation: '2, 3 and 5 are prime numbers. 9 = 3×3 is composite.', rating: 280 },
  { items: ['8', '27', '64', '100'], odd: '100', explanation: '8, 27 and 64 are perfect cubes (2³, 3³, 4³). 100 is not a perfect cube.', rating: 480 },
  { items: ['1', '4', '9', '15'], odd: '15', explanation: '1, 4 and 9 are perfect squares (1², 2², 3²). 15 is not.', rating: 300 },
  { items: ['Pluto', 'Mercury', 'Venus', 'Earth'], odd: 'Pluto', explanation: 'Mercury, Venus and Earth are planets. Pluto is classified as a dwarf planet.', rating: 240 },
  { items: ['HTML', 'Python', 'Java', 'C++'], odd: 'HTML', explanation: 'Python, Java and C++ are programming languages. HTML is a markup language used for structuring web pages.', rating: 420 },
  { items: ['Photon', 'Proton', 'Neutron', 'Electron'], odd: 'Photon', explanation: 'Protons, neutrons and electrons are subatomic particles that make up atoms. A photon is a particle of light — not a component of atoms.', rating: 580 },
  { items: ['Sonnet', 'Comedy', 'Tragedy', 'Epic'], odd: 'Sonnet', explanation: 'Comedy, tragedy and epic are broad literary or dramatic genres. A sonnet is a specific poetic form (14 lines).', rating: 500 },
  { items: ['Osmosis', 'Mitosis', 'Meiosis', 'Binary fission'], odd: 'Osmosis', explanation: 'Mitosis, meiosis and binary fission are forms of cellular division. Osmosis is the movement of water through a semi-permeable membrane.', rating: 620 },
  { items: ['Sentence', 'Noun', 'Verb', 'Preposition'], odd: 'Sentence', explanation: 'Noun, verb and preposition are parts of speech (word-level). A sentence is a syntactic unit — it contains parts of speech.', rating: 380 },
  { items: ['Sphere', 'Triangle', 'Square', 'Pentagon'], odd: 'Sphere', explanation: 'Triangle, square and pentagon are 2-D polygons. A sphere is a 3-D solid.', rating: 200 },
  { items: ['Diamond', 'Copper', 'Iron', 'Gold'], odd: 'Diamond', explanation: 'Copper, iron and gold are metals. Diamond is a form of carbon — a non-metal.', rating: 350 },
  { items: ['Flute', 'Violin', 'Cello', 'Guitar'], odd: 'Flute', explanation: 'Violin, cello and guitar are string instruments. A flute is a wind instrument.', rating: 260 },
  { items: ['Green', 'Red', 'Yellow', 'Blue'], odd: 'Green', explanation: 'Red, yellow and blue are primary colours. Green is a secondary colour (blue + yellow).', rating: 300 },
  { items: ['Tuna', 'Whale', 'Dolphin', 'Seal'], odd: 'Tuna', explanation: 'Whales, dolphins and seals are marine mammals. Tuna is a fish.', rating: 280 },
  { items: ['NOT', 'AND', 'OR', 'XOR'], odd: 'NOT', explanation: 'AND, OR and XOR are binary operators (two inputs). NOT is unary (one input).', rating: 680 },
  { items: ['Geneva', 'Brussels', 'Berlin', 'Madrid'], odd: 'Geneva', explanation: 'Brussels, Berlin and Madrid are capitals of EU member states. Geneva is in Switzerland, which is not an EU member.', rating: 620 },
  { items: ['Haiku', 'Sonata', 'Concerto', 'Symphony'], odd: 'Haiku', explanation: 'Sonata, concerto and symphony are musical forms. A haiku is a Japanese poetic form.', rating: 560 },
  { items: ['Libel', 'Slander', 'Defamation', 'Perjury'], odd: 'Perjury', explanation: 'Libel, slander and defamation all relate to false statements harming reputation. Perjury is lying under oath in court — a distinct offence.', rating: 750 },
  { items: ['Keynesian', 'Monetarist', 'Supply-side', 'Darwinian'], odd: 'Darwinian', explanation: 'Keynesian, monetarist and supply-side are schools of economic thought. Darwinian refers to evolutionary biology.', rating: 700 },
  { items: ['Acid', 'Base', 'Salt', 'Enzyme'], odd: 'Enzyme', explanation: 'Acids, bases and salts are categories in acid-base chemistry. An enzyme is a biological catalyst — a different domain.', rating: 580 },
  { items: ['25', '36', '49', '54'], odd: '54', explanation: '25, 36 and 49 are perfect squares (5², 6², 7²). 54 is not a perfect square.', rating: 360 },
]

function makeOddOneOut(diff: number): Question | null {
  const pool = diff < 380
    ? ODD_GROUPS.filter(g => g.rating < 460)
    : diff < 650
      ? ODD_GROUPS.filter(g => g.rating >= 260 && g.rating < 700)
      : ODD_GROUPS.filter(g => g.rating >= 500)
  if (!pool.length) return makeOddOneOut(Math.min(diff + 200, 900))
  const g = pick(pool)
  return {
    id: `gen:odd:${g.odd.replace(/\s+/g, '-')}`,
    category: 'odd-one-out',
    difficulty: diffBand(g.rating),
    type: 'multiple-choice',
    prompt: 'Which one does not belong?',
    options: shuffle([...g.items]),
    answer: g.odd,
    explanation: g.explanation,
    style: 'category',
    difficultyRating: g.rating,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Top-level dispatcher
// ─────────────────────────────────────────────────────────────────────────────

type Gen = (diff: number) => Question | null

const GENS_BY_CATEGORY: Record<string, Gen[]> = {
  sequence:    [seqArithmetic, seqGeometric, seqFibonacci, seqPrimes, seqSquares],
  analogy:     [makeAnalogy],
  logic:       [makeLogic],
  numerical:   [numPercentage, numRatio, numRate, numInterest],
  'odd-one-out': [makeOddOneOut],
}

const CATEGORIES = Object.keys(GENS_BY_CATEGORY)

/**
 * Generate a fresh question not already in `usedIds`.
 * `level` is 1–10; it maps to a 1–1000 difficulty for the generators.
 */
export function generateQuestion(level: number, usedIds: string[]): Question | null {
  const diff = Math.round(((level - 1) / 9) * 900) + 50  // 1→50, 10→950
  const used = new Set(usedIds)
  for (const cat of shuffle(CATEGORIES)) {
    const gens = shuffle(GENS_BY_CATEGORY[cat])
    for (const gen of gens) {
      for (let attempt = 0; attempt < 10; attempt++) {
        const q = gen(diff)
        if (q && !used.has(q.id)) return q
      }
    }
  }
  return null
}
