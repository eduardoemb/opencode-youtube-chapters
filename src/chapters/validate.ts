import { formatChapters } from "./format.js"
import { type ChapterCandidate, parseChapterCandidates } from "./parse.js"
import { MINIMUM_GAP_SECONDS, repairChapterCandidates } from "./repair.js"

export interface ChapterValidationOptions {
  durationSeconds?: number
}

export interface ChapterValidationResult {
  valid: boolean
  lines: string[]
  errors: string[]
  warnings: string[]
  chapters: ChapterCandidate[]
}

export function validateAndRepairChapters(
  text: string,
  options: ChapterValidationOptions = {},
): ChapterValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (options.durationSeconds !== undefined && options.durationSeconds < 30) {
    errors.push("Videos under 30 seconds are not apt for YouTube chapters.")
  }

  const parsed = parseChapterCandidates(text)
  errors.push(...parsed.errors)

  if (parsed.chapters.length < 3) {
    errors.push("YouTube chapters require at least 3 chapters.")
  }

  if (parsed.chapters.length > 10) {
    errors.push("V1 supports a maximum of 10 chapters.")
  }

  if (errors.length) {
    return { valid: false, lines: [], errors: unique(errors), warnings, chapters: parsed.chapters }
  }

  const repaired = repairChapterCandidates(parsed.chapters)
  warnings.push(...repaired.warnings)
  errors.push(...validateMechanicalRules(repaired.chapters, options))

  const valid = errors.length === 0
  return {
    valid,
    lines: valid ? formatChapters(repaired.chapters) : [],
    errors: unique(errors),
    warnings: unique(warnings),
    chapters: repaired.chapters,
  }
}

function validateMechanicalRules(chapters: ChapterCandidate[], options: ChapterValidationOptions): string[] {
  const errors: string[] = []

  if (chapters[0]?.seconds !== 0) {
    errors.push("First chapter must start at 00:00.")
  }

  for (let index = 1; index < chapters.length; index += 1) {
    const previous = chapters[index - 1]
    const current = chapters[index]

    if (current.seconds <= previous.seconds) {
      errors.push(`Chapter ${index + 1} timestamp must be after chapter ${index}.`)
    }

    if (current.seconds - previous.seconds < MINIMUM_GAP_SECONDS) {
      errors.push(`Chapter ${index + 1} must be at least 10 seconds after chapter ${index}.`)
    }
  }

  if (options.durationSeconds !== undefined) {
    for (const chapter of chapters) {
      if (chapter.seconds > options.durationSeconds) {
        errors.push(`Chapter timestamp ${chapter.seconds}s is beyond the video duration (${options.durationSeconds}s).`)
      }
    }
  }

  return errors
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}
