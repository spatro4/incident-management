// MathEngine — dynamic question generation for Singapore Math Grade 4 topics.

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[randInt(0, arr.length - 1)]
const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
const simplify = (num, den) => {
  const g = gcd(num, den) || 1
  return [num / g, den / g]
}
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function mcqFrom(correctValue, distractorFn, formatFn = (v) => `${v}`) {
  const choicesSet = new Set([correctValue])
  let guard = 0
  while (choicesSet.size < 4 && guard < 30) {
    choicesSet.add(distractorFn())
    guard += 1
  }
  const choices = shuffle(Array.from(choicesSet)).map(formatFn)
  return { choices, answer: formatFn(correctValue) }
}

// ---------------------------------------------------------------------------
// PLACE VALUE
// ---------------------------------------------------------------------------
function genReadingNumbers() {
  const n = randInt(1000, 99999)
  const digitIdx = randInt(0, 4) // ones..ten-thousands
  const places = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands']
  const str = String(n).padStart(5, '0')
  const digitFromRight = str[str.length - 1 - digitIdx]
  const placeValue = Number(digitFromRight) * Math.pow(10, digitIdx)
  const { choices, answer } = mcqFrom(placeValue, () => randInt(0, 9) * Math.pow(10, randInt(0, 4)))
  return {
    subtopicId: 'reading-numbers',
    type: 'mcq',
    prompt: `In the number ${n.toLocaleString()}, what is the value of the digit in the ${places[digitIdx]} place?`,
    choices,
    answer,
    hint: `Find the digit in the ${places[digitIdx]} place, then multiply it by the place value (${Math.pow(10, digitIdx).toLocaleString()}).`,
  }
}

function genRounding() {
  const roundTo = pick([10, 100, 1000])
  const n = randInt(1000, 99999)
  const rounded = Math.round(n / roundTo) * roundTo
  const { choices, answer } = mcqFrom(rounded, () => {
    const offset = pick([-2, -1, 1, 2]) * roundTo
    return rounded + offset
  })
  return {
    subtopicId: 'rounding',
    type: 'mcq',
    prompt: `Round ${n.toLocaleString()} to the nearest ${roundTo.toLocaleString()}.`,
    choices,
    answer,
    hint: `Look at the digit right after the ${roundTo === 10 ? 'ones' : roundTo === 100 ? 'tens' : 'hundreds'} place. If it's 5 or more, round up.`,
  }
}

function genFactorsMultiples() {
  const askFactor = Math.random() < 0.5
  if (askFactor) {
    const n = pick([12, 18, 24, 36, 48, 60, 72, 84, 90])
    const factors = []
    for (let i = 1; i <= n; i++) if (n % i === 0) factors.push(i)
    const notAFactor = randInt(2, 20)
    const isFactor = factors.includes(notAFactor)
    const candidates = shuffle([...factors.filter((f) => f !== 1 && f !== n), notAFactor]).slice(0, 4)
    const correct = pick(factors.filter((f) => candidates.includes(f)) || [factors[1]])
    const finalChoices = shuffle(Array.from(new Set([correct, ...candidates])).slice(0, 4).map(String))
    return {
      subtopicId: 'factors-multiples',
      type: 'mcq',
      prompt: `Which of these numbers is a factor of ${n}?`,
      choices: finalChoices,
      answer: String(correct),
      hint: `A factor divides ${n} exactly, with no remainder. Try dividing each choice into ${n}.`,
    }
  }
  const a = randInt(3, 9)
  const b = randInt(3, 9)
  const correct = a * b
  const { choices, answer } = mcqFrom(correct, () => correct + pick([-a, a, -b, b, randInt(-6, 6)]))
  return {
    subtopicId: 'factors-multiples',
    type: 'mcq',
    prompt: `What is the ${b}th multiple of ${a}?`,
    choices,
    answer,
    hint: `The ${b}th multiple of ${a} is ${a} × ${b}.`,
  }
}

