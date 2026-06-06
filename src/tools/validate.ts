import { normalizeGlossary, type ChapterGlossary } from "../chapters/glossary.js"
import { validateAndRepairChapters, type ChapterValidationResult } from "../chapters/validate.js"

export interface ValidateChaptersArgs {
  chapters: string
  durationSeconds?: number
  glossary?: ChapterGlossary
}

export function validateChapterToolInput(args: ValidateChaptersArgs, configuredGlossary: ChapterGlossary = {}): ChapterValidationResult {
  const explicitGlossary = normalizeGlossary(args.glossary)

  return validateAndRepairChapters(args.chapters, {
    durationSeconds: args.durationSeconds,
    glossary: Object.keys(explicitGlossary).length ? explicitGlossary : configuredGlossary,
  })
}
