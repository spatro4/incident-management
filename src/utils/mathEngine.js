// MathEngine — dynamic question generation for Singapore Math Primary 4
// (Level 4A + 4B) topics, plus bonus enrichment chapters.
// Every generator accepts a difficulty tier: 'easy' | 'medium' | 'hard'
// (simple -> advanced), so chapter practice can progress smoothly.

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

// Like mcqFrom, but for "which of these satisfies property X" questions
// where a naive distractor could accidentally ALSO satisfy X (e.g. another
// common factor, another multiple of the same LCM). isAlsoValid rejects any
// candidate that would make the question ambiguous.
function mcqFromExcluding(correctValue, distractorFn, isAlsoValid, formatFn = (v) => `${v}`) {
  const choicesSet = new Set([correctValue])
  let guard = 0
  while (choicesSet.size < 4 && guard < 60) {
    const candidate = distractorFn()
    guard += 1
    if (choicesSet.has(candidate)) continue
    if (isAlsoValid(candidate)) continue
    choicesSet.add(candidate)
  }
  const choices = shuffle(Array.from(choicesSet)).map(formatFn)
  return { choices, answer: formatFn(correctValue) }
}

const WP_NAMES = ['Mei Ling', 'Ahmad', 'Priya', 'Wei Jie', 'Aisha', 'Kumar', 'Siti', 'Ryan']
const WP_ITEMS = ['stickers', 'marbles', 'story books', 'seashells', 'trading cards', 'stamps']

// ---------------------------------------------------------------------------
// WHOLE NUMBERS
// ---------------------------------------------------------------------------
function genNumbersTo100000(difficulty = 'medium') {
  const places = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands']

  if (difficulty === 'hard') {
    const n = randInt(10000, 99999)
    const str = String(n).padStart(5, '0')
    const idxA = 4
    const idxB = 2
    const digitA = Number(str[str.length - 1 - idxA])
    const digitB = Number(str[str.length - 1 - idxB])
    const correct = digitA * Math.pow(10, idxA) + digitB * Math.pow(10, idxB)
    const { choices, answer } = mcqFrom(correct, () => correct + pick([-1000, -100, 100, 1000, 10000]))
    return {
      subtopicId: 'numbers-to-100000',
      type: 'mcq',
      prompt: `In the number ${n.toLocaleString()}, what is the sum of the value of the ten-thousands digit and the value of the hundreds digit?`,
      choices,
      answer,
      hint: `Find each digit's value separately (digit × place value), then add them together.`,
    }
  }

  const n = difficulty === 'easy' ? randInt(1000, 9999) : randInt(10000, 99999)
  const maxIdx = difficulty === 'easy' ? 3 : 4
  const digitIdx = randInt(0, maxIdx)
  const str = String(n).padStart(5, '0')
  const digitFromRight = str[str.length - 1 - digitIdx]
  const placeValue = Number(digitFromRight) * Math.pow(10, digitIdx)
  const { choices, answer } = mcqFrom(placeValue, () => randInt(0, 9) * Math.pow(10, randInt(0, maxIdx)))
  return {
    subtopicId: 'numbers-to-100000',
    type: 'mcq',
    prompt: `In the number ${n.toLocaleString()}, what is the value of the digit in the ${places[digitIdx]} place?`,
    choices,
    answer,
    hint: `Find the digit in the ${places[digitIdx]} place, then multiply it by the place value (${Math.pow(10, digitIdx).toLocaleString()}).`,
  }
}

function genRoundingEstimation(difficulty = 'medium') {
  let roundTo, n
  if (difficulty === 'easy') {
    roundTo = 10
    n = randInt(100, 999)
  } else if (difficulty === 'hard') {
    roundTo = pick([1000, 10000])
    n = randInt(10000, 99999)
  } else {
    roundTo = pick([10, 100, 1000])
    n = randInt(1000, 99999)
  }
  const rounded = Math.round(n / roundTo) * roundTo
  const { choices, answer } = mcqFrom(rounded, () => {
    const offset = pick([-2, -1, 1, 2]) * roundTo
    return rounded + offset
  })
  return {
    subtopicId: 'rounding-estimation',
    type: 'mcq',
    prompt: `Round ${n.toLocaleString()} to the nearest ${roundTo.toLocaleString()}.`,
    choices,
    answer,
    hint: `Look at the digit right after the place you're rounding to. If it's 5 or more, round up.`,
  }
}

// CBSE-style multi-step word problem: form the greatest/smallest number from
// a set of digits, then find the difference between them.
function genPlaceValueWordProblem(difficulty = 'medium') {
  const numDigits = difficulty === 'hard' ? 5 : difficulty === 'easy' ? 3 : 4
  const digits = []
  while (digits.length < numDigits) {
    const d = randInt(0, 9)
    if (!digits.includes(d)) digits.push(d)
  }
  const sortedDesc = [...digits].sort((a, b) => b - a)
  const greatest = Number(sortedDesc.join(''))
  const sortedAsc = [...digits].sort((a, b) => a - b)
  if (sortedAsc[0] === 0) {
    const firstNonZeroIdx = sortedAsc.findIndex((d) => d !== 0)
    ;[sortedAsc[0], sortedAsc[firstNonZeroIdx]] = [sortedAsc[firstNonZeroIdx], sortedAsc[0]]
  }
  const smallest = Number(sortedAsc.join(''))
  const difference = greatest - smallest
  return {
    subtopicId: 'whole-numbers-word-problems',
    type: 'input',
    prompt: `Using the digits ${digits.join(', ')} exactly once each, form the greatest possible ${numDigits}-digit number and the smallest possible ${numDigits}-digit number (the smallest cannot start with 0). What is the difference between them?`,
    answer: String(difference),
    hint: `Greatest number: arrange the digits from largest to smallest (${sortedDesc.join('')}). Smallest number: arrange from smallest to largest, but don't start with 0 (${sortedAsc.join('')}). Then subtract.`,
  }
}

// ---------------------------------------------------------------------------
// MULTIPLES AND FACTORS
// ---------------------------------------------------------------------------
function genFactorsCommonFactors(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const pairs = [
      [12, 18], [16, 24], [20, 30], [18, 27], [24, 36], [15, 25], [14, 21], [28, 42],
      [10, 15], [21, 28], [16, 40], [27, 36], [22, 33], [20, 50], [18, 24], [30, 45],
      [32, 48], [26, 39], [12, 30], [35, 49],
    ]
    const [x, y] = pick(pairs)
    const gcf = gcd(x, y)
    const { choices, answer } = mcqFrom(gcf, () => Math.max(1, gcf + pick([-3, -2, -1, 1, 2, 3])))
    return {
      subtopicId: 'factors-common-factors',
      type: 'mcq',
      prompt: `What is the Greatest Common Factor (GCF) of ${x} and ${y}?`,
      choices,
      answer,
      hint: `List the factors of both numbers and find the largest one they share.`,
    }
  }
  if (difficulty === 'medium') {
    const pairs = [[12, 18], [8, 12], [10, 15], [9, 12], [6, 15], [16, 20]]
    const [x, y] = pick(pairs)
    const factorsX = []
    for (let i = 1; i <= x; i++) if (x % i === 0) factorsX.push(i)
    const factorsY = []
    for (let i = 1; i <= y; i++) if (y % i === 0) factorsY.push(i)
    const common = factorsX.filter((f) => factorsY.includes(f) && f !== 1)
    const correct = pick(common)
    const { choices, answer } = mcqFromExcluding(
      correct,
      () => Math.max(2, correct + pick([-4, -3, -2, -1, 1, 2, 3, 4])),
      (v) => x % v === 0 && y % v === 0
    )
    return {
      subtopicId: 'factors-common-factors',
      type: 'mcq',
      prompt: `Which of these is a common factor of ${x} and ${y} (other than 1)?`,
      choices,
      answer,
      hint: `List the factors of both ${x} and ${y}, then find a number that appears in both lists.`,
    }
  }
  const n = pick([12, 18, 24])
  const factors = []
  for (let i = 1; i <= n; i++) if (n % i === 0) factors.push(i)
  const correct = pick(factors.filter((f) => f !== 1 && f !== n))
  const { choices, answer } = mcqFromExcluding(correct, () => randInt(2, n - 1), (v) => n % v === 0)
  return {
    subtopicId: 'factors-common-factors',
    type: 'mcq',
    prompt: `Which of these numbers is a factor of ${n}?`,
    choices,
    answer,
    hint: `A factor divides ${n} exactly, with no remainder. Try dividing each choice into ${n}.`,
  }
}

function genMultiplesCommonMultiples(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const pairs = [
      [4, 6], [3, 5], [6, 8], [4, 10], [5, 6], [3, 4], [6, 9], [8, 12],
      [4, 9], [3, 8], [5, 8], [6, 10], [9, 12], [4, 14], [7, 10], [5, 9],
      [6, 14], [8, 10], [3, 14], [9, 15],
    ]
    const [x, y] = pick(pairs)
    const lcm = (x * y) / gcd(x, y)
    const { choices, answer } = mcqFrom(lcm, () => lcm + pick([-x, -y, x, y]))
    return {
      subtopicId: 'multiples-common-multiples',
      type: 'mcq',
      prompt: `What is the Least Common Multiple (LCM) of ${x} and ${y}?`,
      choices,
      answer,
      hint: `List the multiples of both numbers and find the smallest one they share.`,
    }
  }
  if (difficulty === 'medium') {
    const [a, b] = pick([[2, 3], [3, 4], [2, 5], [4, 6], [3, 6]])
    const multiplesA = Array.from({ length: 8 }, (_, i) => a * (i + 1))
    const multiplesB = Array.from({ length: 8 }, (_, i) => b * (i + 1))
    const common = multiplesA.filter((m) => multiplesB.includes(m))
    const correct = pick(common)
    const { choices, answer } = mcqFromExcluding(
      correct,
      () => Math.max(1, correct + pick([-a, -b, a, b, 1, -1])),
      (v) => v % a === 0 && v % b === 0
    )
    return {
      subtopicId: 'multiples-common-multiples',
      type: 'mcq',
      prompt: `Which of these numbers is a common multiple of ${a} and ${b}?`,
      choices,
      answer,
      hint: `List out the first several multiples of both ${a} and ${b}, then look for a match.`,
    }
  }
  const a = randInt(2, 9)
  const b = randInt(2, 9)
  const correct = a * b
  const { choices, answer } = mcqFrom(correct, () => correct + pick([-a, a, -b, b, randInt(-6, 6)]))
  return {
    subtopicId: 'multiples-common-multiples',
    type: 'mcq',
    prompt: `What is the ${b}th multiple of ${a}?`,
    choices,
    answer,
    hint: `The ${b}th multiple of ${a} is ${a} × ${b}.`,
  }
}

function genPrimeComposite(difficulty = 'medium') {
  const maxN = difficulty === 'easy' ? 20 : difficulty === 'hard' ? 100 : 50
  const n = randInt(2, maxN)
  const isPrime = (num) => {
    if (num < 2) return false
    for (let i = 2; i * i <= num; i++) if (num % i === 0) return false
    return true
  }
  const prime = isPrime(n)
  const { choices, answer } = mcqFrom(prime ? 'Prime' : 'Composite', () => (prime ? 'Composite' : 'Prime'), (v) => v)
  return {
    subtopicId: 'prime-composite',
    type: 'mcq',
    prompt: `Is ${n} a prime number or a composite number?`,
    choices,
    answer,
    hint: `A prime number has exactly two factors: 1 and itself. A composite number has more than two factors.`,
  }
}

// CBSE-style word problems: the classic "bells toll together" (LCM) and
// "cut into equal pieces" (GCF) scenarios.
function genFactorsMultiplesWordProblem() {
  const mode = pick(['lcm-bells', 'gcf-ribbon'])
  if (mode === 'lcm-bells') {
    const pairs = [[4, 6], [3, 5], [6, 8], [4, 10], [5, 6], [3, 4], [6, 9], [8, 12], [4, 9], [3, 8], [5, 8], [6, 10]]
    const [a, b] = pick(pairs)
    const lcm = (a * b) / gcd(a, b)
    return {
      subtopicId: 'factors-multiples-word-problems',
      type: 'input',
      prompt: `Two bells toll every ${a} minutes and ${b} minutes respectively. If both bells toll together at 9:00 am, after how many minutes will they toll together again?`,
      answer: String(lcm),
      hint: `They'll toll together again after a number of minutes that's a multiple of both ${a} and ${b} — that's the LCM of ${a} and ${b}.`,
    }
  }
  const pairs2 = [[12, 18], [16, 24], [20, 30], [18, 27], [24, 36], [15, 25], [14, 21], [28, 42], [10, 15], [21, 28]]
  const [x, y] = pick(pairs2)
  const gcf = gcd(x, y)
  const pieces = (x + y) / gcf
  return {
    subtopicId: 'factors-multiples-word-problems',
    type: 'input',
    prompt: `A tailor has two ribbons, one ${x} m long and the other ${y} m long. She wants to cut both into equal-length pieces with none left over, using the greatest possible length for each piece. How many pieces will she get in total from both ribbons?`,
    answer: String(pieces),
    hint: `The greatest possible piece length is the GCF of ${x} and ${y}, which is ${gcf} m. Total pieces = (${x} + ${y}) ÷ ${gcf}.`,
  }
}

// ---------------------------------------------------------------------------
// MULTIPLICATION AND DIVISION
// ---------------------------------------------------------------------------
function genMultiply2Digit(difficulty = 'medium') {
  const a = difficulty === 'easy' ? randInt(10, 30) : difficulty === 'hard' ? randInt(200, 800) : randInt(100, 300)
  const b = randInt(11, 99)
  const product = a * b
  const { choices, answer } = mcqFrom(product, () => product + pick([-b, b, -a, a, -10, 10]))
  return {
    subtopicId: 'multiply-2digit',
    type: 'mcq',
    prompt: `${a} × ${b} = ?`,
    choices,
    answer,
    hint: `Break ${b} into tens and ones (${Math.floor(b / 10) * 10} + ${b % 10}), multiply each part by ${a}, then add.`,
  }
}

