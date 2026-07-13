// One-off authoring script: bakes a FIXED 25-question English Olympiad
// "paper" per syllabus chapter into src/data/englishOlympiadBank.js. Mirrors
// scripts/gen-olympiad-bank.mjs for the Math Olympiad Syllabus. Re-run this
// whenever the underlying hard-tier generators in englishEngine.js change.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateEnglishOlympiadPaper, ENGLISH_OLYMPIAD_CHAPTER_GENERATORS } from '../src/utils/englishEngine.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const CHAPTER_IDS = Object.keys(ENGLISH_OLYMPIAD_CHAPTER_GENERATORS)

const bank = {}
for (const chapterId of CHAPTER_IDS) {
  const questions = generateEnglishOlympiadPaper(chapterId, 25)
  if (questions.length !== 25) {
    console.warn(`WARNING: ${chapterId} only produced ${questions.length}/25 unique questions`)
  }
  bank[chapterId] = questions
}

const header = `// AUTO-GENERATED — fixed English Olympiad challenge papers, one per syllabus
// chapter. Do not hand-edit; re-run \`node scripts/gen-english-olympiad-bank.mjs\`
// to regenerate. Each chapter has exactly 25 fixed, hard-difficulty questions
// with a stable answer key (visible to teachers in the Teacher Dashboard).
`

const body = `export const ENGLISH_OLYMPIAD_BANK = ${JSON.stringify(bank, null, 2)}\n`

const outPath = path.join(__dirname, '..', 'src', 'data', 'englishOlympiadBank.js')
fs.writeFileSync(outPath, header + body)

console.log(`Wrote ${outPath}`)
for (const chapterId of CHAPTER_IDS) {
  console.log(`  ${chapterId}: ${bank[chapterId].length} questions`)
}
