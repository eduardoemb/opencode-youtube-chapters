import { validateAndRepairChapters, type ChapterValidationResult } from "../chapters/validate.js"

export interface ValidateChaptersArgs {
  chapters: string
  durationSeconds?: number
}

export function validateChapterToolInput(args: ValidateChaptersArgs): ChapterValidationResult {
  return validateAndRepairChapters(args.chapters, { durationSeconds: args.durationSeconds })
}