function genDivide1Digit(difficulty = 'medium') {
  const divisor = randInt(2, 9)
  if (difficulty === 'hard') {
    const quotient = randInt(20, 90)
    const remainder = randInt(1, divisor - 1)
    const dividend = quotient * divisor + remainder
    const answerStr = `${quotient} r ${remainder}`
    const { choices, answer } = mcqFrom(answerStr, () => `${quotient + pick([-2, -1, 1, 2])} r ${remainder}`, (v) => v)
    return {
      subtopicId: 'divide-1digit',
      type: 'mcq',
      prompt: `${dividend} ÷ ${divisor} = ? (write your answer as "quotient r remainder")`,
      choices,
      answer,
      hint: `Divide as usual — whatever is left over after the last full group is the remainder.`,
    }
  }
  const quotient = difficulty === 'easy' ? randInt(10, 50) : randInt(50, 200)
  const dividend = quotient * divisor
  const { choices, answer } = mcqFrom(quotient, () => quotient + pick([-3, -2, -1, 1, 2, 3]))
  return {
    subtopicId: 'divide-1digit',
    type: 'mcq',
    prompt: `${dividend} ÷ ${divisor} = ?`,
    choices,
    answer,
    hint: `Think: ${divisor} times what number equals ${dividend}?`,
  }
}

function genMultDivWordProblems(difficulty = 'medium') {
  const name = pick(WP_NAMES)
  const item = pick(WP_ITEMS)

  if (difficulty === 'hard') {
    const boxes = randInt(4, 9)
    const perBox = randInt(10, 30)
    const people = pick([2, 3, 4, 5])
    const total = boxes * perBox
    const remainder = total % people
    const adjustedPerBox = remainder === 0 ? perBox : perBox + Math.ceil((people - remainder) / boxes)
    const adjustedTotal = boxes * adjustedPerBox
    const each = adjustedTotal / people
    return {
      subtopicId: 'word-problems-multdiv',
      type: 'input',
      prompt: `${name} packed ${boxes} boxes with ${adjustedPerBox} ${item} in each box. If the ${item} are shared equally among ${people} friends, how many does each friend get?`,
      answer: String(each),
      hint: `First find the total (${boxes} × ${adjustedPerBox} = ${adjustedTotal}), then divide by ${people}.`,
    }
  }

  if (difficulty === 'easy' || Math.random() < 0.5) {
    const groups = randInt(4, 12)
    const perGroup = randInt(5, 20)
    const total = groups * perGroup
    return {
      subtopicId: 'word-problems-multdiv',
      type: 'input',
      prompt: `${name} has ${groups} bags with ${perGroup} ${item} in each bag. How many ${item} does ${name} have in total?`,
      answer: String(total),
      hint: `Multiply the number of bags by the number of ${item} in each bag (${groups} × ${perGroup}).`,
    }
  }
  const people = pick([2, 3, 4, 5, 6])
  const each = randInt(5, 20)
  const total = people * each
  return {
    subtopicId: 'word-problems-multdiv',
    type: 'input',
    prompt: `${name} has ${total} ${item} and wants to share them equally among ${people} friends. How many ${item} will each friend get?`,
    answer: String(each),
    hint: `Divide the total number of ${item} by the number of friends (${total} ÷ ${people}).`,
  }
}

// CBSE-style 3-step word problem: multiply, subtract, then divide.
function genComputationWordProblem() {
  const name = pick(WP_NAMES)
  const rows = randInt(6, 12)
  const perRow = randInt(8, 20)
  const total = rows * perRow
  const broken = randInt(3, Math.max(4, Math.min(15, total - 10)))
  const usable = total - broken
  const groupSize = pick([4, 5, 6, 7, 8])
  const groups = Math.floor(usable / groupSize)
  return {
    subtopicId: 'word-problems-multdiv',
    type: 'input',
    prompt: `For the school fair, ${name} arranged ${rows} rows of chairs with ${perRow} chairs in each row. ${broken} chairs were found broken and removed. The remaining chairs were then grouped into sets of ${groupSize} for storage. How many full sets were made?`,
    answer: String(groups),
    hint: `First find the total chairs (${rows} × ${perRow} = ${total}), subtract the broken ones (${total} − ${broken} = ${usable}), then divide by ${groupSize}.`,
  }
}

// ---------------------------------------------------------------------------
// FRACTIONS
// ---------------------------------------------------------------------------
function genMixedNumbers(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const den = pick([4, 5, 6, 8])
    const w1 = randInt(1, 5)
    const w2 = randInt(1, 5)
    const n1 = randInt(1, den - 1)
    const n2 = randInt(1, den - 1)
    const totalNum = n1 + n2
    const extraWhole = Math.floor(totalNum / den)
    const remNum = totalNum % den
    const finalWhole = w1 + w2 + extraWhole
    const answerStr = remNum === 0 ? `${finalWhole}` : `${finalWhole} ${remNum}/${den}`
    const { choices, answer } = mcqFrom(
      answerStr,
      () => {
        const fw = Math.max(0, finalWhole + pick([-1, 1]))
        return remNum === 0 ? `${fw}` : `${fw} ${remNum}/${den}`
      },
      (v) => v
    )
    return {
      subtopicId: 'mixed-improper',
      type: 'mcq',
      prompt: `${w1} ${n1}/${den} + ${w2} ${n2}/${den} = ?`,
      choices,
      answer,
      hint: `Add the whole numbers together, then add the fraction parts. If the fraction sum reaches ${den}/${den} or more, regroup it into an extra whole.`,
    }
  }

  const whole = difficulty === 'easy' ? randInt(1, 3) : randInt(1, 6)
  const den = difficulty === 'easy' ? pick([3, 4]) : pick([3, 4, 5, 6, 8])
  const num = randInt(1, den - 1)
  const toImproper = Math.random() < 0.5
  const improperNum = whole * den + num
  if (toImproper) {
    const { choices, answer } = mcqFrom(improperNum, () => improperNum + pick([-den, -1, 1, den]))
    return {
      subtopicId: 'mixed-improper',
      type: 'mcq',
      prompt: `Convert ${whole} ${num}/${den} to an improper fraction. What is the numerator (over ${den})?`,
      choices,
      answer,
      hint: `Multiply the whole number by the denominator (${whole} × ${den}), then add the numerator (${num}).`,
    }
  }
  const { choices, answer } = mcqFrom(
    `${whole} ${num}/${den}`,
    () => {
      const fw = Math.max(0, whole + pick([-1, 1]))
      return `${fw} ${num}/${den}`
    },
    (v) => v
  )
  return {
    subtopicId: 'mixed-improper',
    type: 'mcq',
    prompt: `Convert ${improperNum}/${den} to a mixed number.`,
    choices,
    answer,
    hint: `Divide ${improperNum} by ${den}. The quotient is the whole number, and the remainder sits over ${den}.`,
  }
}

function genCompareFractions(difficulty = 'medium') {
  if (difficulty === 'easy') {
    const den = pick([3, 4, 5, 6])
    const n1 = randInt(1, den - 1)
    let n2 = randInt(1, den - 1)
    while (n2 === n1) n2 = randInt(1, den - 1)
    const bigger = n1 > n2 ? `${n1}/${den}` : `${n2}/${den}`
    const smaller = n1 > n2 ? `${n2}/${den}` : `${n1}/${den}`
    const { choices, answer } = mcqFrom(bigger, () => smaller, (v) => v)
    return {
      subtopicId: 'comparing-ordering-fractions',
      type: 'mcq',
      prompt: `Which fraction is greater: ${n1}/${den} or ${n2}/${den}?`,
      choices,
      answer,
      hint: `When denominators are the same, the fraction with the bigger numerator is greater.`,
    }
  }

  const pairs = difficulty === 'hard' ? [[2, 7], [3, 5], [4, 7], [3, 8], [5, 6], [2, 9]] : [[2, 4], [3, 6], [2, 6], [3, 9], [4, 8], [2, 8]]
  const [d1, d2] = pick(pairs)
  const n1 = randInt(1, d1 - 1)
  let n2 = randInt(1, d2 - 1)
  let v1 = n1 / d1
  let v2 = n2 / d2
  let guard = 0
  while (Math.abs(v1 - v2) < 0.02 && guard < 20) {
    n2 = randInt(1, d2 - 1)
    v2 = n2 / d2
    guard += 1
  }
  const bigger = v1 > v2 ? `${n1}/${d1}` : `${n2}/${d2}`
  const smaller = v1 > v2 ? `${n2}/${d2}` : `${n1}/${d1}`
  const { choices, answer } = mcqFrom(bigger, () => smaller, (v) => v)
  return {
    subtopicId: 'comparing-ordering-fractions',
    type: 'mcq',
    prompt: `Which fraction is greater: ${n1}/${d1} or ${n2}/${d2}?`,
    choices,
    answer,
    hint: `Rewrite both fractions with a common denominator, then compare the numerators.`,
  }
}

function genAddSubUnlikeFractions(difficulty = 'medium') {
  const pairs =
    difficulty === 'easy'
      ? [[2, 4], [3, 6], [2, 6], [4, 8], [3, 9], [5, 10]]
      : difficulty === 'hard'
        ? [[3, 4], [4, 6], [2, 5], [3, 8], [5, 6], [2, 7], [4, 7], [3, 7]]
        : [[2, 3], [3, 4], [2, 5], [4, 6], [3, 5], [2, 4]]
  let [d1, d2] = pick(pairs)
  let n1 = randInt(1, d1 - 1)
  let n2 = randInt(1, d2 - 1)
  const isAdd = Math.random() < 0.5
  const lcmVal = (d1 * d2) / gcd(d1, d2)
  let cn1 = n1 * (lcmVal / d1)
  let cn2 = n2 * (lcmVal / d2)
  if (!isAdd && cn2 > cn1) {
    ;[d1, d2] = [d2, d1]
    ;[n1, n2] = [n2, n1]
    ;[cn1, cn2] = [cn2, cn1]
  }
  const resultNum = isAdd ? cn1 + cn2 : cn1 - cn2
  const [simpNum, simpDen] = simplify(resultNum, lcmVal)
  const answerStr = simpDen === 1 ? `${simpNum}` : `${simpNum}/${simpDen}`
  const { choices, answer } = mcqFrom(
    answerStr,
    () => {
      const fakeNum = Math.max(0, resultNum + pick([-2, -1, 1, 2]))
      const [fn, fd] = simplify(fakeNum || 1, lcmVal)
      return fd === 1 ? `${fn}` : `${fn}/${fd}`
    },
    (v) => v
  )
  return {
    subtopicId: 'add-sub-unlike',
    type: 'mcq',
    prompt: `${n1}/${d1} ${isAdd ? '+' : '-'} ${n2}/${d2} = ? (give your answer in simplest form)`,
    choices,
    answer,
    hint: `Find a common denominator first (try ${lcmVal}), rewrite both fractions, then ${isAdd ? 'add' : 'subtract'}.`,
  }
}

function genFractionOfSet(difficulty = 'medium') {
  const den = difficulty === 'easy' ? pick([2, 3, 4]) : difficulty === 'hard' ? pick([5, 6, 8, 9]) : pick([3, 4, 5, 6])
  const multiplier = difficulty === 'hard' ? randInt(3, 8) : randInt(2, 6)
  const total = den * multiplier
  const num = randInt(1, den - 1)
  const part = (total / den) * num

  if (difficulty === 'hard' && Math.random() < 0.5) {
    const item = pick(WP_ITEMS)
    const remainder = total - part
    return {
      subtopicId: 'fraction-of-set',
      type: 'input',
      prompt: `A class has ${total} ${item}. ${num}/${den} of them are red. How many ${item} are NOT red?`,
      answer: String(remainder),
      hint: `First find how many are red (${num}/${den} of ${total} = ${part}), then subtract from the total.`,
    }
  }
  const { choices, answer } = mcqFrom(part, () => part + pick([-multiplier, multiplier, -den, den]))
  return {
    subtopicId: 'fraction-of-set',
    type: 'mcq',
    prompt: `What is ${num}/${den} of ${total}?`,
    choices,
    answer,
    hint: `Divide ${total} by ${den} to find one part (${total} ÷ ${den} = ${total / den}), then multiply by ${num}.`,
  }
}

function genFractionWordProblems(difficulty = 'medium') {
  const name = pick(WP_NAMES)
  const item = pick(WP_ITEMS)

  if (difficulty === 'hard') {
    const den = pick([4, 5, 6])
    const num = randInt(1, den - 2)
    const multiplier = randInt(3, 7)
    const total = den * multiplier
    const gaveAway = (total / den) * num
    const remaining = total - gaveAway
    return {
      subtopicId: 'word-problems-fractions',
      type: 'input',
      prompt: `${name} had ${total} ${item}. ${name} gave away ${num}/${den} of them to friends. How many ${item} does ${name} have left?`,
      answer: String(remaining),
      hint: `Find how many were given away (${num}/${den} of ${total} = ${gaveAway}), then subtract from the total.`,
    }
  }

  const den = difficulty === 'easy' ? pick([2, 3, 4]) : pick([3, 4, 5, 6])
  const multiplier = randInt(2, 6)
  const total = den * multiplier
  const num = randInt(1, den - 1)
  const part = (total / den) * num
  return {
    subtopicId: 'word-problems-fractions',
    type: 'input',
    prompt: `${name} has ${total} ${item}. ${num}/${den} of them are ${pick(['blue', 'red', 'yellow', 'green'])}. How many ${item} is that?`,
    answer: String(part),
    hint: `Divide ${total} by ${den} to find one part, then multiply by ${num}.`,
  }
}

// CBSE-style 2-step fraction word problem: take a fraction of a total, then
// a fraction of what's left.
function genFractionWordProblemAdvanced() {
  const name = pick(WP_NAMES)
  const den1 = pick([3, 4, 5, 6, 8])
  const num1 = randInt(1, den1 - 1)
  const den2 = pick([2, 3, 4])
  const num2 = randInt(1, den2 - 1)
  const k = randInt(2, 4)
  const total = den1 * den2 * k
  const usedFirst = den2 * k * num1
  const remainingAfterFirst = total - usedFirst
  const usedSecond = k * (den1 - num1) * num2
  const final = remainingAfterFirst - usedSecond
  return {
    subtopicId: 'word-problems-fractions',
    type: 'input',
    prompt: `${name} had ${total} liters of water in a tank. On Monday, ${name} used ${num1}/${den1} of the water for cleaning. On Tuesday, ${name} used ${num2}/${den2} of the remaining water for washing. How many liters of water are left in the tank?`,
    answer: String(final),
    hint: `First find how much was used Monday (${num1}/${den1} of ${total} = ${usedFirst} L), leaving ${remainingAfterFirst} L. Then find Tuesday's use (${num2}/${den2} of ${remainingAfterFirst} = ${usedSecond} L) and subtract.`,
  }
}