// ---------------------------------------------------------------------------
// FRACTIONS
// ---------------------------------------------------------------------------
function genEquivalentFractions() {
  const den = pick([2, 3, 4, 5, 6])
  const num = randInt(1, den - 1)
  const factor = randInt(2, 5)
  const targetDen = den * factor
  const correctNum = num * factor
  const { choices, answer } = mcqFrom(correctNum, () => correctNum + pick([-2, -1, 1, 2]))
  return {
    subtopicId: 'equivalent-fractions',
    type: 'mcq',
    prompt: `Find the missing numerator: ${num}/${den} = ?/${targetDen}`,
    choices,
    answer,
    hint: `Whatever you multiply the denominator by (${den} × ${factor} = ${targetDen}), multiply the numerator by the same amount.`,
  }
}

function genAddSubFractions() {
  const den = pick([4, 5, 6, 8, 10, 12])
  let n1 = randInt(1, den - 1)
  let n2 = randInt(1, den - 1)
  const isAdd = Math.random() < 0.5
  if (!isAdd && n2 > n1) [n1, n2] = [n2, n1]
  const resultNum = isAdd ? n1 + n2 : n1 - n2
  const [simpNum, simpDen] = simplify(Math.abs(resultNum), den)
  const answerStr = simpDen === 1 ? `${simpNum}` : `${simpNum}/${simpDen}`
  const { choices, answer } = mcqFrom(
    answerStr,
    () => {
      const fakeNum = Math.max(0, resultNum + pick([-2, -1, 1, 2]))
      const [fn, fd] = simplify(fakeNum || 1, den)
      return fd === 1 ? `${fn}` : `${fn}/${fd}`
    },
    (v) => v
  )
  return {
    subtopicId: 'add-sub-fractions',
    type: 'mcq',
    prompt: `${n1}/${den} ${isAdd ? '+' : '-'} ${n2}/${den} = ?  (give your answer in simplest form)`,
    choices,
    answer,
    hint: `Since the denominators match, just ${isAdd ? 'add' : 'subtract'} the numerators, then simplify if you can.`,
  }
}

function genMixedNumbers() {
  const whole = randInt(1, 6)
  const den = pick([3, 4, 5, 6, 8])
  const num = randInt(1, den - 1)
  const toImproper = Math.random() < 0.5
  if (toImproper) {
    const improperNum = whole * den + num
    const { choices, answer } = mcqFrom(improperNum, () => improperNum + pick([-den, -1, 1, den]))
    return {
      subtopicId: 'mixed-numbers',
      type: 'mcq',
      prompt: `Convert ${whole} ${num}/${den} to an improper fraction. What is the numerator (over ${den})?`,
      choices,
      answer,
      hint: `Multiply the whole number by the denominator (${whole} × ${den}), then add the numerator (${num}).`,
    }
  }
  const improperNum = whole * den + num
  const { choices, answer } = mcqFrom(
    `${whole} ${num}/${den}`,
    () => {
      const fw = whole + pick([-1, 1])
      return `${Math.max(0, fw)} ${num}/${den}`
    },
    (v) => v
  )
  return {
    subtopicId: 'mixed-numbers',
    type: 'mcq',
    prompt: `Convert ${improperNum}/${den} to a mixed number.`,
    choices,
    answer,
    hint: `Divide ${improperNum} by ${den}. The quotient is the whole number, and the remainder sits over ${den}.`,
  }
}

// ---------------------------------------------------------------------------
// DECIMALS
// ---------------------------------------------------------------------------
function genTenthsHundredths() {
  const useHundredths = Math.random() < 0.5
  if (useHundredths) {
    const n = randInt(1, 99)
    const decimal = (n / 100).toFixed(2)
    const { choices, answer } = mcqFrom(
      decimal,
      () => ((n + pick([-10, -1, 1, 10]) + 100) % 100 / 100).toFixed(2),
      (v) => v
    )
    return {
      subtopicId: 'tenths-hundredths',
      type: 'mcq',
      prompt: `Write ${n}/100 as a decimal.`,
      choices,
      answer,
      hint: `Hundredths means two digits after the decimal point.`,
    }
  }
  const n = randInt(1, 9)
  const decimal = (n / 10).toFixed(1)
  const { choices, answer } = mcqFrom(
    decimal,
    () => (((n + pick([-2, -1, 1, 2]) + 10) % 10) / 10).toFixed(1),
    (v) => v
  )
  return {
    subtopicId: 'tenths-hundredths',
    type: 'mcq',
    prompt: `Write ${n}/10 as a decimal.`,
    choices,
    answer,
    hint: `Tenths means one digit after the decimal point.`,
  }
}

