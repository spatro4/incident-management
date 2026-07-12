// MathEngine — dynamic question generation for Singapore Math Grade 4 topics.
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

// ---------------------------------------------------------------------------
// PLACE VALUE
// ---------------------------------------------------------------------------
function genReadingNumbers(difficulty = 'medium') {
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
      subtopicId: 'reading-numbers',
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
    subtopicId: 'reading-numbers',
    type: 'mcq',
    prompt: `In the number ${n.toLocaleString()}, what is the value of the digit in the ${places[digitIdx]} place?`,
    choices,
    answer,
    hint: `Find the digit in the ${places[digitIdx]} place, then multiply it by the place value (${Math.pow(10, digitIdx).toLocaleString()}).`,
  }
}

function genRounding(difficulty = 'medium') {
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
    subtopicId: 'rounding',
    type: 'mcq',
    prompt: `Round ${n.toLocaleString()} to the nearest ${roundTo.toLocaleString()}.`,
    choices,
    answer,
    hint: `Look at the digit right after the place you're rounding to. If it's 5 or more, round up.`,
  }
}

function genFactorsMultiples(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const pairs = [
      [12, 18], [16, 24], [20, 30], [18, 27], [24, 36], [15, 25], [14, 21], [28, 42],
    ]
    const [x, y] = pick(pairs)
    const gcf = gcd(x, y)
    const { choices, answer } = mcqFrom(gcf, () => Math.max(1, gcf + pick([-3, -2, -1, 1, 2, 3])))
    return {
      subtopicId: 'factors-multiples',
      type: 'mcq',
      prompt: `What is the Greatest Common Factor (GCF) of ${x} and ${y}?`,
      choices,
      answer,
      hint: `List the factors of both numbers and find the largest one they share.`,
    }
  }

  const askFactor = Math.random() < 0.5
  if (askFactor) {
    const n = difficulty === 'easy' ? pick([12, 18, 24]) : pick([12, 18, 24, 36, 48, 60, 72, 84, 90])
    const factors = []
    for (let i = 1; i <= n; i++) if (n % i === 0) factors.push(i)
    const notAFactor = randInt(2, 20)
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
  const [rangeMin, rangeMax] = difficulty === 'easy' ? [2, 6] : [3, 9]
  const a = randInt(rangeMin, rangeMax)
  const b = randInt(rangeMin, rangeMax)
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
function genEquivalentFractions(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const base = pick([2, 3, 4, 5])
    const factor = randInt(2, 5)
    const den = base * factor
    const num = randInt(1, base - 1) * factor
    const simplifiedNum = num / factor
    const { choices, answer } = mcqFrom(simplifiedNum, () => simplifiedNum + pick([-2, -1, 1, 2]))
    return {
      subtopicId: 'equivalent-fractions',
      type: 'mcq',
      prompt: `Simplify ${num}/${den} to its lowest terms. What is the new numerator (over ${base})?`,
      choices,
      answer,
      hint: `Divide both the numerator and denominator by their greatest common factor (${factor}).`,
    }
  }
  const den = difficulty === 'easy' ? pick([2, 3, 4]) : pick([2, 3, 4, 5, 6])
  const num = randInt(1, den - 1)
  const factor = difficulty === 'easy' ? randInt(2, 3) : randInt(2, 5)
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

function genAddSubFractions(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const pairs = [[2, 3], [3, 4], [4, 6], [2, 5], [3, 6], [4, 8], [5, 10], [2, 7]]
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
      subtopicId: 'add-sub-fractions',
      type: 'mcq',
      prompt: `${n1}/${d1} ${isAdd ? '+' : '-'} ${n2}/${d2} = ? (give your answer in simplest form)`,
      choices,
      answer,
      hint: `Find a common denominator first (try ${lcmVal}), rewrite both fractions, then ${isAdd ? 'add' : 'subtract'}.`,
    }
  }

  const den = difficulty === 'easy' ? pick([2, 3, 4]) : pick([4, 5, 6, 8, 10, 12])
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
      subtopicId: 'mixed-numbers',
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
      subtopicId: 'mixed-numbers',
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
function genTenthsHundredths(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const a = randInt(1, 99) / 100
    let b = randInt(1, 99) / 100
    while (Math.abs(a - b) < 0.02) b = randInt(1, 99) / 100
    const bigger = a > b ? a : b
    const smaller = a === bigger ? b : a
    const others = new Set([bigger.toFixed(2), smaller.toFixed(2)])
    while (others.size < 4) others.add((randInt(1, 99) / 100).toFixed(2))
    return {
      subtopicId: 'tenths-hundredths',
      type: 'mcq',
      prompt: `Which decimal is greater: ${a.toFixed(2)} or ${b.toFixed(2)}?`,
      choices: shuffle(Array.from(others)),
      answer: bigger.toFixed(2),
      hint: `Compare digit by digit, starting from the tenths place.`,
    }
  }

  const useHundredths = difficulty === 'easy' ? false : Math.random() < 0.5
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