// ---------------------------------------------------------------------------
// DECIMALS
// ---------------------------------------------------------------------------
function genDecimalPlaceValue(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const n = randInt(1, 999)
    const decimal = (n / 1000).toFixed(3)
    const { choices, answer } = mcqFrom(
      decimal,
      () => (((n + pick([-100, -10, 10, 100]) + 1000) % 1000) / 1000).toFixed(3),
      (v) => v
    )
    return {
      subtopicId: 'tenths-hundredths-thousandths',
      type: 'mcq',
      prompt: `Write ${n}/1000 as a decimal.`,
      choices,
      answer,
      hint: `Thousandths means three digits after the decimal point.`,
    }
  }

  const useHundredths = difficulty !== 'easy'
  if (useHundredths) {
    const n = randInt(1, 99)
    const decimal = (n / 100).toFixed(2)
    const { choices, answer } = mcqFrom(
      decimal,
      () => (((n + pick([-10, -1, 1, 10]) + 100) % 100) / 100).toFixed(2),
      (v) => v
    )
    return {
      subtopicId: 'tenths-hundredths-thousandths',
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
    subtopicId: 'tenths-hundredths-thousandths',
    type: 'mcq',
    prompt: `Write ${n}/10 as a decimal.`,
    choices,
    answer,
    hint: `Tenths means one digit after the decimal point.`,
  }
}

function genCompareDecimals(difficulty = 'medium') {
  let aStr, bStr, aVal, bVal
  if (difficulty === 'easy') {
    aVal = randInt(1, 9) / 10
    bVal = randInt(1, 9) / 10
    let guard = 0
    while (bVal === aVal && guard < 20) {
      bVal = randInt(1, 9) / 10
      guard += 1
    }
    aStr = aVal.toFixed(1)
    bStr = bVal.toFixed(1)
  } else if (difficulty === 'hard') {
    aVal = randInt(1, 9) / 10
    bVal = randInt(10, 99) / 100
    aStr = aVal.toFixed(1)
    bStr = bVal.toFixed(2)
  } else {
    aVal = randInt(1, 99) / 100
    bVal = randInt(1, 99) / 100
    let guard = 0
    while (Math.abs(aVal - bVal) < 0.02 && guard < 20) {
      bVal = randInt(1, 99) / 100
      guard += 1
    }
    aStr = aVal.toFixed(2)
    bStr = bVal.toFixed(2)
  }
  const bigger = aVal > bVal ? aStr : bStr
  const smaller = aVal > bVal ? bStr : aStr
  const others = new Set([bigger, smaller])
  let guard = 0
  while (others.size < 4 && guard < 20) {
    others.add((randInt(1, 99) / 100).toFixed(2))
    guard += 1
  }
  return {
    subtopicId: 'comparing-ordering-decimals',
    type: 'mcq',
    prompt: `Which decimal is greater: ${aStr} or ${bStr}?`,
    choices: shuffle(Array.from(others)),
    answer: bigger,
    hint: `Compare digit by digit, starting from the tenths place. If needed, add a zero so both numbers have the same number of decimal places.`,
  }
}

function genRoundingDecimals(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const n = randInt(1, 999) / 1000
    const rounded = Math.round(n * 100) / 100
    const { choices, answer } = mcqFrom(rounded.toFixed(2), () => (rounded + pick([-0.02, -0.01, 0.01, 0.02])).toFixed(2), (v) => v)
    return {
      subtopicId: 'rounding-decimals',
      type: 'mcq',
      prompt: `Round ${n.toFixed(3)} to the nearest hundredth.`,
      choices,
      answer,
      hint: `Look at the digit in the thousandths place. If it's 5 or more, round the hundredths digit up.`,
    }
  }
  if (difficulty === 'easy') {
    const n = randInt(10, 99) / 10
    const rounded = Math.round(n)
    const { choices, answer } = mcqFrom(rounded, () => rounded + pick([-2, -1, 1, 2]))
    return {
      subtopicId: 'rounding-decimals',
      type: 'mcq',
      prompt: `Round ${n.toFixed(1)} to the nearest whole number.`,
      choices,
      answer,
      hint: `Look at the digit after the decimal point. If it's 5 or more, round up.`,
    }
  }
  const n = randInt(100, 999) / 1000
  const rounded = Math.round(n * 10) / 10
  const { choices, answer } = mcqFrom(rounded.toFixed(1), () => (rounded + pick([-0.2, -0.1, 0.1, 0.2])).toFixed(1), (v) => v)
  return {
    subtopicId: 'rounding-decimals',
    type: 'mcq',
    prompt: `Round ${n.toFixed(3)} to the nearest tenth.`,
    choices,
    answer,
    hint: `Look at the digit in the hundredths place. If it's 5 or more, round the tenths digit up.`,
  }
}

// ---------------------------------------------------------------------------
// DECIMALS OPERATIONS
// ---------------------------------------------------------------------------
function genAddSubDecimals(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const a = randInt(100, 999) / 100
    const b = randInt(100, 999) / 100
    const c = randInt(100, 999) / 100
    const isAdd = Math.random() < 0.6
    let result, prompt
    if (isAdd) {
      result = +(a + b + c).toFixed(2)
      prompt = `${a.toFixed(2)} + ${b.toFixed(2)} + ${c.toFixed(2)} = ?`
    } else {
      const hi = Math.max(a, b)
      const lo = Math.min(a, b)
      result = +(hi - lo).toFixed(2)
      prompt = `${hi.toFixed(2)} - ${lo.toFixed(2)} = ?`
    }
    const { choices, answer } = mcqFrom(result, () => +(result + pick([-1, -0.5, 0.5, 1])).toFixed(2), (v) => v.toFixed(2))
    return {
      subtopicId: 'add-sub-decimals',
      type: 'mcq',
      prompt,
      choices,
      answer,
      hint: `Line up the decimal points carefully before adding or subtracting.`,
    }
  }

  const dp = difficulty === 'easy' ? 1 : 2
  const a = difficulty === 'easy' ? randInt(10, 99) / 10 : randInt(100, 999) / 100
  const b = difficulty === 'easy' ? randInt(10, 99) / 10 : randInt(100, 999) / 100
  const isAdd = Math.random() < 0.5
  let result, prompt
  if (isAdd) {
    result = +(a + b).toFixed(dp)
    prompt = `${a.toFixed(dp)} + ${b.toFixed(dp)} = ?`
  } else {
    const hi = Math.max(a, b)
    const lo = Math.min(a, b)
    result = +(hi - lo).toFixed(dp)
    prompt = `${hi.toFixed(dp)} - ${lo.toFixed(dp)} = ?`
  }
  const { choices, answer } = mcqFrom(result, () => +(result + pick([-1, -0.5, 0.5, 1])).toFixed(dp), (v) => v.toFixed(dp))
  return {
    subtopicId: 'add-sub-decimals',
    type: 'mcq',
    prompt,
    choices,
    answer,
    hint: `Line up the decimal points before you calculate.`,
  }
}

function genMultiplyDivideDecimals(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const whole = pick([2, 4, 5, 10])
    const quotient = randInt(10, 99) / 10
    const a = +(quotient * whole).toFixed(2)
    const { choices, answer } = mcqFrom(quotient.toFixed(1), () => (quotient + pick([-1, -0.5, 0.5, 1])).toFixed(1), (v) => v)
    return {
      subtopicId: 'multiply-divide-decimals',
      type: 'mcq',
      prompt: `${a.toFixed(2)} ÷ ${whole} = ?`,
      choices,
      answer,
      hint: `Divide as you would with whole numbers, then place the decimal point in the same position.`,
    }
  }
  const dp = difficulty === 'easy' ? 1 : 2
  const a = difficulty === 'easy' ? randInt(10, 99) / 10 : randInt(100, 999) / 100
  const whole = randInt(2, 9)
  const result = +(a * whole).toFixed(2)
  const { choices, answer } = mcqFrom(result, () => +(result + pick([-1, -0.5, 0.5, 1])).toFixed(2), (v) => v.toFixed(2))
  return {
    subtopicId: 'multiply-divide-decimals',
    type: 'mcq',
    prompt: `${a.toFixed(dp)} × ${whole} = ?`,
    choices,
    answer,
    hint: `Multiply as you would with whole numbers, then place the decimal point in the same spot counting from the right.`,
  }
}

function genDecimalWordProblems(difficulty = 'medium') {
  const name = pick(WP_NAMES)

  if (difficulty === 'hard') {
    const price = randInt(150, 999) / 100
    const qty = randInt(2, 6)
    const total = +(price * qty).toFixed(2)
    const paid = Math.ceil(total / 5) * 5
    const change = +(paid - total).toFixed(2)
    return {
      subtopicId: 'word-problems-decimals',
      type: 'input',
      prompt: `${name} bought ${qty} notebooks at $${price.toFixed(2)} each and paid with $${paid.toFixed(2)}. How much change did ${name} get? (in dollars, e.g. 1.50)`,
      answer: change.toFixed(2),
      hint: `First find the total cost (${qty} × $${price.toFixed(2)} = $${total.toFixed(2)}), then subtract from $${paid.toFixed(2)}.`,
    }
  }

  const price1 = randInt(100, 999) / 100
  const price2 = randInt(100, 999) / 100
  const total = +(price1 + price2).toFixed(2)
  return {
    subtopicId: 'word-problems-decimals',
    type: 'input',
    prompt: `${name} bought a book for $${price1.toFixed(2)} and a pen for $${price2.toFixed(2)}. How much did ${name} spend in total? (in dollars, e.g. 5.25)`,
    answer: total.toFixed(2),
    hint: `Add the two prices together, lining up the decimal points.`,
  }
}

// CBSE-style 3-item shopping bill: add three decimal prices, then find change.
function genDecimalWordProblemAdvanced() {
  const name = pick(WP_NAMES)
  const items = shuffle(['a notebook', 'a pencil box', 'a water bottle', 'a lunch bag', 'a storybook', 'an umbrella']).slice(0, 3)
  const prices = items.map(() => randInt(150, 999) / 100)
  const total = +prices.reduce((s, p) => s + p, 0).toFixed(2)
  let paid = Math.ceil(total / 10) * 10
  if (paid <= total) paid += 10
  const change = +(paid - total).toFixed(2)
  return {
    subtopicId: 'word-problems-decimals',
    type: 'input',
    prompt: `${name} bought ${items[0]} for $${prices[0].toFixed(2)}, ${items[1]} for $${prices[1].toFixed(2)}, and ${items[2]} for $${prices[2].toFixed(2)}. ${name} paid with a $${paid.toFixed(2)} note. How much change did ${name} receive? (in dollars, e.g. 1.50)`,
    answer: change.toFixed(2),
    hint: `First add all three prices together ($${prices[0].toFixed(2)} + $${prices[1].toFixed(2)} + $${prices[2].toFixed(2)} = $${total.toFixed(2)}), then subtract from $${paid.toFixed(2)}.`,
  }
}

// ---------------------------------------------------------------------------
// GEOMETRY
// ---------------------------------------------------------------------------
function genAngles(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const angle = pick([190, 200, 220, 250, 270, 300, 330, 350])
    const type = 'reflex'
    const { choices, answer } = mcqFrom(type, () => pick(['acute', 'right', 'obtuse', 'straight'].filter((t) => t !== type)), (v) => v)
    return {
      subtopicId: 'angles-protractor',
      type: 'mcq',
      prompt: `Using a protractor, you measure an angle as ${angle}°. What type of angle is it?`,
      choices,
      answer,
      hint: `A reflex angle is greater than 180° but less than 360°.`,
    }
  }
  const angle = difficulty === 'easy' ? pick([30, 60, 90, 120, 150, 180]) : randInt(1, 17) * 10
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
    subtopicId: 'angles-protractor',
    type: 'mcq',
    prompt: `Using a protractor, you measure an angle as ${angle}°. What type of angle is it?`,
    choices,
    answer,
    hint: `Acute < 90°, Right = 90°, Obtuse is between 90° and 180°, Straight = 180°.`,
  }
}

function genLines(difficulty = 'medium') {
  const easyScenarios = [
    { desc: 'Two lines meet and form a perfect 90° corner (like the corner of a book).', answer: 'Perpendicular' },
    { desc: 'Two lines run side by side and will never meet, no matter how far they extend (like railway tracks).', answer: 'Parallel' },
  ]
  const mediumScenarios = [
    ...easyScenarios,
    { desc: 'Two lines cross each other at a 90° angle.', answer: 'Perpendicular' },
    { desc: 'Two lines stay exactly the same distance apart forever.', answer: 'Parallel' },
  ]
  const hardScenarios = [
    ...mediumScenarios,
    { desc: 'Two lines cross each other, but the angle formed is 60°, not 90°.', answer: 'Intersecting' },
    { desc: 'Two lines cross at a single point, forming four angles that are not all equal.', answer: 'Intersecting' },
  ]
  const pool = difficulty === 'easy' ? easyScenarios : difficulty === 'hard' ? hardScenarios : mediumScenarios
  const s = pick(pool)
  const { choices, answer } = mcqFrom(s.answer, () => pick(['Perpendicular', 'Parallel', 'Intersecting'].filter((t) => t !== s.answer)), (v) => v)
  return {
    subtopicId: 'perpendicular-parallel',
    type: 'mcq',
    prompt: s.desc + ' What do we call these lines?',
    choices,
    answer,
    hint: `Perpendicular lines cross at exactly 90°. Parallel lines never meet. Lines that cross at any other angle are just "intersecting".`,
  }
}

function genSquaresRectangles(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const l = randInt(4, 15)
    const w = randInt(4, 12)
    const areaVal = l * w
    const { choices, answer } = mcqFrom(w, () => w + pick([-2, -1, 1, 2]))
    return {
      subtopicId: 'squares-rectangles',
      type: 'mcq',
      prompt: `A rectangle has an area of ${areaVal} cm² and a length of ${l} cm. What is its width?`,
      choices,
      answer,
      hint: `Width = Area ÷ Length (${areaVal} ÷ ${l}).`,
    }
  }
  if (difficulty === 'medium') {
    const side = randInt(3, 15)
    const perimeter = side * 4
    const { choices, answer } = mcqFrom(side, () => side + pick([-2, -1, 1, 2]))
    return {
      subtopicId: 'squares-rectangles',
      type: 'mcq',
      prompt: `A square has a perimeter of ${perimeter} cm. What is the length of one side?`,
      choices,
      answer,
      hint: `A square has 4 equal sides, so side length = perimeter ÷ 4.`,
    }
  }
  const side = randInt(3, 12)
  const askPerimeter = Math.random() < 0.5
  if (askPerimeter) {
    const perimeter = side * 4
    const { choices, answer } = mcqFrom(perimeter, () => perimeter + pick([-4, -2, 2, 4]))
    return {
      subtopicId: 'squares-rectangles',
      type: 'mcq',
      prompt: `A square has sides of ${side} cm. What is its perimeter?`,
      choices: choices.map((c) => `${c} cm`),
      answer: `${answer} cm`,
      hint: `A square has 4 equal sides, so perimeter = 4 × side length.`,
    }
  }
  const area = side * side
  const { choices, answer } = mcqFrom(area, () => area + pick([-side, side, -4, 4]))
  return {
    subtopicId: 'squares-rectangles',
    type: 'mcq',
    prompt: `A square has sides of ${side} cm. What is its area?`,
    choices: choices.map((c) => `${c} cm²`),
    answer: `${answer} cm²`,
    hint: `Area of a square = side × side.`,
  }
}