function genDecimalFractionConversion() {
  const den = pick([2, 4, 5, 10, 20, 25, 50])
  const num = randInt(1, den - 1)
  const decimal = (num / den).toFixed(2).replace(/0$/, den % 10 === 0 ? '0' : '0')
  const value = num / den
  const decimalStr = Number.isInteger(value * 100) ? (value).toFixed(2) : value.toFixed(2)
  const { choices, answer } = mcqFrom(
    decimalStr,
    () => (value + pick([-0.1, -0.05, 0.05, 0.1])).toFixed(2),
    (v) => v
  )
  return {
    subtopicId: 'decimal-fraction-conversion',
    type: 'mcq',
    prompt: `Convert ${num}/${den} to a decimal.`,
    choices,
    answer,
    hint: `Divide the numerator by the denominator: ${num} ÷ ${den}.`,
  }
}

function genDecimalOperations() {
  const op = pick(['+', '-', '×'])
  const a = randInt(10, 99) / 10
  const b = randInt(10, 99) / 10
  let result
  let prompt
  if (op === '+') {
    result = +(a + b).toFixed(2)
    prompt = `${a.toFixed(1)} + ${b.toFixed(1)} = ?`
  } else if (op === '-') {
    const hi = Math.max(a, b)
    const lo = Math.min(a, b)
    result = +(hi - lo).toFixed(2)
    prompt = `${hi.toFixed(1)} - ${lo.toFixed(1)} = ?`
  } else {
    const whole = randInt(2, 9)
    result = +(a * whole).toFixed(2)
    prompt = `${a.toFixed(1)} × ${whole} = ?`
  }
  const { choices, answer } = mcqFrom(result, () => +(result + pick([-1, -0.5, 0.5, 1])).toFixed(2), (v) => v.toFixed(2))
  return {
    subtopicId: 'decimal-operations',
    type: 'mcq',
    prompt,
    choices,
    answer,
    hint: `Line up the decimal points before you calculate.`,
  }
}

// ---------------------------------------------------------------------------
// GEOMETRY
// ---------------------------------------------------------------------------
function genAngles() {
  const angle = randInt(1, 17) * 10
  let type
  if (angle < 90) type = 'acute'
  else if (angle === 90) type = 'right'
  else if (angle < 180) type = 'obtuse'
  else type = 'straight'
  const { choices, answer } = mcqFrom(
    type,
    () => pick(['acute', 'right', 'obtuse', 'straight'].filter((t) => t !== type)),
    (v) => v
  )
  return {
    subtopicId: 'angles',
    type: 'mcq',
    prompt: `An angle measures ${angle}°. What type of angle is it?`,
    choices,
    answer,
    hint: `Acute < 90°, Right = 90°, Obtuse is between 90° and 180°, Straight = 180°.`,
  }
}

function genLines() {
  const scenarios = [
    { desc: 'Two lines meet and form a perfect 90° corner (like the corner of a book).', answer: 'Perpendicular' },
    { desc: 'Two lines run side by side and will never meet, no matter how far they extend (like railway tracks).', answer: 'Parallel' },
    { desc: 'Two lines cross each other at a 90° angle.', answer: 'Perpendicular' },
    { desc: 'Two lines stay exactly the same distance apart forever.', answer: 'Parallel' },
  ]
  const s = pick(scenarios)
  const { choices, answer } = mcqFrom(s.answer, () => pick(['Perpendicular', 'Parallel', 'Intersecting'].filter((t) => t !== s.answer)), (v) => v)
  return {
    subtopicId: 'lines',
    type: 'mcq',
    prompt: s.desc + ' What do we call these lines?',
    choices,
    answer,
    hint: `Perpendicular lines cross at 90°. Parallel lines never meet.`,
  }
}