function genDecimalFractionConversion(difficulty = 'medium') {
  const den =
    difficulty === 'easy' ? pick([2, 4, 5, 10]) : difficulty === 'hard' ? pick([8, 16, 20, 25, 40]) : pick([2, 4, 5, 10, 20, 25, 50])
  const num = randInt(1, den - 1)
  const value = num / den
  const decimals = Number.isInteger(value * 1000) && !Number.isInteger(value * 100) ? 3 : 2
  const decimalStr = value.toFixed(decimals)
  const { choices, answer } = mcqFrom(decimalStr, () => (value + pick([-0.1, -0.05, 0.05, 0.1])).toFixed(decimals), (v) => v)
  return {
    subtopicId: 'decimal-fraction-conversion',
    type: 'mcq',
    prompt: `Convert ${num}/${den} to a decimal.`,
    choices,
    answer,
    hint: `Divide the numerator by the denominator: ${num} ÷ ${den}.`,
  }
}

function genDecimalOperations(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const op = pick(['+', '-', '×', '÷'])
    const a = randInt(100, 999) / 100
    const b = op === '÷' ? pick([2, 4, 5, 10]) : randInt(100, 999) / 100
    let result, prompt
    if (op === '+') {
      result = +(a + b).toFixed(2)
      prompt = `${a.toFixed(2)} + ${b.toFixed(2)} = ?`
    } else if (op === '-') {
      const hi = Math.max(a, b)
      const lo = Math.min(a, b)
      result = +(hi - lo).toFixed(2)
      prompt = `${hi.toFixed(2)} - ${lo.toFixed(2)} = ?`
    } else if (op === '×') {
      const whole = randInt(2, 9)
      result = +(a * whole).toFixed(2)
      prompt = `${a.toFixed(2)} × ${whole} = ?`
    } else {
      result = +(a / b).toFixed(2)
      prompt = `${a.toFixed(2)} ÷ ${b} = ?`
    }
    const { choices, answer } = mcqFrom(result, () => +(result + pick([-1, -0.5, 0.5, 1])).toFixed(2), (v) => v.toFixed(2))
    return {
      subtopicId: 'decimal-operations',
      type: 'mcq',
      prompt,
      choices,
      answer,
      hint: `Line up the decimal points carefully, and double-check your place values.`,
    }
  }

  const op = difficulty === 'easy' ? pick(['+', '-']) : pick(['+', '-', '×'])
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
function genAngles(difficulty = 'medium') {
  if (difficulty === 'hard') {
    const angle = pick([190, 200, 220, 250, 270, 300, 330, 350])
    const type = 'reflex'
    const { choices, answer } = mcqFrom(type, () => pick(['acute', 'right', 'obtuse', 'straight'].filter((t) => t !== type)), (v) => v)
    return {
      subtopicId: 'angles',
      type: 'mcq',
      prompt: `An angle measures ${angle}°. What type of angle is it?`,
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
    subtopicId: 'angles',
    type: 'mcq',
    prompt: `An angle measures ${angle}°. What type of angle is it?`,
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
    subtopicId: 'lines',
    type: 'mcq',
    prompt: s.desc + ' What do we call these lines?',
    choices,
    answer,
    hint: `Perpendicular lines cross at exactly 90°. Parallel lines never meet. Lines that cross at any other angle are just "intersecting".`,
  }
}

function genAreaPerimeter(difficulty = 'medium') {
  if (difficulty === 'easy') {
    const l = randInt(3, 8)
    const w = randInt(2, 6)
    const askArea = Math.random() < 0.5
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

  if (difficulty === 'hard') {
    const L = randInt(10, 18)
    const W = randInt(8, 16)
    const notchL = randInt(2, Math.floor(L / 2))
    const notchW = randInt(2, Math.floor(W / 2))
    const perimeter = 2 * (L + W)
    const { choices, answer } = mcqFrom(perimeter, () => perimeter + pick([-2 * notchL, 2 * notchL, -2 * notchW, 2 * notchW]))
    return {
      subtopicId: 'area-perimeter',
      type: 'mcq',
      prompt: `An L-shaped figure is made from a ${L} cm × ${W} cm rectangle with a ${notchL} cm × ${notchW} cm rectangular notch cut from one corner. What is the perimeter of the L-shape?`,
      choices: choices.map((c) => `${c} cm`),
      answer: `${answer} cm`,
      hint: `Here's a trick: cutting a rectangular notch from a corner doesn't change the total perimeter! It's still 2 × (${L} + ${W}).`,
    }
  }

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
    subtopicId: 'bar-graphs',
    type: 'mcq',
    prompt,
    choices,
    answer,
    hint: `Read each bar carefully and compare heights (values) before answering.`,
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

function genDataAnalysis(difficulty = 'medium') {
  const count = difficulty === 'easy' ? 4 : difficulty === 'hard' ? 7 : 5
  const maxVal = difficulty === 'easy' ? 10 : difficulty === 'hard' ? 30 : 20
  const metricPool = difficulty === 'easy' ? ['range'] : difficulty === 'hard' ? ['range', 'median', 'mode'] : ['range', 'median']
  const metric = pick(metricPool)

  if (metric === 'mode') {
    const modeValue = randInt(1, maxVal)
    const others = Array.from({ length: count - 2 }, () => {
      let v = randInt(1, maxVal)
      while (v === modeValue) v = randInt(1, maxVal)
      return v
    })
    const nums = shuffle([modeValue, modeValue, ...others])
    const { choices, answer } = mcqFrom(modeValue, () => pick(others.length ? others : [modeValue + 1]))
    return {
      subtopicId: 'data-analysis',
      type: 'mcq',
      prompt: `A data set has these values: ${nums.join(', ')}. What is the mode (the value that appears most often)?`,
      choices,
      answer,
      hint: `Count how many times each number appears. The mode is the one that shows up the most.`,
    }
  }

  const nums = Array.from({ length: count }, () => randInt(1, maxVal)).sort((a, b) => a - b)
  let correct, prompt
  if (metric === 'range') {
    correct = nums[nums.length - 1] - nums[0]
    prompt = `A data set has these values: ${nums.join(', ')}. What is the range (highest − lowest)?`
  } else {
    correct = nums[Math.floor(nums.length / 2)]
    prompt = `A data set has these values: ${nums.join(', ')}. What is the median (middle value when sorted)?`
  }
  const { choices, answer } = mcqFrom(correct, () => correct + pick([-3, -2, -1, 1, 2, 3]))
  return {
    subtopicId: 'data-analysis',
    type: 'mcq',
    prompt,
    choices,
    answer,
    hint: metric === 'range' ? `Subtract the smallest number from the largest.` : `Sort the numbers and find the one in the middle.`,
  }
}

// ---------------------------------------------------------------------------
// WORD PROBLEMS (Bar Modeling)
// ---------------------------------------------------------------------------
const WP_NAMES = ['Mei Ling', 'Ahmad', 'Priya', 'Wei Jie', 'Aisha', 'Kumar', 'Siti', 'Ryan']
const WP_ITEMS = ['stickers', 'marbles', 'story books', 'seashells', 'trading cards', 'stamps']

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
// MATH OLYMPIAD PREP
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
  olympiad: [genPatternsSequences, genLogicPuzzles, genCompetitionProblems],
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