const SYMMETRY_SHAPES = {
  easy: [
    { name: 'square', lines: 4 },
    { name: 'rectangle (non-square)', lines: 2 },
    { name: 'equilateral triangle', lines: 3 },
  ],
  medium: [
    { name: 'regular pentagon', lines: 5 },
    { name: 'regular hexagon', lines: 6 },
    { name: 'isosceles triangle', lines: 1 },
    { name: 'rhombus', lines: 2 },
  ],
  hard: [
    { name: 'scalene triangle', lines: 0 },
    { name: 'parallelogram (non-rectangle)', lines: 0 },
    { name: 'regular octagon', lines: 8 },
  ],
}

function genSymmetry(difficulty = 'medium') {
  const pool = SYMMETRY_SHAPES[difficulty] || SYMMETRY_SHAPES.medium
  const shape = pick(pool)
  const { choices, answer } = mcqFrom(shape.lines, () => Math.max(0, shape.lines + pick([-2, -1, 1, 2])))
  return {
    subtopicId: 'symmetry',
    type: 'mcq',
    prompt: `How many lines of symmetry does a ${shape.name} have?`,
    choices,
    answer,
    hint: `A line of symmetry divides a shape into two mirror-image halves. Try folding the shape in your mind along different lines.`,
  }
}

// CBSE-style angle reasoning: linear pairs, missing triangle angle, and
// angles given as a ratio.
function genGeometryWordProblem() {
  const mode = pick(['linear-pair', 'triangle-two-given', 'triangle-ratio'])
  if (mode === 'linear-pair') {
    const angle = randInt(20, 160)
    const other = 180 - angle
    return {
      subtopicId: 'geometry-word-problems',
      type: 'input',
      prompt: `Two angles lie next to each other on a straight line, forming a linear pair. If one of the angles measures ${angle}°, what is the measure of the other angle?`,
      answer: String(other),
      hint: `Angles on a straight line always add up to 180°, so subtract: 180° − ${angle}°.`,
    }
  }
  if (mode === 'triangle-two-given') {
    const a = randInt(30, 90)
    const b = randInt(30, 140 - a)
    const c = 180 - a - b
    return {
      subtopicId: 'geometry-word-problems',
      type: 'input',
      prompt: `In a triangle, two of the angles measure ${a}° and ${b}°. What is the measure of the third angle?`,
      answer: String(c),
      hint: `The angles of a triangle always add up to 180°. Third angle = 180° − ${a}° − ${b}°.`,
    }
  }
  const ratio = pick([[2, 3, 4], [1, 2, 3], [3, 4, 5], [2, 2, 5], [3, 5, 7], [2, 3, 7]])
  const sumParts = ratio.reduce((s, r) => s + r, 0)
  const unit = 180 / sumParts
  const largest = Math.max(...ratio) * unit
  return {
    subtopicId: 'geometry-word-problems',
    type: 'input',
    prompt: `The three angles of a triangle are in the ratio ${ratio.join(' : ')}. What is the measure of the largest angle (in degrees)?`,
    answer: String(largest),
    hint: `Add the ratio parts (${ratio.join(' + ')} = ${sumParts}), then divide 180° by ${sumParts} to find one part (${unit}°). Multiply that by the largest ratio number.`,
  }
}

// ---------------------------------------------------------------------------
// PERIMETER AND AREA
// ---------------------------------------------------------------------------
function genPerimeterRect(difficulty = 'medium') {
  const [lMin, lMax] = difficulty === 'easy' ? [3, 8] : difficulty === 'hard' ? [12, 25] : [4, 15]
  const [wMin, wMax] = difficulty === 'easy' ? [2, 6] : difficulty === 'hard' ? [8, 20] : [3, 12]
  const l = randInt(lMin, lMax)
  const w = randInt(wMin, wMax)
  const perimeter = 2 * (l + w)
  const { choices, answer } = mcqFrom(perimeter, () => perimeter + pick([-4, -2, 2, 4]))
  return {
    subtopicId: 'perimeter-squares-rectangles',
    type: 'mcq',
    prompt: `A rectangle has a length of ${l} cm and a width of ${w} cm. What is its perimeter?`,
    choices: choices.map((c) => `${c} cm`),
    answer: `${answer} cm`,
    hint: `Perimeter of a rectangle = 2 × (length + width).`,
  }
}

function genAreaRect(difficulty = 'medium') {
  const [lMin, lMax] = difficulty === 'easy' ? [3, 8] : difficulty === 'hard' ? [12, 25] : [4, 15]
  const [wMin, wMax] = difficulty === 'easy' ? [2, 6] : difficulty === 'hard' ? [8, 20] : [3, 12]
  const l = randInt(lMin, lMax)
  const w = randInt(wMin, wMax)
  const area = l * w
  const { choices, answer } = mcqFrom(area, () => area + pick([-l, l, -w, w]))
  return {
    subtopicId: 'area-squares-rectangles',
    type: 'mcq',
    prompt: `A rectangle has a length of ${l} cm and a width of ${w} cm. What is its area?`,
    choices: choices.map((c) => `${c} cm²`),
    answer: `${answer} cm²`,
    hint: `Area of a rectangle = length × width.`,
  }
}

function genAreaComposite(difficulty = 'medium') {
  const [LMin, LMax] = difficulty === 'easy' ? [8, 12] : difficulty === 'hard' ? [14, 20] : [10, 16]
  const [WMin, WMax] = difficulty === 'easy' ? [6, 10] : difficulty === 'hard' ? [10, 16] : [8, 14]
  const L = randInt(LMin, LMax)
  const W = randInt(WMin, WMax)
  const notchL = randInt(2, Math.floor(L / 2))
  const notchW = randInt(2, Math.floor(W / 2))

  if (difficulty === 'hard') {
    const perimeter = 2 * (L + W)
    const { choices, answer } = mcqFrom(perimeter, () => perimeter + pick([-2 * notchL, 2 * notchL, -2 * notchW, 2 * notchW]))
    return {
      subtopicId: 'area-composite',
      type: 'mcq',
      prompt: `An L-shaped figure is made from a ${L} cm × ${W} cm rectangle with a ${notchL} cm × ${notchW} cm rectangular notch cut from one corner. What is the perimeter of the L-shape?`,
      choices: choices.map((c) => `${c} cm`),
      answer: `${answer} cm`,
      hint: `Here's a trick: cutting a rectangular notch from a corner doesn't change the total perimeter! It's still 2 × (${L} + ${W}).`,
    }
  }
  const area = L * W - notchL * notchW
  const { choices, answer } = mcqFrom(area, () => area + pick([-notchL * notchW, notchL * notchW, -4, 4]))
  return {
    subtopicId: 'area-composite',
    type: 'mcq',
    prompt: `An L-shaped figure is made from a ${L} cm × ${W} cm rectangle with a ${notchL} cm × ${notchW} cm rectangular notch cut from one corner. What is the area of the L-shape?`,
    choices: choices.map((c) => `${c} cm²`),
    answer: `${answer} cm²`,
    hint: `Find the area of the whole rectangle (${L} × ${W}), then subtract the notch (${notchL} × ${notchW}).`,
  }
}

// CBSE-style real-world cost problems: fencing (perimeter × rate) and
// tiling/flooring (area × rate).
function genPerimeterAreaWordProblem() {
  const mode = pick(['fencing', 'tiling'])
  const l = randInt(8, 25)
  const w = randInt(5, 18)
  const rate = pick([3, 4, 5, 6, 8, 10])
  if (mode === 'fencing') {
    const perimeter = 2 * (l + w)
    const cost = perimeter * rate
    return {
      subtopicId: 'perimeter-area-word-problems',
      type: 'input',
      prompt: `A rectangular garden is ${l} m long and ${w} m wide. It needs to be fenced all the way around at a cost of $${rate} per meter. What is the total cost of fencing?`,
      answer: String(cost),
      hint: `First find the perimeter (2 × (${l} + ${w}) = ${perimeter} m), then multiply by the cost per meter ($${rate}).`,
    }
  }
  const area = l * w
  const cost = area * rate
  return {
    subtopicId: 'perimeter-area-word-problems',
    type: 'input',
    prompt: `A rectangular room is ${l} m long and ${w} m wide. Tiling costs $${rate} per square meter. What is the total cost to tile the whole room?`,
    answer: String(cost),
    hint: `First find the area (${l} × ${w} = ${area} m²), then multiply by the cost per square meter ($${rate}).`,
  }
}

// ---------------------------------------------------------------------------
// DATA ANALYSIS
// ---------------------------------------------------------------------------
function genBarGraphQuestion(difficulty = 'medium') {
  const categoryPool = ['Apples', 'Bananas', 'Oranges', 'Grapes', 'Mangoes', 'Pears']
  const numCategories = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 5 : 4
  const maxVal = difficulty === 'easy' ? 10 : difficulty === 'hard' ? 30 : 20
  const categories = shuffle(categoryPool).slice(0, numCategories)
  const values = categories.map(() => randInt(2, maxVal))
  const data = categories.map((c, i) => ({ label: c, value: values[i] }))
  const typePool =
    difficulty === 'easy' ? ['max', 'min'] : difficulty === 'hard' ? ['max', 'min', 'difference', 'total', 'average'] : ['max', 'min', 'difference', 'total']
  const questionType = pick(typePool)
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
  } else if (questionType === 'average') {
    const total = data.reduce((sum, d) => sum + d.value, 0)
    correct = Math.round(total / data.length)
    prompt = 'What is the average (mean) number of fruits per bar, rounded to the nearest whole number?'
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
    subtopicId: 'tables-bar-graphs',
    type: 'mcq',
    prompt,
    choices,
    answer,
    hint: `Read each bar (or table row) carefully and compare the values before answering.`,
    chartData: { type: 'bar', data },
  }
}