function genAreaPerimeter() {
  const askArea = Math.random() < 0.5
  const isComposite = Math.random() < 0.4
  if (!isComposite) {
    const l = randInt(4, 15)
    const w = randInt(3, 12)
    if (askArea) {
      const area = l * w
      const { choices, answer } = mcqFrom(area, () => area + pick([-l, l, -w, w]))
      return {
        subtopicId: 'area-perimeter',
        type: 'mcq',
        prompt: `A rectangle has a length of ${l} cm and a width of ${w} cm. What is its area?`,
        choices: choices.map((c) => `${c} cm²`),
        answer: `${answer} cm²`,
        hint: `Area of a rectangle = length × width = ${l} × ${w}.`,
      }
    }
    const perimeter = 2 * (l + w)
    const { choices, answer } = mcqFrom(perimeter, () => perimeter + pick([-4, -2, 2, 4]))
    return {
      subtopicId: 'area-perimeter',
      type: 'mcq',
      prompt: `A rectangle has a length of ${l} cm and a width of ${w} cm. What is its perimeter?`,
      choices: choices.map((c) => `${c} cm`),
      answer: `${answer} cm`,
      hint: `Perimeter of a rectangle = 2 × (length + width).`,
    }
  }
  // Composite L-shape: big rectangle minus a notch
  const L = randInt(10, 16)
  const W = randInt(8, 14)
  const notchL = randInt(2, Math.floor(L / 2))
  const notchW = randInt(2, Math.floor(W / 2))
  const area = L * W - notchL * notchW
  const { choices, answer } = mcqFrom(area, () => area + pick([-notchL * notchW, notchL * notchW, -4, 4]))
  return {
    subtopicId: 'area-perimeter',
    type: 'mcq',
    prompt: `An L-shaped figure is made from a ${L} cm × ${W} cm rectangle with a ${notchL} cm × ${notchW} cm rectangular notch cut from one corner. What is the area of the L-shape?`,
    choices: choices.map((c) => `${c} cm²`),
    answer: `${answer} cm²`,
    hint: `Find the area of the whole rectangle (${L} × ${W}), then subtract the notch (${notchL} × ${notchW}).`,
  }
}

// ---------------------------------------------------------------------------
// DATA / GRAPHS
// ---------------------------------------------------------------------------
function genBarGraphQuestion() {
  const categories = shuffle(['Apples', 'Bananas', 'Oranges', 'Grapes', 'Mangoes']).slice(0, 4)
  const values = categories.map(() => randInt(2, 20))
  const data = categories.map((c, i) => ({ label: c, value: values[i] }))
  const questionType = pick(['max', 'min', 'difference', 'total'])
  let prompt, correct
  if (questionType === 'max') {
    const maxItem = data.reduce((a, b) => (b.value > a.value ? b : a))
    prompt = 'Which fruit has the highest bar (the greatest quantity)?'
    correct = maxItem.label
  } else if (questionType === 'min') {
    const minItem = data.reduce((a, b) => (b.value < a.value ? b : a))
    prompt = 'Which fruit has the lowest bar (the least quantity)?'
    correct = minItem.label
  } else if (questionType === 'difference') {
    const sorted = [...data].sort((a, b) => b.value - a.value)
    correct = sorted[0].value - sorted[1].value
    prompt = `How many more ${sorted[0].label} are there than ${sorted[1].label}?`
  } else {
    correct = data.reduce((sum, d) => sum + d.value, 0)
    prompt = 'What is the total number of fruits shown across all bars?'
  }
  const { choices, answer } = mcqFrom(
    correct,
    () => (typeof correct === 'number' ? correct + pick([-3, -2, -1, 1, 2, 3]) : pick(categories.filter((c) => c !== correct))),
    (v) => `${v}`
  )
  return {
    subtopicId: 'bar-graphs',
    type: 'mcq',
    prompt,
    choices,
    answer,
    hint: `Read each bar carefully and compare heights (values) before answering.`,
    chartData: { type: 'bar', data },
  }
}

