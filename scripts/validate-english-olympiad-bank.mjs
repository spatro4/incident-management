// Sanity check: every mcq question's `answer` must appear in its `choices`
// exactly once, and prompts must be unique per chapter. Mirrors
// scripts/validate-olympiad-bank.mjs for the English Olympiad Syllabus.
import { ENGLISH_OLYMPIAD_BANK } from '../src/data/englishOlympiadBank.js'

let problems = 0
let total = 0

for (const [chapterId, questions] of Object.entries(ENGLISH_OLYMPIAD_BANK)) {
  total += questions.length
  if (questions.length !== 25) {
    console.log(`FAIL ${chapterId}: expected 25 questions, got ${questions.length}`)
    problems++
  }
  const seenPrompts = new Set()
  for (const q of questions) {
    if (seenPrompts.has(q.prompt)) {
      console.log(`FAIL ${chapterId}: duplicate prompt "${q.prompt}"`)
      problems++
    }
    seenPrompts.add(q.prompt)

    if (q.type === 'mcq') {
      const matches = q.choices.filter((c) => c === q.answer)
      if (matches.length !== 1) {
        console.log(`FAIL ${chapterId}: answer "${q.answer}" appears ${matches.length}x in choices [${q.choices.join(', ')}] -- "${q.prompt}"`)
        problems++
      }
      if (q.choices.length < 2) {
        console.log(`FAIL ${chapterId}: only ${q.choices.length} choice(s) -- "${q.prompt}"`)
        problems++
      }
    } else if (q.type === 'input') {
      if (q.answer == null || q.answer === '') {
        console.log(`FAIL ${chapterId}: empty answer for input question -- "${q.prompt}"`)
        problems++
      }
    }
  }
}

if (problems === 0) {
  console.log(`OK: all ${total} questions passed validation (unique prompts, well-formed answers/choices).`)
} else {
  console.log(`${problems} problem(s) found.`)
  process.exit(1)
}