function genLineGraphQuestion(difficulty = 'medium') {
  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const numDays = difficulty === 'easy' ? 4 : difficulty === 'hard' ? 7 : 5
  const days = allDays.slice(0, numDays)
  let last = randInt(10, 20)
  const values = days.map(() => {
    last = Math.max(2, last + randInt(-5, 5))
    return last
  })
  const data = days.map((d, i) => ({ label: d, value: values[i] }))
  const typePool =
    difficulty === 'easy' ? ['value', 'trend'] : difficulty === 'hard' ? ['value', 'trend', 'change', 'biggest-change'] : ['value', 'trend', 'change']
  const questionType = pick(typePool)
  let prompt, correct
  if (questionType === 'value') {
    const idx = randInt(0, days.length - 1)
    prompt = `According to the line graph, what was the value on ${days[idx]}?`
    correct = values[idx]
  } else if (questionType === 'change') {
    correct = values[values.length - 1] - values[0]
    prompt = `What was the change in value from ${days[0]} to ${days[days.length - 1]}?`
  } else if (questionType === 'biggest-change') {
    let maxDelta = -Infinity
    let maxIdx = 1
    for (let i = 1; i < values.length; i++) {
      const delta = Math.abs(values[i] - values[i - 1])
      if (delta > maxDelta) {
        maxDelta = delta
        maxIdx = i
      }
    }
    correct = days[maxIdx]
    prompt = `On which day did the value change the most compared to the day before?`
  } else {
    const rising = values[values.length - 1] > values[0]
    prompt = `Overall, from ${days[0]} to ${days[days.length - 1]}, did the value increase or decrease?`
    correct = rising ? 'Increase' : 'Decrease'
  }
  const { choices, answer } = mcqFrom(
    correct,
    () =>
      typeof correct === 'number'
        ? correct + pick([-4, -2, -1, 1, 2, 4])
        : correct === 'Increase' || correct === 'Decrease'
          ? correct === 'Increase'
            ? 'Decrease'
            : 'Increase'
          : pick(days.filter((d) => d !== correct)),
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

// CBSE-style data-table reasoning: read several values, then compute a total
// and apply a rate to it.
function genDataHandlingWordProblem() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const sold = days.map(() => randInt(4, 20))
  const price = pick([2, 3, 4, 5])
  const total = sold.reduce((s, v) => s + v, 0)
  const revenue = total * price
  const tableStr = days.map((d, i) => `${d}: ${sold[i]}`).join(', ')
  return {
    subtopicId: 'data-handling-word-problems',
    type: 'input',
    prompt: `A bakery recorded how many cakes it sold each day: ${tableStr}. Each cake sells for $${price}. What was the bakery's total revenue (in dollars) from cake sales that week?`,
    answer: String(revenue),
    hint: `First add up all the cakes sold (${sold.join(' + ')} = ${total}), then multiply by the price per cake ($${price}).`,
  }
}

// ---------------------------------------------------------------------------
// WORD PROBLEMS (Bar Modeling) — bonus
// ---------------------------------------------------------------------------
function genPartWhole(difficulty = 'medium') {
  const name = pick(WP_NAMES)
  const item = pick(WP_ITEMS)

  if (difficulty === 'hard') {
    const part1 = randInt(10, 40)
    const part2 = randInt(10, 40)
    const part3 = randInt(10, 40)
    const whole = part1 + part2 + part3
    const askWhole = Math.random() < 0.5
    if (askWhole) {
      return {
        subtopicId: 'part-whole',
        type: 'input',
        prompt: `${name} has ${part1} ${item} in a red box, ${part2} ${item} in a blue box, and ${part3} ${item} in a green box. How many ${item} does ${name} have in total?`,
        answer: String(whole),
        hint: `Add all three parts together (${part1} + ${part2} + ${part3}).`,
        barModel: { mode: 'part-whole', whole: null, parts: [part1, part2, part3], unknownIndex: 'whole', unit: item },
      }
    }
    return {
      subtopicId: 'part-whole',
      type: 'input',
      prompt: `${name} has ${whole} ${item} in total, split across three boxes. The red box has ${part1} and the blue box has ${part2}. How many ${item} are in the green box?`,
      answer: String(part3),
      hint: `Add the two known parts (${part1} + ${part2} = ${part1 + part2}), then subtract from the whole (${whole} − ${part1 + part2}).`,
      barModel: { mode: 'part-whole', whole, parts: [part1, part2, null], unknownIndex: 2, unit: item },
    }
  }

  const [minP, maxP] = difficulty === 'easy' ? [5, 20] : [15, 60]
  const part1 = randInt(minP, maxP)
  const part2 = randInt(minP, maxP)
  const whole = part1 + part2
  const askWhole = Math.random() < 0.5
  if (askWhole) {
    return {
      subtopicId: 'part-whole',
      type: 'input',
      prompt: `${name} has ${part1} ${item}. ${name}'s friend gives ${name} ${part2} more ${item}. How many ${item} does ${name} have now?`,
      answer: String(whole),
      hint: `This is a part-whole model: add the two parts together (${part1} + ${part2}).`,
      barModel: { mode: 'part-whole', whole: null, parts: [part1, part2], unknownIndex: 'whole', unit: item },
    }
  }
  return {
    subtopicId: 'part-whole',
    type: 'input',
    prompt: `${name} had ${whole} ${item} in total. ${part1} of them are red, and the rest are blue. How many ${item} are blue?`,
    answer: String(part2),
    hint: `This is a part-whole model: subtract the known part from the whole (${whole} − ${part1}).`,
    barModel: { mode: 'part-whole', whole, parts: [part1, null], unknownIndex: 1, unit: item },
  }
}

function genComparison(difficulty = 'medium') {
  const name1 = pick(WP_NAMES)
  let name2 = pick(WP_NAMES)
  while (name2 === name1) name2 = pick(WP_NAMES)
  const item = pick(WP_ITEMS)

  if (difficulty === 'hard') {
    const multiplier = pick([2, 3])
    const base = randInt(8, 25)
    const more = base * multiplier
    const askMore = Math.random() < 0.5
    if (askMore) {
      return {
        subtopicId: 'comparison',
        type: 'input',
        prompt: `${name1} has ${base} ${item}. ${name2} has ${multiplier} times as many ${item} as ${name1}. How many ${item} does ${name2} have?`,
        answer: String(more),
        hint: `Multiply ${name1}'s amount by ${multiplier} (${base} × ${multiplier}).`,
        barModel: { mode: 'comparison', bars: [{ label: name1, value: base }, { label: name2, value: more }], unknownIndex: 1, unit: item },
      }
    }
    const total = base + more
    return {
      subtopicId: 'comparison',
      type: 'input',
      prompt: `${name2} has ${multiplier} times as many ${item} as ${name1}. Together they have ${total} ${item}. How many ${item} does ${name1} have?`,
      answer: String(base),
      hint: `Think of ${name1}'s amount as 1 unit. Then ${name2} has ${multiplier} units, so together that's ${multiplier + 1} units = ${total}. One unit = ${total} ÷ ${multiplier + 1}.`,
      barModel: { mode: 'comparison', bars: [{ label: name1, value: base }, { label: name2, value: more }], unknownIndex: 0, unit: item },
    }
  }

  const [baseMin, baseMax] = difficulty === 'easy' ? [10, 25] : [20, 50]
  const [diffMin, diffMax] = difficulty === 'easy' ? [3, 10] : [5, 30]
  const base = randInt(baseMin, baseMax)
  const diff = randInt(diffMin, diffMax)
  const more = base + diff
  const askDiff = Math.random() < 0.4
  if (askDiff) {
    return {
      subtopicId: 'comparison',
      type: 'input',
      prompt: `${name1} has ${base} ${item}. ${name2} has ${more} ${item}. How many more ${item} does ${name2} have than ${name1}?`,
      answer: String(diff),
      hint: `Comparison bar model: subtract the smaller amount from the larger amount (${more} − ${base}).`,
      barModel: { mode: 'comparison', bars: [{ label: name1, value: base }, { label: name2, value: more }], unknownIndex: 'diff', unit: item },
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
      barModel: { mode: 'comparison', bars: [{ label: name1, value: base }, { label: name2, value: more }], unknownIndex: null, unit: item },
    }
  }
  return {
    subtopicId: 'comparison',
    type: 'input',
    prompt: `${name1} has ${base} ${item}. ${name2} has ${diff} fewer ${item} than ${name1}. How many ${item} does ${name2} have?`,
    answer: String(base - diff),
    hint: `Since ${name2} has fewer, subtract the difference from ${name1}'s amount (${base} − ${diff}).`,
    barModel: { mode: 'comparison', bars: [{ label: name1, value: base }, { label: name2, value: base - diff }], unknownIndex: 1, unit: item },
  }
}

function genMultiStep(difficulty = 'medium') {
  const name = pick(WP_NAMES)
  const item = pick(WP_ITEMS)

  if (difficulty === 'hard') {
    const start = randInt(100, 200)
    const given = randInt(10, 40)
    const bought = randInt(10, 40)
    const friends = pick([2, 3, 4])
    const afterGiveAndBuy = start - given + bought
    const remainder = afterGiveAndBuy % friends
    const adjustedBought = bought + ((friends - remainder) % friends)
    const finalTotal = start - given + adjustedBought
    const each = finalTotal / friends
    return {
      subtopicId: 'multi-step',
      type: 'input',
      prompt: `${name} started with ${start} ${item}. ${name} gave away ${given} ${item}, then bought ${adjustedBought} more. Finally, ${name} shared the ${item} equally among ${friends} friends (including themselves). How many ${item} does each person get?`,
      answer: String(each),
      hint: `First find the total after giving away and buying (${start} − ${given} + ${adjustedBought} = ${finalTotal}), then divide by ${friends}.`,
      barModel: {
        mode: 'multi-step',
        steps: [
          { label: 'Start', value: start },
          { label: 'Gave away', value: -given },
          { label: 'Bought', value: adjustedBought },
        ],
        unit: item,
      },
    }
  }

  const [startMin, startMax] = difficulty === 'easy' ? [30, 60] : [80, 150]
  const [stepMin, stepMax] = difficulty === 'easy' ? [5, 15] : [10, 40]
  const start = randInt(startMin, startMax)
  const given = randInt(stepMin, stepMax)
  const bought = randInt(stepMin, stepMax)
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
// MATH OLYMPIAD PREP — bonus
// ---------------------------------------------------------------------------
function genPatternsSequences(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const kind = pick(['fibonacci', 'alternating'])
    if (kind === 'fibonacci') {
      const a = randInt(1, 5)
      const b = randInt(a + 1, a + 5)
      const seq = [a, b]
      for (let i = 0; i < 4; i++) seq.push(seq[seq.length - 1] + seq[seq.length - 2])
      const next = seq[seq.length - 1] + seq[seq.length - 2]
      const { choices, answer } = mcqFrom(next, () => next + pick([-5, -3, 3, 5, 8]))
      return {
        subtopicId: 'patterns-sequences',
        type: 'mcq',
        prompt: `Look at this pattern: ${seq.join(', ')}, ... Each term is the sum of the two terms before it. What is the next number?`,
        choices,
        answer,
        hint: `Add the last two numbers in the sequence together: ${seq[seq.length - 1]} + ${seq[seq.length - 2]}.`,
      }
    }
    const start = randInt(3, 10)
    const addAmt = randInt(3, 8)
    const subAmt = randInt(1, 4)
    const seq = [start]
    for (let i = 0; i < 5; i++) seq.push(seq[seq.length - 1] + (i % 2 === 0 ? addAmt : -subAmt))
    const next = seq[seq.length - 1] + (seq.length % 2 === 1 ? addAmt : -subAmt)
    const { choices, answer } = mcqFrom(next, () => next + pick([-4, -2, 2, 4]))
    return {
      subtopicId: 'patterns-sequences',
      type: 'mcq',
      prompt: `Look at this pattern: ${seq.join(', ')}, ... The rule alternates: add ${addAmt}, then subtract ${subAmt}. What is the next number?`,
      choices,
      answer,
      hint: `Check whether the last step was "add ${addAmt}" or "subtract ${subAmt}", then apply the other one next.`,
    }
  }

  const step = difficulty === 'easy' ? randInt(2, 5) : randInt(4, 9)
  const goingUp = Math.random() < 0.7
  const start = randInt(1, 20)
  const seq = [start]
  for (let i = 0; i < 4; i++) seq.push(seq[seq.length - 1] + (goingUp ? step : -step))
  const next = seq[seq.length - 1] + (goingUp ? step : -step)
  const { choices, answer } = mcqFrom(next, () => next + pick([-step, step, -2 * step, 2 * step].filter((v) => v !== 0)))
  return {
    subtopicId: 'patterns-sequences',
    type: 'mcq',
    prompt: `Look at this number pattern: ${seq.join(', ')}, ... What is the next number?`,
    choices,
    answer,
    hint: `Find the difference between each pair of consecutive numbers — that's the rule to apply again.`,
  }
}

// CBSE/Olympiad-style pattern applied to a real scenario (arithmetic sequence
// dressed up as rows of stadium seating).
function genPatternsSequencesWordProblem() {
  const a = randInt(3, 10)
  const d = randInt(2, 6)
  const n = randInt(4, 9)
  const seatsInRowN = a + (n - 1) * d
  return {
    subtopicId: 'patterns-sequences',
    type: 'input',
    prompt: `In a stadium, Row 1 has ${a} seats. Each row after that has ${d} more seats than the row before it. How many seats are in Row ${n}?`,
    answer: String(seatsInRowN),
    hint: `This is an arithmetic pattern. Seats in Row ${n} = ${a} + (${n} − 1) × ${d}.`,
  }
}

function genLogicPuzzles(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const hundreds = randInt(1, 9)
    const tens = randInt(0, 9)
    const ones = randInt(0, 9)
    const n = hundreds * 100 + tens * 10 + ones
    const digitSum = hundreds + tens + ones
    const isEven = ones % 2 === 0
    const { choices, answer } = mcqFrom(n, () => n + pick([-11, -10, -1, 1, 10, 11, 100]))
    return {
      subtopicId: 'logic-puzzles',
      type: 'mcq',
      prompt: `I am a 3-digit number. My digits add up to ${digitSum}. My hundreds digit is ${hundreds}, my tens digit is ${tens}, and I am ${isEven ? 'an even' : 'an odd'} number. Who am I?`,
      choices,
      answer,
      hint: `Start with the hundreds digit (${hundreds}), then use the digit sum and the other clues to find the tens and ones digits.`,
    }
  }

  const tens = randInt(1, 9)
  const ones = randInt(0, 9)
  const n = tens * 10 + ones
  const digitSum = tens + ones
  const isEven = ones % 2 === 0

  if (difficulty === 'easy') {
    const { choices, answer } = mcqFrom(n, () => n + pick([-11, -10, -1, 1, 10, 11]))
    return {
      subtopicId: 'logic-puzzles',
      type: 'mcq',
      prompt: `I am a 2-digit number. My digits add up to ${digitSum}, and I am ${isEven ? 'an even' : 'an odd'} number. My tens digit is ${tens}. Who am I?`,
      choices,
      answer,
      hint: `If the tens digit is ${tens} and the digits add up to ${digitSum}, what must the ones digit be?`,
    }
  }

  const relation = tens > ones ? 'greater than' : tens < ones ? 'less than' : 'equal to'
  const { choices, answer } = mcqFrom(n, () => n + pick([-11, -10, -1, 1, 10, 11]))
  return {
    subtopicId: 'logic-puzzles',
    type: 'mcq',
    prompt: `I am a 2-digit number. My digits add up to ${digitSum}. My tens digit is ${relation} my ones digit. I am ${isEven ? 'an even' : 'an odd'} number. Who am I?`,
    choices,
    answer,
    hint: `Try digit pairs that add up to ${digitSum} where the tens digit is ${relation} the ones digit.`,
  }
}

function genCompetitionProblems(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const kind = pick(['chickens-rabbits', 'work-backwards'])
    if (kind === 'chickens-rabbits') {
      const rabbits = randInt(3, 10)
      const chickens = randInt(3, 10)
      const heads = rabbits + chickens
      const legs = rabbits * 4 + chickens * 2
      const { choices, answer } = mcqFrom(rabbits, () => Math.max(1, rabbits + pick([-2, -1, 1, 2])))
      return {
        subtopicId: 'competition-problems',
        type: 'mcq',
        prompt: `On a farm there are chickens and rabbits. Together they have ${heads} heads and ${legs} legs. How many rabbits are there?`,
        choices,
        answer,
        hint: `If all ${heads} animals were chickens, there'd be ${heads * 2} legs. The extra ${legs - heads * 2} legs must come from rabbits (2 extra legs each), so rabbits = ${legs - heads * 2} ÷ 2.`,
      }
    }
    const start = randInt(5, 20)
    const afterDouble = start * 2
    const subtractAmt = randInt(3, afterDouble - 1)
    const finalAmt = afterDouble - subtractAmt
    const { choices, answer } = mcqFrom(start, () => Math.max(1, start + pick([-3, -2, -1, 1, 2, 3])))
    return {
      subtopicId: 'competition-problems',
      type: 'mcq',
      prompt: `I thought of a number, doubled it, then subtracted ${subtractAmt}. My result was ${finalAmt}. What number did I start with?`,
      choices,
      answer,
      hint: `Work backwards: add ${subtractAmt} to ${finalAmt} first, then divide by 2.`,
    }
  }

  const numTerms = difficulty === 'easy' ? randInt(3, 4) : randInt(5, 8)
  const first = randInt(1, 10)
  const terms = Array.from({ length: numTerms }, (_, i) => first + i)
  const sum = terms.reduce((a, b) => a + b, 0)
  const { choices, answer } = mcqFrom(sum, () => sum + pick([-numTerms, -2, 2, numTerms]))
  return {
    subtopicId: 'competition-problems',
    type: 'mcq',
    prompt: `What is the sum of these consecutive numbers: ${terms.join(' + ')}?`,
    choices,
    answer,
    hint: `Try pairing the first and last numbers together (${terms[0]} + ${terms[terms.length - 1]} = ${terms[0] + terms[terms.length - 1]}) — each pair adds up to the same total!`,
  }
}