function genLineGraphQuestion() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  let last = randInt(10, 20)
  const values = days.map(() => {
    last = Math.max(2, last + randInt(-5, 5))
    return last
  })
  const data = days.map((d, i) => ({ label: d, value: values[i] }))
  const questionType = pick(['trend', 'value', 'change'])
  let prompt, correct
  if (questionType === 'value') {
    const idx = randInt(0, days.length - 1)
    prompt = `According to the line graph, what was the value on ${days[idx]}?`
    correct = values[idx]
  } else if (questionType === 'change') {
    correct = values[values.length - 1] - values[0]
    prompt = `What was the change in value from ${days[0]} to ${days[days.length - 1]}?`
  } else {
    const rising = values[values.length - 1] > values[0]
    prompt = `Overall, from ${days[0]} to ${days[days.length - 1]}, did the value increase or decrease?`
    correct = rising ? 'Increase' : 'Decrease'
  }
  const { choices, answer } = mcqFrom(
    correct,
    () => (typeof correct === 'number' ? correct + pick([-4, -2, -1, 1, 2, 4]) : correct === 'Increase' ? 'Decrease' : 'Increase'),
    (v) => `${v}`
  )
  return {
    subtopicId: 'line-graphs',
    type: 'mcq',
    prompt,
    choices,
    answer,
    hint: `Trace the line from left to right and watch whether it goes up or down.`,
    chartData: { type: 'line', data },
  }
}

function genDataAnalysis() {
  const nums = Array.from({ length: 5 }, () => randInt(1, 20)).sort((a, b) => a - b)
  const mode = pick(['range', 'median'])
  let correct, prompt
  if (mode === 'range') {
    correct = nums[nums.length - 1] - nums[0]
    prompt = `A data set has these values: ${nums.join(', ')}. What is the range (highest − lowest)?`
  } else {
    correct = nums[2]
    prompt = `A data set has these values: ${nums.join(', ')}. What is the median (middle value when sorted)?`
  }
  const { choices, answer } = mcqFrom(correct, () => correct + pick([-3, -2, -1, 1, 2, 3]))
  return {
    subtopicId: 'data-analysis',
    type: 'mcq',
    prompt,
    choices,
    answer,
    hint: mode === 'range' ? `Subtract the smallest number from the largest.` : `Sort the numbers and find the one in the middle.`,
  }
}

// ---------------------------------------------------------------------------
// WORD PROBLEMS (Bar Modeling)
// ---------------------------------------------------------------------------
const WP_NAMES = ['Mei Ling', 'Ahmad', 'Priya', 'Wei Jie', 'Aisha', 'Kumar', 'Siti', 'Ryan']
const WP_ITEMS = ['stickers', 'marbles', 'story books', 'seashells', 'trading cards', 'stamps']

function genPartWhole() {
  const name = pick(WP_NAMES)
  const item = pick(WP_ITEMS)
  const part1 = randInt(15, 60)
  const part2 = randInt(15, 60)
  const whole = part1 + part2
  const askWhole = Math.random() < 0.5
  if (askWhole) {
    return {
      subtopicId: 'part-whole',
      type: 'input',
      prompt: `${name} has ${part1} ${item}. ${name}'s friend gives ${name} ${part2} more ${item}. How many ${item} does ${name} have now?`,
      answer: String(whole),
      hint: `This is a part-whole model: add the two parts together (${part1} + ${part2}).`,
      barModel: {
        mode: 'part-whole',
        whole: null,
        parts: [part1, part2],
        unknownIndex: 'whole',
        unit: item,
      },
    }
  }
  return {
    subtopicId: 'part-whole',
    type: 'input',
    prompt: `${name} had ${whole} ${item} in total. ${part1} of them are red, and the rest are blue. How many ${item} are blue?`,
    answer: String(part2),
    hint: `This is a part-whole model: subtract the known part from the whole (${whole} − ${part1}).`,
    barModel: {
      mode: 'part-whole',
      whole,
      parts: [part1, null],
      unknownIndex: 1,
      unit: item,
    },
  }
}

