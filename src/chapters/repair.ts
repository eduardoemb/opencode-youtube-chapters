import type { ChapterCandidate } from "./parse.js"

export interface ChapterRepairResult {
  chapters: ChapterCandidate[]
  warnings: string[]
}

const MINIMUM_GAP_SECONDS = 10

export function repairChapterCandidates(chapters: ChapterCandidate[]): ChapterRepairResult {
  const warnings: string[] = []
  const repaired = [...chapters]

  if (hasNonAscendingTimestamps(repaired)) {
    repaired.sort((a, b) => a.seconds - b.seconds)
    warnings.push("Chapters were sorted into ascending timestamp order.")
  }

  if (repaired[0] && repaired[0].seconds !== 0) {
    repaired[0] = { ...repaired[0], seconds: 0 }
    warnings.push("First chapter timestamp was repaired to 00:00.")
  }

  for (let index = 1; index < repaired.length; index += 1) {
    const previous = repaired[index - 1]
    const current = repaired[index]
    const minimum = previous.seconds + MINIMUM_GAP_SECONDS

    if (current.seconds < minimum) {
      repaired[index] = { ...current, seconds: minimum }
      warnings.push(`Chapter ${index + 1} timestamp was moved to maintain a 10-second minimum gap.`)
    }
  }

  return { chapters: repaired, warnings }
}

function hasNonAscendingTimestamps(chapters: ChapterCandidate[]): boolean {
  return chapters.some((chapter, index) => index > 0 && chapter.seconds < chapters[index - 1].seconds)
}

export { MINIMUM_GAP_SECONDS }
