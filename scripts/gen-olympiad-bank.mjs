// One-off authoring script: bakes a FIXED 25-question Olympiad "paper" per
// syllabus chapter into src/data/olympiadBank.js. Re-run this whenever the
// underlying hard-tier generators in mathEngine.js change and you want a
// fresh set of challenge papers. The output is static — the app does not
// regenerate these at runtime, so teachers get a stable answer key.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateOlympiadPaper, OLYMPIAD_CHAPTER_GENERATORS } from '../src/utils/mathEngine.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const CHAPTER_IDS = Object.keys(OLYMPIAD_CHAPTER_GENERATORS)

const bank = {}
for (const chapterId of CHAPTER_IDS) {
  const questions = generateOlympiadPaper(chapterId, 25)
  if (questions.length !== 25) {
    console.warn(`WARNING: ${chapterId} only produced ${questions.length}/25 unique questions`)
  }
  bank[chapterId] = questions
}

const header = `// AUTO-GENERATED — fixed Olympiad challenge papers, one per syllabus chapter.
// Do not hand-edit; re-run \`node scripts/gen-olympiad-bank.mjs\` to regenerate.
// Each chapter has exactly 25 fixed, hard-difficulty questions with a stable
// answer key (visible to teachers in the Teacher Dashboard).
`

const body = `export const OLYMPIAD_BANK = ${JSON.stringify(bank, null, 2)}\n`

const outPath = path.join(__dirname, '..', 'src', 'data', 'olympiadBank.js')
fs.writeFileSync(outPath, header + body)

console.log(`Wrote ${outPath}`)
for (const chapterId of CHAPTER_IDS) {
  console.log(`  ${chapterId}: ${bank[chapterId].length} questions`)
}