function genComparison() {
  const name1 = pick(WP_NAMES)
  let name2 = pick(WP_NAMES)
  while (name2 === name1) name2 = pick(WP_NAMES)
  const item = pick(WP_ITEMS)
  const base = randInt(20, 50)
  const diff = randInt(5, 30)
  const more = base + diff
  const askDiff = Math.random() < 0.4
  if (askDiff) {
    return {
      subtopicId: 'comparison',
      type: 'input',
      prompt: `${name1} has ${base} ${item}. ${name2} has ${more} ${item}. How many more ${item} does ${name2} have than ${name1}?`,
      answer: String(diff),
      hint: `Comparison bar model: subtract the smaller amount from the larger amount (${more} − ${base}).`,
      barModel: {
        mode: 'comparison',
        bars: [{ label: name1, value: base }, { label: name2, value: more }],
        unknownIndex: 'diff',
        unit: item,
      },
    }
  }
  const askTotal = Math.random() < 0.5
  if (askTotal) {
    const total = base + more
    return {
      subtopicId: 'comparison',
      type: 'input',
      prompt: `${name1} has ${base} ${item}. ${name2} has ${diff} more ${item} than ${name1}. How many ${item} do they have in total?`,
      answer: String(total),
      hint: `First find ${name2}'s amount (${base} + ${diff} = ${more}), then add both amounts together.`,
      barModel: {
        mode: 'comparison',
        bars: [{ label: name1, value: base }, { label: name2, value: more }],
        unknownIndex: null,
        unit: item,
      },
    }
  }
  return {
    subtopicId: 'comparison',
    type: 'input',
    prompt: `${name1} has ${base} ${item}. ${name2} has ${diff} fewer ${item} than ${name1}. How many ${item} does ${name2} have?`,
    answer: String(base - diff),
    hint: `Since ${name2} has fewer, subtract the difference from ${name1}'s amount (${base} − ${diff}).`,
    barModel: {
      mode: 'comparison',
      bars: [{ label: name1, value: base }, { label: name2, value: base - diff }],
      unknownIndex: 1,
      unit: item,
    },
  }
}

function genMultiStep() {
  const name = pick(WP_NAMES)
  const item = pick(WP_ITEMS)
  const start = randInt(80, 150)
  const given = randInt(10, 40)
  const bought = randInt(10, 40)
  const remaining = start - given + bought
  return {
    subtopicId: 'multi-step',
    type: 'input',
    prompt: `${name} started with ${start} ${item}. ${name} gave away ${given} ${item} to a friend, then bought ${bought} more ${item}. How many ${item} does ${name} have now?`,
    answer: String(remaining),
    hint: `Work step by step: ${start} − ${given} = ${start - given}, then ${start - given} + ${bought} = ${remaining}.`,
    barModel: {
      mode: 'multi-step',
      steps: [
        { label: 'Start', value: start },
        { label: 'Gave away', value: -given },
        { label: 'Bought', value: bought },
      ],
      unit: item,
    },
  }
}

// ---------------------------------------------------------------------------
// REGISTRY
// ---------------------------------------------------------------------------
const GENERATORS = {
  'place-value': [genReadingNumbers, genRounding, genFactorsMultiples],
  fractions: [genEquivalentFractions, genAddSubFractions, genMixedNumbers],
  decimals: [genTenthsHundredths, genDecimalFractionConversion, genDecimalOperations],
  geometry: [genAngles, genLines, genAreaPerimeter],
  data: [genBarGraphQuestion, genLineGraphQuestion, genDataAnalysis],
  'word-problems': [genPartWhole, genComparison, genMultiStep],
}

/**
 * Generate a randomized set of questions across the given chapter ids.
 * @param {string[]} chapterIds
 * @param {number} count total number of questions to generate
 * @returns {Array} question objects, each tagged with chapterId + id
 */
export function generateQuestions(chapterIds, count = 12) {
  const validChapters = chapterIds.filter((id) => GENERATORS[id])
  if (validChapters.length === 0) return []
  const questions = []
  for (let i = 0; i < count; i++) {
    const chapterId = validChapters[i % validChapters.length]
    const generatorPool = GENERATORS[chapterId]
    const generator = pick(generatorPool)
    const q = generator()
    questions.push({ ...q, id: uid(), chapterId })
  }
  return shuffle(questions)
}

export function generateSingleQuestion(chapterId, subtopicId) {
  const pool = GENERATORS[chapterId]
  if (!pool) return null
  let attempts = 0
  let q = null
  while (attempts < 10) {
    const candidate = pick(pool)()
    if (!subtopicId || candidate.subtopicId === subtopicId) {
      q = candidate
      break
    }
    attempts += 1
  }
  if (!q) q = pick(pool)()
  return { ...q, id: uid(), chapterId }
}

export function checkAnswer(question, userAnswer) {
  if (userAnswer == null) return false
  const normalize = (v) => String(v).trim().toLowerCase()
  return normalize(userAnswer) === normalize(question.answer)
}