function genNumberTheoryPuzzles(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const pairs = [
      [4, 6], [3, 4], [2, 9], [4, 10], [3, 5], [6, 8],
      [4, 9], [3, 7], [5, 6], [4, 8], [2, 7], [3, 10], [5, 7], [6, 10], [4, 12],
    ]
    const [a, b] = pick(pairs)
    const lcm = (a * b) / gcd(a, b)
    const multiplier = randInt(2, Math.max(2, Math.floor(99 / lcm)))
    const n = lcm * multiplier
    const { choices, answer } = mcqFromExcluding(
      n,
      () => Math.max(10, Math.min(99, n + pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]))),
      (v) => v % a === 0 && v % b === 0
    )
    return {
      subtopicId: 'number-theory-puzzles',
      type: 'mcq',
      prompt: `I am a 2-digit number divisible by both ${a} and ${b}. Which of these could I be?`,
      choices,
      answer,
      hint: `Any number divisible by both ${a} and ${b} must be divisible by their LCM, which is ${lcm}.`,
    }
  }
  if (difficulty === 'medium') {
    const divisor = pick([3, 9])
    const digits = randInt(2, 4)
    const n = randInt(Math.pow(10, digits - 1), Math.pow(10, digits) - 1)
    const digitSum = String(n).split('').reduce((s, d) => s + Number(d), 0)
    const divisible = digitSum % divisor === 0
    const { choices, answer } = mcqFrom(divisible ? 'Yes' : 'No', () => (divisible ? 'No' : 'Yes'), (v) => v)
    return {
      subtopicId: 'number-theory-puzzles',
      type: 'mcq',
      prompt: `Is ${n} divisible by ${divisor}? (Hint: add up its digits first!)`,
      choices,
      answer,
      hint: `A number is divisible by ${divisor} if the sum of its digits is divisible by ${divisor}. ${n}'s digits add up to ${digitSum}.`,
    }
  }
  const divisor = pick([2, 5, 10])
  const n = randInt(10, 999)
  const divisible = n % divisor === 0
  const { choices, answer } = mcqFrom(divisible ? 'Yes' : 'No', () => (divisible ? 'No' : 'Yes'), (v) => v)
  return {
    subtopicId: 'number-theory-puzzles',
    type: 'mcq',
    prompt: `Is ${n} divisible by ${divisor}?`,
    choices,
    answer,
    hint:
      divisor === 10
        ? `A number is divisible by 10 if it ends in 0.`
        : divisor === 5
          ? `A number is divisible by 5 if it ends in 0 or 5.`
          : `A number is divisible by 2 if its last digit is even.`,
  }
}

function genGeometrySpatial(difficulty = 'medium') {
  if (difficulty === 'easy') {
    const rows = randInt(2, 4)
    const cols = randInt(2, 4)
    const total = rows * cols
    const { choices, answer } = mcqFrom(total, () => total + pick([-2, -1, 1, 2]))
    return {
      subtopicId: 'geometry-spatial',
      type: 'mcq',
      prompt: `A rectangle is divided into a grid of ${rows} rows and ${cols} columns of equal small squares. How many small squares are there in total?`,
      choices,
      answer,
      hint: `Multiply the number of rows by the number of columns (${rows} × ${cols}).`,
    }
  }
  if (difficulty === 'hard') {
    const folds = randInt(3, 5)
    const layers = Math.pow(2, folds)
    const { choices, answer } = mcqFrom(layers, () => layers + pick([-4, -2, 2, 4]))
    return {
      subtopicId: 'geometry-spatial',
      type: 'mcq',
      prompt: `A piece of paper is folded in half ${folds} times. How many layers thick is it now?`,
      choices,
      answer,
      hint: `Each fold doubles the number of layers. Start at 1 layer and double it ${folds} times.`,
    }
  }
  const vLines = randInt(1, 3)
  const hLines = randInt(1, 3)
  const total = (vLines + 1) * (hLines + 1)
  const { choices, answer } = mcqFrom(total, () => total + pick([-2, -1, 1, 2]))
  return {
    subtopicId: 'geometry-spatial',
    type: 'mcq',
    prompt: `A rectangle is divided by ${vLines} evenly spaced vertical line(s) and ${hLines} evenly spaced horizontal line(s), splitting it into smaller equal rectangles. How many small rectangles are formed in total?`,
    choices,
    answer,
    hint: `The lines create (${vLines} + 1) columns and (${hLines} + 1) rows. Multiply them together.`,
  }
}

function genCombinatoricsCounting(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const digits = shuffle([1, 2, 3, 4, 5]).slice(0, randInt(3, 4))
    const count = digits.length * (digits.length - 1)
    const { choices, answer } = mcqFrom(count, () => count + pick([-4, -2, 2, 4]))
    return {
      subtopicId: 'combinatorics-counting',
      type: 'mcq',
      prompt: `Using the digits ${digits.join(', ')} (each used at most once), how many different 2-digit numbers can you form?`,
      choices,
      answer,
      hint: `For the first digit, you have ${digits.length} choices. For the second digit, you have ${digits.length - 1} choices left. Multiply them together.`,
    }
  }
  if (difficulty === 'medium') {
    const people = randInt(4, 8)
    const handshakes = (people * (people - 1)) / 2
    const { choices, answer } = mcqFrom(handshakes, () => handshakes + pick([-3, -2, -1, 1, 2, 3]))
    return {
      subtopicId: 'combinatorics-counting',
      type: 'mcq',
      prompt: `At a party, everyone shakes hands with everyone else exactly once. If there are ${people} people, how many handshakes happen in total?`,
      choices,
      answer,
      hint: `Each of the ${people} people shakes hands with ${people - 1} others, but that counts every handshake twice, so divide by 2.`,
    }
  }
  const shirts = randInt(2, 5)
  const pants = randInt(2, 5)
  const total = shirts * pants
  const { choices, answer } = mcqFrom(total, () => total + pick([-2, -1, 1, 2]))
  return {
    subtopicId: 'combinatorics-counting',
    type: 'mcq',
    prompt: `You have ${shirts} different shirts and ${pants} different pairs of pants. How many different outfits (one shirt + one pair of pants) can you make?`,
    choices,
    answer,
    hint: `Multiply the number of shirt choices by the number of pants choices (${shirts} × ${pants}).`,
  }
}

// ---------------------------------------------------------------------------
// OLYMPIAD-ONLY REASONING CATEGORIES (Logical Reasoning / Mathematical
// Reasoning "extra" topics not covered by the regular syllabus). These are
// always hard/competition difficulty — there is no easy/medium tier since
// they only ever appear in the Olympiad Syllabus.
// ---------------------------------------------------------------------------
function ordinalSuffix(n) {
  const j = n % 10
  const k = n % 100
  if (j === 1 && k !== 11) return 'st'
  if (j === 2 && k !== 12) return 'nd'
  if (j === 3 && k !== 13) return 'rd'
  return 'th'
}

function genAnalogyClassification() {
  const mode = pick(['analogy', 'classification'])
  if (mode === 'analogy') {
    const relations = [
      { fn: (x) => x * 2, desc: 'double the number' },
      { fn: (x) => x * 3, desc: 'triple the number' },
      { fn: (x) => x + 5, desc: 'add 5' },
      { fn: (x) => x * x, desc: 'square the number' },
      { fn: (x) => x - 3, desc: 'subtract 3' },
    ]
    // Some (relation, a) pairs are ambiguous — e.g. tripling 3 and squaring 3
    // both give 9, so the rule can't be determined from that one example.
    // Retry until no other relation would explain the same evidence.
    let rel, a, b
    let guard = 0
    do {
      rel = pick(relations)
      a = randInt(2, 9)
      b = rel.fn(a)
      guard += 1
    } while (relations.some((r) => r !== rel && r.fn(a) === b) && guard < 30)
    let c = randInt(2, 9)
    while (c === a) c = randInt(2, 9)
    const d = rel.fn(c)
    const { choices, answer } = mcqFromExcluding(d, () => d + pick([-4, -3, -2, -1, 1, 2, 3, 4]), (v) => v === d)
    return {
      subtopicId: 'analogy-classification',
      type: 'mcq',
      prompt: `${a} is to ${b} as ${c} is to ?`,
      choices,
      answer,
      hint: `Find the rule that changes ${a} into ${b} (hint: ${rel.desc}), then apply the same rule to ${c}.`,
    }
  }
  const groups = [
    { category: 'even numbers', items: [2, 4, 6, 8, 10, 12], oddOneOutPool: [3, 5, 7, 9, 11] },
    { category: 'odd numbers', items: [3, 5, 7, 9, 11, 13], oddOneOutPool: [2, 4, 6, 8, 10] },
    { category: 'multiples of 5', items: [5, 10, 15, 20, 25, 30], oddOneOutPool: [12, 18, 22, 27] },
    { category: 'square numbers', items: [1, 4, 9, 16, 25, 36], oddOneOutPool: [10, 20, 15, 30] },
    { category: 'prime numbers', items: [2, 3, 5, 7, 11, 13], oddOneOutPool: [4, 6, 8, 9, 10] },
  ]
  const group = pick(groups)
  const three = shuffle(group.items).slice(0, 3)
  const oddOne = pick(group.oddOneOutPool)
  const choices = shuffle([...three, oddOne]).map(String)
  return {
    subtopicId: 'analogy-classification',
    type: 'mcq',
    prompt: `Three of these numbers belong to the same group (${group.category}). Which one does NOT belong?`,
    choices,
    answer: String(oddOne),
    hint: `Check which numbers are ${group.category} — the one that doesn't fit is the odd one out.`,
  }
}

const WORD_ANALOGIES = [
  ['Pen', 'Write', 'Knife', 'Cut'],
  ['Bird', 'Fly', 'Fish', 'Swim'],
  ['Eye', 'See', 'Ear', 'Hear'],
  ['Cow', 'Calf', 'Dog', 'Puppy'],
  ['Doctor', 'Hospital', 'Teacher', 'School'],
  ['Foot', 'Shoe', 'Hand', 'Glove'],
  ['Bee', 'Hive', 'Bird', 'Nest'],
  ['Sun', 'Day', 'Moon', 'Night'],
  ['Puppy', 'Dog', 'Kitten', 'Cat'],
  ['Water', 'Liquid', 'Ice', 'Solid'],
  ['Author', 'Book', 'Singer', 'Song'],
  ['Tailor', 'Clothes', 'Carpenter', 'Furniture'],
  ['Fish', 'Water', 'Bird', 'Air'],
  ['Petrol', 'Vehicle', 'Food', 'Body'],
]

// Real-world verbal analogy — a classic CBSE/Olympiad reasoning question type
// distinct from the numeric a:b::c:? puzzles above.
function genAnalogyClassificationWordProblem() {
  const [w1, w2, w3, w4] = pick(WORD_ANALOGIES)
  const distractorPool = WORD_ANALOGIES.flat().filter((w) => w !== w4)
  const { choices, answer } = mcqFrom(w4, () => pick(distractorPool), (v) => v)
  return {
    subtopicId: 'analogy-classification',
    type: 'mcq',
    prompt: `${w1} is to ${w2} as ${w3} is to ?`,
    choices,
    answer,
    hint: `Work out how ${w1} relates to ${w2} (think about what a ${w1} is used for or related to), then find the word with the same relationship to ${w3}.`,
  }
}

function genCodingDecoding() {
  const shift = pick([1, 2, 3, -1, -2, -3])
  const words = ['CAT', 'DOG', 'SUN', 'BAT', 'PEN', 'CUP', 'HAT', 'BOX', 'RUN', 'MAP']
  const codeWord = pick(words)
  let targetWord = pick(words)
  while (targetWord === codeWord) targetWord = pick(words)
  const shiftLetter = (ch, s) => {
    const code = (((ch.charCodeAt(0) - 65 + s) % 26) + 26) % 26
    return String.fromCharCode(code + 65)
  }
  const encode = (word) => word.split('').map((ch) => shiftLetter(ch, shift)).join('')
  const codedExample = encode(codeWord)
  const correctAnswer = encode(targetWord)
  const { choices, answer } = mcqFrom(correctAnswer, () => encode(pick(words.filter((w) => w !== targetWord))), (v) => v)
  return {
    subtopicId: 'coding-decoding',
    type: 'mcq',
    prompt: `In a code language, ${codeWord} is written as ${codedExample}. Using the same code, how is ${targetWord} written?`,
    choices,
    answer,
    hint: `Find how much each letter shifts (compare ${codeWord} to ${codedExample}), then apply the same shift to each letter of ${targetWord}.`,
  }
}

const CODE_DEDUCTION_NONSENSE = ['pic', 'ne', 'ma', 'da', 'ta', 'ki', 'lo', 'zu', 've', 'ra', 'mi', 'bo', 'fa', 'tu', 'xe']
const CODE_DEDUCTION_WORDS = ['ram', 'sita', 'good', 'bad', 'boy', 'girl', 'run', 'fast', 'big', 'small', 'red', 'blue', 'cat', 'dog', 'sun', 'rain']

// Two more coding-decoding puzzle types, distinct from the letter-shift
// cipher above: a mirror-alphabet substitution, and the classic CBSE
// "find the code word" deduction puzzle (find the common code between two
// overlapping coded phrases).
function genCodingDecodingWordProblem() {
  const mode = pick(['mirror-alphabet', 'sentence-deduction'])
  if (mode === 'mirror-alphabet') {
    const mirror = (ch) => String.fromCharCode(90 - (ch.charCodeAt(0) - 65))
    const words = ['CAT', 'DOG', 'SUN', 'BAT', 'PEN', 'CUP', 'HAT', 'BOX', 'RUN', 'MAP', 'BIRD', 'FISH', 'BOOK', 'DESK', 'LAMP']
    const codeWord = pick(words)
    let targetWord = pick(words)
    while (targetWord === codeWord) targetWord = pick(words)
    const encode = (word) => word.split('').map(mirror).join('')
    const codedExample = encode(codeWord)
    const correctAnswer = encode(targetWord)
    const { choices, answer } = mcqFrom(correctAnswer, () => encode(pick(words.filter((w) => w !== targetWord))), (v) => v)
    return {
      subtopicId: 'coding-decoding',
      type: 'mcq',
      prompt: `In a certain code, each letter is replaced by the letter that is the same number of steps from the end of the alphabet as it is from the start (A↔Z, B↔Y, C↔X, and so on). If ${codeWord} is written as ${codedExample}, how is ${targetWord} written in the same code?`,
      choices,
      answer,
      hint: `Pair up the alphabet from both ends: A↔Z, B↔Y, C↔X, D↔W, and so on. Replace each letter of ${targetWord} using this pairing.`,
    }
  }
  const [w1, w2, w3] = shuffle(CODE_DEDUCTION_WORDS).slice(0, 3)
  const [c1, c2, c3] = shuffle(CODE_DEDUCTION_NONSENSE).slice(0, 3)
  const pairA = shuffle([c1, c2])
  const pairB = shuffle([c2, c3])
  return {
    subtopicId: 'coding-decoding',
    type: 'input',
    prompt: `In a certain code language, '${w1} ${w2}' is written as '${pairA[0]} ${pairA[1]}', and '${w2} ${w3}' is written as '${pairB[0]} ${pairB[1]}'. What is the code for '${w3}'?`,
    answer: c3,
    hint: `'${w2}' appears in both statements, so its code is the one common to both coded pairs (${pairA.join(' & ')} and ${pairB.join(' & ')}). The remaining code word in the second statement must stand for '${w3}'.`,
  }
}

