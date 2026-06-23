/**
 * Procedural question generators for Quotient, mirroring the Learned app's runtime pattern.
 * Each generator takes a `diff` value (1–1000) and returns a Question or null on failure.
 * The adaptive engine calls generateQuestionAtDifficulty(diff, usedIds), which tries
 * generators across all categories until a fresh (unseen) question is produced.
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

/** Stable short hash so curated items get unique, content-derived ids. */
function hashId(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

function isPerfectSquare(n: number): boolean {
  if (n < 0) return false
  const r = Math.round(Math.sqrt(n))
  return r * r === n
}

const clampRating = (r: number) => Math.max(60, Math.min(960, Math.round(r)))

/** Items whose rating is closest to the target difficulty (widening until non-empty). */
function nearestPool<T extends { rating: number }>(items: T[], diff: number, window = 170): T[] {
  for (let w = window; w <= 1100; w += 120) {
    const pool = items.filter((i) => Math.abs(i.rating - diff) <= w)
    if (pool.length) return pool
  }
  return items
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
  const start = diff < 400 ? rint(1, 7) : rint(4, 15)
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

function seqLetters(diff: number): Question | null {
  const step = diff < 350 ? pick([1, 2]) : diff < 650 ? pick([2, 3]) : pick([3, 4, 5])
  const start = rint(0, 25 - step * 5)
  const seq = [0, 1, 2, 3, 4].map(i => String.fromCharCode(65 + start + i * step))
  const ansCode = 65 + start + 5 * step
  const ans = String.fromCharCode(ansCode)
  const stepWord = step === 1 ? 'consecutive letter' : `${step}${step === 2 ? 'nd' : step === 3 ? 'rd' : 'th'} letter`
  return makeQ(
    `gen:seq:alpha:${start}:${step}`,
    'sequence', 'letter-series', clampRating(220 + step * 110),
    `What letter comes next?\n\n${seq.join(', ')}, __`,
    ans,
    [String.fromCharCode(ansCode + 1), String.fromCharCode(ansCode - 1), String.fromCharCode(ansCode + step)],
    `The series advances by every ${stepWord} (skip ${step - 1}). After ${seq[4]} comes ${ans}.`,
  )
}

function seqInterleaved(diff: number): Question | null {
  if (diff < 480) return null // an inherently hard style — skip for easy targets
  // Two arithmetic sequences interleaved; the next term continues the first.
  const a0 = rint(1, 9), da = rint(2, diff < 700 ? 8 : 14)
  const b0 = rint(10, 40), db = rint(3, diff < 700 ? 12 : 18)
  const seq = [a0, b0, a0 + da, b0 + db, a0 + 2 * da, b0 + 2 * db]
  const ans = a0 + 3 * da
  return makeQ(
    `gen:seq:inter:${a0}:${da}:${b0}:${db}`,
    'sequence', 'interleaved', clampRating(620 + (da + db) * 5),
    `What comes next?\n\n${seq.join(', ')}, __`,
    String(ans),
    [String(b0 + 3 * db), String(ans + da), String(seq[5] + db)],
    `Two sequences alternate: positions 1,3,5 go ${a0}, ${a0 + da}, ${a0 + 2 * da} (step ${da}); positions 2,4,6 go ${b0}, ${b0 + db}, ${b0 + 2 * db} (step ${db}). The next term continues the first: ${a0 + 2 * da} + ${da} = ${ans}.`,
  )
}

function seqQuadratic(diff: number): Question | null {
  if (diff < 380) return null // medium-hard style — skip for easy targets
  // Differences themselves increase by a constant (second difference constant).
  const start = rint(1, 6)
  const d0 = rint(1, 4)
  const dd = diff < 600 ? pick([1, 2]) : pick([2, 3])
  const seq = [start]
  for (let i = 0; i < 4; i++) seq.push(seq[i] + d0 + i * dd)
  const ans = seq[4] + d0 + 4 * dd
  return makeQ(
    `gen:seq:quad:${start}:${d0}:${dd}`,
    'sequence', 'growing-difference', clampRating(560 + dd * 60),
    `What comes next?\n\n${seq.join(', ')}, __`,
    String(ans),
    [String(seq[4] + d0 + 3 * dd), String(ans + dd), String(seq[4] + (seq[4] - seq[3]))],
    `The gaps grow by ${dd} each step: ${seq.slice(1).map((v, i) => v - seq[i]).join(', ')}. The next gap is ${d0 + 4 * dd}, so ${seq[4]} + ${d0 + 4 * dd} = ${ans}.`,
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
  // Easy opposites / pairs
  { prompt: 'Big is to Small as Tall is to __', answer: 'Short', distractors: ['Wide', 'Long', 'Huge'], explanation: 'Big and Small are opposites. Tall and Short are opposites.', rating: 150 },
  { prompt: 'Day is to Night as Open is to __', answer: 'Closed', distractors: ['Wide', 'Door', 'Empty'], explanation: 'Day and Night are opposites. Open and Closed are opposites.', rating: 160 },
  { prompt: 'Fast is to Slow as Early is to __', answer: 'Late', distractors: ['Quick', 'Soon', 'Time'], explanation: 'Fast and Slow are opposites. Early and Late are opposites.', rating: 170 },
  // Easy part / pair
  { prompt: 'Puppy is to Dog as Kitten is to __', answer: 'Cat', distractors: ['Mouse', 'Lion', 'Pet'], explanation: 'A puppy is a young dog. A kitten is a young cat.', rating: 180 },
  { prompt: 'Hand is to Glove as Foot is to __', answer: 'Sock', distractors: ['Shoe', 'Toe', 'Leg'], explanation: 'A glove covers a hand. A sock covers a foot.', rating: 220 },
  { prompt: 'Bird is to Nest as Bee is to __', answer: 'Hive', distractors: ['Honey', 'Flower', 'Web'], explanation: 'A bird lives in a nest. A bee lives in a hive.', rating: 240 },
  { prompt: 'Pen is to Write as Knife is to __', answer: 'Cut', distractors: ['Sharp', 'Metal', 'Kitchen'], explanation: 'A pen is used to write. A knife is used to cut.', rating: 230 },
  // Medium function / place
  { prompt: 'Library is to Books as Gallery is to __', answer: 'Paintings', distractors: ['Statues', 'Visitors', 'Walls'], explanation: 'A library houses books. A gallery houses paintings.', rating: 360 },
  { prompt: 'Captain is to Ship as Pilot is to __', answer: 'Aircraft', distractors: ['Runway', 'Sky', 'Engine'], explanation: 'A captain commands a ship. A pilot commands an aircraft.', rating: 400 },
  { prompt: 'Author is to Novel as Composer is to __', answer: 'Symphony', distractors: ['Orchestra', 'Piano', 'Lyrics'], explanation: 'An author creates a novel. A composer creates a symphony.', rating: 460 },
  { prompt: 'Thermometer is to Temperature as Odometer is to __', answer: 'Distance', distractors: ['Speed', 'Time', 'Fuel'], explanation: 'A thermometer measures temperature. An odometer measures distance travelled.', rating: 520 },
  { prompt: 'Herd is to Cattle as Flock is to __', answer: 'Sheep', distractors: ['Wolves', 'Fish', 'Birdsong'], explanation: 'A herd is a group of cattle. A flock is a group of sheep.', rating: 420 },
  { prompt: 'Island is to Ocean as Oasis is to __', answer: 'Desert', distractors: ['Water', 'Palm', 'Mirage'], explanation: 'An island is land surrounded by ocean. An oasis is greenery surrounded by desert.', rating: 540 },
  { prompt: 'Sculptor is to Clay as Poet is to __', answer: 'Words', distractors: ['Paint', 'Rhyme', 'Paper'], explanation: 'A sculptor shapes clay. A poet shapes words.', rating: 500 },
  { prompt: 'Drought is to Water as Famine is to __', answer: 'Food', distractors: ['Rain', 'Crops', 'Hunger'], explanation: 'A drought is a severe shortage of water. A famine is a severe shortage of food.', rating: 480 },
  // Hard degree / vocabulary
  { prompt: 'Whisper is to Shout as Glance is to __', answer: 'Stare', distractors: ['Look', 'Blink', 'Wink'], explanation: 'A whisper is a faint version of a shout. A glance is a faint version of a stare (degree of intensity).', rating: 660 },
  { prompt: 'Novice is to Expert as Apprentice is to __', answer: 'Master', distractors: ['Student', 'Trainee', 'Beginner'], explanation: 'A novice becomes an expert with experience. An apprentice becomes a master.', rating: 640 },
  { prompt: 'Loquacious is to Talkative as Taciturn is to __', answer: 'Reserved', distractors: ['Loud', 'Friendly', 'Honest'], explanation: 'Loquacious is a formal synonym of talkative. Taciturn is a formal synonym of reserved (saying little).', rating: 780 },
  { prompt: 'Cacophony is to Harmony as Chaos is to __', answer: 'Order', distractors: ['Noise', 'Music', 'Disaster'], explanation: 'Cacophony (harsh discord) is the opposite of harmony. Chaos is the opposite of order.', rating: 720 },
  { prompt: 'Indelible is to Erase as Immovable is to __', answer: 'Move', distractors: ['Lift', 'Push', 'Place'], explanation: 'Indelible means impossible to erase. Immovable means impossible to move (the in-/im- prefix negates the verb).', rating: 760 },
  { prompt: 'Prologue is to Epilogue as Preface is to __', answer: 'Afterword', distractors: ['Foreword', 'Index', 'Chapter'], explanation: 'A prologue opens and an epilogue closes a work. A preface opens and an afterword closes a book.', rating: 700 },
  { prompt: 'Cartographer is to Maps as Lexicographer is to __', answer: 'Dictionaries', distractors: ['Books', 'Words', 'Laws'], explanation: 'A cartographer makes maps. A lexicographer compiles dictionaries.', rating: 820 },
  { prompt: 'Phobia is to Fear as Mania is to __', answer: 'Obsession', distractors: ['Calm', 'Sadness', 'Anger'], explanation: 'A phobia is an extreme fear. A mania is an extreme obsession or compulsion.', rating: 740 },
  { prompt: 'Etymology is to Words as Genealogy is to __', answer: 'Ancestry', distractors: ['Genes', 'Maps', 'Fossils'], explanation: 'Etymology studies the origins of words. Genealogy studies the origins of ancestry (family lines).', rating: 800 },
  { prompt: 'Pride is to Lions as Murder is to __', answer: 'Crows', distractors: ['Wolves', 'Fish', 'Bees'], explanation: 'A "pride" is the collective noun for lions. A "murder" is the collective noun for crows.', rating: 860 },
  { prompt: 'Ductile is to Stretch as Malleable is to __', answer: 'Hammer', distractors: ['Melt', 'Break', 'Bend'], explanation: 'Ductile means able to be stretched into wire. Malleable means able to be hammered into sheets.', rating: 880 },
]

function makeAnalogy(diff: number): Question | null {
  const item = pick(nearestPool(ANALOGIES, diff))
  return makeQ(
    `gen:ana:${hashId(item.prompt)}`,
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
  {
    major: 'All even numbers are divisible by 2',
    minor: '1,024 is an even number',
    subject: '1,024',
    conclusion: 'is divisible by 2',
    distractors: ['is a prime number', 'is odd', 'is not a whole number'],
    explanation: 'All even numbers are divisible by 2. 1,024 is even, so it is divisible by 2.',
    rating: 240,
  },
  {
    major: 'All multiples of 10 end in the digit 0',
    minor: '250 is a multiple of 10',
    subject: '250',
    conclusion: 'ends in the digit 0',
    distractors: ['ends in the digit 5', 'is a prime number', 'is odd'],
    explanation: 'Every multiple of 10 ends in 0. 250 is a multiple of 10, so it ends in 0.',
    rating: 260,
  },
  {
    major: 'All squares are rectangles',
    minor: 'This shape is a square',
    subject: 'this shape',
    conclusion: 'is a rectangle',
    distractors: ['is a circle', 'has five sides', 'is not a quadrilateral'],
    explanation: 'A square meets the definition of a rectangle (four right angles). So if this shape is a square, it is a rectangle.',
    rating: 360,
  },
  {
    major: 'No reptiles are warm-blooded',
    minor: 'Snakes are reptiles',
    subject: 'Snakes',
    conclusion: 'are not warm-blooded',
    distractors: ['are warm-blooded', 'are mammals', 'regulate their own temperature'],
    explanation: 'No reptile is warm-blooded. Snakes are reptiles, so snakes are not warm-blooded.',
    rating: 360,
  },
  {
    major: 'All conductors allow electric current to flow',
    minor: 'Copper is a conductor',
    subject: 'Copper',
    conclusion: 'allows electric current to flow',
    distractors: ['blocks electric current', 'is an insulator', 'is non-metallic'],
    explanation: 'All conductors allow current to flow. Copper is a conductor, so copper allows current to flow.',
    rating: 340,
  },
  {
    major: 'All vaccines train the immune system to recognise a pathogen',
    minor: 'The flu shot is a vaccine',
    subject: 'The flu shot',
    conclusion: 'trains the immune system to recognise a pathogen',
    distractors: ['weakens the immune system', 'is an antibiotic', 'cures an existing infection'],
    explanation: 'All vaccines train the immune system. The flu shot is a vaccine, so it trains the immune system.',
    rating: 380,
  },
  {
    major: 'No square number is negative',
    minor: '−9 is negative',
    subject: '−9',
    conclusion: 'is not a square number',
    distractors: ['is a square number', 'is a perfect cube', 'has a real square root'],
    explanation: 'No square number can be negative. Since −9 is negative, it cannot be a square number.',
    rating: 520,
  },
  {
    major: 'All inflationary periods reduce the purchasing power of cash',
    minor: 'The late 1970s were an inflationary period',
    subject: 'the late 1970s',
    conclusion: 'reduced the purchasing power of cash',
    distractors: ['increased the purchasing power of cash', 'had no effect on prices', 'caused deflation'],
    explanation: 'Inflationary periods reduce purchasing power. The late 1970s were inflationary, so purchasing power fell.',
    rating: 560,
  },
  {
    major: 'All catalysts speed up a reaction without being consumed',
    minor: 'An enzyme is a biological catalyst',
    subject: 'An enzyme',
    conclusion: 'speeds up a reaction without being consumed',
    distractors: ['is consumed by the reaction', 'slows the reaction down', 'has no effect on reaction rate'],
    explanation: 'Catalysts speed up reactions without being used up. Enzymes are catalysts, so they do the same.',
    rating: 600,
  },
  {
    major: 'All irrational numbers cannot be written as a ratio of two integers',
    minor: 'π (pi) is irrational',
    subject: 'π',
    conclusion: 'cannot be written as a ratio of two integers',
    distractors: ['equals exactly 22/7', 'is a whole number', 'terminates after a few decimals'],
    explanation: 'Irrational numbers cannot be expressed as a ratio of integers. π is irrational, so it cannot be either.',
    rating: 660,
  },
  {
    major: 'A binding contract requires consideration (something of value exchanged)',
    minor: 'This agreement involves no consideration',
    subject: 'this agreement',
    conclusion: 'is not a binding contract',
    distractors: ['is a binding contract', 'is enforceable in court', 'requires no agreement to be valid'],
    explanation: 'If a binding contract requires consideration and this agreement has none, it cannot be a binding contract.',
    rating: 720,
  },
  {
    major: 'A recursive function needs a base case to be guaranteed to terminate',
    minor: 'This recursive function has no base case',
    subject: 'this function',
    conclusion: 'is not guaranteed to terminate',
    distractors: ['always terminates quickly', 'runs in constant time', 'needs no stack memory'],
    explanation: 'Termination is guaranteed only with a base case. This function lacks one, so termination is not guaranteed.',
    rating: 760,
  },
]

function makeLogicSyllogism(diff: number): Question | null {
  const t = pick(nearestPool(SYLLOGISMS, diff))
  return makeQ(
    `gen:logic:syl:${hashId(t.major + t.subject)}`,
    'logic', 'syllogism', t.rating,
    `${t.major}.\n${t.minor}.\n\nWhat can we conclude about ${t.subject}?`,
    `${t.subject} ${t.conclusion}`,
    t.distractors.map(d => `${t.subject} ${d}`),
    t.explanation,
  )
}

interface OrderTheme {
  ask: 'Who' | 'Which'
  entities: string[]
  comp: string // "X comp Y" means X ranks above Y
  most: string
  least: string
}

const ORDER_THEMES: OrderTheme[] = [
  { ask: 'Who', entities: ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Hannah'], comp: 'is older than', most: 'is the oldest', least: 'is the youngest' },
  { ask: 'Who', entities: ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Hannah'], comp: 'earns more than', most: 'earns the most', least: 'earns the least' },
  { ask: 'Who', entities: ['Maya', 'Noah', 'Omar', 'Priya', 'Quinn', 'Ravi', 'Sara', 'Theo'], comp: 'finished the race ahead of', most: 'finished first', least: 'finished last' },
  { ask: 'Who', entities: ['Maya', 'Noah', 'Omar', 'Priya', 'Quinn', 'Ravi', 'Sara', 'Theo'], comp: 'scored higher than', most: 'scored the highest', least: 'scored the lowest' },
  { ask: 'Which', entities: ['Building P', 'Building Q', 'Building R', 'Building S', 'Building T'], comp: 'is taller than', most: 'is the tallest', least: 'is the shortest' },
  { ask: 'Which', entities: ['the Standard plan', 'the Lite plan', 'the Pro plan', 'the Max plan', 'the Eco plan'], comp: 'costs more than', most: 'is the most expensive', least: 'is the cheapest' },
  { ask: 'Which', entities: ['Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta', 'Project Omega'], comp: 'took longer than', most: 'took the longest', least: 'was completed fastest' },
  { ask: 'Which', entities: ['Model X', 'Model Y', 'Model Z', 'Model W', 'Model V'], comp: 'is more accurate than', most: 'is the most accurate', least: 'is the least accurate' },
  { ask: 'Which', entities: ['Port Vale', 'Lake City', 'Hill Town', 'River Bend', 'Sea Point'], comp: 'has a larger population than', most: 'has the largest population', least: 'has the smallest population' },
]

function makeLogicOrdering(diff: number): Question | null {
  const theme = pick(ORDER_THEMES)
  const n = diff >= 580 && Math.random() < 0.6 ? 4 : 3
  const ranking = shuffle(theme.entities).slice(0, n) // ranking[0] ranks highest
  const statements = ranking.slice(0, n - 1).map((e, i) => `${e} ${theme.comp} ${ranking[i + 1]}`)
  const sorted = diff < 360
  const presented = sorted ? statements : shuffle(statements)
  const askLeast = Math.random() < 0.5
  const answer = askLeast ? ranking[n - 1] : ranking[0]
  const others = ranking.filter((e) => e !== answer)
  // 3-item versions add a "can't tell" foil; 4-item versions use the entities themselves.
  const distractors = n === 3 ? [...others, "Can't tell from the information given"] : others
  const rating = clampRating((n === 4 ? 620 : 320) + (sorted ? 0 : 150) + (n === 4 ? 60 : 0))
  return makeQ(
    `gen:logic:ord:${hashId(ranking.join('>') + theme.comp + askLeast)}`,
    'logic', 'ordering', rating,
    `${presented.join('.\n')}.\n\n${theme.ask} ${askLeast ? theme.least : theme.most}?`,
    answer,
    distractors,
    `In order: ${ranking.join(' > ')} (ranked by "${theme.comp}"). So ${answer} ${askLeast ? theme.least : theme.most}.`,
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
    const basePool = p === 10
      ? [30, 40, 50, 60, 70, 80, 90, 100, 120, 150, 200]
      : p === 20
        ? [20, 30, 35, 40, 45, 50, 60, 80, 100]
        : p === 25
          ? [16, 20, 24, 40, 60, 80, 120]
          : [24, 30, 40, 50, 60, 80, 90, 120]
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

function numAverage(diff: number): Question | null {
  const count = diff < 450 ? 3 : pick([4, 5])
  const mean = rint(diff < 450 ? 6 : 20, diff < 450 ? 24 : 90)
  const vals: number[] = []
  for (let i = 0; i < count - 1; i++) vals.push(rint(Math.max(1, mean - 12), mean + 12))
  const last = mean * count - vals.reduce((a, b) => a + b, 0)
  if (last < 1) return null
  vals.push(last)

  if (diff >= 450 && Math.random() < 0.5) {
    const shown = vals.slice(0, -1)
    const missing = vals[vals.length - 1]
    return makeQ(
      `gen:num:avgM:${vals.join('-')}`,
      'numerical', 'average', 560,
      `The average of ${count} numbers is ${mean}. ${count - 1} of them are ${shown.join(', ')}. What is the missing number?`,
      String(missing),
      [String(missing + count), String(missing > count ? missing - count : missing + 2 * count), String(mean)],
      `The total must be ${mean} × ${count} = ${mean * count}. Missing = ${mean * count} − (${shown.join(' + ')}) = ${missing}.`,
    )
  }
  return makeQ(
    `gen:num:avg:${vals.join('-')}`,
    'numerical', 'average', diff < 450 ? 300 : 460,
    `What is the average (mean) of ${vals.join(', ')}?`,
    String(mean),
    [String(mean + 1), String(mean - 1), String(Math.round((mean * count) / (count + 1)))],
    `Average = sum ÷ count = ${mean * count} ÷ ${count} = ${mean}.`,
  )
}

function numFraction(diff: number): Question | null {
  const denom = pick([4, 5, 6, 8, 10])
  const num = rint(1, denom - 1)
  const base = denom * rint(diff < 400 ? 2 : 5, diff < 400 ? 12 : 40)
  const ans = (num / denom) * base
  return makeQ(
    `gen:num:frac:${num}:${denom}:${base}`,
    'numerical', 'fraction', diff < 400 ? 280 : 460,
    `What is ${num}/${denom} of ${base}?`,
    String(ans),
    [String(ans + denom), String(ans > denom ? ans - denom : ans + 2 * denom), String(base - ans)],
    `${num}/${denom} of ${base} = (${base} ÷ ${denom}) × ${num} = ${base / denom} × ${num} = ${ans}.`,
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
  // Geometry / maths
  { items: ['Square', 'Rectangle', 'Rhombus', 'Circle'], odd: 'Circle', explanation: 'Square, rectangle and rhombus are quadrilaterals (four straight sides). A circle has no straight sides.', rating: 200 },
  { items: ['Triangle', 'Hexagon', 'Octagon', 'Cube'], odd: 'Cube', explanation: 'Triangle, hexagon and octagon are 2-D polygons. A cube is a 3-D solid.', rating: 240 },
  { items: ['Sphere', 'Cylinder', 'Cone', 'Pentagon'], odd: 'Pentagon', explanation: 'Sphere, cylinder and cone are 3-D solids. A pentagon is a 2-D shape.', rating: 260 },
  { items: ['Equilateral', 'Isosceles', 'Scalene', 'Parallelogram'], odd: 'Parallelogram', explanation: 'Equilateral, isosceles and scalene are types of triangle. A parallelogram is a quadrilateral.', rating: 420 },
  { items: ['Addition', 'Subtraction', 'Multiplication', 'Equation'], odd: 'Equation', explanation: 'Addition, subtraction and multiplication are arithmetic operations. An equation is a statement of equality.', rating: 340 },
  { items: ['Square root', 'Logarithm', 'Derivative', 'Thermostat'], odd: 'Thermostat', explanation: 'Square root, logarithm and derivative are mathematical operations. A thermostat is a device.', rating: 420 },
  // Units
  { items: ['Inch', 'Metre', 'Mile', 'Kilogram'], odd: 'Kilogram', explanation: 'Inch, metre and mile measure length. A kilogram measures mass.', rating: 280 },
  { items: ['Byte', 'Kilobyte', 'Megabyte', 'Hertz'], odd: 'Hertz', explanation: 'Byte, kilobyte and megabyte are units of digital data. Hertz is a unit of frequency.', rating: 440 },
  // Science / chemistry / biology
  { items: ['Mercury', 'Venus', 'Mars', 'Sun'], odd: 'Sun', explanation: 'Mercury, Venus and Mars are planets. The Sun is a star.', rating: 240 },
  { items: ['Oxygen', 'Hydrogen', 'Helium', 'Water'], odd: 'Water', explanation: 'Oxygen, hydrogen and helium are chemical elements. Water is a compound (H₂O).', rating: 360 },
  { items: ['Helium', 'Neon', 'Argon', 'Nitrogen'], odd: 'Nitrogen', explanation: 'Helium, neon and argon are noble gases (Group 18). Nitrogen is not a noble gas.', rating: 640 },
  { items: ['Iron', 'Cobalt', 'Nickel', 'Aluminium'], odd: 'Aluminium', explanation: 'Iron, cobalt and nickel are ferromagnetic (strongly attracted to magnets). Aluminium is not.', rating: 720 },
  { items: ['Quartz', 'Granite', 'Basalt', 'Limestone'], odd: 'Quartz', explanation: 'Granite, basalt and limestone are rocks. Quartz is a single mineral.', rating: 620 },
  { items: ['Liver', 'Heart', 'Kidney', 'Femur'], odd: 'Femur', explanation: 'Liver, heart and kidney are soft internal organs. The femur is a bone.', rating: 420 },
  { items: ['Aorta', 'Vein', 'Artery', 'Trachea'], odd: 'Trachea', explanation: 'Aorta, vein and artery carry blood. The trachea (windpipe) carries air.', rating: 600 },
  { items: ['Mitochondrion', 'Ribosome', 'Nucleus', 'Capillary'], odd: 'Capillary', explanation: 'Mitochondrion, ribosome and nucleus are organelles inside a cell. A capillary is a blood vessel.', rating: 660 },
  { items: ['Cumulus', 'Stratus', 'Cirrus', 'Magma'], odd: 'Magma', explanation: 'Cumulus, stratus and cirrus are cloud types. Magma is molten rock.', rating: 380 },
  // Geography (safe facts)
  { items: ['Brazil', 'Chile', 'Peru', 'Mexico'], odd: 'Mexico', explanation: 'Brazil, Chile and Peru are in South America. Mexico is in North America.', rating: 500 },
  // Language / grammar
  { items: ['Comma', 'Colon', 'Semicolon', 'Paragraph'], odd: 'Paragraph', explanation: 'Comma, colon and semicolon are punctuation marks. A paragraph is a block of text.', rating: 360 },
  { items: ['Verb', 'Adverb', 'Adjective', 'Syllable'], odd: 'Syllable', explanation: 'Verb, adverb and adjective are parts of speech. A syllable is a unit of sound.', rating: 440 },
  { items: ['Noun', 'Pronoun', 'Gerund', 'Pixel'], odd: 'Pixel', explanation: 'Noun, pronoun and gerund are grammatical terms. A pixel is a unit of a digital image.', rating: 360 },
  { items: ['Spanish', 'French', 'Italian', 'Latin'], odd: 'Latin', explanation: 'Spanish, French and Italian are living, widely-spoken languages. Latin is a classical language no longer spoken natively.', rating: 540 },
  // Arts / music
  { items: ['Waltz', 'Tango', 'Foxtrot', 'Sonnet'], odd: 'Sonnet', explanation: 'Waltz, tango and foxtrot are dances. A sonnet is a poem.', rating: 480 },
  { items: ['Red', 'Orange', 'Violet', 'Brown'], odd: 'Brown', explanation: 'Red, orange and violet appear in the visible spectrum (rainbow). Brown is not a spectral colour.', rating: 560 },
  // Computing / tech
  { items: ['Stack', 'Queue', 'Array', 'Compiler'], odd: 'Compiler', explanation: 'Stack, queue and array are data structures. A compiler is a program that translates code.', rating: 600 },
  { items: ['TCP', 'UDP', 'HTTP', 'RAM'], odd: 'RAM', explanation: 'TCP, UDP and HTTP are network protocols. RAM is computer memory hardware.', rating: 660 },
  // Economics / politics
  { items: ['Inflation', 'Recession', 'Deflation', 'Photosynthesis'], odd: 'Photosynthesis', explanation: 'Inflation, recession and deflation are economic phenomena. Photosynthesis is a biological process.', rating: 460 },
  { items: ['Democracy', 'Oligarchy', 'Monarchy', 'Bureaucracy'], odd: 'Bureaucracy', explanation: 'Democracy, oligarchy and monarchy describe who holds sovereign power. Bureaucracy describes administration by officials, not a form of sovereign rule.', rating: 760 },
]

function makeOddOneOut(diff: number): Question | null {
  const g = pick(nearestPool(ODD_GROUPS, diff))
  return {
    id: `gen:odd:${hashId(g.items.join(','))}`,
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

function oddNumeric(diff: number): Question | null {
  // Bias the style toward the requested difficulty (parity easiest, squares hardest).
  const kind = diff < 320
    ? pick(['parity', 'multiple'] as const)
    : diff < 560
      ? pick(['multiple', 'square'] as const)
      : pick(['square', 'multiple'] as const)
  let items: number[] = []
  let odd = 0
  let explanation = ''
  let rating = 300

  if (kind === 'multiple') {
    const k = rint(3, 9)
    const set = new Set<number>()
    while (set.size < 3) set.add(k * rint(2, 12))
    items = [...set]
    let guard = 0
    do { odd = k * rint(2, 12) + rint(1, k - 1); guard++ } while ((items.includes(odd) || odd % k === 0) && guard < 30)
    if (odd % k === 0) return null
    explanation = `${items.join(', ')} are all multiples of ${k}. ${odd} is not a multiple of ${k}.`
    rating = clampRating(240 + k * 25)
  } else if (kind === 'square') {
    const set = new Set<number>()
    while (set.size < 3) { const r = rint(2, 12); set.add(r * r) }
    items = [...set]
    let guard = 0
    do { const r = rint(2, 12); odd = r * r + pick([-2, -1, 1, 2]); guard++ } while ((items.includes(odd) || isPerfectSquare(odd) || odd <= 0) && guard < 30)
    if (isPerfectSquare(odd) || odd <= 0) return null
    explanation = `${items.join(', ')} are perfect squares. ${odd} is not a perfect square.`
    rating = 440
  } else {
    const evenMajority = Math.random() < 0.5
    const set = new Set<number>()
    while (set.size < 3) { const v = rint(5, 60); if ((v % 2 === 0) === evenMajority) set.add(v) }
    items = [...set]
    let guard = 0
    do { odd = rint(5, 60); guard++ } while ((items.includes(odd) || (odd % 2 === 0) === evenMajority) && guard < 30)
    if ((odd % 2 === 0) === evenMajority) return null
    explanation = `${items.join(', ')} are all ${evenMajority ? 'even' : 'odd'} numbers. ${odd} is ${evenMajority ? 'odd' : 'even'}.`
    rating = 240
  }

  const options = shuffle([...items, odd]).map(String)
  return {
    id: `gen:odd:num:${hashId(items.join(',') + ':' + odd)}`,
    category: 'odd-one-out',
    difficulty: diffBand(rating),
    type: 'multiple-choice',
    prompt: 'Which number does not belong?',
    options,
    answer: String(odd),
    explanation,
    style: 'numeric',
    difficultyRating: rating,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Top-level dispatcher
// ─────────────────────────────────────────────────────────────────────────────

type Gen = (diff: number) => Question | null

const GENS_BY_CATEGORY: Record<string, Gen[]> = {
  sequence:    [seqArithmetic, seqGeometric, seqFibonacci, seqPrimes, seqSquares, seqLetters, seqInterleaved, seqQuadratic],
  analogy:     [makeAnalogy],
  logic:       [makeLogic],
  numerical:   [numPercentage, numRatio, numRate, numInterest, numAverage, numFraction],
  'odd-one-out': [makeOddOneOut, oddNumeric],
}

const CATEGORIES = Object.keys(GENS_BY_CATEGORY)

/**
 * Generate a fresh question at a target difficulty (1–1000), avoiding `usedIds`.
 * This is the entry point used by the adaptive engine, which serves each question
 * right at the player's current ability estimate.
 */
export function generateQuestionAtDifficulty(diff: number, usedIds: string[]): Question | null {
  const d = Math.max(50, Math.min(950, Math.round(diff)))
  const used = new Set(usedIds)
  for (const cat of shuffle(CATEGORIES)) {
    const gens = shuffle(GENS_BY_CATEGORY[cat])
    for (const gen of gens) {
      for (let attempt = 0; attempt < 16; attempt++) {
        const q = gen(d)
        if (q && !used.has(q.id)) return q
      }
    }
  }
  return null
}