const MIRROR_SYMMETRIC_LETTERS = new Set(['A', 'H', 'I', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y'])
const MIRROR_ASYMMETRIC_LETTERS = ['B', 'C', 'D', 'E', 'F', 'G', 'J', 'K', 'L', 'N', 'P', 'Q', 'R', 'S', 'Z']
const MIRROR_WORDS = [
  'MATH', 'HOME', 'TOYS', 'KITE', 'DOVE', 'FISH', 'BIRD', 'TREE', 'BOOK', 'DESK',
  'LAMP', 'STAR', 'MOON', 'RAIN', 'SNOW', 'WIND', 'LEAF', 'ROOT', 'SEED', 'FARM',
  'GATE', 'ROAD', 'LAKE', 'HILL', 'CAVE', 'ROCK', 'SAND', 'WAVE', 'SHIP', 'BOAT',
  'MOUTH', 'HOUSE', 'WATER', 'TIGER', 'HONEY', 'MUSIC', 'HAPPY', 'YOUTH',
]

function mirrorClockTime() {
  const h = randInt(1, 12)
  const m = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
  const total = (h % 12) * 60 + m
  const mirrorTotal = (720 - total) % 720
  let mh = Math.floor(mirrorTotal / 60)
  const mm = mirrorTotal % 60
  if (mh === 0) mh = 12
  return { h, m, mh, mm }
}

const EMBEDDED_FIGURE_FACTS = [
  { prompt: 'A square has both of its diagonals drawn. How many triangles can you count in the figure?', answer: 8, hint: 'The two diagonals split the square into 4 small triangles, which also combine into 4 larger ones.' },
  { prompt: 'A square has only ONE diagonal drawn. How many triangles can you count in the figure?', answer: 2, hint: 'One diagonal splits a square into exactly two triangles.' },
  { prompt: 'A triangle is divided into 4 smaller triangles by joining the midpoints of its three sides. How many triangles are in the figure in total?', answer: 5, hint: 'Count the 4 small triangles, plus the 1 big outer triangle they form together.' },
  { prompt: 'A big square is divided into a 2×2 grid of 4 equal small squares. How many squares (of any size) can you count in the figure?', answer: 5, hint: 'Count the 4 small squares, then add the 1 big square they form together.' },
  { prompt: 'A big square is divided into a 3×3 grid of 9 equal small squares. How many squares (of any size) can you count in the figure?', answer: 14, hint: 'Count the 9 smallest squares, then the 4 medium (2×2) squares, then the 1 biggest square: 9 + 4 + 1.' },
  { prompt: 'A rectangle is divided into a grid of 2 rows and 3 columns of equal small rectangles. How many rectangles (of any size) can you count in the figure?', answer: 18, hint: 'Use rectangle counting: choose 2 of the 3 horizontal lines and 2 of the 4 vertical lines — the number of ways to pick each pair, multiplied together.' },
  { prompt: 'A rectangle has both of its diagonals drawn. How many triangles can you count in the figure?', answer: 4, hint: 'The two diagonals cross at the center, splitting the rectangle into 4 triangles.' },
]

function genMirrorEmbedded() {
  const mode = pick(['word-sym-count', 'word-asym-count', 'mirror-clock', 'embedded-count', 'symmetric-letter', 'asymmetric-letter'])

  if (mode === 'word-sym-count' || mode === 'word-asym-count') {
    const word = pick(MIRROR_WORDS)
    const letters = word.split('')
    const symCount = letters.filter((l) => MIRROR_SYMMETRIC_LETTERS.has(l)).length
    const askSym = mode === 'word-sym-count'
    const count = askSym ? symCount : letters.length - symCount
    return {
      subtopicId: 'mirror-embedded-figures',
      type: 'input',
      prompt: `In the word ${word}, how many letters ${askSym ? 'have a vertical line of symmetry (look the same in a mirror)' : 'do NOT look the same when reflected in a mirror'}? (Symmetric letters: A, H, I, M, O, T, U, V, W, X, Y)`,
      answer: String(count),
      hint: `Go letter by letter through ${word} and check which ones are in the symmetric list: A, H, I, M, O, T, U, V, W, X, Y.`,
    }
  }

  if (mode === 'mirror-clock') {
    const { h, m, mh, mm } = mirrorClockTime()
    const time = `${h}:${String(m).padStart(2, '0')}`
    const mirrorTime = `${mh}:${String(mm).padStart(2, '0')}`
    return {
      subtopicId: 'mirror-embedded-figures',
      type: 'input',
      prompt: `A clock shows the time ${time}. What time does its mirror image show? (Answer as H:MM, e.g. 6:30)`,
      answer: mirrorTime,
      hint: `For a mirror-image clock time, the hour and minute hands' positions flip left-right. A quick trick: the original time and its mirror image always add up to 12:00 (i.e. 720 minutes).`,
    }
  }

  if (mode === 'embedded-count') {
    const fact = pick(EMBEDDED_FIGURE_FACTS)
    return {
      subtopicId: 'mirror-embedded-figures',
      type: 'input',
      prompt: fact.prompt,
      answer: String(fact.answer),
      hint: fact.hint,
    }
  }

  if (mode === 'symmetric-letter') {
    const correct = pick([...MIRROR_SYMMETRIC_LETTERS])
    const { choices, answer } = mcqFrom(correct, () => pick(MIRROR_ASYMMETRIC_LETTERS), (v) => v)
    return {
      subtopicId: 'mirror-embedded-figures',
      type: 'mcq',
      prompt: `Which of these letters looks exactly the same when reflected in a mirror (has a vertical line of symmetry): ${choices.join(', ')}?`,
      choices,
      answer,
      hint: `Imagine folding the letter down the middle vertically — if both halves match perfectly, it has a vertical line of symmetry.`,
    }
  }

  const correct = pick(MIRROR_ASYMMETRIC_LETTERS)
  const { choices, answer } = mcqFrom(correct, () => pick([...MIRROR_SYMMETRIC_LETTERS]), (v) => v)
  return {
    subtopicId: 'mirror-embedded-figures',
    type: 'mcq',
    prompt: `Which of these letters does NOT look the same when reflected in a mirror: ${choices.join(', ')}?`,
    choices,
    answer,
    hint: `A letter has a vertical line of symmetry if folding it down the middle makes both halves match exactly. Look for one where they don't.`,
  }
}

const DICTIONARY_ORDER_WORDS = ['GARDEN', 'PLANET', 'MARKET', 'STRANGE', 'JUNGLE', 'JACKET', 'JASMINE', 'TIGERS', 'CLOUDY', 'NUMBER', 'SILVER', 'WONDER']

function genAlphabetRanking() {
  const mode = pick(['alphabet', 'ranking', 'dictionary'])
  if (mode === 'dictionary') {
    const word = pick(DICTIONARY_ORDER_WORDS)
    const chars = word.split('')
    const sorted = [...chars].sort()
    const askFirst = Math.random() < 0.5
    const correct = askFirst ? sorted[0] : sorted[sorted.length - 1]
    const otherLetters = chars.filter((c) => c !== correct)
    const { choices, answer } = mcqFrom(correct, () => pick(otherLetters), (v) => v)
    return {
      subtopicId: 'alphabet-ranking',
      type: 'mcq',
      prompt: `If the letters of the word ${word} are rearranged in alphabetical order, which letter comes ${askFirst ? 'first' : 'last'}?`,
      choices,
      answer,
      hint: `Write out all the letters of ${word} and sort them from A to Z. The ${askFirst ? 'first' : 'last'} letter in that order is the answer.`,
    }
  }
  if (mode === 'alphabet') {
    const steps = randInt(2, 5)
    const direction = pick(['after', 'before'])
    const startIdx = direction === 'after' ? randInt(0, 25 - steps) : randInt(steps, 25)
    const targetIdx = direction === 'after' ? startIdx + steps : startIdx - steps
    const startLetter = String.fromCharCode(65 + startIdx)
    const correct = String.fromCharCode(65 + targetIdx)
    const { choices, answer } = mcqFrom(
      correct,
      () => {
        const d = Math.max(0, Math.min(25, targetIdx + pick([-2, -1, 1, 2])))
        return String.fromCharCode(65 + d)
      },
      (v) => v
    )
    return {
      subtopicId: 'alphabet-ranking',
      type: 'mcq',
      prompt: `What letter comes ${steps} positions ${direction} ${startLetter} in the alphabet?`,
      choices,
      answer,
      hint: `Count ${steps} letters ${direction === 'after' ? 'forward' : 'backward'} from ${startLetter}.`,
    }
  }
  const fromFront = randInt(3, 10)
  const fromBack = randInt(3, 10)
  const total = fromFront + fromBack - 1
  const name = pick(WP_NAMES)
  const { choices, answer } = mcqFrom(total, () => total + pick([-2, -1, 1, 2]))
  return {
    subtopicId: 'alphabet-ranking',
    type: 'mcq',
    prompt: `In a queue, ${name} is ${fromFront}${ordinalSuffix(fromFront)} from the front and ${fromBack}${ordinalSuffix(fromBack)} from the back. How many people are in the queue in total?`,
    choices,
    answer,
    hint: `Total = (position from front) + (position from back) − 1, since ${name} is counted in both.`,
  }
}

const RIGHT_TRIANGLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]

function genDirectionSense() {
  const mode = pick(['distance', 'facing'])
  const name = pick(WP_NAMES)
  if (mode === 'distance') {
    const [a, b, c] = pick(RIGHT_TRIANGLES)
    const dir1 = pick(['North', 'South'])
    const dir2 = pick(['East', 'West'])
    const { choices, answer } = mcqFrom(c, () => c + pick([-2, -1, 1, 2]))
    return {
      subtopicId: 'direction-sense',
      type: 'mcq',
      prompt: `${name} walks ${a} m ${dir1}, then ${b} m ${dir2}. How far is ${name} from the starting point (in a straight line)?`,
      choices: choices.map((v) => `${v} m`),
      answer: `${answer} m`,
      hint: `This forms a right angle. Use the Pythagorean triple ${a}-${b}-${c}: the straight-line distance is ${c} m.`,
    }
  }
  const directions = ['North', 'East', 'South', 'West']
  const startIdx = randInt(0, 3)
  const turns = randInt(1, 3)
  const turnType = pick(['right', 'left'])
  let idx = startIdx
  for (let i = 0; i < turns; i++) {
    idx = turnType === 'right' ? (idx + 1) % 4 : (idx + 3) % 4
  }
  const facing = directions[idx]
  const { choices, answer } = mcqFrom(facing, () => pick(directions.filter((d) => d !== facing)), (v) => v)
  return {
    subtopicId: 'direction-sense',
    type: 'mcq',
    prompt: `${name} starts facing ${directions[startIdx]}. ${name} turns ${turnType} ${turns} time${turns > 1 ? 's' : ''} (each turn is 90°). Which direction is ${name} facing now?`,
    choices,
    answer,
    hint: `Each 90° turn ${turnType === 'right' ? 'moves one step clockwise' : 'moves one step counter-clockwise'} through North → East → South → West → North.`,
  }
}

// Multi-leg journey (4 legs instead of 2) that still nets out to a clean
// Pythagorean-triple straight-line distance.
function genDirectionSenseWordProblem() {
  const [p, q, r] = pick(RIGHT_TRIANGLES)
  const name = pick(WP_NAMES)
  const n2 = randInt(1, Math.max(1, p - 1))
  const n1 = n2 + p
  const e2 = randInt(1, Math.max(1, q - 1))
  const e1 = e2 + q
  return {
    subtopicId: 'direction-sense',
    type: 'input',
    prompt: `${name} walks ${n1} km North, then ${e1} km East, then ${n2} km South, and finally ${e2} km West. How far is ${name} now from the starting point, in a straight line (in km)?`,
    answer: String(r),
    hint: `Find the net distance North (${n1} − ${n2} = ${p} km) and net distance East (${e1} − ${e2} = ${q} km). These form a right angle, so use the Pythagorean triple ${p}-${q}-${r}: the straight-line distance is ${r} km.`,
  }
}

const MEASUREMENT_UNITS = [
  { big: 'm', small: 'cm', factor: 100 },
  { big: 'kg', small: 'g', factor: 1000 },
  { big: 'L', small: 'ml', factor: 1000 },
]

function genMeasurement() {
  const unit = pick(MEASUREMENT_UNITS)
  const toSmall = Math.random() < 0.5
  if (toSmall) {
    const bigVal = randInt(2, 9)
    const correct = bigVal * unit.factor
    const { choices, answer } = mcqFrom(correct, () => correct + pick([-unit.factor, unit.factor, -unit.factor / 2, unit.factor / 2]))
    return {
      subtopicId: 'measurement',
      type: 'mcq',
      prompt: `Convert ${bigVal} ${unit.big} to ${unit.small}.`,
      choices: choices.map((v) => `${v} ${unit.small}`),
      answer: `${answer} ${unit.small}`,
      hint: `1 ${unit.big} = ${unit.factor} ${unit.small}, so multiply by ${unit.factor}.`,
    }
  }
  const multiplier = randInt(2, 9)
  const smallVal = multiplier * unit.factor
  const { choices, answer } = mcqFrom(multiplier, () => multiplier + pick([-2, -1, 1, 2]))
  return {
    subtopicId: 'measurement',
    type: 'mcq',
    prompt: `Convert ${smallVal} ${unit.small} to ${unit.big}.`,
    choices: choices.map((v) => `${v} ${unit.big}`),
    answer: `${answer} ${unit.big}`,
    hint: `${unit.factor} ${unit.small} = 1 ${unit.big}, so divide by ${unit.factor}.`,
  }
}

// CBSE-style measurement word problems: unit conversion combined with a
// real-world division scenario.
function genMeasurementWordProblem() {
  const mode = pick(['bottles', 'rope'])
  if (mode === 'bottles') {
    const bottleML = pick([200, 250, 500])
    const containerL = randInt(2, 8)
    const containerML = containerL * 1000
    const bottles = containerML / bottleML
    return {
      subtopicId: 'measurement',
      type: 'input',
      prompt: `A container holds ${containerL} liters of juice. If each bottle holds ${bottleML} ml, how many bottles can be completely filled from the container?`,
      answer: String(bottles),
      hint: `Convert the container's volume to milliliters (${containerL} L = ${containerML} ml), then divide by the size of each bottle (${bottleML} ml).`,
    }
  }
  const pieceCm = pick([25, 50, 20, 10])
  const ropeM = randInt(3, 9)
  const ropeCm = ropeM * 100
  const pieces = ropeCm / pieceCm
  return {
    subtopicId: 'measurement',
    type: 'input',
    prompt: `A rope is ${ropeM} m long. It is cut into equal pieces, each ${pieceCm} cm long. How many pieces are cut from the rope?`,
    answer: String(pieces),
    hint: `Convert the rope's length to centimeters (${ropeM} m = ${ropeCm} cm), then divide by the length of each piece (${pieceCm} cm).`,
  }
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function genTimeCalendar() {
  const mode = pick(['elapsed-time', 'day-of-week'])
  if (mode === 'elapsed-time') {
    const startHour = randInt(1, 12)
    const startMin = pick([0, 15, 30, 45])
    const durationHours = randInt(1, 3)
    const durationMins = pick([0, 15, 30, 45])
    const totalMin = startHour * 60 + startMin + durationHours * 60 + durationMins
    const fmt = (mins) => {
      const h = Math.floor((((mins % 720) + 720) % 720) / 60) || 12
      const m = ((mins % 60) + 60) % 60
      return `${h}:${String(m).padStart(2, '0')}`
    }
    const correct = fmt(totalMin)
    const { choices, answer } = mcqFromExcluding(correct, () => fmt(totalMin + pick([-30, -15, 15, 30])), (v) => v === correct, (v) => v)
    return {
      subtopicId: 'time-calendar',
      type: 'mcq',
      prompt: `A movie starts at ${fmt(startHour * 60 + startMin)} and lasts ${durationHours} hour${durationHours > 1 ? 's' : ''}${
        durationMins > 0 ? ` and ${durationMins} minutes` : ''
      }. What time does it end?`,
      choices,
      answer,
      hint: `Add the duration to the start time. First add the hours, then the minutes (regrouping 60 minutes into an hour if needed).`,
    }
  }
  const startDay = randInt(0, 6)
  const daysLater = randInt(3, 60)
  const endDay = (startDay + daysLater) % 7
  const { choices, answer } = mcqFrom(DAYS[endDay], () => pick(DAYS.filter((d) => d !== DAYS[endDay])), (v) => v)
  return {
    subtopicId: 'time-calendar',
    type: 'mcq',
    prompt: `If today is ${DAYS[startDay]}, what day of the week will it be in ${daysLater} days?`,
    choices,
    answer,
    hint: `Divide ${daysLater} by 7 and look at the remainder — that's how many days of the week to count forward from ${DAYS[startDay]}.`,
  }
}

// CBSE-style multi-leg elapsed-time word problem (journey + a stop + a
// second leg), instead of a single addition step.
function genTimeWordProblem() {
  const name = pick(WP_NAMES)
  const startHour = randInt(1, 12)
  const startMin = pick([0, 10, 20, 30, 40, 50])
  const leg1H = randInt(1, 2)
  const leg1M = pick([0, 15, 30, 45])
  const stopMin = randInt(5, 25)
  const leg2H = randInt(0, 2)
  const leg2M = pick([15, 30, 45])
  const totalMin = startHour * 60 + startMin + leg1H * 60 + leg1M + stopMin + leg2H * 60 + leg2M
  const fmt = (mins) => {
    const h = Math.floor((((mins % 720) + 720) % 720) / 60) || 12
    const m = ((mins % 60) + 60) % 60
    return `${h}:${String(m).padStart(2, '0')}`
  }
  return {
    subtopicId: 'time-calendar',
    type: 'input',
    prompt: `${name} boards a train at ${fmt(startHour * 60 + startMin)}. The train travels for ${leg1H} hour${leg1H > 1 ? 's' : ''}${
      leg1M > 0 ? ` ${leg1M} minutes` : ''
    } to reach a junction, waits there for ${stopMin} minutes, then travels another ${leg2H > 0 ? `${leg2H} hour${leg2H > 1 ? 's' : ''} ` : ''}${leg2M} minutes to reach the final station. What time does ${name} arrive at the final station? (Answer as H:MM, e.g. 6:30)`,
    answer: fmt(totalMin),
    hint: `Add up each time segment one by one: the first leg, the waiting time, then the second leg, regrouping 60 minutes into an hour whenever needed.`,
  }
}

function genMoney() {
  const mode = pick(['change', 'total-coins'])
  const name = pick(WP_NAMES)
  if (mode === 'change') {
    const price = randInt(150, 950) / 100
    let paid = Math.ceil(price / 5) * 5
    if (paid <= price) paid += 5
    const change = +(paid - price).toFixed(2)
    return {
      subtopicId: 'money',
      type: 'input',
      prompt: `${name} buys a toy for $${price.toFixed(2)} and pays with a $${paid.toFixed(2)} note. How much change should ${name} get? (e.g. 2.50)`,
      answer: change.toFixed(2),
      hint: `Subtract the price from the amount paid: $${paid.toFixed(2)} − $${price.toFixed(2)}.`,
    }
  }
  const coins = [
    { value: 0.05, name: '5¢' },
    { value: 0.1, name: '10¢' },
    { value: 0.25, name: '25¢' },
    { value: 1, name: '$1' },
  ]
  const coin = pick(coins)
  const count = randInt(3, 12)
  const total = +(coin.value * count).toFixed(2)
  return {
    subtopicId: 'money',
    type: 'input',
    prompt: `${name} has ${count} coins worth ${coin.name} each. How much money does ${name} have in total? (in dollars, e.g. 1.25)`,
    answer: total.toFixed(2),
    hint: `Multiply the number of coins (${count}) by the value of each coin (${coin.name}).`,
  }
}

// CBSE-style classic profit/loss money word problem.
function genMoneyWordProblem() {
  const item = pick(['bicycle', 'watch', 'table', 'chair', 'toy car', 'showpiece'])
  const costPrice = randInt(200, 900)
  const isProfit = Math.random() < 0.5
  const changeAmt = randInt(20, 150)
  const sellingPrice = isProfit ? costPrice + changeAmt : costPrice - changeAmt
  return {
    subtopicId: 'money',
    type: 'input',
    prompt: `A shopkeeper bought a ${item} for $${costPrice} and sold it for $${sellingPrice}. Did the shopkeeper make a profit or a loss, and how much? (Answer as "Profit X" or "Loss X", e.g. Profit 20)`,
    answer: `${isProfit ? 'Profit' : 'Loss'} ${changeAmt}`,
    hint: `Compare the selling price to the cost price. If selling price is higher, it's a profit; if lower, it's a loss. The amount is the difference between the two prices.`,
  }
}

function genComputationOperations() {
  const a = randInt(2, 12)
  const b = randInt(2, 12)
  const c = randInt(2, 9)
  const useAddition = Math.random() < 0.5
  if (useAddition) {
    const result = a + b * c
    const wrongOrder = (a + b) * c
    const { choices, answer } = mcqFromExcluding(result, () => Math.max(0, wrongOrder + pick([-3, -2, -1, 0, 1, 2, 3])), (v) => v === result)
    return {
      subtopicId: 'computation-operations',
      type: 'mcq',
      prompt: `${a} + ${b} × ${c} = ?`,
      choices,
      answer,
      hint: `Remember: multiplication comes before addition. Work out ${b} × ${c} first, then add ${a}.`,
    }
  }
  const bigA = randInt(30, 80)
  const result = bigA - b * c
  const wrongOrder = Math.max(0, (bigA - b) * c)
  const { choices, answer } = mcqFromExcluding(
    Math.max(0, result),
    () => Math.max(0, wrongOrder + pick([-3, -2, -1, 1, 2, 3])),
    (v) => v === result
  )
  return {
    subtopicId: 'computation-operations',
    type: 'mcq',
    prompt: `${bigA} - ${b} × ${c} = ?`,
    choices,
    answer,
    hint: `Do the multiplication first (${b} × ${c}), then subtract the result from ${bigA}.`,
  }
}

// ---------------------------------------------------------------------------
// REGISTRY
// ---------------------------------------------------------------------------
const GENERATORS = {
  'whole-numbers': [genNumbersTo100000, genRoundingEstimation, genPlaceValueWordProblem],
  'factors-multiples': [genFactorsCommonFactors, genMultiplesCommonMultiples, genPrimeComposite, genFactorsMultiplesWordProblem],
  'multiplication-division': [genMultiply2Digit, genDivide1Digit, genMultDivWordProblems, genComputationWordProblem],
  fractions: [genMixedNumbers, genCompareFractions, genAddSubUnlikeFractions, genFractionOfSet, genFractionWordProblems, genFractionWordProblemAdvanced],
  decimals: [genDecimalPlaceValue, genCompareDecimals, genRoundingDecimals],
  'decimal-operations': [genAddSubDecimals, genMultiplyDivideDecimals, genDecimalWordProblems, genDecimalWordProblemAdvanced],
  geometry: [genAngles, genLines, genSquaresRectangles, genSymmetry, genGeometryWordProblem],
  'perimeter-area': [genPerimeterRect, genAreaRect, genAreaComposite, genPerimeterAreaWordProblem],
  'data-analysis': [genBarGraphQuestion, genLineGraphQuestion, genDataHandlingWordProblem],
  'word-problems': [genPartWhole, genComparison, genMultiStep],
}

// ---------------------------------------------------------------------------
// OLYMPIAD SYLLABUS — fixed 25-question "challenge papers", organized into
// the three standard sections used by Grade 4 math olympiad exams (SOF-IMO,
// NSO, and similar): Logical Reasoning, Mathematical Reasoning, and an
// Achievers Section of higher-order-thinking problems. Unlike the regular
// syllabus chapters, these are baked into a static bank
// (src/data/olympiadBank.js via scripts/gen-olympiad-bank.mjs) rather than
// re-randomized every session, so teachers have a stable answer key. Every
// generator below always runs at 'hard' difficulty.
export const OLYMPIAD_CHAPTER_GENERATORS = {
  'patterns-series': [genPatternsSequences, genPatternsSequencesWordProblem],
  'analogy-classification': [genAnalogyClassification, genAnalogyClassificationWordProblem],
  'coding-decoding': [genCodingDecoding, genCodingDecodingWordProblem],
  'mirror-embedded-figures': [genMirrorEmbedded],
  'alphabet-ranking': [genAlphabetRanking],
  'direction-sense': [genDirectionSense, genDirectionSenseWordProblem],
  'number-system-sense': [genNumbersTo100000, genPrimeComposite, genRoundingEstimation, genPlaceValueWordProblem],
  'factors-multiples-olympiad': [genFactorsCommonFactors, genMultiplesCommonMultiples, genNumberTheoryPuzzles, genFactorsMultiplesWordProblem],
  'computation-operations': [genComputationOperations, genMultiply2Digit, genDivide1Digit, genComputationWordProblem],
  'fractions-decimals-olympiad': [
    genMixedNumbers,
    genCompareFractions,
    genAddSubUnlikeFractions,
    genDecimalPlaceValue,
    genCompareDecimals,
    genFractionWordProblemAdvanced,
    genDecimalWordProblemAdvanced,
  ],
  measurement: [genMeasurement, genMeasurementWordProblem],
  'time-calendar': [genTimeCalendar, genTimeWordProblem],
  money: [genMoney, genMoneyWordProblem],
  'geometry-olympiad': [genAngles, genLines, genSquaresRectangles, genSymmetry, genGeometrySpatial, genGeometryWordProblem],
  'perimeter-area-olympiad': [genPerimeterRect, genAreaRect, genAreaComposite, genPerimeterAreaWordProblem],
  'data-handling': [genBarGraphQuestion, genLineGraphQuestion, genCombinatoricsCounting, genDataHandlingWordProblem],
  achievers: [genCompetitionProblems, genLogicPuzzles],
}

/**
 * Author-time generator for a fixed, non-randomized 25-question Olympiad
 * "paper" for one syllabus chapter. Every question is forced to 'hard'
 * difficulty and deduped by prompt text. The result is meant to be baked
 * into a static file once (see scripts/gen-olympiad-bank.mjs), not called
 * at runtime in the app.
 */
export function generateOlympiadPaper(chapterId, count = 25) {
  const pool = OLYMPIAD_CHAPTER_GENERATORS[chapterId]
  if (!pool) return []
  const seen = new Set()
  const questions = []
  let idx = 0
  let guard = 0
  while (questions.length < count && guard < count * 40) {
    const generator = pool[idx % pool.length]
    idx += 1
    guard += 1
    const q = generator('hard')
    if (seen.has(q.prompt)) continue
    seen.add(q.prompt)
    questions.push({
      ...q,
      id: `olympiad-${chapterId}-${questions.length + 1}`,
      chapterId: `olympiad-${chapterId}`,
      difficulty: 'hard',
    })
  }
  return questions
}

const DIFFICULTY_TIERS = ['easy', 'medium', 'hard']

function difficultyForIndex(index, total) {
  const third = total / 3
  if (index < third) return 'easy'
  if (index < third * 2) return 'medium'
  return 'hard'
}

/**
 * Generate a randomized set of questions across the given chapter ids,
 * mixing difficulty tiers for a quick, varied practice session.
 * @param {string[]} chapterIds
 * @param {number} count total number of questions to generate
 * @returns {Array} question objects, each tagged with chapterId + id + difficulty
 */
export function generateQuestions(chapterIds, count = 12) {
  const validChapters = chapterIds.filter((id) => GENERATORS[id])
  if (validChapters.length === 0) return []
  const questions = []
  for (let i = 0; i < count; i++) {
    const chapterId = validChapters[i % validChapters.length]
    const generatorPool = GENERATORS[chapterId]
    const generator = pick(generatorPool)
    const difficulty = pick(DIFFICULTY_TIERS)
    const q = generator(difficulty)
    questions.push({ ...q, id: uid(), chapterId, difficulty })
  }
  return shuffle(questions)
}

/**
 * Generate a deep-practice session for a single chapter: simple -> advanced,
 * cycling evenly through the chapter's sub-topics.
 * @param {string} chapterId
 * @param {number} count defaults to 25
 * @returns {Array} question objects ordered from easy to hard
 */
export function generateChapterPractice(chapterId, count = 25) {
  const pool = GENERATORS[chapterId]
  if (!pool) return []
  const questions = []
  for (let i = 0; i < count; i++) {
    const difficulty = difficultyForIndex(i, count)
    const generator = pool[i % pool.length]
    const q = generator(difficulty)
    questions.push({ ...q, id: uid(), chapterId, difficulty })
  }
  return questions
}

export function generateSingleQuestion(chapterId, subtopicId, difficulty = 'medium') {
  const pool = GENERATORS[chapterId]
  if (!pool) return null
  let attempts = 0
  let q = null
  while (attempts < 10) {
    const candidate = pick(pool)(difficulty)
    if (!subtopicId || candidate.subtopicId === subtopicId) {
      q = candidate
      break
    }
    attempts += 1
  }
  if (!q) q = pick(pool)(difficulty)
  return { ...q, id: uid(), chapterId, difficulty }
}

export function checkAnswer(question, userAnswer) {
  if (userAnswer == null) return false
  const normalize = (v) => String(v).trim().toLowerCase()
  return normalize(userAnswer) === normalize(question.answer)
}
